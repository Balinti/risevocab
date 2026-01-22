-- RiseVocab Row Level Security Policies
-- App-specific Supabase database (NOT the shared auth instance)

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE srs_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Tracks: Public read access (anyone can browse tracks)
CREATE POLICY "Anyone can view tracks"
    ON tracks FOR SELECT
    TO anon, authenticated
    USING (TRUE);

-- Scenarios: Public read access
CREATE POLICY "Anyone can view scenarios"
    ON scenarios FOR SELECT
    TO anon, authenticated
    USING (TRUE);

-- Prompts: Public read access
CREATE POLICY "Anyone can view prompts"
    ON prompts FOR SELECT
    TO anon, authenticated
    USING (TRUE);

-- Attempts: Users can only access their own attempts
CREATE POLICY "Users can view own attempts"
    ON attempts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts"
    ON attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- SRS Items: Users can only access their own SRS items
CREATE POLICY "Users can view own srs_items"
    ON srs_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own srs_items"
    ON srs_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own srs_items"
    ON srs_items FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own srs_items"
    ON srs_items FOR DELETE
    USING (auth.uid() = user_id);

-- Phrases: Users can only access their own phrases
CREATE POLICY "Users can view own phrases"
    ON phrases FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own phrases"
    ON phrases FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own phrases"
    ON phrases FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own phrases"
    ON phrases FOR DELETE
    USING (auth.uid() = user_id);

-- Usage Counters: Users can only access their own usage data
CREATE POLICY "Users can view own usage_counters"
    ON usage_counters FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage_counters"
    ON usage_counters FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage_counters"
    ON usage_counters FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Subscriptions: Users can only view their own subscription
-- Insert/Update handled by service role (webhook)
CREATE POLICY "Users can view own subscription"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Service role bypass for all tables (for API routes)
-- The service role key should be used server-side only

-- Grant usage to authenticated and anon roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant SELECT on public tables
GRANT SELECT ON tracks TO anon, authenticated;
GRANT SELECT ON scenarios TO anon, authenticated;
GRANT SELECT ON prompts TO anon, authenticated;

-- Grant full access on user-specific tables to authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT SELECT, INSERT ON attempts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON srs_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON phrases TO authenticated;
GRANT SELECT, INSERT, UPDATE ON usage_counters TO authenticated;
GRANT SELECT ON subscriptions TO authenticated;
