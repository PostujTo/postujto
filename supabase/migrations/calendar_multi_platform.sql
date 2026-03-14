-- Migration: calendar_topics multi-platform support
-- Run in Supabase Dashboard > SQL Editor

ALTER TABLE calendar_topics
  ADD COLUMN IF NOT EXISTS platforms text[] DEFAULT ARRAY['facebook'],
  ADD COLUMN IF NOT EXISTS generated_platforms jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS posts_by_platform jsonb DEFAULT '{}';

-- Backfill existing rows: set platforms from legacy platform column
UPDATE calendar_topics
SET platforms = ARRAY[platform]
WHERE platforms IS NULL OR platforms = '{}';

-- Backfill generated_platforms from legacy generated column
UPDATE calendar_topics
SET generated_platforms = jsonb_build_object(platform, true)
WHERE generated = true AND (generated_platforms IS NULL OR generated_platforms = '{}');
