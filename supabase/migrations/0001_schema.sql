-- RiseVocab Database Schema
-- App-specific Supabase database (NOT the shared auth instance)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (stores user preferences)
CREATE TABLE profiles (
    user_id UUID PRIMARY KEY,
    role TEXT DEFAULT 'user',
    level TEXT DEFAULT 'intermediate',
    goals TEXT[] DEFAULT '{}',
    upcoming_use_cases TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracks table (learning paths)
CREATE TABLE tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    is_free BOOLEAN DEFAULT FALSE,
    sort INTEGER DEFAULT 0
);

-- Scenarios table (grouped exercises within tracks)
CREATE TABLE scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    difficulty INTEGER DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
    sort INTEGER DEFAULT 0
);

-- Prompts table (individual drill questions)
CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    prompt_type TEXT NOT NULL CHECK (prompt_type IN ('rewrite', 'tone_rewrite', 'cloze', 'short_reply')),
    prompt_text TEXT NOT NULL,
    target_tone TEXT,
    reference_notes TEXT,
    tags TEXT[] DEFAULT '{}',
    use_cases TEXT[] DEFAULT '{}'
);

-- Attempts table (user submissions)
CREATE TABLE attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    input_text TEXT NOT NULL,
    feedback_json JSONB DEFAULT '{}',
    score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SRS Items table (spaced repetition scheduling)
CREATE TABLE srs_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL,
    phrase_id UUID,
    due_at TIMESTAMPTZ DEFAULT NOW(),
    interval_days INTEGER DEFAULT 0,
    ease NUMERIC(4,2) DEFAULT 2.50,
    last_score INTEGER DEFAULT 0,
    error_tags TEXT[] DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Phrases table (saved professional phrases)
CREATE TABLE phrases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    phrase_text TEXT NOT NULL,
    tone TEXT DEFAULT 'neutral',
    tags TEXT[] DEFAULT '{}',
    source_attempt_id UUID REFERENCES attempts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for srs_items -> phrases
ALTER TABLE srs_items
ADD CONSTRAINT srs_items_phrase_id_fkey
FOREIGN KEY (phrase_id) REFERENCES phrases(id) ON DELETE SET NULL;

-- Usage Counters table (metered features)
CREATE TABLE usage_counters (
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    message_repair_count INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, date)
);

-- Subscriptions table (Stripe subscription data)
CREATE TABLE subscriptions (
    user_id UUID PRIMARY KEY,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    status TEXT DEFAULT 'inactive',
    plan TEXT DEFAULT 'free',
    current_period_end TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_scenarios_track_id ON scenarios(track_id);
CREATE INDEX idx_prompts_scenario_id ON prompts(scenario_id);
CREATE INDEX idx_attempts_user_id ON attempts(user_id);
CREATE INDEX idx_attempts_prompt_id ON attempts(prompt_id);
CREATE INDEX idx_attempts_created_at ON attempts(created_at DESC);
CREATE INDEX idx_srs_items_user_id ON srs_items(user_id);
CREATE INDEX idx_srs_items_due_at ON srs_items(due_at);
CREATE INDEX idx_phrases_user_id ON phrases(user_id);
CREATE INDEX idx_usage_counters_date ON usage_counters(date);

-- Seed initial tracks
INSERT INTO tracks (id, slug, name, is_free, sort) VALUES
    ('00000000-0000-0000-0000-000000000001', 'office-basics', 'Office Basics', TRUE, 1),
    ('00000000-0000-0000-0000-000000000002', 'pm-standups', 'PM Standups & Updates', FALSE, 2),
    ('00000000-0000-0000-0000-000000000003', 'sales-discovery', 'Sales Discovery Calls', FALSE, 3);

-- Seed scenarios
INSERT INTO scenarios (id, track_id, title, description, difficulty, sort) VALUES
    -- Office Basics
    ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'Email Essentials', 'Master professional email writing for everyday workplace communication.', 1, 1),
    ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'Meeting Requests', 'Learn to schedule meetings professionally and respectfully.', 1, 2),
    ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'Status Updates', 'Write clear and concise status updates for your team.', 2, 3),
    -- PM Standups
    ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000002', 'Daily Standup', 'Deliver effective standup updates that keep the team aligned.', 2, 1),
    ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000002', 'Blocker Escalation', 'Communicate blockers clearly without sounding negative.', 3, 2),
    -- Sales Discovery
    ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000003', 'Discovery Questions', 'Ask the right questions to uncover customer needs.', 2, 1),
    ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0000-000000000003', 'Objection Handling', 'Respond professionally to common sales objections.', 3, 2);

