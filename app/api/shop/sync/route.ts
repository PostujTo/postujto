import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { encrypt, decrypt } from '@/lib/crypto';
import { getBaselinkerStorages, getBaselinkerProducts, mapBaselinkerProduct } from '@/lib/integrations/baselinker';
import { getShoperProducts, mapShoperProduct } from '@/lib/integrations/shoper';
import { getAllegroOffers, mapAllegroOffer, refreshAllegroToken } from '@/lib/integrations/allegro';
import type { ShopProduct } from '@/lib/integrations/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const RATE_LIMIT_MINUTES = 15;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { connection_id } = await req.json();
    if (!connection_id) return NextResponse.json({ error: 'Brak connection_id' }, { status: 400 });

    const { data: conn, error: connError } = await supabase
      .from('shop_connections')
      .select('*')
      .eq('id', connection_id)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    if (connError || !conn) return NextResponse.json({ error: 'Nie znaleziono polaczenia' }, { status: 404 });

    if (conn.last_sync_at) {
      const lastSync = new Date(conn.last_sync_at).getTime();
      const now = Date.now();
      if (now - lastSync < RATE_LIMIT_MINUTES * 60 * 1000) {
        const waitMin = Math.ceil((RATE_LIMIT_MINUTES * 60 * 1000 - (now - lastSync)) / 60000);
        return NextResponse.json(
          { error: 'Synchronizacja mozliwa co ' + RATE_LIMIT_MINUTES + ' minut. Poczekaj ' + waitMin + ' min.' },
          { status: 429 }
        );
      }
    }

    const { data: event } = await supabase
      .from('shop_events')
      .insert({ connection_id, user_id: userId, event_type: 'sync', processed: false })
      .select('id')
      .single();

    let products: Partial<ShopProduct>[] = [];

    if (conn.platform === 'baselinker') {
      const apiKey = decrypt(conn.api_key);
      const storages = await getBaselinkerStorages(apiKey);
      const storageId = storages[0]?.storage_id || 'bl_1';

      for (let page = 1; page <= 20; page++) {
        const batch = await getBaselinkerProducts(apiKey, storageId, page);
        if (!batch.length) break;
        products.push(...batch.map((p: any) => mapBaselinkerProduct(p, connection_id, userId)));
        if (batch.length < 100) break;
      }
    } else if (conn.platform === 'shoper') {
      const apiKey = decrypt(conn.api_key);
      const shopUrl = conn.shop_url;

      for (let page = 1; page <= 20; page++) {
        const batch = await getShoperProducts(shopUrl, apiKey, page);
        if (!batch.length) break;
        products.push(...batch.map((p: any) => mapShoperProduct(p, shopUrl, connection_id, userId)));
        if (batch.length < 50) break;
      }
    } else if (conn.platform === 'allegro') {
      let accessToken = decrypt(conn.access_token);

      try {
        const refreshed = await refreshAllegroToken(
          decrypt(conn.refresh_token),
          process.env.ALLEGRO_CLIENT_ID!,
          process.env.ALLEGRO_CLIENT_SECRET!
        );
        accessToken = refreshed.access_token;
        await supabase.from('shop_connections').update({
          access_token: encrypt(refreshed.access_token),
          refresh_token: encrypt(refreshed.refresh_token),
          updated_at: new Date().toISOString(),
        }).eq('id', connection_id);
      } catch {
        // token still valid — continue with existing
      }

      for (let offset = 0; offset <= 1000; offset += 50) {
        const batch = await getAllegroOffers(accessToken, 50, offset);
        if (!batch.length) break;
        products.push(...batch.map((o: any) => mapAllegroOffer(o, connection_id, userId)));
        if (batch.length < 50) break;
      }
    }

    if (products.length > 0) {
      for (let i = 0; i < products.length; i += 100) {
        const batch = products.slice(i, i + 100);
        await supabase
          .from('shop_products')
          .upsert(batch, { onConflict: 'connection_id,external_id', ignoreDuplicates: false });
      }
    }

    await supabase.from('shop_connections').update({
      last_sync_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', connection_id);

    if (event?.id) {
      await supabase.from('shop_events').update({
        processed: true,
        payload: { products_synced: products.length },
      }).eq('id', event.id);
    }

    return NextResponse.json({ status: 'completed', products_synced: products.length });
  } catch (error) {
    console.error('[shop/sync]', error);
    return NextResponse.json({ error: 'Blad synchronizacji' }, { status: 500 });
  }
}
