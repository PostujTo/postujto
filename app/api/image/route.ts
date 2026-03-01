import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import Replicate from 'replicate';
import { detectBrand } from '@/lib/polish-brands';
import sharp from 'sharp';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

const DAILY_IMAGE_LIMIT = 50;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Nie zalogowany' }, { status: 401 });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, subscription_plan')
      .eq('clerk_user_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Nie znaleziono użytkownika' }, { status: 404 });
    }

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

    const body = await req.json();
const { topic, platform, industry, imagePrompt, addWatermark, useBrandColors } = body;

// Walidacja
if (!topic || !platform || !imagePrompt) {
  return NextResponse.json({ error: 'Brakuje wymaganych parametrów' }, { status: 400 });
}

if (typeof topic !== 'string' || topic.length > 500) {
  return NextResponse.json({ error: 'Temat jest za długi' }, { status: 400 });
}

if (!['facebook', 'instagram', 'tiktok'].includes(platform)) {
  return NextResponse.json({ error: 'Nieprawidłowa platforma' }, { status: 400 });
}

const sanitizedTopic = topic.replace(/<[^>]*>/g, '').trim();
const sanitizedImagePrompt = imagePrompt.replace(/<[^>]*>/g, '').trim();

// Pobierz Brand Kit użytkownika
const { data: brandKit } = await supabase
  .from('brand_kits')
  .select('*')
  .eq('user_id', user.id)
  .single();

// Wykryj znany brand z bazy polskich marek

const detectedBrand = detectBrand(topic);

// Zbuduj brand context
const brandContext = detectedBrand
  ? `BRAND: ${detectedBrand.brand}, COLORS: ${detectedBrand.data.colors}, STYLE: ${detectedBrand.data.description}`
  : (brandKit && useBrandColors !== false)
  ? `COMPANY: ${brandKit.company_name || ''}, COLORS: ${(brandKit.colors || []).join(', ')}, STYLE: ${brandKit.style || 'realistic'}, SLOGAN: ${brandKit.slogan || ''}`
  : '';

    // Claude dobiera styl Recraft V3 i generuje zoptymalizowany prompt
    const styleResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Jesteś ekspertem od reklam social media. Na podstawie poniższych danych wybierz najlepszy styl Recraft V3 i stwórz zoptymalizowany prompt po angielsku.

TEMAT: ${topic}
PLATFORMA: ${platform}
BRANŻA: ${industry || 'ogólna'}
OPIS OBRAZU: ${imagePrompt}
${brandContext ? `IDENTYFIKACJA WIZUALNA MARKI: ${brandContext}` : ''}

TEMAT: ${topic}
PLATFORMA: ${platform}
BRANŻA: ${industry || 'ogólna'}
OPIS OBRAZU: ${imagePrompt}

DOSTĘPNE STYLE RECRAFT V3:
- "realistic_image" → realistyczne zdjęcia produktów, jedzenia, miejsc
- "realistic_image/natural_light" → jedzenie, restauracje, lifestyle
- "realistic_image/studio_portrait" → produkty, moda, uroda
- "realistic_image/hdr" → nieruchomości, motoryzacja, krajobraz
- "realistic_image/enterprise" → B2B, usługi, budowlanka
- "digital_illustration/2d_art_poster" → plakaty z tekstem, promocje, hasła
- "digital_illustration/hand_drawn" → TikTok, młodzież, casual
- "vector_illustration" → logo, ikony, branding

ZASADY:
- Gdy post zawiera cenę lub hasło reklamowe → "digital_illustration/2d_art_poster"
- Gdy branża to restauracja/jedzenie → "realistic_image/natural_light"
- Gdy branża to moda/uroda → "realistic_image/studio_portrait"
- Gdy branża to budowlanka/nieruchomości → "realistic_image/enterprise"
- Gdy platforma to TikTok → "digital_illustration/hand_drawn"
- W pozostałych przypadkach → "realistic_image"
- Prompt musi zawierać "Polish people" lub "European appearance" gdy są ludzie
- Prompt musi być po angielsku, max 200 znaków

Zwróć TYLKO JSON:
{
  "style": "wybrany styl",
  "prompt": "zoptymalizowany prompt po angielsku",
  "reason": "krótkie uzasadnienie"
}`
      }]
    });

    const styleText = styleResponse.content[0].type === 'text' 
      ? styleResponse.content[0].text 
      : '';
    
    const cleanedStyle = styleText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const styleData = JSON.parse(cleanedStyle);

    const aspectRatio = platform === 'instagram' ? '1:1' : 
                        platform === 'tiktok' ? '9:16' : '4:3';

    const output = await replicate.run(
  'recraft-ai/recraft-v3',
  {
    input: {
      prompt: styleData.prompt,
      style: styleData.style,
      aspect_ratio: aspectRatio,
    }
  }
);

// Recraft V3 zwraca obiekt URL - konwertujemy na string
const imageUrl = Array.isArray(output) 
  ? String(output[0]) 
  : String(output);
// Nakładanie logo (watermark) — tylko Pro + logo w Brand Kit
    let finalImageUrl = imageUrl;
    
    if (addWatermark && brandKit?.logo_url && user.subscription_plan === 'premium') {
      try {
        // Pobierz obraz z Recraft
        const imageResponse = await fetch(imageUrl);
        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

        // Pobierz logo z Brand Kit
        const logoResponse = await fetch(brandKit.logo_url);
        const logoBuffer = Buffer.from(await logoResponse.arrayBuffer());

        // Oblicz rozmiar logo (15% szerokości obrazu)
        const imageMeta = await sharp(imageBuffer).metadata();
        const imageWidth = imageMeta.width || 1000;
        const logoSize = Math.round(imageWidth * 0.15);

        // Skaluj logo z zachowaniem proporcji
        const resizedLogo = await sharp(logoBuffer)
          .resize(logoSize, logoSize, { fit: 'inside' })
          .toBuffer();

        // Nałóż logo w prawym dolnym rogu
        const processedImageBuffer = await sharp(imageBuffer)
          .composite([{
            input: resizedLogo,
            gravity: 'southeast',
          }])
          .jpeg({ quality: 90 })
          .toBuffer();

        // Wgraj do Supabase Storage
        const fileName = `watermarked_${Date.now()}_${user.id}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('processed-images')
          .upload(fileName, processedImageBuffer, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('processed-images')
            .getPublicUrl(fileName);
          finalImageUrl = publicUrl;
        } else {
          console.error('Błąd uploadu watermark:', uploadError);
          // Fallback — zwróć oryginalny obraz bez logo
        }
      } catch (watermarkError) {
        console.error('Błąd nakładania logo:', watermarkError);
        // Fallback — zwróć oryginalny obraz
      }
    }
    await supabase.from('image_generations').insert({
      user_id: user.id,
      topic: sanitizedTopic,
      platform,
      tool_used: 'recraft_v3',
      prompt_used: styleData.prompt,
      image_url: finalImageUrl,
      cost_usd: 0.04,
    });

    return NextResponse.json({ 
      imageUrl: finalImageUrl,
      tool: 'recraft_v3',
      style: styleData.style,
      reason: styleData.reason,
    });

  } catch (error: any) {
    console.error('Błąd generowania obrazu:', error);
    return NextResponse.json({ error: 'Błąd serwera', details: error.message }, { status: 500 });
  }
}