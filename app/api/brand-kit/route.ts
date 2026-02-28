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

    const { company_name, colors, style, tone, slogan, logo_url } = await req.json();

    const { data, error } = await supabase
      .from('brand_kits')
      .upsert({
        user_id: user.id,
        company_name,
        colors,
        style,
        tone,
        slogan,
        logo_url,
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