import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rateLimit';
import { GOLDEN_PATTERNS, LP_SLUG_BY_INDUSTRY_ID, buildSystemPrompt } from '@/lib/prompts';
import { sendUsageAlert } from '@/lib/alerts';

// Server-side Supabase client z service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    // Pobierz ID zalogowanego użytkownika z Clerk
    const { userId } = await auth();
const isGuest = !userId;

// Rate limiting
const rateLimitKey = userId || request.headers.get('x-forwarded-for') || 'guest';
const allowed = await rateLimit(rateLimitKey, 'generate', 10, 60000);
if (!allowed) {
  return NextResponse.json(
    { error: 'Zbyt wiele żądań. Spróbuj za chwilę.' },
    { status: 429 }
  );
}

    // Pobierz użytkownika z Supabase (tylko dla zalogowanych)
    let user = null;
    if (!isGuest) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, credits_remaining, credits_total, subscription_plan')
        .eq('clerk_user_id', userId)
        .single();

      if (userError || !userData) {
        return NextResponse.json(
          { error: 'Nie znaleziono użytkownika' },
          { status: 404 }
        );
      }

      user = userData;

      // Kredyty odejmowane atomicznie przez RPC poniżej
    }

    const body = await request.json();
const { topic, platform, tone, length, industry, industryId, scheduled_date, use_brand_voice, isPreview, brandKitOverride } = body;

// Walidacja obecności
if (!topic || !platform || !tone || !length) {
  return NextResponse.json(
    { error: 'Brakuje wymaganych parametrów' },
    { status: 400 }
  );
}

// Walidacja długości i typów
if (typeof topic !== 'string' || topic.length > 500) {
  return NextResponse.json(
    { error: 'Temat posta jest za długi (max 500 znaków)' },
    { status: 400 }
  );
}

if (!['facebook', 'instagram', 'tiktok'].includes(platform)) {
  return NextResponse.json(
    { error: 'Nieprawidłowa platforma' },
    { status: 400 }
  );
}

if (!['professional', 'casual', 'humorous', 'sales'].includes(tone)) {
  return NextResponse.json(
    { error: 'Nieprawidłowy ton' },
    { status: 400 }
  );
}

if (!['short', 'medium', 'long'].includes(length)) {
  return NextResponse.json(
    { error: 'Nieprawidłowa długość' },
    { status: 400 }
  );
}

// Sanityzacja — usuń potencjalnie złośliwe znaki
const sanitizedTopic = topic.replace(/<[^>]*>/g, '').trim();

    // Mapowanie długości na liczbę znaków
    const lengthMap = {
      short: 100,
      medium: 250,
      long: 500,
    };

    // Mapowanie tonu na opis
    const toneMap = {
      professional: 'profesjonalny, formalny, biznesowy',
      casual: 'swobodny, przyjazny, nieformalny',
      humorous: 'humorystyczny, zabawny, lekki',
      sales: 'sprzedażowy, przekonujący, zachęcający do akcji',
    };

    // Mapowanie platformy na specyfikę
    const platformMap = {
  facebook: 'Facebook - możesz użyć dłuższych akapitów, ale podziel tekst dla czytelności',
  instagram: 'Instagram - krótkie akapity, angażujące od pierwszych słów, przyjazne emoji',
  tiktok: 'TikTok - bardzo krótki, chwytliwy tekst do opisu wideo, max 150 znaków, dużo emoji, młodzieżowy język, trending hashtagi',
};

    const targetLength = lengthMap[length as keyof typeof lengthMap];
    const toneDescription = toneMap[tone as keyof typeof toneMap];
    const platformDescription = platformMap[platform as keyof typeof platformMap];

    // Prompt dla Claude
    const industryHint = industry 
  ? `\nBRANŻA: ${industry} - dostosuj język, styl i treść do tej branży.`
  : '';

    // Złoty Wzorzec — wstrzykiwany gdy użytkownik wybrał branżę w generatorze
    const goldenKey = industryId ? LP_SLUG_BY_INDUSTRY_ID[industryId as string] : undefined;
    const goldenPattern = goldenKey ? GOLDEN_PATTERNS[goldenKey] : undefined;
    const goldenPatternSection = goldenPattern ? `

## Złoty Wzorzec dla tej branży
Zastosuj w każdym wygenerowanym poście:
- Główny Ból klienta końcowego: ${goldenPattern.pain}
- Wymarzony Rezultat: ${goldenPattern.dream}
- Kluczowy Styl postów: ${goldenPattern.style}

Zasady:
1. Użyj Bólu jako haczyka w postach sprzedażowych.
2. Wyeksponuj Wymarzony Rezultat jako główną korzyść.
3. Dla branż usługowych — buduj zaufanie przez konkret i dowody.
4. Dla branż wizualnych — buduj pragnienie przez opis sensoryczny.` : '';

