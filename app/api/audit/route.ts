import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { hasAnnualPlan, canUseAudit, nextAuditDate } from '@/lib/subscription';

const anthropic = new Anthropic();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { posts } = await req.json();
  if (!posts || typeof posts !== 'string') {
    return NextResponse.json({ error: 'Za mało treści do analizy' }, { status: 400 });
  }
  const trimmedPosts = posts.trim();
  if (trimmedPosts.length < 50) {
    return NextResponse.json({ error: 'Za mało treści do analizy (min. 50 znaków)' }, { status: 400 });
  }
  if (trimmedPosts.length > 15000) {
    return NextResponse.json({ error: 'Treść zbyt długa (max 15 000 znaków)' }, { status: 400 });
  }

  const { data: user } = await supabase
    .from('users')
    .select('id, subscription_price_id, audit_used_at, ayrshare_profile_key')
    .eq('clerk_user_id', userId)
    .single();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!hasAnnualPlan(user.subscription_price_id)) {
    return NextResponse.json({ error: 'annual_required' }, { status: 403 });
  }

  if (!canUseAudit(user.audit_used_at)) {
    return NextResponse.json({
      error: 'limit',
      nextAuditAt: nextAuditDate(user.audit_used_at!).toISOString(),
    }, { status: 429 });
  }

  const { data: brandKit } = await supabase
    .from('brand_kits')
    .select('company_name, tone')
    .eq('user_id', user.id)
    .single();

  // Best-time z Zernio Analytics (opcjonalne — tylko jeśli user ma połączone Zernio)
  let bestTimesSection = '';
  if (user.ayrshare_profile_key) {
    try {
      const platforms = ['facebook', 'instagram', 'tiktok'];
      const btResults = await Promise.allSettled(
        platforms.map(platform =>
          fetch(
            `https://zernio.com/api/v1/analytics/best-time?platform=${platform}&profileId=${user.ayrshare_profile_key}`,
            { headers: { Authorization: `Bearer ${process.env.ZERNIO_API_KEY}` } }
          ).then(r => r.ok ? r.json() : null)
        )
      );
      const [fb, ig, tt] = btResults.map(r => r.status === 'fulfilled' ? r.value : null);
      const formatSlots = (data: any) => {
        if (!data?.slots?.length) return 'brak danych';
        return data.slots.slice(0, 2).map((s: any) => `${s.day} ${s.hour}:00 UTC (eng: ${s.avg_engagement?.toFixed(1) ?? '?'})`).join(', ');
      };
      if (fb || ig || tt) {
        bestTimesSection = `\n## Dane analityczne z platform (Zernio):\nNajlepsze godziny publikowania:\n- Facebook: ${formatSlots(fb)}\n- Instagram: ${formatSlots(ig)}\n- TikTok: ${formatSlots(tt)}\n`;
      }
    } catch {
      // Brak danych best-time — audyt działa bez nich
    }
  }

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: 'ODPOWIADAJ WYŁĄCZNIE PO POLSKU. Każdy wygenerowany post, każde zdanie, każde słowo musi być w języku polskim. Nigdy nie używaj angielskiego ani żadnego innego języka, nawet jeśli dane wejściowe (Brand Kit, tematy, nazwy pól) są po angielsku.',
    messages: [{
      role: 'user',
      content: `Jesteś ekspertem od marketingu w mediach społecznościowych dla polskich małych firm.

Firma: ${brandKit?.company_name || 'nieznana'}
Deklarowany ton: ${brandKit?.tone || 'nieznany'}

Oto ostatnie posty tej firmy:
${posts}

Przeprowadź szczegółowy audyt tych postów. Odpowiedz w języku polskim, używając struktury:

## 💪 Co robisz dobrze
(3-4 konkretne rzeczy)

## 🔧 Co warto poprawić
(3-4 konkretne wskazówki z przykładami)

## 📅 Częstotliwość i timing
(analiza i rekomendacje)
${bestTimesSection}

## #️⃣ Hashtagi
(ocena i sugestie)

## 🎯 Dopasowanie do branży
(czy posty brzmią branżowo i wiarygodnie)

## ⭐ Jedna najważniejsza zmiana
(jedno działanie które przyniesie największy efekt)

Bądź konkretny, praktyczny i konstruktywny. Używaj przykładów z dostarczonych postów.`
    }]
  });

  const auditResult = message.content[0].type === 'text'
    ? message.content[0].text
    : 'Nie udało się wygenerować audytu.';

  await supabase
    .from('users')
    .update({ audit_used_at: new Date().toISOString() })
    .eq('id', user.id);

  return NextResponse.json({ result: auditResult });
}
