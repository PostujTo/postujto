import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    const formData = await req.formData();
    const file = formData.get('logo') as File;

    if (!file) return NextResponse.json({ error: 'Brak pliku' }, { status: 400 });

    // Sprawdź rozmiar (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Plik za duży. Maksymalny rozmiar to 2MB' }, { status: 400 });
    }

    // Sprawdź typ pliku
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Dozwolone formaty: PNG, JPG, SVG, WebP' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/logo.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload do Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('brand-logos')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: 'Błąd uploadu' }, { status: 500 });
    }

    // Pobierz publiczny URL
    const { data: { publicUrl } } = supabase.storage
      .from('brand-logos')
      .getPublicUrl(fileName);

    return NextResponse.json({ logo_url: publicUrl });

  } catch (error: any) {
    return NextResponse.json({ error: 'Błąd serwera', details: error.message }, { status: 500 });
  }
}