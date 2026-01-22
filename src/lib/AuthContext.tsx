'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

// Hardcoded shared auth configuration
const SHARED_AUTH_URL = 'https://api.srv936332.hstgr.cloud';
const SHARED_AUTH_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';
const APP_SLUG = 'risevocab';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Dynamic Supabase client loader
let supabaseClient: ReturnType<typeof import('@supabase/supabase-js').createClient> | null = null;

async function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const { createClient } = await import('@supabase/supabase-js');
  supabaseClient = createClient(SHARED_AUTH_URL, SHARED_AUTH_ANON_KEY);
  return supabaseClient;
}

// Track user login in shared user_tracking table
async function trackUserLogin(userId: string, email: string) {
  try {
    const supabase = await getSupabaseClient();

    // Try to get existing record
    const { data: existing } = await supabase
      .from('user_tracking')
      .select('login_cnt')
      .eq('user_id', userId)
      .eq('app', APP_SLUG)
      .single();

    if (existing && typeof existing === 'object' && 'login_cnt' in existing) {
      // Update existing record
      await (supabase
        .from('user_tracking') as ReturnType<typeof supabase.from>)
        .update({
          login_cnt: (existing as { login_cnt: number }).login_cnt + 1,
          last_login_ts: new Date().toISOString()
        } as Record<string, unknown>)
        .eq('user_id', userId)
        .eq('app', APP_SLUG);
    } else {
      // Insert new record
      await (supabase
        .from('user_tracking') as ReturnType<typeof supabase.from>)
        .insert({
          user_id: userId,
          email: email,
          app: APP_SLUG,
          login_cnt: 1,
          last_login_ts: new Date().toISOString()
        } as Record<string, unknown>);
    }
  } catch (err) {
    console.error('Failed to track user login:', err);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const supabase = await getSupabaseClient();

        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();

        if (mounted && session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || ''
          });
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;

            if (session?.user) {
              const newUser = {
                id: session.user.id,
                email: session.user.email || ''
              };
              setUser(newUser);

              // Track login on SIGNED_IN event
              if (event === 'SIGNED_IN') {
                await trackUserLogin(session.user.id, session.user.email || '');
                // Trigger data migration
                window.dispatchEvent(new CustomEvent('risevocab:user-signed-in', {
                  detail: { userId: session.user.id, email: session.user.email }
                }));
              }
            } else {
              setUser(null);
            }
          }
        );

        if (mounted) {
          setLoading(false);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Auth init error:', err);
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      const supabase = await getSupabaseClient();
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/`
        : 'https://risevocab.vercel.app/';

      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });
    } catch (err) {
      console.error('Sign in error:', err);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const supabase = await getSupabaseClient();
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const supabase = await getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch {
      return null;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
