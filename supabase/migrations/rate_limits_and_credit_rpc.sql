-- Rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  requests INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RPC: check and increment rate limit atomically
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_key TEXT,
  p_max_requests INTEGER,
  p_window_ms BIGINT
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_requests INTEGER;
  v_window_start TIMESTAMPTZ;
BEGIN
  INSERT INTO rate_limits (key, requests, window_start)
  VALUES (p_key, 0, NOW())
  ON CONFLICT (key) DO NOTHING;

  SELECT requests, window_start INTO v_requests, v_window_start
  FROM rate_limits WHERE key = p_key FOR UPDATE;

  IF NOW() > v_window_start + (p_window_ms::TEXT || ' milliseconds')::INTERVAL THEN
    UPDATE rate_limits SET requests = 1, window_start = NOW() WHERE key = p_key;
    RETURN TRUE;
  END IF;

  IF v_requests >= p_max_requests THEN
    RETURN FALSE;
  END IF;

  UPDATE rate_limits SET requests = requests + 1 WHERE key = p_key;
  RETURN TRUE;
END;
$$;

-- RPC: atomically decrement credits, returns new value or -1 if insufficient
CREATE OR REPLACE FUNCTION decrement_credit(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_remaining INTEGER;
BEGIN
  UPDATE users
  SET credits_remaining = credits_remaining - 1,
      updated_at = NOW()
  WHERE id = p_user_id AND credits_remaining > 0
  RETURNING credits_remaining INTO v_remaining;

  IF NOT FOUND THEN
    RETURN -1;
  END IF;

  RETURN v_remaining;
END;
$$;
