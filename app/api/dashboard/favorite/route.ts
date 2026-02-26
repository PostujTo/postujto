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
    if (!userId) {
      return NextResponse.json({ error: 'Nie zalogowany' }, { status: 401 });
    }

    const { id, is_favorite, liked_versions } = await req.json();

    // Pobierz user_id z Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Nie znaleziono użytkownika' }, { status: 404 });
    }

    // Zaktualizuj is_favorite — tylko dla własnych generacji
    const { error } = await supabase
      .from('generations')
      .update({ is_favorite, liked_versions: liked_versions ?? [] })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: 'Błąd aktualizacji' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Błąd serwera', details: error.message }, { status: 500 });
  }
}