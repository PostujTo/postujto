import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Server-side SupabaseAdmin client z service role
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // Sprawdź czy użytkownik jest zalogowany
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Nie zalogowany' },
        { status: 401 }
      );
    }

    const { priceId } = await request.json();
    
console.log('🔍 DEBUG:', { priceId, env_standard: process.env.STRIPE_PRICE_ID_STANDARD, env_premium: process.env.STRIPE_PRICE_ID_PREMIUM });

    if (!priceId) {
      return NextResponse.json(
        { error: 'Brak priceId' },
        { status: 400 }
      );
    }

    // Pobierz użytkownika z SupabaseAdmin
const { data: userData, error: userError } = await supabaseAdmin
  .from('users')
  .select('*')
  .eq('clerk_user_id', userId)
  .single();

let user = userData;
if (userError || !user) {
  const { currentUser } = await import('@clerk/nextjs/server');
  const clerkUser = await currentUser();
  
  const { data: newUser, error: createError } = await supabaseAdmin
    .from('users')
    .insert({
      clerk_user_id: userId,
      email: clerkUser?.emailAddresses[0]?.emailAddress || '',
      subscription_plan: 'free',
      credits_total: 10,
      credits_remaining: 10,
    })
    .select()
    .single();

  if (createError || !newUser) {
    return NextResponse.json({ error: 'Nie można utworzyć użytkownika' }, { status: 500 });
  }
  user = newUser;
}
// Po pobraniu `user` z Supabase, a przed tworzeniem customerId
// Sprawdź czy użytkownik już ma aktywną subskrypcję
if (user.subscription_plan && user.subscription_plan !== 'free') {
  return NextResponse.json(
    { error: 'Masz już aktywną subskrypcję. Anuluj ją przed zakupem nowej.' },
    { status: 400 }
  );
}
    // Jeśli użytkownik już ma stripe_customer_id, użyj go
    let customerId = user.stripe_customer_id;

    // Jeśli nie ma, utwórz nowego klienta w Stripe
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          clerk_user_id: userId,
          supabase_user_id: user.id,
        },
      });

      customerId = customer.id;

      // Zapisz stripe_customer_id w SupabaseAdmin
      await supabaseAdmin
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Utwórz Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing`,
      metadata: {
        clerk_user_id: userId,
        supabase_user_id: user.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Błąd Stripe Checkout:', error);
    return NextResponse.json(
      { error: 'Błąd podczas tworzenia sesji płatności', details: error.message },
      { status: 500 }
    );
  }
}