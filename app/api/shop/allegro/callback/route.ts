import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { exchangeAllegroCode, getAllegroSellerInfo, getAllegroOffers, mapAllegroOffer } from '@/lib/integrations/allegro';
import { encrypt } from '@/lib/crypto';
import { sanitizeError } from '@/lib/sanitize-error';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PLAN_SHOP_LIMITS: Record<string, number> = {
  free: 0,
  standard: 1,
  premium: 3,
};

export async function GET(req: Request) {
  const shopUrl = new URL('/shop', req.url);

  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.redirect(new URL('/sign-in', req.url));

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const oauthError = searchParams.get('error');

    if (oauthError || !code) {
      shopUrl.searchParams.set('error', 'allegro_auth_failed');
      return NextResponse.redirect(shopUrl);
    }

    const { data: user } = await supabase
      .from('users')
      .select('id, subscription_plan')
      .eq('clerk_user_id', userId)
      .single();
    if (!user) {
      shopUrl.searchParams.set('error', 'user_not_found');
      return NextResponse.redirect(shopUrl);
    }

    const limit = PLAN_SHOP_LIMITS[user.subscription_plan] ?? 0;
    const { count } = await supabase
      .from('shop_connections')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true);
    if ((count ?? 0) >= limit) {
      shopUrl.searchParams.set('error', 'plan_limit');
      return NextResponse.redirect(shopUrl);
    }

    const tokens = await exchangeAllegroCode(
      code,
      process.env.ALLEGRO_CLIENT_ID!,
      process.env.ALLEGRO_CLIENT_SECRET!,
      process.env.ALLEGRO_REDIRECT_URI!
    );

    const seller = await getAllegroSellerInfo(tokens.access_token);

    const { data: existing } = await supabase
      .from('shop_connections')
      .select('id')
      .eq('user_id', userId)
      .eq('platform', 'allegro')
      .maybeSingle();

    let connectionId: string;
    if (existing) {
      await supabase.from('shop_connections').update({
        access_token: encrypt(tokens.access_token),
        refresh_token: encrypt(tokens.refresh_token),
        shop_name: seller.login,
        is_active: true,
        updated_at: new Date().toISOString(),
      }).eq('id', existing.id);
      connectionId = existing.id;
    } else {
      const { data: newConn } = await supabase.from('shop_connections').insert({
        user_id: userId,
        platform: 'allegro',
        access_token: encrypt(tokens.access_token),
        refresh_token: encrypt(tokens.refresh_token),
        shop_name: seller.login,
        is_active: true,
      }).select('id').single();
      connectionId = newConn!.id;
    }

    const offers = await getAllegroOffers(tokens.access_token, 50, 0);
    if (offers.length > 0) {
      await supabase.from('shop_products').upsert(
        offers.map((o: any) => mapAllegroOffer(o, connectionId, userId)),
        { onConflict: 'connection_id,external_id' }
      );
    }

    await supabase.from('shop_connections').update({
      last_sync_at: new Date().toISOString(),
    }).eq('id', connectionId);

    shopUrl.searchParams.set('connected', 'allegro');
    return NextResponse.redirect(shopUrl);
  } catch (error) {
    console.error('[shop/allegro/callback]', sanitizeError(error));
    shopUrl.searchParams.set('error', 'allegro_callback_failed');
    return NextResponse.redirect(shopUrl);
  }
}
