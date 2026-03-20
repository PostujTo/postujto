import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { input } = await req.json();
  if (!input || input.trim().length < 5) {
    return NextResponse.json({ error: 'Podaj link lub opis firmy.' }, { status: 400 });
  }

  const anthropic = new Anthropic();
  const now = new Date();
  const dateStr = `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}`;

  let contentToAnalyze = input.trim();

  // Jeśli input wygląda jak URL — spróbuj pobrać stronę
  const looksLikeUrl = /^https?:\/\//i.test(input) ||
    (/\.[a-z]{2,}(\/|$)/i.test(input) && !input.includes(' '));

  if (looksLikeUrl) {
    const url = input.startsWith('http') ? input : `https://${input}`;
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PostujToBot/1.0)',
          'Accept': 'text/html,application/xhtml+xml',
        },
        signal: AbortSignal.timeout(8000),
      });
      if (response.ok) {
        const html = await response.text();
        contentToAnalyze = extractTextFromHtml(html).substring(0, 4000);
      }
    } catch {
      contentToAnalyze = `URL firmy: ${url}`;
    }
  }

  const prompt = `Aktualna data: ${dateStr}. Jesteś asystentem konfigurującym profil polskiej firmy w serwisie PostujTo.

Przeanalizuj poniższe informacje o firmie i wyciągnij dane do Brand Kitu.

DANE DO ANALIZY:
${contentToAnalyze}

Odpowiedz TYLKO w formacie JSON (bez markdown, bez komentarzy):
{
  "name": "nazwa firmy",
  "slogan": "slogan jeśli widoczny, lub pusty string",
  "industry": "DOKŁADNIE jedna z: restaurant|catering|bakery|food|beauty|hairdresser|fitness|medical|veterinary|fashion|ecommerce|crafts|florist|construction|carpenter|photography|automotive|tutoring|education|realestate|tourism",
  "tone": "DOKŁADNIE jedna z: professional|casual|humorous|sales",
  "description": "2-3 zdania o firmie, ofercie i klientach docelowych",
  "pain_point": "największy problem klientów tej firmy — 1 zdanie lub pusty string",
  "dream_outcome": "wymarzony rezultat klienta — 1 zdanie lub pusty string",
  "unique_mechanism": "co unikalnego robi ta firma — 1 zdanie lub pusty string"
}

Jeśli nie możesz określić pola: industry="restaurant", tone="casual", reszta = pusty string.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const data = JSON.parse(text.replace(/```json|```/g, '').trim());

    return NextResponse.json({
      name: data.name || '',
      slogan: data.slogan || '',
      industry: data.industry || '',
      tone: data.tone || '',
      description: data.description || '',
      pain_point: data.pain_point || '',
      dream_outcome: data.dream_outcome || '',
      unique_mechanism: data.unique_mechanism || '',
    });
  } catch {
    return NextResponse.json({
      error: 'Nie udało się przeanalizować. Spróbuj opisać firmę własnymi słowami.'
    }, { status: 500 });
  }
}

function extractTextFromHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
