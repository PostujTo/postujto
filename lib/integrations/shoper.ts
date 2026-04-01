import type { ShopProduct } from './types';

function shoperAuth(apiKey: string): string {
  return Buffer.from('admin:' + apiKey).toString('base64');
}

export async function testShoperConnection(shopUrl: string, apiKey: string): Promise<boolean> {
  const response = await fetch('https://' + shopUrl + '/webapi/rest/products?limit=1', {
    headers: { Authorization: 'Basic ' + shoperAuth(apiKey) },
  });
  return response.ok;
}

export async function getShoperShopName(shopUrl: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch('https://' + shopUrl + '/webapi/rest/settings', {
      headers: { Authorization: 'Basic ' + shoperAuth(apiKey) },
    });
    if (!response.ok) return shopUrl;
    const data = await response.json();
    return data.name || shopUrl;
  } catch {
    return shopUrl;
  }
}

export async function getShoperProducts(shopUrl: string, apiKey: string, page: number = 1): Promise<any[]> {
  const response = await fetch(
    'https://' + shopUrl + '/webapi/rest/products?page=' + page + '&limit=50',
    { headers: { Authorization: 'Basic ' + shoperAuth(apiKey) } }
  );
  if (!response.ok) return [];
  const data = await response.json();
  return data.list || [];
}

export function mapShoperProduct(raw: any, shopUrl: string, connectionId: string, userId: string): Partial<ShopProduct> {
  const translation = (raw.translations?.pl || Object.values(raw.translations || {})[0]) as any;
  const imagePath = raw.main_image?.unic_name
    ? 'https://' + shopUrl + '/userdata/public/images/' + raw.main_image.unic_name
    : null;
  return {
    connection_id: connectionId,
    user_id: userId,
    external_id: String(raw.product_id),
    name: translation?.name || raw.code || 'Produkt bez nazwy',
    description: translation?.description || null,
    price: parseFloat(raw.stock?.price) || 0,
    currency: 'PLN',
    image_url: imagePath,
    category: raw.category?.category_id ? String(raw.category.category_id) : null,
    sku: raw.code || null,
    status: 'active',
    raw_data: raw,
  };
}
