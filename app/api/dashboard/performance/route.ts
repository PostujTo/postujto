import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Nie zalogowany' }, { status: 401 });

  const { id, performance } = await req.json();
  if (!id || !performance) return NextResponse.json({ error: 'Brak danych' }, { status: 400 });

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  if (!user) return NextResponse.json({ error: 'Nie znaleziono użytkownika' }, { status: 404 });

  const { error } = await supabase
    .from('generations')
    .update({ performance })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: 'Błąd aktualizacji' }, { status: 500 });

  return NextResponse.json({ ok: true });
}
