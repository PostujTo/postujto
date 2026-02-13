import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { topic, platform, tone, length } = await request.json();

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
    };

    const targetLength = lengthMap[length as keyof typeof lengthMap];
    const toneDescription = toneMap[tone as keyof typeof toneMap];
    const platformDescription = platformMap[platform as keyof typeof platformMap];

    // Prompt dla Claude
    const prompt = `Jesteś ekspertem od social media marketingu. Wygeneruj 3 różne wersje postu na ${platformDescription}.

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
      return NextResponse.json({
        posts: [
          {
            text: responseText,
            hashtags: ['#socialmedia', '#marketing', '#polska'],
            imagePrompt: `Grafika związana z: ${topic}`,
          },
        ],
      });
    }

    return NextResponse.json(jsonData);
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