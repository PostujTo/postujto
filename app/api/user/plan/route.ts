import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ plan: 'free' });

  const { data } = await supabase
    .from('users')
    .select('subscription_plan, subscription_price_id')
    .eq('clerk_user_id', userId)
    .single();

  const annualIds = [
    process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD_ANNUAL,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM_ANNUAL,
  ].filter(Boolean);
  const isAnnual = annualIds.includes(data?.subscription_price_id ?? '');
  return NextResponse.json({ plan: data?.subscription_plan || 'free', is_annual: isAnnual });
}
