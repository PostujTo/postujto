export interface ShopProduct {
  id?: string;
  connection_id: string;
  user_id: string;
  external_id: string;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  image_url?: string | null;
  category?: string | null;
  sku?: string | null;
  status: string;
  raw_data?: unknown;
  last_post_generated_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ShopConnection {
  id: string;
  user_id: string;
  platform: 'baselinker' | 'shoper' | 'allegro';
  api_key?: string | null;
  api_secret?: string | null;
  access_token?: string | null;
  refresh_token?: string | null;
  shop_url?: string | null;
  shop_name?: string | null;
  is_active: boolean;
  last_sync_at?: string | null;
  created_at: string;
  updated_at: string;
}
