'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { PRICING, PlanType } from '@/lib/entitlements';

interface SubscriptionData {
  subscribed: boolean;
  plan: PlanType;
  status: string | null;
  current_period_end?: string;
  stripe_customer_id?: string;
}

export default function AccountPage() {
  const { user, loading: authLoading, getAccessToken } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscription() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const token = await getAccessToken();
        const response = await fetch('/api/subscription', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setSubscription(data);
      } catch (err) {
        console.error('Failed to fetch subscription:', err);
        setSubscription({ subscribed: false, plan: 'free', status: null });
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchSubscription();
    }
  }, [user, authLoading, getAccessToken]);

  if (authLoading || loading) {
    return (
      <main className="min-h-[calc(100vh-60px)] py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-[calc(100vh-60px)] py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Account</h1>
          <p className="text-gray-400 mb-8">
            Sign in to manage your account and subscription.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors"
          >
            View Pricing
          </Link>
        </div>
      </main>
    );
  }

  const plan = subscription?.plan || 'free';
  const isSubscribed = subscription?.subscribed;

  return (
    <main className="min-h-[calc(100vh-60px)] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Account</h1>

        {/* Profile Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Profile</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Email</span>
              <span className="text-white">{user.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">User ID</span>
              <span className="text-gray-500 text-sm font-mono">{user.id.slice(0, 8)}...</span>
            </div>
          </div>
        </div>

        {/* Subscription Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Subscription</h2>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white font-medium capitalize">{plan} Plan</p>
              <p className="text-gray-400 text-sm">
                {isSubscribed
                  ? `Active - Renews ${subscription?.current_period_end
                      ? new Date(subscription.current_period_end).toLocaleDateString()
                      : 'monthly'}`
                  : 'Free tier'}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isSubscribed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
            }`}>
              {isSubscribed ? 'Active' : 'Free'}
            </span>
          </div>

          {!isSubscribed && (
            <Link
              href="/pricing"
              className="block w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-center font-medium rounded-lg transition-colors"
            >
              Upgrade to {PRICING.plus.name}
            </Link>
          )}

          {isSubscribed && (
            <p className="text-sm text-gray-500">
              To manage your subscription or update payment method, contact support.
            </p>
          )}
        </div>

        {/* Plan Features */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Your Features</h2>

          <ul className="space-y-3">
            {plan === 'free' && (
              <>
                <li className="flex items-center gap-2 text-sm">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">Office Basics track</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">1 AI rewrite per drill</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">1 message repair per day</span>
                </li>
              </>
            )}
            {(plan === 'plus' || plan === 'pro') && (
              <>
                {(plan === 'plus' ? PRICING.plus.features : PRICING.pro.features).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>
      </div>
    </main>
  );
}
