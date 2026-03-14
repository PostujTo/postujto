-- ============================================
-- RLS POLICIES — user data isolation
-- Run in Supabase SQL Editor
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_kits           ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_topics      ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES — each user sees only their own data
-- ============================================

-- users
DROP POLICY IF EXISTS "users_own_data" ON users;
CREATE POLICY "users_own_data" ON users
  FOR ALL USING (clerk_user_id = auth.uid()::text);

-- generations
DROP POLICY IF EXISTS "generations_own_data" ON generations;
CREATE POLICY "generations_own_data" ON generations
  FOR ALL USING (
    user_id = (
      SELECT id FROM users WHERE clerk_user_id = auth.uid()::text
    )
  );

-- brand_kits
DROP POLICY IF EXISTS "brand_kits_own_data" ON brand_kits;
CREATE POLICY "brand_kits_own_data" ON brand_kits
  FOR ALL USING (
    user_id = (
      SELECT id FROM users WHERE clerk_user_id = auth.uid()::text
    )
  );

-- calendar_topics
DROP POLICY IF EXISTS "calendar_topics_own_data" ON calendar_topics;
CREATE POLICY "calendar_topics_own_data" ON calendar_topics
  FOR ALL USING (
    user_id = (
      SELECT id FROM users WHERE clerk_user_id = auth.uid()::text
    )
  );

-- NOTE: API endpoints use SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.
-- Code-level filtering (.eq('user_id', user.id)) is the primary defense.
-- RLS is the last line of defense for direct database access.