const polishLawHint = `
POLSKIE PRAWO REKLAMOWE - przestrzegaj tych zasad:
- Ceny podawaj zawsze w PLN z VAT (ceny brutto)
- Nie używaj sformułowań "najlepszy", "nr 1", "jedyny" bez udokumentowania
- Promocje i wyprzedaże muszą mieć określony czas trwania
- Nie składaj obietnic których nie można spełnić (np. "gwarantujemy najniższą cenę")
- Unikaj sformułowań mogących wprowadzać w błąd konsumenta
- Dla suplementów/kosmetyków nie używaj twierdzeń medycznych
- Zawsze pisz po polsku, naturalnym językiem - nie tłumacz z angielskiego
- Używaj polskich zwrotów sprzedażowych: "sprawdź", "odkryj", "skorzystaj", "zadzwoń", "zarezerwuj"
- NIE używaj emoji ani emotikon w tekście postu - tylko czysty tekst
`;

// Pobierz Brand Kit + rated generations + feedback równolegle (#19)
    let fetchedBrandKit: any = null;
    let samplePostsHint = '';
    let brandContextHint = '';
    let ratingsHint = '';
    let feedbackHint = '';
    if (!isGuest) {
      const [brandKitRes, ratedGensRes, negFeedbacksRes] = await Promise.all([
        supabase
          .from('brand_kits')
          .select('sample_posts, company_name, tone, tone_source, industry, usp, usp_source, pain_point, pain_point_source, dream_outcome, dream_outcome_source, biggest_pain, unique_mechanism')
          .eq('user_id', user!.id)
          .single(),
        supabase
          .from('generations')
          .select('generated_posts, ratings, platform')
          .eq('user_id', user!.id)
          .eq('platform', platform)
          .not('ratings', 'eq', '{}')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('generations')
          .select('feedback_note')
          .eq('user_id', user!.id)
          .eq('feedback', 'not_my_style')
          .not('feedback_note', 'is', null)
          .order('created_at', { ascending: false })
          .limit(3),
      ]);

      const brandKit = brandKitRes.data;
      fetchedBrandKit = (isPreview && brandKitOverride) ? brandKitOverride : brandKit;

      if (use_brand_voice && brandKit?.sample_posts && brandKit.sample_posts.trim().length > 0) {
        samplePostsHint = `
GŁOS MARKI — BARDZO WAŻNE:
Poniżej przykładowe posty tej firmy. Przeanalizuj ich styl, długość zdań, sposób zwracania się do odbiorcy, użycie emoji, interpunkcję i słownictwo. Pisz DOKŁADNIE w tym samym stylu${brandKit.tone_source === 'manual' || !brandKit.tone_source ? ' — ale TON z sekcji WYMAGANIA poniżej ma priorytet absolutny (ustawiony ręcznie przez właściciela)' : ''}:

---
${brandKit.sample_posts.slice(0, 3000)}
---
`;
      }

      if (!brandKit?.company_name) {
        brandContextHint = `
KONTEKST FIRMY: Użytkownik nie skonfigurował profilu. Pisz dla małej polskiej firmy lub freelancera.
Na podstawie tematu posta postaraj się wywnioskować branżę i dostosuj styl.
Użyj swobodnego, ale profesjonalnego tonu — jak właściciel małej firmy który sam prowadzi social media.
Unikaj korporacyjnego języka i sztucznych zwrotów.
`;
      }

      const ratedGens = ratedGensRes.data;
      if (ratedGens && ratedGens.length > 0) {
        const highRated: string[] = [];
        const lowRated: string[] = [];
        ratedGens.forEach(gen => {
          if (!gen.ratings) return;
          Object.entries(gen.ratings).forEach(([idx, rating]) => {
            const post = gen.generated_posts?.[Number(idx)];
            if (!post) return;
            if ((rating as number) >= 4) highRated.push(post.text);
            if ((rating as number) <= 2) lowRated.push(post.text);
          });
        });
        if (highRated.length > 0 || lowRated.length > 0) {
          ratingsHint = `
FEEDBACK UŻYTKOWNIKA — uwzględnij przy generowaniu:
${highRated.length > 0 ? `\nPOSTY KTÓRE SIĘ PODOBAŁY (ocena 4-5★) — pisz podobnie:\n${highRated.slice(0, 3).map(t => `"${t.slice(0, 200)}"`).join('\n')}` : ''}
${lowRated.length > 0 ? `\nPOSTY KTÓRE SIĘ NIE PODOBAŁY (ocena 1-2★) — unikaj takiego stylu:\n${lowRated.slice(0, 2).map(t => `"${t.slice(0, 200)}"`).join('\n')}` : ''}
`;
        }
      }

      const negFeedbacks = negFeedbacksRes.data;
      if (negFeedbacks?.length) {
        feedbackHint = '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n## WAŻNE — Czego unikać (feedback od użytkownika)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
          + negFeedbacks.map((f: { feedback_note: string }) => `- "${f.feedback_note}"`).join('\n')
          + '\nUnikaj tych elementów w nowym poście.\n';
      }
    }

    const postCount = isGuest || isPreview ? 1 : 3;
    const now = new Date();
    const dateStr = `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}`;
    const prompt = `Aktualna data: ${dateStr}. Rok: ${now.getFullYear()}.

Wygeneruj ${postCount} ${isGuest ? 'wersję' : 'różne wersje'} postu na ${platformDescription}.${brandContextHint}${polishLawHint}${samplePostsHint}${ratingsHint}

TEMAT: ${sanitizedTopic}

WYMAGANIA:
- Długość: około ${targetLength} znaków
- Ton: ${toneDescription}
- Język: polski
- Format: naturalny, angażujący post

Dla każdego postu wygeneruj również:
1. 5-7 relevantnych hashtagów po polsku
2. Krótki opis grafiki AI (prompt do generatora obrazów)

ZWRÓĆ ODPOWIEDŹ W FORMACIE JSON (bez markdown backticks):
{
  "posts": [
    {
      "text": "treść postu...",
      "hashtags": ["#hashtag1", "#hashtag2", ...],
      "imagePrompt": "opis grafiki do wygenerowania przez AI..."
    },
    ... (3 wersje)
  ]
}

WAŻNE: Zwróć TYLKO czysty JSON, bez żadnego dodatkowego tekstu, komentarzy czy markdown formatowania.`;

    // System prompt — hierarchia priorytetów (Mega-Prompt)
    const systemPrompt = buildSystemPrompt({
      company_name: fetchedBrandKit?.company_name,
      industry: fetchedBrandKit?.industry || (industryId as string) || undefined,
      tone: fetchedBrandKit?.tone,
      tone_source: fetchedBrandKit?.tone_source,
      usp: fetchedBrandKit?.usp,
      usp_source: fetchedBrandKit?.usp_source,
      pain_point: fetchedBrandKit?.pain_point,
      pain_point_source: fetchedBrandKit?.pain_point_source,
      dream_outcome: fetchedBrandKit?.dream_outcome,
      dream_outcome_source: fetchedBrandKit?.dream_outcome_source,
    }, platform as 'facebook' | 'instagram' | 'tiktok', feedbackHint);

    // Wywołanie Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Parsowanie odpowiedzi
    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    // Próba wyciągnięcia JSON z odpowiedzi
    let jsonData;
    try {
      // Usuń ewentualne markdown backticks
      const cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      jsonData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Błąd parsowania JSON:', parseError);
      console.error('Odpowiedź Claude:', responseText);
      
      // Fallback - zwróć surowy tekst jako pojedynczy post
      jsonData = {
        posts: [
          {
            text: responseText,
            hashtags: ['#socialmedia', '#marketing', '#polska'],
            imagePrompt: `Grafika związana z: ${topic}`,
          },
        ],
      };
    }

    // Goście i preview — nie zapisujemy, nie odejmujemy kredytów
    if (isGuest || isPreview) {
      return NextResponse.json({
        ...jsonData,
        generationId: null,
        isGuest: isGuest,
      });
    }

    // ============================================
    // ODEJMIJ KREDYT I ZAPISZ GENERACJĘ
    // ============================================
    
    const { data: newCredits } = await supabase.rpc('decrement_credit', { p_user_id: user!.id });
    if (newCredits === -1 || newCredits === null) {
      return NextResponse.json(
        {
          error: 'Brak kredytów',
          message: 'Wykorzystałeś wszystkie kredyty w tym miesiącu. Przejdź na plan Standard lub Premium!',
          creditsRemaining: 0,
        },
        { status: 403 }
      );
    }

    const { data: newGen, error: historyError } = await supabase
      .from('generations')
      .insert({
        user_id: user!.id,
        topic,
        platform,
        tone,
        length,
        generated_posts: jsonData.posts,
        quality_tier: 'standard',
        has_image: false,
        has_audio: false,
        cost_usd: 0.015,
        scheduled_date: scheduled_date || null,
        industry: industryId || null,
      })
      .select('id')
      .single();

    if (historyError) {
      console.error('Błąd zapisywania generacji:', historyError);
    }

    // ============================================
    // MONITORING UŻYCIA — sprawdź anomalie
    // ============================================
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: monthlyCount } = await supabase
        .from('generations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .gte('created_at', startOfMonth.toISOString());

      const ALERT_THRESHOLDS = [100, 300, 500];
      if (monthlyCount && ALERT_THRESHOLDS.includes(monthlyCount)) {
        await sendUsageAlert({
          userId: user!.id,
          email: user!.email,
          plan: user!.subscription_plan,
          monthlyCount,
        });
      }
    } catch (monitorErr) {
      console.error('Błąd monitoringu użycia:', monitorErr);
    }

    // Aktualizuj last_active_at — fire and forget, nie blokuj odpowiedzi
    void (supabase
      .from('users')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', user!.id) as unknown as Promise<void>);

    return NextResponse.json({
      ...jsonData,
      generationId: newGen?.id || null,
      creditsRemaining: newCredits,
      creditsTotal: user!.credits_total,
    });
  } catch (error: any) {
    console.error('Błąd API:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas generowania postów' },
      { status: 500 }
    );
  }
}