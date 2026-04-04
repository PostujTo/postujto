import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getSupabaseUserId(clerkUserId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single();
  if (error || !data) return null;
  return data.id as string;
}

// GET /api/calendar/topics?year=2026&month=3
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get('year') || '');
  const month = parseInt(searchParams.get('month') || ''); // 1-based

  if (isNaN(year) || isNaN(month)) {
    return NextResponse.json({ error: 'Brak parametrow year/month' }, { status: 400 });
  }

  const supabaseUserId = await getSupabaseUserId(userId);
  if (!supabaseUserId) return NextResponse.json({ error: 'Nie znaleziono uzytkownika' }, { status: 404 });

  const from = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(Number(year), Number(month), 0).getDate();
  const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const { data, error } = await supabase
    .from('calendar_topics')
    .select('date, topic, platform, platforms, generated, generated_platforms, post_text, hashtags, posts_by_platform, generation_id_per_platform, is_favorite_per_platform')
    .eq('user_id', supabaseUserId)
    .gte('date', from)
    .lte('date', to);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ topics: data || [] });
}

// POST /api/calendar/topics
// Body: { topics: Array<{ date, topic, platform, generated?, post_text?, hashtags? }> }
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const topics: Array<{
    date: string;
    topic: string;
    platform: string;
    platforms?: string[];
    generated?: boolean;
    generated_platforms?: Record<string, boolean>;
    post_text?: string;
    hashtags?: string[];
    posts_by_platform?: Record<string, { text: string; hashtags: string[] }>;
    generation_id_per_platform?: Record<string, string | null>;
  }> = body.topics;

  if (!Array.isArray(topics) || topics.length === 0) {
    return NextResponse.json({ error: 'Brak danych' }, { status: 400 });
  }

  const supabaseUserId = await getSupabaseUserId(userId);
  if (!supabaseUserId) return NextResponse.json({ error: 'Nie znaleziono uzytkownika' }, { status: 404 });

  const rows = topics.map(t => ({
    user_id: supabaseUserId,
    date: t.date,
    topic: t.topic,
    platform: t.platform,
    platforms: t.platforms ?? [t.platform],
    generated: t.generated ?? false,
    generated_platforms: t.generated_platforms ?? {},
    post_text: t.post_text ?? null,
    hashtags: t.hashtags ?? [],
    posts_by_platform: t.posts_by_platform ?? {},
    generation_id_per_platform: t.generation_id_per_platform ?? {},
  }));

  const { error } = await supabase
    .from('calendar_topics')
    .upsert(rows, { onConflict: 'user_id,date' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
