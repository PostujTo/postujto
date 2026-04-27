import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { sanitizeError } from '@/lib/sanitize-error';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { connection_id } = await req.json();
    if (!connection_id) return NextResponse.json({ error: 'Brak connection_id' }, { status: 400 });

    const { data: conn } = await supabase
      .from('shop_connections')
      .select('id')
      .eq('id', connection_id)
      .eq('user_id', userId)
      .single();
    if (!conn) return NextResponse.json({ error: 'Nie znaleziono polaczenia' }, { status: 404 });

    const { error } = await supabase
      .from('shop_connections')
      .delete()
      .eq('id', connection_id);

    if (error) return NextResponse.json({ error: 'Blad usuwania polaczenia' }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[shop/disconnect]', sanitizeError(error));
    return NextResponse.json({ error: 'Blad serwera' }, { status: 500 });
  }
}
