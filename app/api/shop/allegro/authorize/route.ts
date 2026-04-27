import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'node:crypto';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { getAllegroAuthUrl } from '@/lib/integrations/allegro';
import { sanitizeError } from '@/lib/sanitize-error';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Fix 2.2: TTL state'u OAuth (oauth_states nie ma kolumny expires_at — TTL liczony z created_at)
const STATE_TTL_SECONDS = 600; // 10 min
const OAUTH_STATE_COOKIE = 'allegro_oauth_state';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const clientId = process.env.ALLEGRO_CLIENT_ID;
    const redirectUri = process.env.ALLEGRO_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return NextResponse.json({ error: 'Integracja Allegro nie jest skonfigurowana.' }, { status: 503 });
    }

    // Fix 2.2: kryptograficznie losowy state (256-bit)
    const state = crypto.randomBytes(32).toString('hex');

    // Cleanup wygasłych state'ów PRZED INSERT (oauth_states bez expires_at — odpalamy przy każdym authorize)
    const cutoff = new Date(Date.now() - STATE_TTL_SECONDS * 1000).toISOString();
    await supabase.from('oauth_states').delete().lt('created_at', cutoff);

    // Zapisz state w Supabase z bindingiem do user_id (defense in depth)
    const { error: stateError } = await supabase.from('oauth_states').insert({
      state,
      user_id: userId,
      provider: 'allegro',
    });
    if (stateError) {
      console.error('[shop/allegro/authorize] state insert', sanitizeError(stateError));
      return NextResponse.json({ error: 'Blad inicjalizacji autoryzacji' }, { status: 500 });
    }

    // Zapisz state w HttpOnly cookie (drugi kanał weryfikacji)
    const cookieStore = await cookies();
    cookieStore.set(OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: STATE_TTL_SECONDS,
      path: '/api/shop/allegro',
    });

    const url = getAllegroAuthUrl(clientId, redirectUri, state);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('[shop/allegro/authorize]', sanitizeError(error));
    return NextResponse.json({ error: 'Blad serwera' }, { status: 500 });
  }
}
