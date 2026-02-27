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

    const { id, version_index } = await req.json();

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Nie znaleziono użytkownika' }, { status: 404 });
    }

    // Usuń całą generację
    if (version_index === undefined) {
      const { error } = await supabase
        .from('generations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        return NextResponse.json({ error: 'Błąd usuwania' }, { status: 500 });
      }
      return NextResponse.json({ success: true, deleted: 'all' });
    }

    // Usuń tylko jedną wersję
    const { data: gen, error: fetchError } = await supabase
      .from('generations')
      .select('generated_posts')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !gen) {
      return NextResponse.json({ error: 'Nie znaleziono posta' }, { status: 404 });
    }

    const updatedPosts = gen.generated_posts.filter((_: any, i: number) => i !== version_index);

    // Jeśli zostały 0 wersji — usuń całą generację
    if (updatedPosts.length === 0) {
      await supabase.from('generations').delete().eq('id', id).eq('user_id', user.id);
      return NextResponse.json({ success: true, deleted: 'all' });
    }

    const { error: updateError } = await supabase
      .from('generations')
      .update({ generated_posts: updatedPosts })
      .eq('id', id)
      .eq('user_id', user.id);

    if (updateError) {
      return NextResponse.json({ error: 'Błąd aktualizacji' }, { status: 500 });
    }

    return NextResponse.json({ success: true, deleted: 'version' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Błąd serwera', details: error.message }, { status: 500 });
  }
}