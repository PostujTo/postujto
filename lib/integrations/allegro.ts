import type { ShopProduct } from './types';

const ALLEGRO_AUTH_URL = 'https://allegro.pl/auth/oauth';
const ALLEGRO_API_URL = 'https://api.allegro.pl';

function allegroBasicAuth(clientId: string, clientSecret: string): string {
  return Buffer.from(clientId + ':' + clientSecret).toString('base64');
}

export function getAllegroAuthUrl(clientId: string, redirectUri: string, state: string): string {
  // Fix 2.2: state parameter (CSRF protection) — wymagany
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
  });
  return ALLEGRO_AUTH_URL + '/authorize?' + params.toString();
}

export async function exchangeAllegroCode(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
  const response = await fetch(ALLEGRO_AUTH_URL + '/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + allegroBasicAuth(clientId, clientSecret),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error('Allegro token exchange failed: ' + err);
  }
  return response.json();
}

export async function refreshAllegroToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
  const response = await fetch(ALLEGRO_AUTH_URL + '/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + allegroBasicAuth(clientId, clientSecret),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error('Allegro token refresh failed: ' + err);
  }
  return response.json();
}

export async function getAllegroSellerInfo(accessToken: string): Promise<{ id: string; login: string }> {
  const response = await fetch(ALLEGRO_API_URL + '/me', {
    headers: {
      Authorization: 'Bearer ' + accessToken,
      Accept: 'application/vnd.allegro.public.v1+json',
    },
  });
  if (!response.ok) throw new Error('Cannot fetch Allegro seller info');
  return response.json();
}

export async function getAllegroOffers(
  accessToken: string,
  limit: number = 50,
  offset: number = 0
): Promise<any[]> {
  const response = await fetch(
    ALLEGRO_API_URL + '/sale/offers?limit=' + limit + '&offset=' + offset + '&publication.status=ACTIVE',
    {
      headers: {
        Authorization: 'Bearer ' + accessToken,
        Accept: 'application/vnd.allegro.public.v1+json',
      },
    }
  );
  if (!response.ok) return [];
  const data = await response.json();
  return data.offers || [];
}

export function mapAllegroOffer(raw: any, connectionId: string, userId: string): Partial<ShopProduct> {
  const price = raw.sellingMode?.price?.amount ? parseFloat(raw.sellingMode.price.amount) : 0;
  const imageUrl = raw.primaryImage?.url || raw.images?.[0]?.url || null;
  return {
    connection_id: connectionId,
    user_id: userId,
    external_id: String(raw.id),
    name: raw.name || 'Oferta bez nazwy',
    description: null,
    price,
    currency: raw.sellingMode?.price?.currency || 'PLN',
    image_url: imageUrl,
    category: raw.category?.id ? String(raw.category.id) : null,
    sku: raw.external?.id || null,
    status: 'active',
    raw_data: raw,
  };
}
