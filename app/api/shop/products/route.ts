import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const connectionId = searchParams.get('connection_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';

    if (!connectionId) return NextResponse.json({ error: 'Brak connection_id' }, { status: 400 });

    const { data: conn } = await supabase
      .from('shop_connections')
      .select('id, last_sync_at')
      .eq('id', connectionId)
      .eq('user_id', userId)
      .single();
    if (!conn) return NextResponse.json({ error: 'Nie znaleziono polaczenia' }, { status: 404 });

    let query = supabase
      .from('shop_products')
      .select('id, name, price, currency, image_url, category, sku, status, last_post_generated_at', { count: 'exact' })
      .eq('connection_id', connectionId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.ilike('name', '%' + search + '%');
    }

    const { data: products, count, error } = await query;
    if (error) return NextResponse.json({ error: 'Blad pobierania produktow' }, { status: 500 });

    return NextResponse.json({
      products: products || [],
      total: count || 0,
      last_sync_at: conn.last_sync_at,
    });
  } catch (error) {
    console.error('[shop/products]', error);
    return NextResponse.json({ error: 'Blad serwera' }, { status: 500 });
  }
}
