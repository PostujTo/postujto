-- Statystyki postów pobierane z Zernio Analytics
ALTER TABLE generations ADD COLUMN IF NOT EXISTS stats_likes INTEGER DEFAULT 0;
ALTER TABLE generations ADD COLUMN IF NOT EXISTS stats_comments INTEGER DEFAULT 0;
ALTER TABLE generations ADD COLUMN IF NOT EXISTS stats_shares INTEGER DEFAULT 0;
ALTER TABLE generations ADD COLUMN IF NOT EXISTS stats_impressions INTEGER DEFAULT 0;
ALTER TABLE generations ADD COLUMN IF NOT EXISTS stats_reach INTEGER DEFAULT 0;
ALTER TABLE generations ADD COLUMN IF NOT EXISTS stats_synced_at TIMESTAMPTZ;
