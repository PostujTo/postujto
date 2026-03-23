import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const industry = searchParams.get('industry');
  if (!industry) return NextResponse.json({ count: 0 });

  const today = new Date().toISOString().split('T')[0];
  const { count } = await supabase
    .from('generations')
    .select('*', { count: 'exact', head: true })
    .eq('industry', industry)
    .gte('created_at', `${today}T00:00:00Z`);

  const displayCount = (count || 0) + Math.floor(Math.random() * 15 + 5);
  return NextResponse.json({ count: displayCount }, { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' } });
}
