import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Nie zalogowany' }, { status: 401 });

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (!user) return NextResponse.json({ error: 'Nie znaleziono użytkownika' }, { status: 404 });

    const { data: brandKit } = await supabase
      .from('brand_kits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({ brandKit: brandKit || null });
  } catch (error: any) {
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Nie zalogowany' }, { status: 401 });

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (!user) return NextResponse.json({ error: 'Nie znaleziono użytkownika' }, { status: 404 });

    const body = await req.json();
    const { company_name, colors, style, tone, length, slogan, logo_url, sample_posts, platforms, tone_source, usp, pain_point, dream_outcome, usp_source, pain_point_source, dream_outcome_source } = body;

    // Walidacja
    if (company_name !== undefined && (typeof company_name !== 'string' || company_name.length > 100)) {
      return NextResponse.json({ error: 'Nazwa firmy jest za długa (max 100 znaków)' }, { status: 400 });
    }

    if (slogan !== undefined && (typeof slogan !== 'string' || slogan.length > 150)) {
      return NextResponse.json({ error: 'Slogan jest za długi (max 150 znaków)' }, { status: 400 });
    }

    if (colors !== undefined) {
      if (!Array.isArray(colors) || colors.length > 5) {
        return NextResponse.json({ error: 'Maksymalnie 5 kolorów' }, { status: 400 });
      }
      if (colors.some((c: any) => typeof c !== 'string' || c.length > 50)) {
        return NextResponse.json({ error: 'Nieprawidłowy format koloru' }, { status: 400 });
      }
    }

    const ALLOWED_STYLES = ['realistic', 'illustration', 'minimalist', 'bold', 'elegant', 'playful'];
    if (style !== undefined && !ALLOWED_STYLES.includes(style)) {
      return NextResponse.json({ error: 'Nieprawidłowy styl graficzny' }, { status: 400 });
    }

    const ALLOWED_TONES = ['professional', 'casual', 'humorous', 'sales'];
    if (tone !== undefined && !ALLOWED_TONES.includes(tone)) {
      return NextResponse.json({ error: 'Nieprawidłowy ton' }, { status: 400 });
    }

    const ALLOWED_SOURCES = ['manual', 'imported'];
    if (tone_source !== undefined && !ALLOWED_SOURCES.includes(tone_source)) {
      return NextResponse.json({ error: 'Nieprawidłowe źródło tonu' }, { status: 400 });
    }

    const ALLOWED_LENGTHS = ['short', 'medium', 'long'];
    if (length !== undefined && !ALLOWED_LENGTHS.includes(length)) {
      return NextResponse.json({ error: 'Nieprawidłowa długość' }, { status: 400 });
    }

    if (logo_url !== undefined && typeof logo_url === 'string' && logo_url.length > 500) {
      return NextResponse.json({ error: 'Nieprawidłowy URL logo' }, { status: 400 });
    }

    if (sample_posts !== undefined && (typeof sample_posts !== 'string' || sample_posts.length > 10000)) {
      return NextResponse.json({ error: 'Przykładowe posty są za długie (max 10000 znaków)' }, { status: 400 });
    }

    if (usp !== undefined && (typeof usp !== 'string' || usp.length > 300)) {
      return NextResponse.json({ error: 'USP jest za długi (max 300 znaków)' }, { status: 400 });
    }

    if (pain_point !== undefined && (typeof pain_point !== 'string' || pain_point.length > 300)) {
      return NextResponse.json({ error: 'Opis bólu klientów jest za długi (max 300 znaków)' }, { status: 400 });
    }

    if (dream_outcome !== undefined && (typeof dream_outcome !== 'string' || dream_outcome.length > 300)) {
      return NextResponse.json({ error: 'Wymarzony rezultat jest za długi (max 300 znaków)' }, { status: 400 });
    }

    if (usp_source !== undefined && !['manual', 'imported'].includes(usp_source)) {
      return NextResponse.json({ error: 'Nieprawidłowe źródło USP' }, { status: 400 });
    }
    if (pain_point_source !== undefined && !['manual', 'imported'].includes(pain_point_source)) {
      return NextResponse.json({ error: 'Nieprawidłowe źródło pain_point' }, { status: 400 });
    }
    if (dream_outcome_source !== undefined && !['manual', 'imported'].includes(dream_outcome_source)) {
      return NextResponse.json({ error: 'Nieprawidłowe źródło dream_outcome' }, { status: 400 });
    }

    const ALLOWED_PLATFORMS = ['facebook', 'instagram', 'tiktok'];
    if (platforms !== undefined) {
      if (!Array.isArray(platforms) || platforms.some((p: any) => !ALLOWED_PLATFORMS.includes(p))) {
        return NextResponse.json({ error: 'Nieprawidłowe platformy' }, { status: 400 });
      }
    }

    // Sanityzacja
    const sanitized = {
      company_name: company_name?.replace(/<[^>]*>/g, '').trim(),
      slogan: slogan?.replace(/<[^>]*>/g, '').trim(),
      colors,
      style,
      tone,
      length,
      logo_url,
      sample_posts: sample_posts?.replace(/<[^>]*>/g, '').trim(),
      platforms,
      tone_source,
      usp: usp?.replace(/<[^>]*>/g, '').trim(),
      pain_point: pain_point?.replace(/<[^>]*>/g, '').trim(),
      dream_outcome: dream_outcome?.replace(/<[^>]*>/g, '').trim(),
      usp_source,
      pain_point_source,
      dream_outcome_source,
    };

    const { data, error } = await supabase
      .from('brand_kits')
      .upsert({
        user_id: user.id,
        company_name: sanitized.company_name,
        colors: sanitized.colors,
        style: sanitized.style,
        tone: sanitized.tone,
        length: sanitized.length,
        slogan: sanitized.slogan,
        logo_url: sanitized.logo_url,
        sample_posts: sanitized.sample_posts,
        platforms: sanitized.platforms,
        tone_source: sanitized.tone_source,
        usp: sanitized.usp,
        pain_point: sanitized.pain_point,
        dream_outcome: sanitized.dream_outcome,
        usp_source: sanitized.usp_source,
        pain_point_source: sanitized.pain_point_source,
        dream_outcome_source: sanitized.dream_outcome_source,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) return NextResponse.json({ error: 'Błąd zapisu' }, { status: 500 });

    return NextResponse.json({ brandKit: data });
  } catch (error: any) {
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}