-- Webhook deduplication table
-- Used by Stripe (and other webhook sources) to enforce idempotency.
-- INSERT claims an event; UPDATE processed_at after successful handling.
-- On conflict: if processed_at IS NOT NULL → already done (return 200);
-- if NULL → in-flight or crashed (return 503 for retry).

CREATE TABLE IF NOT EXISTS webhook_events (
  event_id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  event_type TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS webhook_events_received_at_idx
  ON webhook_events (received_at DESC);

-- Service role only (webhooks run with SUPABASE_SERVICE_ROLE_KEY).
-- No public policies = no user access.
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
