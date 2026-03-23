import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import Anthropic from '@anthropic-ai/sdk';
import { RSS_SOURCES } from '@/lib/rss-sources';

const resend = new Resend(process.env.RESEND_API_KEY);
const anthropic = new Anthropic();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

async function fetchRSSHeadlines(urls: string[], limit: number): Promise<string[]> {
  const headlines: string[] = [];
  for (const url of urls) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      const text = await response.text();
      const matches = text.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/g) ?? [];
      const titles = matches
        .slice(1, limit)
        .map(t => t.replace(/<title>|<\/title>|<!\[CDATA\[|\]\]>/g, '').trim())
        .filter(t => t.length > 10);
      headlines.push(...titles);
    } catch { /* ignoruj bledy pojedynczego zrodla */ }
  }
  return headlines.slice(0, limit);
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const today = new Date().toISOString().split('T')[0];

  const { data: proUsers } = await supabase
    .from('users')
    .select('id, email, industry:brand_kits(industry, company_name)')
    .eq('subscription_plan', 'premium')
    .or(`trend_suggested_at.is.null,trend_suggested_at.lt.${today}T00:00:00Z`)
    .not('email', 'is', null)
    .limit(100);

  if (!proUsers?.length) return new Response('OK - no pro users', { status: 200 });

  const byIndustry = groupBy(proUsers as any[], u => (u.industry as any)?.[0]?.industry ?? '_default');

  for (const [industry, users] of Object.entries(byIndustry)) {
    try {
      const rssSources = RSS_SOURCES[industry] ?? RSS_SOURCES._default;
      const headlines = await fetchRSSHeadlines(rssSources, 10);
      if (!headlines.length) continue;

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `Jestes doradca marketingowym dla polskich firm z branzy: ${industry}.\n\nOto dzisiejsze naglowki z branzowych portali:\n${headlines.map((h, i) => `${i + 1}. ${h}`).join('\n')}\n\nWybierz JEDEN temat ktory:\n1. Jest aktualny i relevantny dla tej branzy\n2. Mozna wykorzystac do ciekawego posta na social media\n3. Bedzie interesujacy dla klientow tej branzy\n\nOdpowiedz TYLKO w formacie JSON:\n{"topic": "krotki tytul tematu posta (max 10 slow)", "reason": "dlaczego warto o tym napisac (1 zdanie)"}`,
        }],
      });

      let result: { topic?: string; reason?: string } = {};
      try {
        const raw = message.content[0].type === 'text' ? message.content[0].text : '{}';
        result = JSON.parse(raw);
      } catch { continue; }
      if (!result.topic) continue;

      for (const user of users as any[]) {
        const companyName = (user.industry as any)?.[0]?.company_name ?? 'Twoja firma';
        try {
          await resend.emails.send({
            from: 'PostujTo <hello@postujto.com>',
            to: user.email,
            subject: `Trend dnia dla ${companyName}: ${result.topic}`,
            html: `
              <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
                <h2>Trend dnia w Twojej branzy</h2>
                <p>Dzis warto napisac o:</p>
                <div style="background: #f0f0ff; border-left: 4px solid #6C47FF; padding: 12px 16px; border-radius: 4px; margin: 16px 0;">
                  <strong>${result.topic}</strong>
                  <p style="margin: 8px 0 0; color: #555; font-size: 14px;">${result.reason ?? ''}</p>
                </div>
                <a href="https://www.postujto.com/app?topic=${encodeURIComponent(result.topic)}&industry=${industry}"
                   style="display: inline-block; background: #6C47FF; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                  Wygeneruj post na ten temat &rarr;
                </a>
                <p style="color: #888; font-size: 12px; margin-top: 24px;">
                  PostujTo Pro &mdash; Twoj osobisty doradca marketingowy<br>
                  <a href="https://www.postujto.com/settings" style="color: #888;">Zarzadzaj powiadomieniami</a>
                </p>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error(`Trend email failed for user ${user.id}:`, emailErr);
        }

        void supabase
          .from('users')
          .update({ trend_suggested_at: new Date().toISOString() })
          .eq('id', user.id);
      }
    } catch (err) {
      console.error(`Trend advisor failed for industry ${industry}:`, err);
    }
  }

  return new Response('OK', { status: 200 });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';