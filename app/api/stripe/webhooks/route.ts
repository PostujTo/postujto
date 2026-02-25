import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

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

      // Get subscription details
      const subscription: any = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0].price.id;

      // Determine plan
      let plan: 'standard' | 'premium' = 'standard';
      let credits = 100;

      if (priceId === process.env.STRIPE_PRICE_ID_PREMIUM) {
        plan = 'premium';
        credits = 500;
      }

      console.log('📝 Updating user:', { clerkUserId, plan, credits });

      // Update user in Supabase
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

      console.log('✅ User updated successfully');
    }
// Odnowienie subskrypcji co miesiąc
if (event.type === 'invoice.payment_succeeded') {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionId = (invoice as any).subscription as string;
  if (!subscriptionId) return NextResponse.json({ received: true });

  const subscription: any = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0].price.id;

  let credits = 100;
  if (priceId === process.env.STRIPE_PRICE_ID_PREMIUM) credits = 500;

  await supabaseAdmin
    .from('users')
    .update({ credits_remaining: credits, credits_total: credits })
    .eq('stripe_subscription_id', subscriptionId);

  console.log('✅ Kredyty odnowione dla subskrypcji:', subscriptionId);
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
      credits_total: 10,
      credits_remaining: 10,
    })
    .eq('stripe_subscription_id', subscription.id);

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

// Vercel config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';