-- Seed prompts
INSERT INTO prompts (id, scenario_id, prompt_type, prompt_text, target_tone, reference_notes, tags, use_cases) VALUES
    -- Email Essentials
    ('00000000-0000-0001-0001-000000000001', '00000000-0000-0000-0001-000000000001', 'rewrite',
     E'Rewrite this email to sound more professional:\n\n"Hey, I need that report ASAP. Where is it??"',
     NULL,
     'Good rewrite: "Hi [Name], Could you please send me the status update on the report? I''d appreciate having it by [time] if possible. Thanks!"',
     ARRAY['email', 'professional', 'urgent'],
     ARRAY['requesting updates', 'following up']),

    ('00000000-0000-0001-0001-000000000002', '00000000-0000-0000-0001-000000000001', 'tone_rewrite',
     E'Rewrite this in a POLITE tone:\n\n"You didn''t answer my question in the last email."',
     'polite',
     'The original sounds accusatory. A polite version acknowledges the other person''s time.',
     ARRAY['email', 'tone', 'polite'],
     ARRAY['following up', 'clarification']),

    ('00000000-0000-0001-0001-000000000003', '00000000-0000-0000-0001-000000000001', 'cloze',
     E'Fill in the blank:\n\n"I wanted to _____ with you regarding the project timeline."',
     NULL,
     'Common collocations: "touch base", "follow up", "check in"',
     ARRAY['email', 'collocation'],
     ARRAY['following up']),

    -- Meeting Requests
    ('00000000-0000-0001-0002-000000000001', '00000000-0000-0000-0001-000000000002', 'rewrite',
     E'Rewrite this meeting request to be more professional:\n\n"We need to talk about the project. When are you free?"',
     NULL,
     'A good meeting request includes: purpose, suggested times, expected duration.',
     ARRAY['meeting', 'scheduling'],
     ARRAY['scheduling meetings']),

    ('00000000-0000-0001-0002-000000000002', '00000000-0000-0000-0001-000000000002', 'short_reply',
     E'Your colleague asks: "Can we reschedule our 2pm meeting to tomorrow?"\n\nWrite a brief, professional response accepting the change.',
     NULL,
     'Keep it brief but friendly. Confirm the new time.',
     ARRAY['meeting', 'rescheduling'],
     ARRAY['rescheduling']),

    -- Status Updates
    ('00000000-0000-0001-0003-000000000001', '00000000-0000-0000-0001-000000000003', 'rewrite',
     E'Rewrite this status update to be clearer:\n\n"Working on stuff. Having some issues but will figure it out."',
     NULL,
     'Good status updates are specific about: what was done, what''s in progress, any blockers.',
     ARRAY['status', 'clarity'],
     ARRAY['status updates', 'team communication']),

    ('00000000-0000-0001-0003-000000000002', '00000000-0000-0000-0001-000000000003', 'tone_rewrite',
     E'Rewrite this in a NEUTRAL tone (not too negative, not too positive):\n\n"The project is a disaster. We''re way behind and nothing is working."',
     'neutral',
     'Neutral tone acknowledges challenges without being alarmist.',
     ARRAY['status', 'tone', 'neutral'],
     ARRAY['status updates']),

    -- Daily Standup (Paid)
    ('00000000-0000-0002-0001-000000000001', '00000000-0000-0000-0002-000000000001', 'rewrite',
     E'Improve this standup update:\n\n"Yesterday I did meetings. Today more meetings. No blockers."',
     NULL,
     'Good standups: specific accomplishments, clear plans, proactive about blockers.',
     ARRAY['standup', 'specific'],
     ARRAY['daily standup']),

    ('00000000-0000-0002-0001-000000000002', '00000000-0000-0000-0002-000000000001', 'short_reply',
     E'Your manager asks in standup: "Any updates on the API integration?"\n\nProvide a concise, professional update. The integration is 60% complete.',
     NULL,
     'Be specific about progress and next steps.',
     ARRAY['standup', 'progress'],
     ARRAY['daily standup', 'progress updates']),

    -- Blocker Escalation (Paid)
    ('00000000-0000-0002-0002-000000000001', '00000000-0000-0000-0002-000000000002', 'rewrite',
     E'Rewrite this blocker message to be more constructive:\n\n"I can''t do my work because the design team hasn''t finished their part."',
     NULL,
     'Focus on the situation, not blame. Suggest solutions.',
     ARRAY['blocker', 'escalation', 'constructive'],
     ARRAY['blocker communication']),

    ('00000000-0000-0002-0002-000000000002', '00000000-0000-0000-0002-000000000002', 'tone_rewrite',
     E'Rewrite in a DIRECT but professional tone:\n\n"I think maybe we might have a small issue that could potentially cause some delays..."',
     'direct',
     'Direct communication saves time. Be clear about the issue and impact.',
     ARRAY['blocker', 'tone', 'direct'],
     ARRAY['blocker communication']),

    -- Discovery Questions (Paid)
    ('00000000-0000-0003-0001-000000000001', '00000000-0000-0000-0003-000000000001', 'rewrite',
     E'Rewrite this sales question to be more open-ended:\n\n"Do you have budget for this project?"',
     NULL,
     'Open-ended questions invite more detailed responses.',
     ARRAY['sales', 'discovery', 'questions'],
     ARRAY['sales calls', 'discovery']),

    ('00000000-0000-0003-0001-000000000002', '00000000-0000-0000-0003-000000000001', 'short_reply',
     E'A prospect says: "We''re currently using a competitor''s product."\n\nWrite a follow-up question to learn more about their experience.',
     NULL,
     'Stay curious, not defensive. Learn about their needs.',
     ARRAY['sales', 'discovery', 'competitor'],
     ARRAY['sales calls', 'discovery']),

    -- Objection Handling (Paid)
    ('00000000-0000-0003-0002-000000000001', '00000000-0000-0000-0003-000000000002', 'short_reply',
     E'A prospect says: "Your price is too high compared to alternatives."\n\nWrite a professional response that acknowledges the concern.',
     NULL,
     'Acknowledge, clarify, then differentiate.',
     ARRAY['sales', 'objection', 'pricing'],
     ARRAY['sales calls', 'objection handling']),

    ('00000000-0000-0003-0002-000000000002', '00000000-0000-0000-0003-000000000002', 'tone_rewrite',
     E'Rewrite in a CONFIDENT but not pushy tone:\n\n"Trust me, our product is definitely the best choice for you."',
     'confident',
     'Confidence comes from evidence, not assertions.',
     ARRAY['sales', 'tone', 'confident'],
     ARRAY['sales calls', 'objection handling']);
