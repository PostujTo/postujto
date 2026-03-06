import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: user } = await supabaseAdmin
    .from('users').select('*').eq('clerk_user_id', userId).single();

  const { data: generations } = await supabaseAdmin
    .from('generations').select('*').eq('user_id', user?.id);

  return NextResponse.json({
    exported_at: new Date().toISOString(),
    user: { email: user?.email, full_name: user?.full_name, subscription_plan: user?.subscription_plan, created_at: user?.created_at },
    generations_count: generations?.length || 0,
    generations: generations?.map(g => ({
      topic: g.topic, platform: g.platform, tone: g.tone,
      created_at: g.created_at, is_favorite: g.is_favorite,
    })),
  });
}