import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Rate limiter backed by Supabase (table: rate_limits).
 * Works across all serverless instances — no in-memory state.
 * Fails open on DB error to avoid blocking legitimate requests.
 */
export async function rateLimit(
  identifier: string,
  endpoint: string,
  maxRequests = 10,
  windowMs = 60000
): Promise<boolean> {
  const key = `${identifier}:${endpoint}`;
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_key: key,
      p_max_requests: maxRequests,
      p_window_ms: windowMs,
    });
    if (error) {
      console.error('Rate limit DB error:', error);
      return true; // fail open
    }
    return data === true;
  } catch {
    return true; // fail open
  }
}
