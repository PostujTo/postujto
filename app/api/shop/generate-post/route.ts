import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { buildSystemPrompt } from '@/lib/prompts';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PLATFORM_MAP: Record<string, string> = {
  facebook: 'Facebook - mozesz uzywac dluzszych akapitow, ale podziel tekst dla czytelnosci',
  instagram: 'Instagram - krotkie akapity, angazujace od pierwszych slow, przyjazne emoji',
  tiktok: 'TikTok - bardzo krotki, chwytliwy tekst do opisu wideo, max 150 znakow, duzo emoji, mlodziezowy jezyk, trending hashtagi',
};

const TONE_MAP: Record<string, string> = {
  professional: 'profesjonalny, formalny, biznesowy',
  casual: 'swobodny, przyjazny, nieformalny',
  humorous: 'humorystyczny, zabawny, lekki',
  sales: 'sprzedazowy, przekonujacy, zachecajacy do akcji',
};

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { product_id, platform, tone = 'sales' } = await req.json();

    if (!product_id || !platform) {
      return NextResponse.json({ error: 'Brakuje product_id lub platform' }, { status: 400 });
    }
    if (!PLATFORM_MAP[platform]) {
      return NextResponse.json({ error: 'Nieprawidlowa platforma' }, { status: 400 });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, credits_remaining, subscription_plan')
      .eq('clerk_user_id', userId)
      .single();
    if (userError || !user) return NextResponse.json({ error: 'Nie znaleziono uzytkownika' }, { status: 404 });

    if (user.subscription_plan === 'free') {
      return NextResponse.json(
        { error: 'Ta funkcja wymaga planu Starter lub Pro.', upgrade_required: true },
        { status: 403 }
      );
    }

    const { data: product, error: prodError } = await supabase
      .from('shop_products')
      .select('id, name, price, currency, description, image_url, category')
      .eq('id', product_id)
      .eq('user_id', userId)
      .single();
    if (prodError || !product) return NextResponse.json({ error: 'Nie znaleziono produktu' }, { status: 404 });

    const { data: brandKit } = await supabase
      .from('brand_kits')
      .select('company_name, tone, tone_source, industry, usp, usp_source, pain_point, pain_point_source, dream_outcome, dream_outcome_source')
      .eq('user_id', user.id)
      .single();

    const parts: string[] = [product.name];
    if (product.price) parts.push('w cenie ' + product.price + ' ' + (product.currency || 'PLN'));
    if (product.category) parts.push('(kategoria: ' + product.category + ')');
    if (product.description) {
      const shortDesc = product.description.replace(/<[^>]*>/g, '').slice(0, 200);
      parts.push('Opis: ' + shortDesc);
    }
    const topic = parts.join(' — ');

    const now = new Date();
    const dateStr = now.getDate() + '.' + (now.getMonth() + 1) + '.' + now.getFullYear();

    const productBlock = 'DANE PRODUKTU ZE SKLEPU:\n'
      + 'Nazwa: ' + product.name + '\n'
      + 'Cena: ' + product.price + ' ' + (product.currency || 'PLN') + '\n'
      + (product.image_url ? 'Zdjecie produktu: dostepne\n' : '')
      + (product.description ? 'Opis: ' + product.description.replace(/<[^>]*>/g, '').slice(0, 300) + '\n' : '')
      + '\nGeneruj post promujacy ten konkretny produkt. Uzyj ceny jako elementu CTA.';

    const prompt = 'Aktualna data: ' + dateStr + '. Rok: ' + now.getFullYear() + '.\n\n'
      + productBlock + '\n\n'
      + 'Wygeneruj 1 post na ' + PLATFORM_MAP[platform] + '.\n\n'
      + 'TEMAT: ' + topic + '\n\n'
      + 'WYMAGANIA:\n'
      + '- Ton: ' + (TONE_MAP[tone] || TONE_MAP.sales) + '\n'
      + '- Jezyk: polski\n'
      + '- NIE uzywaj emoji ani emotikon w tekscie postu - tylko czysty tekst\n'
      + '- Uzyj ceny produktu w poscie jako elementu CTA\n\n'
      + 'Dla posta wygeneruj rowniez:\n'
      + '1. 5-7 relevantnych hashtagow po polsku\n'
      + '2. Krotki opis grafiki AI\n\n'
      + 'ZWROC ODPOWIEDZ W FORMACIE JSON (bez markdown backticks):\n'
      + '{"posts":[{"text":"tresc postu...","hashtags":["#hashtag1","#hashtag2"],"imagePrompt":"opis grafiki..."}]}\n\n'
      + 'WAZNE: Zwroc TYLKO czysty JSON.';

    const systemPrompt = buildSystemPrompt({
      company_name: brandKit?.company_name,
      industry: brandKit?.industry,
      tone: brandKit?.tone,
      tone_source: brandKit?.tone_source,
      usp: brandKit?.usp,
      usp_source: brandKit?.usp_source,
      pain_point: brandKit?.pain_point,
      pain_point_source: brandKit?.pain_point_source,
      dream_outcome: brandKit?.dream_outcome,
      dream_outcome_source: brandKit?.dream_outcome_source,
    }, platform as 'facebook' | 'instagram' | 'tiktok', '');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    let jsonData: { posts: Array<{ text: string; hashtags: string[]; imagePrompt: string }> };
    try {
      jsonData = JSON.parse(responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } catch {
      jsonData = { posts: [{ text: responseText, hashtags: [], imagePrompt: '' }] };
    }

    const { data: newCredits } = await supabase.rpc('decrement_credit', { p_user_id: user.id });
    if (newCredits === -1 || newCredits === null) {
      return NextResponse.json({ error: 'Brak kredytow', creditsRemaining: 0 }, { status: 403 });
    }

    await supabase.from('generations').insert({
      user_id: user.id,
      topic,
      platform,
      tone,
      length: 'medium',
      generated_posts: jsonData.posts,
      quality_tier: 'standard',
      has_image: false,
      has_audio: false,
      cost_usd: 0.005,
    });

    await supabase
      .from('shop_products')
      .update({ last_post_generated_at: new Date().toISOString() })
      .eq('id', product_id);

    const post = jsonData.posts[0];
    return NextResponse.json({
      post_content: post.text,
      hashtags: post.hashtags || [],
      image_prompt: post.imagePrompt || '',
      platform,
      product_name: product.name,
      creditsRemaining: newCredits,
    });
  } catch (error) {
    console.error('[shop/generate-post]', error);
    return NextResponse.json({ error: 'Blad generowania posta' }, { status: 500 });
  }
}
