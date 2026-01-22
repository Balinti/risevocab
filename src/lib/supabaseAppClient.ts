// App-specific Supabase client for data storage
// Uses environment variables (NOT the shared auth instance)

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let appClient: SupabaseClient | null = null;

export function getAppSupabaseClient(): SupabaseClient | null {
  if (typeof window === 'undefined') {
    // Server-side - use service role if available
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      return null;
    }

    return createClient(url, key);
  }

  // Client-side singleton
  if (appClient) return appClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  appClient = createClient(url, key);
  return appClient;
}

// Server-side client with service role (for admin operations)
export function getServerSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Database types
export interface Profile {
  user_id: string;
  role: string;
  level: string;
  goals: string[];
  upcoming_use_cases: string[];
  created_at: string;
}

export interface Track {
  id: string;
  slug: string;
  name: string;
  is_free: boolean;
  sort: number;
}

export interface Scenario {
  id: string;
  track_id: string;
  title: string;
  description: string;
  difficulty: number;
  sort: number;
}

export interface Prompt {
  id: string;
  scenario_id: string;
  prompt_type: 'rewrite' | 'tone_rewrite' | 'cloze' | 'short_reply';
  prompt_text: string;
  target_tone: string | null;
  reference_notes: string | null;
  tags: string[];
  use_cases: string[];
}

export interface Attempt {
  id: string;
  user_id: string;
  prompt_id: string;
  input_text: string;
  feedback_json: Record<string, unknown>;
  score: number;
  created_at: string;
}

export interface SrsItem {
  id: string;
  user_id: string;
  prompt_id: string | null;
  phrase_id: string | null;
  due_at: string;
  interval_days: number;
  ease: number;
  last_score: number;
  error_tags: string[];
  updated_at: string;
}

export interface Phrase {
  id: string;
  user_id: string;
  phrase_text: string;
  tone: string;
  tags: string[];
  source_attempt_id: string | null;
  created_at: string;
}

export interface UsageCounter {
  user_id: string;
  date: string;
  message_repair_count: number;
}

export interface Subscription {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  plan: string;
  current_period_end: string | null;
  updated_at: string;
}
