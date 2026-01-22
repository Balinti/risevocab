// Subscription entitlements and feature gating

export type PlanType = 'free' | 'plus' | 'pro';

export interface Entitlements {
  plan: PlanType;
  maxRewritesPerDrill: number;
  messageRepairPerDay: number;
  canSavePhrasebook: boolean;
  accessAllTracks: boolean;
  prioritySupport: boolean;
}

const ENTITLEMENTS: Record<PlanType, Entitlements> = {
  free: {
    plan: 'free',
    maxRewritesPerDrill: 1,
    messageRepairPerDay: 1,
    canSavePhrasebook: false,
    accessAllTracks: false,
    prioritySupport: false,
  },
  plus: {
    plan: 'plus',
    maxRewritesPerDrill: 3,
    messageRepairPerDay: 5,
    canSavePhrasebook: true,
    accessAllTracks: true,
    prioritySupport: false,
  },
  pro: {
    plan: 'pro',
    maxRewritesPerDrill: 5,
    messageRepairPerDay: 15,
    canSavePhrasebook: true,
    accessAllTracks: true,
    prioritySupport: true,
  },
};

export function getEntitlements(plan: PlanType): Entitlements {
  return ENTITLEMENTS[plan] || ENTITLEMENTS.free;
}

export function getPlanFromSubscriptionStatus(status: string | null, planName: string | null): PlanType {
  if (!status || status !== 'active') {
    return 'free';
  }

  if (planName === 'pro') return 'pro';
  if (planName === 'plus') return 'plus';

  return 'free';
}

export function canAccessContent(plan: PlanType, isFreeContent: boolean): boolean {
  if (isFreeContent) return true;
  return getEntitlements(plan).accessAllTracks;
}

export function getRemainingMessageRepairs(plan: PlanType, usedToday: number): number {
  const max = getEntitlements(plan).messageRepairPerDay;
  return Math.max(0, max - usedToday);
}

export function canUseMessageRepair(plan: PlanType, usedToday: number): boolean {
  return getRemainingMessageRepairs(plan, usedToday) > 0;
}

export const PRICING = {
  plus: {
    name: 'Plus',
    price: 9,
    period: 'month',
    features: [
      '3 AI rewrites per drill',
      '5 message repairs per day',
      'Save phrases to phrasebook',
      'Access all tracks',
    ],
  },
  pro: {
    name: 'Pro',
    price: 19,
    period: 'month',
    features: [
      '5 AI rewrites per drill',
      '15 message repairs per day',
      'Save phrases to phrasebook',
      'Access all tracks',
      'Priority support',
    ],
  },
};
