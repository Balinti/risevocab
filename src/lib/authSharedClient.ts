// Shared Auth Supabase client - HARDCODED for Google OAuth
// This connects to the shared auth instance, NOT the app-specific database

const SHARED_AUTH_URL = 'https://api.srv936332.hstgr.cloud';
const SHARED_AUTH_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';
const APP_SLUG = 'risevocab';

export { SHARED_AUTH_URL, SHARED_AUTH_ANON_KEY, APP_SLUG };

// Server-side function to verify auth token using shared Supabase
export async function verifyAuthToken(accessToken: string): Promise<{ user: { id: string; email: string } | null; error: string | null }> {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SHARED_AUTH_URL, SHARED_AUTH_ANON_KEY);

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return { user: null, error: error?.message || 'Invalid token' };
    }

    return {
      user: {
        id: user.id,
        email: user.email || ''
      },
      error: null
    };
  } catch {
    return { user: null, error: 'Failed to verify token' };
  }
}

// Track user login in shared user_tracking table
export async function trackUserLogin(userId: string, email: string): Promise<void> {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SHARED_AUTH_URL, SHARED_AUTH_ANON_KEY);

    // Try to update existing record first
    const { data: existing } = await supabase
      .from('user_tracking')
      .select('login_cnt')
      .eq('user_id', userId)
      .eq('app', APP_SLUG)
      .single();

    if (existing) {
      // Update existing record
      await supabase
        .from('user_tracking')
        .update({
          login_cnt: existing.login_cnt + 1,
          last_login_ts: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('app', APP_SLUG);
    } else {
      // Insert new record
      await supabase
        .from('user_tracking')
        .insert({
          user_id: userId,
          email: email,
          app: APP_SLUG,
          login_cnt: 1,
          last_login_ts: new Date().toISOString()
        });
    }
  } catch (err) {
    console.error('Failed to track user login:', err);
  }
}
