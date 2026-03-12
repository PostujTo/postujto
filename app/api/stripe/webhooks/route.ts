import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendNewSubscriptionAlert, sendCancellationAlert, sendPaymentFailedAlert } from '@/lib/email'; // NOWE
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

    console.log('✅ Webhook received:', event.type);

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log('💳 Processing checkout.session.completed');
      console.log('Session ID:', session.id);
      console.log('Customer:', session.customer);
      console.log('Subscription:', session.subscription);

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

      console.log('📝 Updating user:', { clerkUserId, plan, credits });

      const { error } = await supabaseAdmin
        .from('users')
        .update({
          subscription_plan: plan,
          subscription_status: 'active',
          stripe_subscription_id: subscriptionId,
          credits_total: credits,
          credits_remaining: credits,
        })
        .eq('clerk_user_id', clerkUserId);

      if (error) {
        console.error('❌ Supabase update error:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
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

      console.log('✅ User updated successfully');
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

    // Odnowienie subskrypcji co miesiąc
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = (invoice as any).subscription as string;
      if (!subscriptionId) return NextResponse.json({ received: true });

      const subscription: any = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0].price.id;
      let credits = 999999;

      await supabaseAdmin
        .from('users')
        .update({ credits_remaining: credits, credits_total: credits })
        .eq('stripe_subscription_id', subscriptionId);

      console.log('✅ Kredyty odnowione dla subskrypcji:', subscriptionId);
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

      const premiumPriceIds = [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM, process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM_ANNUAL].filter(Boolean);
      let plan: 'standard' | 'premium' | 'free' = premiumPriceIds.includes(priceId) ? 'premium' : 'standard';

      await supabaseAdmin
        .from('users')
        .update({
          subscription_plan: plan,
          subscription_status: subscription.status === 'active' ? 'active' : subscription.status,
          credits_total: 999999,
          credits_remaining: 999999,
        })
        .eq('stripe_subscription_id', subscription.id);

      console.log('✅ Plan zaktualizowany:', { subscriptionId: subscription.id, plan });
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

      console.log('✅ Subskrypcja anulowana:', subscription.id);
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error.message },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';