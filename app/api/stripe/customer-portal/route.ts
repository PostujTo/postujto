import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Nie zalogowany' }, { status: 401 });
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id')
      .eq('clerk_user_id', userId)
      .single();

    if (error || !user?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Nie znaleziono klienta Stripe' },
        { status: 404 }
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: process.env.NEXT_PUBLIC_APP_URL || 'https://postujto.vercel.app',
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error('Błąd Customer Portal:', error);
    return NextResponse.json(
      { error: 'Błąd serwera', details: error.message },
      { status: 500 }
    );
  }
}