import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAllegroAuthUrl } from '@/lib/integrations/allegro';
import { sanitizeError } from '@/lib/sanitize-error';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const clientId = process.env.ALLEGRO_CLIENT_ID;
    const redirectUri = process.env.ALLEGRO_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return NextResponse.json({ error: 'Integracja Allegro nie jest skonfigurowana.' }, { status: 503 });
    }

    const url = getAllegroAuthUrl(clientId, redirectUri);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('[shop/allegro/authorize]', sanitizeError(error));
    return NextResponse.json({ error: 'Blad serwera' }, { status: 500 });
  }
}
