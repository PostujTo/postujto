import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(_req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: user } = await supabase
    .from('users')
    .select('id, subscription_plan, ayrshare_profile_key')
    .eq('clerk_user_id', userId)
    .single();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (user.subscription_plan === 'free') return NextResponse.json({ synced: 0 });
  if (!user.ayrshare_profile_key) return NextResponse.json({ synced: 0 });

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data: generations } = await supabase
    .from('generations')
    .select('id, ayrshare_post_id, stats_synced_at')
    .eq('user_id', user.id)
    .not('ayrshare_post_id', 'is', null)
    .or(`stats_synced_at.is.null,stats_synced_at.lt.${oneHourAgo}`);

  if (!generations?.length) return NextResponse.json({ synced: 0 });

  let synced = 0;
  await Promise.allSettled(
    generations.map(async (gen) => {
      try {
        const res = await fetch(
          `https://zernio.com/api/v1/analytics/${gen.ayrshare_post_id}`,
          { headers: { Authorization: `Bearer ${process.env.ZERNIO_API_KEY}` } }
        );
        if (!res.ok) return;
        const data = await res.json();
        const platforms: Record<string, any> = data.platforms || {};

        const stats_likes       = Object.values(platforms).reduce((s: number, p: any) => s + (p.likes || 0), 0);
        const stats_comments    = Object.values(platforms).reduce((s: number, p: any) => s + (p.comments || 0), 0);
        const stats_shares      = Object.values(platforms).reduce((s: number, p: any) => s + (p.shares || 0), 0);
        const stats_impressions = Object.values(platforms).reduce((s: number, p: any) => s + (p.impressions || 0), 0);
        const stats_reach       = Object.values(platforms).reduce((s: number, p: any) => s + (p.reach || p.views || 0), 0);

        await supabase
          .from('generations')
          .update({ stats_likes, stats_comments, stats_shares, stats_impressions, stats_reach, stats_synced_at: new Date().toISOString() })
          .eq('id', gen.id);

        synced++;
      } catch {
        // Per-post errors nie przerywają całego sync
      }
    })
  );

  return NextResponse.json({ synced });
}
