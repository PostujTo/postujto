import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Nie zalogowany' }, { status: 401 });

  const { data: user } = await supabase.from('users').select('id').eq('clerk_user_id', userId).single();
  if (!user) return NextResponse.json({ error: 'Brak użytkownika' }, { status: 404 });

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: gens } = await supabase
    .from('generations')
    .select('topic, platform, tone, ratings, performance, created_at, generated_posts')
    .eq('user_id', user.id)
    .gte('created_at', firstDay)
    .order('created_at', { ascending: false })
    .limit(50);

  if (!gens || gens.length === 0) {
    return NextResponse.json({ error: 'Brak danych z tego miesiąca' }, { status: 400 });
  }

  const summary = gens.map(g => ({
    topic: g.topic,
    platform: g.platform,
    tone: g.tone,
    avgRating: g.ratings && Object.keys(g.ratings).length > 0
      ? (Object.values(g.ratings).reduce((a: number, b) => a + (b as number), 0) / Object.keys(g.ratings).length).toFixed(1)
      : null,
    performance: g.performance || null,
  }));

  const topRated = summary.filter(g => g.avgRating && parseFloat(g.avgRating) >= 4);
  const withPerformance = summary.filter(g => g.performance && Object.keys(g.performance).length > 0);

  const nowDate = new Date();
  const dateStr = `${nowDate.getDate()}.${nowDate.getMonth() + 1}.${nowDate.getFullYear()}`;
  const prompt = `Aktualna data: ${dateStr}. Rok: ${nowDate.getFullYear()}.

Jesteś ekspertem od social media marketingu. Przeanalizuj dane o postach z tego miesiąca i napisz zwięzły raport po polsku.

DANE Z MIESIĄCA (${gens.length} postów):
${JSON.stringify(summary.slice(0, 20), null, 2)}

NAJLEPIEJ OCENIONE POSTY (${topRated.length}):
${topRated.map(g => `- ${g.topic} (${g.platform}, ocena: ${g.avgRating}★)`).join('\n') || 'Brak ocen'}

POSTY Z WYNIKAMI (${withPerformance.length}):
${withPerformance.map(g => `- ${g.topic}: ${JSON.stringify(g.performance)}`).join('\n') || 'Brak danych'}

Napisz raport w formacie JSON (bez markdown):
{
  "summary": "2-3 zdania podsumowania miesiąca",
  "topInsights": ["insight 1", "insight 2", "insight 3"],
  "bestPlatform": "która platforma dała najlepsze wyniki i dlaczego",
  "recommendations": ["rekomendacja 1", "rekomendacja 2", "rekomendacja 3"],
  "nextMonthTips": "1-2 zdania co robić w przyszłym miesiącu"
}`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  try {
    const report = JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    return NextResponse.json({ report, postsCount: gens.length });
  } catch {
    return NextResponse.json({ error: 'Błąd parsowania raportu' }, { status: 500 });
  }
}