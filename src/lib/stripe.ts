// Stripe utilities

import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (stripeInstance) return stripeInstance;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }

  stripeInstance = new Stripe(secretKey);

  return stripeInstance;
}

export function hasStripeConfig(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

export function hasPriceIds(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_STRIPE_PLUS_PRICE_ID &&
    process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
  );
}

export function getPriceId(plan: 'plus' | 'pro'): string | null {
  if (plan === 'plus') {
    return process.env.NEXT_PUBLIC_STRIPE_PLUS_PRICE_ID || null;
  }
  if (plan === 'pro') {
    return process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || null;
  }
  return null;
}

export const APP_NAME = 'risevocab';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://risevocab.vercel.app';
