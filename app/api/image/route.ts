import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import Replicate from 'replicate';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

// Soft limit — max obrazów dziennie na użytkownika
const DAILY_IMAGE_LIMIT = 50;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Nie zalogowany' }, { status: 401 });
    }

    // Pobierz użytkownika
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, subscription_plan')
      .eq('clerk_user_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Nie znaleziono użytkownika' }, { status: 404 });
    }

    // Tylko Starter i Pro mogą generować obrazy
    if (user.subscription_plan === 'free') {
      return NextResponse.json({ 
        error: 'Generowanie obrazów dostępne tylko w planie Starter i Pro' 
      }, { status: 403 });
    }

    // Sprawdź soft limit dzienny
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('image_generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString());

    if ((count || 0) >= DAILY_IMAGE_LIMIT) {
      return NextResponse.json({ 
        error: `Dzienny limit ${DAILY_IMAGE_LIMIT} obrazów został osiągnięty. Spróbuj jutro.` 
      }, { status: 429 });
    }

    const { topic, platform, industry, imagePrompt } = await req.json();

    // Claude wybiera narzędzie i generuje zoptymalizowany prompt
    const routerResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Jesteś ekspertem od reklam social media. Na podstawie poniższych danych wybierz najlepsze narzędzie do generowania obrazu i stwórz zoptymalizowany prompt po angielsku.

TEMAT: ${topic}
PLATFORMA: ${platform}
BRANŻA: ${industry || 'ogólna'}
OPIS OBRAZU: ${imagePrompt}

ZASADY WYBORU NARZĘDZIA:
- "ideogram" → gdy post zawiera tekst, cenę, nazwę firmy, hasło reklamowe, promocję
- "dalle" → gdy potrzebne jest realistyczne zdjęcie produktu, jedzenia, ludzi, miejsc
- "stable_diffusion" → gdy potrzebny jest artystyczny, estetyczny lub lifestyle obraz

Zwróć TYLKO JSON:
{
  "tool": "ideogram" | "dalle" | "stable_diffusion",
  "prompt": "zoptymalizowany prompt po angielsku max 200 znaków",
  "reason": "krótkie uzasadnienie wyboru"
}`
      }]
    });

    const routerText = routerResponse.content[0].type === 'text' 
      ? routerResponse.content[0].text 
      : '';
    
    const cleanedRouter = routerText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const routerData = JSON.parse(cleanedRouter);

    let imageUrl = '';
    const tool = routerData.tool;
    const optimizedPrompt = routerData.prompt;

    // Generuj obraz wybranym narzędziem
    if (tool === 'dalle') {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: optimizedPrompt,
        n: 1,
        size: platform === 'instagram' ? '1024x1024' : '1792x1024',
        quality: 'standard',
      });
      imageUrl = response.data?.[0]?.url ?? '';

    } else if (tool === 'ideogram') {
      const output = await replicate.run(
  'ideogram-ai/ideogram-v2-turbo',
  { input: { prompt: optimizedPrompt, aspect_ratio: platform === 'instagram' ? '1:1' : '16:9' } }
) as unknown as string;
imageUrl = output;

    } else {
      const output = await replicate.run(
        'stability-ai/sdxl:39ed52f2319f9b6d963e92a3b90e0f38765c98b9ad5b82c7af2f3f78fd0ee3e2',
        { input: { prompt: optimizedPrompt, width: platform === 'instagram' ? 1024 : 1344, height: platform === 'instagram' ? 1024 : 768 } }
      ) as string[];
      imageUrl = output[0];
    }

    // Zapisz w bazie
    await supabase.from('image_generations').insert({
      user_id: user.id,
      topic,
      platform,
      tool_used: tool,
      prompt_used: optimizedPrompt,
      image_url: imageUrl,
      cost_usd: tool === 'ideogram' ? 0.08 : tool === 'dalle' ? 0.04 : 0.002,
    });

    return NextResponse.json({ 
      imageUrl, 
      tool, 
      reason: routerData.reason,
    });

  } catch (error: any) {
    console.error('Błąd generowania obrazu:', error);
    return NextResponse.json({ error: 'Błąd serwera', details: error.message }, { status: 500 });
  }
}