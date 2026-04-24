import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendNewSubscriptionAlert, sendCancellationAlert, sendPaymentFailedAlert, sendAuditWelcomeEmail } from '@/lib/email'; // NOWE
import { createInvoice, sendInvoiceByEmail } from '@/lib/infakt';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
      console.error('❌ Brak stripe-signature header');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Idempotency: claim event before processing.
    // If duplicate and already processed → return 200; if in-flight/crashed → 503 for retry.
    const { error: claimErr } = await supabaseAdmin
      .from('webhook_events')
      .insert({ event_id: event.id, source: 'stripe', event_type: event.type });

    if (claimErr) {
      if (claimErr.code === '23505') {
        const { data: existing } = await supabaseAdmin
          .from('webhook_events')
          .select('processed_at')
          .eq('event_id', event.id)
          .maybeSingle();
        if (existing?.processed_at) {
          return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
        }
        return NextResponse.json({ in_flight: true }, { status: 503 });
      }
      console.error('❌ webhook_events claim error:', claimErr);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }


    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;


      const clerkUserId = session.metadata?.clerk_user_id;
      const subscriptionId = session.subscription as string;

      if (!clerkUserId || !subscriptionId) {
        console.error('Missing metadata:', { clerkUserId, subscriptionId });
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      const subscription: any = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0].price.id;

      const premiumIds = [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM, process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM_ANNUAL].filter(Boolean);
      let plan: 'standard' | 'premium' = premiumIds.includes(priceId) ? 'premium' : 'standard';
      let credits = 999999;


      const { error } = await supabaseAdmin
        .from('users')
        .update({
          subscription_plan: plan,
          subscription_status: 'active',
          stripe_subscription_id: subscriptionId,
          subscription_price_id: priceId,
          credits_total: credits,
          credits_remaining: credits,
        })
        .eq('clerk_user_id', clerkUserId);

      if (error) {
        console.error('❌ Supabase update error:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }

      // Wyślij email z info o audycie dla planów rocznych
      const annualPriceIds = [
        process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD_ANNUAL,
        process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM_ANNUAL,
      ].filter(Boolean);
      if (annualPriceIds.includes(priceId) && session.customer_email) {
        try {
          await sendAuditWelcomeEmail({ email: session.customer_email });
        } catch (emailErr) {
          console.error('Audit welcome email error:', emailErr);
        }
      }

      // NOWE: alert email o nowej subskrypcji
      try {
        await sendNewSubscriptionAlert({
          email: session.customer_email || 'nieznany',
          plan: plan === 'standard' ? 'Starter' : 'Pro',
          amount: session.amount_total || 0,
          currency: session.currency || 'pln',
        });
      } catch (emailErr) {
        console.error('Alert email error:', emailErr);
      }

      // Wystaw fakturę w inFakt
try {
  let clientEmail = session.customer_email || '';
  let clientName = '';
  if (session.customer) {
    const stripeCustomer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer;
    clientEmail = clientEmail || stripeCustomer.email || '';
    clientName = stripeCustomer.name || '';
  }
  if (clientEmail) {
    const invoice = await createInvoice({
      clientEmail, clientName, plan,
      paidAt: new Date().toISOString(),
    });
    if (invoice?.invoice?.id) {
      await sendInvoiceByEmail(invoice.invoice.id);
    }
  }
} catch (invoiceErr) {
  console.error('❌ inFakt invoice error:', invoiceErr);
}
    }

    // Odnowienie subskrypcji co miesiąc (pomijamy pierwsze — obsługuje checkout.session.completed)
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;
      const billingReason = (invoice as any).billing_reason as string;
      // Pierwsze płatności obsługuje checkout.session.completed — pomijamy
      if (billingReason === 'subscription_create') {
        await supabaseAdmin.from('webhook_events').update({ processed_at: new Date().toISOString() }).eq('event_id', event.id);
        return NextResponse.json({ received: true });
      }
      const subscriptionId = (invoice as any).subscription as string;
      if (!subscriptionId) {
        await supabaseAdmin.from('webhook_events').update({ processed_at: new Date().toISOString() }).eq('event_id', event.id);
        return NextResponse.json({ received: true });
      }

      // Odnowienie — przedłuż plan (kredyty unlimited nie wymagają resetu, ale aktualizujemy status)
      await supabaseAdmin
        .from('users')
        .update({ subscription_status: 'active' })
        .eq('stripe_subscription_id', subscriptionId);

    }

    // NOWE: błąd płatności
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice;
      try {
        const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer;
        await sendPaymentFailedAlert({
          email: customer.email || 'nieznany',
          amount: invoice.amount_due || 0,
          currency: invoice.currency || 'pln',
          reason: (invoice as any).last_finalization_error?.message || 'nieznany powód',
        });
      } catch (emailErr) {
        console.error('Alert email error:', emailErr);
      }
    }

// Zmiana planu (upgrade/downgrade przez Customer Portal)
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0].price.id;

      const standardPriceIds = [
        process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD,
        process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD_ANNUAL,
      ].filter(Boolean);
      const premiumPriceIds = [
        process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM,
        process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM_ANNUAL,
      ].filter(Boolean);

      let plan: 'standard' | 'premium';
      if (premiumPriceIds.includes(priceId)) {
        plan = 'premium';
      } else if (standardPriceIds.includes(priceId)) {
        plan = 'standard';
      } else {
        console.error('customer.subscription.updated: nieznany priceId:', priceId, '— nie zmieniam planu');
        await supabaseAdmin.from('webhook_events').update({ processed_at: new Date().toISOString() }).eq('event_id', event.id);
        return NextResponse.json({ received: true });
      }

      await supabaseAdmin
        .from('users')
        .update({
          subscription_plan: plan,
          subscription_status: subscription.status === 'active' ? 'active' : subscription.status,
          subscription_price_id: priceId,
        })
        .eq('stripe_subscription_id', subscription.id);

    }

    // Anulowanie subskrypcji
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;

      await supabaseAdmin
        .from('users')
        .update({
          subscription_plan: 'free',
          subscription_status: 'canceled',
          stripe_subscription_id: null,
          subscription_price_id: null,
          credits_total: 5,
          credits_remaining: 5,
        })
        .eq('stripe_subscription_id', subscription.id);

      // NOWE: alert email o anulowaniu
      try {
        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
        await sendCancellationAlert({
          email: customer.email || 'nieznany',
          plan: (subscription.metadata?.plan) || 'unknown',
          endsAt: new Date((subscription as any).current_period_end * 1000).toLocaleDateString('pl-PL'),
        });
      } catch (emailErr) {
        console.error('Alert email error:', emailErr);
      }

    }

    await supabaseAdmin
      .from('webhook_events')
      .update({ processed_at: new Date().toISOString() })
      .eq('event_id', event.id);

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';