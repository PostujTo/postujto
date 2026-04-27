import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { sanitizeError } from '@/lib/sanitize-error';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Brak id' }, { status: 400 });

    const { data: product } = await supabase
      .from('shop_products')
      .select('id, name, price, currency, category, description')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!product) return NextResponse.json({ error: 'Nie znaleziono produktu' }, { status: 404 });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('[shop/product]', sanitizeError(error));
    return NextResponse.json({ error: 'Blad serwera' }, { status: 500 });
  }
}
