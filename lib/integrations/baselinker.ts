import type { ShopProduct } from './types';

const BASELINKER_API_URL = 'https://api.baselinker.com/connector.php';

async function callBaselinker(apiKey: string, method: string, params: Record<string, unknown> = {}): Promise<any> {
  const response = await fetch(BASELINKER_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      token: apiKey,
      method,
      parameters: JSON.stringify(params),
    }),
  });
  return response.json();
}

export async function testBaselinkerConnection(apiKey: string): Promise<boolean> {
  const data = await callBaselinker(apiKey, 'getStoragesList');
  return data.status === 'SUCCESS';
}

export async function getBaselinkerStorages(apiKey: string): Promise<Array<{ storage_id: string; name: string }>> {
  const data = await callBaselinker(apiKey, 'getStoragesList');
  if (data.status !== 'SUCCESS') return [];
  return Object.entries(data.storages || {}).map(([id, info]: [string, any]) => ({
    storage_id: id,
    name: info.name || id,
  }));
}

export async function getBaselinkerProducts(
  apiKey: string,
  storageId: string,
  page: number = 1
): Promise<any[]> {
  const data = await callBaselinker(apiKey, 'getProductsList', { storage_id: storageId, page });
  if (data.status !== 'SUCCESS') return [];
  return data.products ? Object.values(data.products) : [];
}

export function mapBaselinkerProduct(raw: any, connectionId: string, userId: string): Partial<ShopProduct> {
  const images = raw.images ? Object.values(raw.images) : [];
  return {
    connection_id: connectionId,
    user_id: userId,
    external_id: String(raw.product_id),
    name: raw.name || 'Produkt bez nazwy',
    description: raw.description_extra1 || raw.description || null,
    price: parseFloat(raw.price_brutto) || 0,
    currency: 'PLN',
    image_url: (images[0] as string) || null,
    category: raw.category_id ? String(raw.category_id) : null,
    sku: raw.sku || null,
    status: 'active',
    raw_data: raw,
  };
}
