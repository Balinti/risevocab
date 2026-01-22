'use client';

import Link from 'next/link';
import { PRICING } from '@/lib/entitlements';

interface PaywallModalProps {
  feature: string;
  onDismiss: () => void;
}

export default function PaywallModal({ feature, onDismiss }: PaywallModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold text-white mb-2">
          Upgrade to unlock
        </h3>
        <p className="text-gray-400 text-sm mb-6">
          {feature} is available with Plus or Pro plans. Upgrade to get access to all premium features.
        </p>

        <div className="space-y-3 mb-6">
          <div className="p-4 bg-gray-900 rounded-lg border border-emerald-600">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-white">{PRICING.plus.name}</span>
              <span className="text-emerald-400 font-bold">
                ${PRICING.plus.price}/{PRICING.plus.period}
              </span>
            </div>
            <ul className="text-sm text-gray-400 space-y-1">
              {PRICING.plus.features.slice(0, 3).map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-emerald-500">-</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/pricing"
            className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-center rounded-lg transition-colors font-medium"
          >
            View Pricing
          </Link>
          <button
            onClick={onDismiss}
            className="flex-1 px-4 py-2.5 text-gray-400 hover:text-white border border-gray-600 rounded-lg transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
