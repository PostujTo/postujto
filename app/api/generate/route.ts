import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

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
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Musisz być zalogowany' },
        { status: 401 }
      );
    }

    // Pobierz użytkownika z Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Nie znaleziono użytkownika' },
        { status: 404 }
      );
    }

    // Sprawdź czy ma kredyty
    if (user.credits_remaining <= 0) {
      return NextResponse.json(
        { 
          error: 'Brak kredytów',
          message: 'Wykorzystałeś wszystkie kredyty w tym miesiącu. Przejdź na plan Standard lub Premium!',
          creditsRemaining: 0
        },
        { status: 403 }
      );
    }

    const { topic, platform, tone, length, industry } = await request.json();

    // Walidacja
    if (!topic || !platform || !tone || !length) {
      return NextResponse.json(
        { error: 'Brakuje wymaganych parametrów' },
        { status: 400 }
      );
    }

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

const prompt = `Jesteś ekspertem od social media marketingu w Polsce. Wygeneruj 3 różne wersje postu na ${platformDescription}.${industryHint}${polishLawHint}

TEMAT: ${topic}

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

    // Wywołanie Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
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

    // ============================================
    // ODEJMIJ KREDYT I ZAPISZ GENERACJĘ
    // ============================================
    
    // Odejmij kredyt
    const { error: creditError } = await supabase
      .from('users')
      .update({ 
        credits_remaining: user.credits_remaining - 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (creditError) {
      console.error('Błąd odejmowania kredytu:', creditError);
    }

    // Zapisz generację w historii
    const { error: historyError } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        topic,
        platform,
        tone,
        length,
        generated_posts: jsonData.posts,
        quality_tier: 'standard',
        has_image: false,
        has_audio: false,
        cost_usd: 0.015, // Koszt Claude
      });

    if (historyError) {
      console.error('Błąd zapisywania generacji:', historyError);
    }

    // Pobierz ID nowo zapisanej generacji
const { data: newGen } = await supabase
  .from('generations')
  .select('id')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(1)
  .single();

return NextResponse.json({
  ...jsonData,
  generationId: newGen?.id || null,
  creditsRemaining: user.credits_remaining - 1,
  creditsTotal: user.credits_total,
});
  } catch (error: any) {
    console.error('Błąd API:', error);
    return NextResponse.json(
      { 
        error: 'Wystąpił błąd podczas generowania postów',
        details: error.message 
      },
      { status: 500 }
    );
  }
}