import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ terms_accepted_at: null });

  const { data } = await supabase
    .from('users')
    .select('terms_accepted_at')
    .eq('clerk_user_id', userId)
    .single();

  return NextResponse.json({ terms_accepted_at: data?.terms_accepted_at ?? null });
}