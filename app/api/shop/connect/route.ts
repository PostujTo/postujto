import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { encrypt } from '@/lib/crypto';
import { testBaselinkerConnection, getBaselinkerStorages, getBaselinkerProducts } from '@/lib/integrations/baselinker';
import { testShoperConnection, getShoperShopName, getShoperProducts } from '@/lib/integrations/shoper';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PLAN_SHOP_LIMITS: Record<string, number> = {
  free: 0,
  standard: 1,
  premium: 3,
};

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: connections } = await supabase
      .from('shop_connections')
      .select('id, platform, shop_name, shop_url, is_active, last_sync_at, created_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    return NextResponse.json({ connections: connections || [] });
  } catch (error) {
    console.error('[shop/connect GET]', error);
    return NextResponse.json({ error: 'Blad serwera' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, subscription_plan')
      .eq('clerk_user_id', userId)
      .single();
    if (userError || !user) return NextResponse.json({ error: 'Nie znaleziono uzytkownika' }, { status: 404 });

    const { platform, api_key, shop_url } = await req.json();

    if (!['baselinker', 'shoper', 'allegro'].includes(platform)) {
      return NextResponse.json({ error: 'Nieznana platforma' }, { status: 400 });
    }

    if (platform === 'allegro') {
      return NextResponse.json(
        { error: 'Allegro wymaga autoryzacji OAuth. Uzyj /api/shop/allegro/authorize.' },
        { status: 400 }
      );
    }

    const limit = PLAN_SHOP_LIMITS[user.subscription_plan] ?? 0;
    const { count } = await supabase
      .from('shop_connections')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true);

    if ((count ?? 0) >= limit) {
      const upgradeMsg = user.subscription_plan === 'free'
        ? 'Integracja ze sklepem wymaga planu Starter lub Pro.'
        : 'Osiagnales limit polaczonych sklepow dla swojego planu.';
      return NextResponse.json({ error: upgradeMsg, upgrade_required: true }, { status: 403 });
    }

    if (!api_key) return NextResponse.json({ error: 'Brak klucza API' }, { status: 400 });

    let shopName = '';
    let productsCount = 0;

    if (platform === 'baselinker') {
      const ok = await testBaselinkerConnection(api_key);
      if (!ok) return NextResponse.json({ error: 'Nieprawidlowy klucz API Baselinker' }, { status: 400 });

      const storages = await getBaselinkerStorages(api_key);
      const storageId = storages[0]?.storage_id || 'bl_1';
      shopName = storages[0]?.name || 'Baselinker';
      const products = await getBaselinkerProducts(api_key, storageId, 1);
      productsCount = products.length;
    } else if (platform === 'shoper') {
      if (!shop_url) return NextResponse.json({ error: 'Brak adresu sklepu Shoper' }, { status: 400 });
      const cleanUrl = shop_url.replace(/^https?:\/\//, '').replace(/\/$/, '');

      const ok = await testShoperConnection(cleanUrl, api_key);
      if (!ok) return NextResponse.json({ error: 'Nie mozna polaczyc z API Shoper. Sprawdz URL i klucz API.' }, { status: 400 });

      shopName = await getShoperShopName(cleanUrl, api_key);
      const products = await getShoperProducts(cleanUrl, api_key, 1);
      productsCount = products.length;
    }

    const { data: existing } = await supabase
      .from('shop_connections')
      .select('id')
      .eq('user_id', userId)
      .eq('platform', platform)
      .maybeSingle();

    const encryptedKey = encrypt(api_key);
    const shopUrlClean = shop_url
      ? shop_url.replace(/^https?:\/\//, '').replace(/\/$/, '')
      : null;

    let connectionId: string;
    if (existing) {
      await supabase
        .from('shop_connections')
        .update({
          api_key: encryptedKey,
          shop_url: shopUrlClean,
          shop_name: shopName,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
      connectionId = existing.id;
    } else {
      const { data: newConn, error: connError } = await supabase
        .from('shop_connections')
        .insert({
          user_id: userId,
          platform,
          api_key: encryptedKey,
          shop_url: shopUrlClean,
          shop_name: shopName,
          is_active: true,
        })
        .select('id')
        .single();
      if (connError || !newConn) {
        return NextResponse.json({ error: 'Blad zapisu polaczenia' }, { status: 500 });
      }
      connectionId = newConn.id;
    }

    await supabase.from('shop_events').insert({
      connection_id: connectionId,
      user_id: userId,
      event_type: 'connect',
      processed: true,
    });

    return NextResponse.json({
      success: true,
      connection_id: connectionId,
      shop_name: shopName,
      products_count: productsCount,
    });
  } catch (error) {
    console.error('[shop/connect POST]', error);
    return NextResponse.json({ error: 'Blad serwera' }, { status: 500 });
  }
}
