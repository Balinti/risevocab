'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { PRICING } from '@/lib/entitlements';

export default function PricingPage() {
  const { user, getAccessToken } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasPriceIds = typeof window !== 'undefined' && (
    process.env.NEXT_PUBLIC_STRIPE_PLUS_PRICE_ID ||
    process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
  );

  const handleSubscribe = async (plan: 'plus' | 'pro') => {
    if (!user) {
      setError('Please sign in to subscribe');
      return;
    }

    setLoading(plan);
    setError(null);

    try {
      const token = await getAccessToken();
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan })
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="min-h-[calc(100vh-60px)] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Choose your plan
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Start free and upgrade when you need more practice.
            All plans include our core drill features.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-900/20 border border-red-800/50 rounded-lg text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Free Plan */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-2">Free</h2>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-gray-400">/month</span>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Perfect for trying out the platform
            </p>

            <ul className="space-y-3 mb-6">
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
                <span className="text-gray-300">1 message repair/day</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Local progress saving</span>
              </li>
            </ul>

            <Link
              href="/app"
              className="block w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white text-center font-medium rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Plus Plan */}
          <div className="bg-slate-800 border-2 border-emerald-500 rounded-xl p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full">
                Popular
              </span>
            </div>

            <h2 className="text-xl font-bold mb-2">{PRICING.plus.name}</h2>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold">${PRICING.plus.price}</span>
              <span className="text-gray-400">/{PRICING.plus.period}</span>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              For regular practice and improvement
            </p>

            <ul className="space-y-3 mb-6">
              {PRICING.plus.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe('plus')}
              disabled={loading === 'plus' || !hasPriceIds}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading === 'plus' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : !hasPriceIds ? (
                'Coming Soon'
              ) : (
                'Subscribe'
              )}
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-2">{PRICING.pro.name}</h2>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold">${PRICING.pro.price}</span>
              <span className="text-gray-400">/{PRICING.pro.period}</span>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              For power users and teams
            </p>

            <ul className="space-y-3 mb-6">
              {PRICING.pro.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe('pro')}
              disabled={loading === 'pro' || !hasPriceIds}
              className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading === 'pro' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : !hasPriceIds ? (
                'Coming Soon'
              ) : (
                'Subscribe'
              )}
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-center mb-8">Questions?</h2>

          <div className="space-y-4">
            <div className="p-4 bg-slate-800 rounded-lg">
              <h3 className="font-medium mb-2">Can I cancel anytime?</h3>
              <p className="text-sm text-gray-400">
                Yes, you can cancel your subscription at any time. You&apos;ll continue to have access until the end of your billing period.
              </p>
            </div>

            <div className="p-4 bg-slate-800 rounded-lg">
              <h3 className="font-medium mb-2">What payment methods do you accept?</h3>
              <p className="text-sm text-gray-400">
                We accept all major credit cards through Stripe. Your payment information is securely processed.
              </p>
            </div>

            <div className="p-4 bg-slate-800 rounded-lg">
              <h3 className="font-medium mb-2">Can I try before subscribing?</h3>
              <p className="text-sm text-gray-400">
                The free tier gives you access to the Office Basics track and core features. No credit card required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
