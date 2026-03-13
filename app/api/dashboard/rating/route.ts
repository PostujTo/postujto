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

  const { id, version_index, rating } = await req.json();
  if (!id || version_index === undefined || !rating) return NextResponse.json({ error: 'Brak danych' }, { status: 400 });

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  if (!user) return NextResponse.json({ error: 'Nie znaleziono użytkownika' }, { status: 404 });

  const { data: gen } = await supabase
    .from('generations')
    .select('ratings')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!gen) return NextResponse.json({ error: 'Nie znaleziono' }, { status: 404 });

  const updatedRatings = { ...(gen.ratings || {}), [version_index]: rating };

  await supabase
    .from('generations')
    .update({ ratings: updatedRatings })
    .eq('id', id)
    .eq('user_id', user.id);

  return NextResponse.json({ ok: true, ratings: updatedRatings });
}
