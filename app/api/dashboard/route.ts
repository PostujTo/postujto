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
    if (!userId) {
      return NextResponse.json({ error: 'Nie zalogowany' }, { status: 401 });
    }

    // Pobierz user_id z Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Nie znaleziono użytkownika' }, { status: 404 });
    }

    // Pobierz historię generacji
    const { data: generations, error: genError } = await supabase
      .from('generations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (genError) {
      return NextResponse.json({ error: 'Błąd pobierania historii' }, { status: 500 });
    }

    // Policz statystyki
    const total = generations?.length || 0;
    const favorites = generations?.filter(g => g.is_favorite).length || 0;
    const facebook = generations?.filter(g => g.platform === 'facebook').length || 0;
    const instagram = generations?.filter(g => g.platform === 'instagram').length || 0;
const tiktok = generations?.filter(g => g.platform === 'tiktok').length || 0;

return NextResponse.json({
  generations: generations || [],
  stats: { total, favorites, facebook, instagram, tiktok },
});

    return NextResponse.json({
      generations: generations || [],
      stats: { total, favorites, facebook, instagram },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Błąd serwera', details: error.message }, { status: 500 });
  }
}