import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  // Pobierz wszystkich userów z połączonym Zernio i planem Starter/Pro
  const { data: users } = await supabase
    .from('users')
    .select('id')
    .not('ayrshare_profile_key', 'is', null)
    .in('subscription_plan', ['standard', 'premium']);

  if (!users?.length) return NextResponse.json({ synced: 0 });

  let totalSynced = 0;

  for (const user of users) {
    const { data: generations } = await supabase
      .from('generations')
      .select('id, ayrshare_post_id')
      .eq('user_id', user.id)
      .not('ayrshare_post_id', 'is', null)
      .gte('created_at', thirtyDaysAgo)
      .or(`stats_synced_at.is.null,stats_synced_at.lt.${oneHourAgo}`);

    if (!generations?.length) continue;

    const results = await Promise.allSettled(
      generations.map(async (gen) => {
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
      })
    );

    totalSynced += results.filter(r => r.status === 'fulfilled').length;
  }

  return NextResponse.json({ synced: totalSynced });
}
