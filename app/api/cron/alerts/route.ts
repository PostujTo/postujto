import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendAnthropicCostAlert, sendSupabaseAlert, sendWeeklyReport } from '@/lib/email';
import { sendDailyUsageReport } from '@/lib/alerts';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ANTHROPIC_THRESHOLDS = [50, 100, 200];
const SUPABASE_STORAGE_LIMIT_MB = 500;
const SUPABASE_ALERT_PERCENT = 80;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const isMonday = now.getDay() === 1;
  const results: string[] = [];

  // 1. ANTHROPIC COST CHECK
  try {
    const currentMonth = now.toISOString().slice(0, 7);
    const anthropicRes = await fetch('https://api.anthropic.com/v1/usage', {
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
    });
    if (anthropicRes.ok) {
      const usage = await anthropicRes.json();
      const costUSD: number = usage?.total_cost_usd || 0;
      for (const threshold of ANTHROPIC_THRESHOLDS) {
        if (costUSD >= threshold) {
          const { data: existing } = await supabase
            .from('alert_log')
            .select('id')
            .eq('type', `anthropic_${threshold}`)
            .eq('period', currentMonth)
            .maybeSingle();
          if (!existing) {
            await sendAnthropicCostAlert({ cost: costUSD, threshold, period: currentMonth });
            await supabase.from('alert_log').insert({ type: `anthropic_${threshold}`, period: currentMonth });
            results.push(`Anthropic alert $${threshold} wyslany`);
          }
        }
      }
    }
  } catch (err) {
    console.error('Anthropic check error:', err);
    results.push('Anthropic check failed');
  }

  // 2. SUPABASE STORAGE CHECK
  try {
    const { data: storageMB } = await supabase.rpc('get_db_size_mb');
    const percent = Math.round(((storageMB || 0) / SUPABASE_STORAGE_LIMIT_MB) * 100);
    if (percent >= SUPABASE_ALERT_PERCENT) {
      const today = now.toISOString().slice(0, 10);
      const { data: existing } = await supabase
        .from('alert_log')
        .select('id')
        .eq('type', 'supabase_storage')
        .eq('period', today)
        .maybeSingle();
      if (!existing) {
        await sendSupabaseAlert({
          type: 'storage',
          current: Math.round(storageMB || 0),
          limit: SUPABASE_STORAGE_LIMIT_MB,
          percent,
        });
        await supabase.from('alert_log').insert({ type: 'supabase_storage', period: today });
        results.push(`Supabase storage alert wyslany (${percent}%)`);
      }
    }
  } catch (err) {
    console.error('Supabase check error:', err);
    results.push('Supabase check failed');
  }

  // 3. WEEKLY REPORT (tylko poniedzialek)
  if (isMonday) {
    try {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [
        { count: newUsers },
        { count: totalUsers },
        { count: newSubscriptions },
        { count: totalSubscriptions },
        { count: weekGenerations },
        { count: totalGenerations },
        { data: planCounts },
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).neq('subscription_plan', 'free').gte('updated_at', weekAgo),
        supabase.from('users').select('*', { count: 'exact', head: true }).neq('subscription_plan', 'free'),
        supabase.from('generations').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
        supabase.from('generations').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('plan').neq('subscription_plan', 'free'),
      ]);

      const revenue = (planCounts || []).reduce((acc: number, u: { plan: string }) =>
        acc + (u.plan === 'standard' ? 79 : u.plan === 'premium' ? 199 : 0), 0);

      await sendWeeklyReport({
        newUsers: newUsers || 0,
        totalUsers: totalUsers || 0,
        newSubscriptions: newSubscriptions || 0,
        totalSubscriptions: totalSubscriptions || 0,
        weekGenerations: weekGenerations || 0,
        totalGenerations: totalGenerations || 0,
        revenue,
      });
      results.push('Weekly report wyslany');
    } catch (err) {
      console.error('Weekly report error:', err);
      results.push('Weekly report failed');
    }
  }

  // 4. DAILY USAGE REPORT
  try {
    await sendDailyUsageReport();
    results.push('Daily usage report wysłany (lub pominięty — brak generacji wczoraj)');
  } catch (err) {
    console.error('Daily usage report error:', err);
    results.push('Daily usage report failed');
  }

  return NextResponse.json({ ok: true, results, timestamp: now.toISOString() });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';