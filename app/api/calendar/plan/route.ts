import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { auth } from '@clerk/nextjs/server';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { year, month, monthName, occasions, platform, platforms, tone, daysCount } = await req.json();
  const primaryPlatform = (platforms && platforms.length > 0) ? platforms[0] : (platform || 'facebook');

  const prompt = `Jesteś ekspertem od social media marketingu dla polskich firm.
Zaplanuj kalendarz treści na ${monthName} ${year} (${daysCount} dni).

Polskie okazje w tym miesiącu:
${occasions || 'Brak specjalnych okazji'}

Platforma: ${primaryPlatform}
Ton komunikacji: ${tone}

Zwróć JSON z planem dla KAŻDEGO dnia miesiąca.
Format: tablica obiektów, każdy obiekt:
{
  "date": "YYYY-MM-DD",
  "topic": "konkretny temat posta po polsku (1-2 zdania)",
  "platform": "${primaryPlatform}"
}

Zasady:
- KAŻDY post musi mieć "platform": "${primaryPlatform}" — nie zmieniaj tej wartości
- Przy dniach z okazją — nawiąż do niej w temacie
- Tematy muszą być konkretne i działające dla małej firmy (np. "Nowa kolekcja letnich sukienek — pokaż 3 bestsellery", nie "Post o produktach")
- Urozmaicaj typy treści: edukacyjne, promocyjne, behind-the-scenes, angażujące pytania, opinie klientów
- Pisz po polsku
- Zwróć TYLKO czysty JSON, bez markdown, bez żadnego tekstu przed ani po`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText = response.content[0].type === 'text' ? response.content[0].text : '';
    const clean = rawText.replace(/```json|```/g, '').trim();
    const plan = JSON.parse(clean);

    return NextResponse.json({ plan });
  } catch (err: any) {
    console.error('Calendar plan error:', err);
    return NextResponse.json({ error: err.message || 'Błąd generowania planu' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';