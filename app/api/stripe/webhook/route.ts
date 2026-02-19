import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Webhook secret z Stripe
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Brak signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Weryfikuj webhook z Stripe
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('⚠️ Błąd weryfikacji webhook:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  console.log('✅ Webhook event:', event.type);

  // Obsługa różnych eventów
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('❌ Błąd przetwarzania webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error.message },
      { status: 500 }
    );
  }
}

// Obsługa zakończenia checkout
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('💳 Checkout completed:', session.id);

  const clerkUserId = session.metadata?.clerk_user_id;
  const subscriptionId = session.subscription as string;

  if (!clerkUserId || !subscriptionId) {
    console.error('Brak clerk_user_id lub subscription w metadata');
    return;
  }

  // Pobierz szczegóły subskrypcji
  const subscription: any = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0].price.id;

  // Określ plan na podstawie priceId
  let plan: 'standard' | 'premium' = 'standard';
  let credits = 100;

  if (priceId === process.env.STRIPE_PRICE_ID_PREMIUM) {
    plan = 'premium';
    credits = 500;
  } else if (priceId === process.env.STRIPE_PRICE_ID_STANDARD) {
    plan = 'standard';
    credits = 100;
  }

  // Oblicz datę odnowienia kredytów
  const resetDate = subscription.current_period_end 
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // fallback: +30 dni

  // Aktualizuj użytkownika w Supabase
  const { error } = await supabaseAdmin
    .from('users')
    .update({
      subscription_plan: plan,
      subscription_status: 'active',
      stripe_subscription_id: subscriptionId,
      credits_total: credits,
      credits_remaining: credits,
      credits_reset_date: resetDate,
    })
    .eq('clerk_user_id', clerkUserId);

  if (error) {
    console.error('❌ Błąd aktualizacji użytkownika:', error);
  } else {
    console.log(`✅ Użytkownik zaktualizowany: ${plan} plan, ${credits} kredytów`);
  }

  // Zapisz w historii
  await supabaseAdmin.from('subscription_history').insert({
    user_id: clerkUserId,
    previous_plan: 'free',
    new_plan: plan,
    reason: 'checkout_completed',
    stripe_event_id: subscriptionId,
  });
}

// Obsługa aktualizacji subskrypcji
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Subscription updated:', subscription.id);

  const sub: any = subscription;
  const customerId = sub.customer as string;
  const customer: any = await stripe.customers.retrieve(customerId);
  
  if (customer.deleted) return;

  const clerkUserId = customer.metadata?.clerk_user_id;
  if (!clerkUserId) return;

  const priceId = sub.items.data[0].price.id;
  let plan: 'standard' | 'premium' = 'standard';
  let credits = 100;

  if (priceId === process.env.STRIPE_PRICE_ID_PREMIUM) {
    plan = 'premium';
    credits = 500;
  } else if (priceId === process.env.STRIPE_PRICE_ID_STANDARD) {
    plan = 'standard';
    credits = 100;
  }

  const resetDate = sub.current_period_end 
    ? new Date(sub.current_period_end * 1000).toISOString()
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  await supabaseAdmin
    .from('users')
    .update({
      subscription_plan: plan,
      subscription_status: sub.status,
      credits_total: credits,
      credits_reset_date: resetDate,
    })
    .eq('clerk_user_id', clerkUserId);

  console.log(`✅ Subskrypcja zaktualizowana: ${plan}`);
}

// Obsługa usunięcia subskrypcji (anulowanie)
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('❌ Subscription deleted:', subscription.id);

  const sub: any = subscription;
  const customerId = sub.customer as string;
  const customer: any = await stripe.customers.retrieve(customerId);
  
  if (customer.deleted) return;

  const clerkUserId = customer.metadata?.clerk_user_id;
  if (!clerkUserId) return;

  // Przywróć plan darmowy
  await supabaseAdmin
    .from('users')
    .update({
      subscription_plan: 'free',
      subscription_status: 'canceled',
      stripe_subscription_id: null,
      credits_total: 10,
      credits_remaining: 10,
    })
    .eq('clerk_user_id', clerkUserId);

  console.log('✅ Użytkownik przywrócony do planu free');
}

// Obsługa udanej płatności (odnowienie miesięczne)
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('💰 Invoice paid:', invoice.id);

  const inv: any = invoice;
  
  if (!inv.subscription) {
    console.log('Brak subscription w invoice');
    return;
  }

  const subscriptionId = typeof inv.subscription === 'string' 
    ? inv.subscription 
    : inv.subscription.id;

  const subscription: any = await stripe.subscriptions.retrieve(subscriptionId);
  const customerId = subscription.customer as string;
  const customer: any = await stripe.customers.retrieve(customerId);
  
  if (customer.deleted) return;

  const clerkUserId = customer.metadata?.clerk_user_id;
  if (!clerkUserId) return;

  // Odnów kredyty na nowy miesiąc
  const priceId = subscription.items.data[0].price.id;
  let credits = 100;

  if (priceId === process.env.STRIPE_PRICE_ID_PREMIUM) {
    credits = 500;
  }

  const resetDate = subscription.current_period_end 
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  await supabaseAdmin
    .from('users')
    .update({
      credits_remaining: credits,
      credits_reset_date: resetDate,
    })
    .eq('clerk_user_id', clerkUserId);

  console.log(`✅ Kredyty odnowione: ${credits}`);
}

// Obsługa nieudanej płatności
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.error('⚠️ Invoice payment failed:', invoice.id);

  const inv: any = invoice;
  
  if (!inv.subscription) {
    console.log('Brak subscription w invoice');
    return;
  }

  const subscriptionId = typeof inv.subscription === 'string' 
    ? inv.subscription 
    : inv.subscription.id;

  const subscription: any = await stripe.subscriptions.retrieve(subscriptionId);
  const customerId = subscription.customer as string;
  const customer: any = await stripe.customers.retrieve(customerId);
  
  if (customer.deleted) return;

  const clerkUserId = customer.metadata?.clerk_user_id;
  if (!clerkUserId) return;

  // Oznacz jako past_due
  await supabaseAdmin
    .from('users')
    .update({
      subscription_status: 'past_due',
    })
    .eq('clerk_user_id', clerkUserId);

  console.log('⚠️ Subskrypcja oznaczona jako past_due');
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';