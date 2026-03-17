-- Calendar topics: add generation_id_per_platform and is_favorite_per_platform
ALTER TABLE calendar_topics
  ADD COLUMN IF NOT EXISTS generation_id_per_platform jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_favorite_per_platform jsonb DEFAULT '{}';
