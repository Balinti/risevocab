'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import TonePicker from '@/components/TonePicker';
import SoftSavePrompt from '@/components/SoftSavePrompt';
import PaywallModal from '@/components/PaywallModal';
import { getMessageRepairCount, incrementMessageRepairCount, hasDrillBeenSubmitted, markDrillSubmitted } from '@/lib/localStore';
import { getRemainingMessageRepairs, canUseMessageRepair, PlanType } from '@/lib/entitlements';

interface RepairResult {
  original: string;
  rewritten: string;
  tone: string;
  score: number;
  explanation: string;
}

export default function MessageRepairPage() {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [targetTone, setTargetTone] = useState('polite');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<RepairResult | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [plan] = useState<PlanType>('free'); // TODO: Fetch from subscription

  useEffect(() => {
    const count = getMessageRepairCount();
    setUsageCount(count);
  }, []);

  const remaining = getRemainingMessageRepairs(plan, usageCount);
  const canUse = canUseMessageRepair(plan, usageCount);

  const handleRepair = useCallback(async () => {
    if (!input.trim() || isProcessing) return;

    if (!canUse) {
      setShowPaywall(true);
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_text: `Rewrite this message in a ${targetTone} professional tone, suitable for workplace communication.`,
          prompt_type: 'tone_rewrite',
          target_tone: targetTone,
          user_input: input
        })
      });

      const data = await response.json();

      setResult({
        original: input,
        rewritten: data.rewrites?.[0] || input,
        tone: targetTone,
        score: data.score || 70,
        explanation: data.explanation || 'Message has been rewritten.'
      });

      // Increment usage
      incrementMessageRepairCount();
      setUsageCount(u => u + 1);

      // Show save prompt after first use (if not logged in)
      if (!user && !hasDrillBeenSubmitted()) {
        markDrillSubmitted();
        setTimeout(() => setShowSavePrompt(true), 1500);
      }
    } catch (error) {
      console.error('Repair error:', error);
      setResult({
        original: input,
        rewritten: 'Sorry, an error occurred. Please try again.',
        tone: targetTone,
        score: 0,
        explanation: 'Unable to process your request.'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [input, targetTone, isProcessing, canUse, user]);

  const handleCopy = () => {
    if (result?.rewritten) {
      navigator.clipboard.writeText(result.rewritten);
    }
  };

  const handleReset = () => {
    setInput('');
    setResult(null);
  };

  return (
    <main className="min-h-[calc(100vh-60px)] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Message Repair</h1>
            <p className="text-gray-400 text-sm mt-1">
              Paste your message and get an instant professional rewrite
            </p>
          </div>

          <Link
            href="/app"
            className="text-gray-400 hover:text-white text-sm"
          >
            ← Back
          </Link>
        </div>

        {/* Usage Counter */}
        <div className="flex items-center justify-between p-3 bg-slate-800 border border-slate-700 rounded-lg mb-6">
          <span className="text-sm text-gray-400">
            Daily repairs remaining
          </span>
          <span className={`font-medium ${remaining > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {remaining} / {plan === 'free' ? 1 : plan === 'plus' ? 5 : 15}
          </span>
        </div>

        {/* Input */}
        {!result && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your message (1-3 sentences)
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste the message you want to improve..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {input.length}/500 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target tone
              </label>
              <TonePicker selected={targetTone} onChange={setTargetTone} />
            </div>

            <button
              onClick={handleRepair}
              disabled={!input.trim() || isProcessing || !canUse}
              className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : !canUse ? (
                'Upgrade for more repairs'
              ) : (
                'Repair Message'
              )}
            </button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-6">
            {/* Original */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Original
              </label>
              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                <p className="text-gray-400">{result.original}</p>
              </div>
            </div>

            {/* Rewritten */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">
                  Rewritten ({result.tone})
                </label>
                <button
                  onClick={handleCopy}
                  className="text-sm text-emerald-400 hover:text-emerald-300"
                >
                  Copy
                </button>
              </div>
              <div className="p-4 bg-emerald-900/20 border border-emerald-800/50 rounded-lg">
                <p className="text-emerald-300">{result.rewritten}</p>
              </div>
            </div>

            {/* Explanation */}
            <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
              <p className="text-sm text-gray-400">{result.explanation}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleReset}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                Repair Another
              </button>
              <Link
                href="/app"
                className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors text-center"
              >
                Back to Practice
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Save Prompt Modal */}
      {showSavePrompt && !user && (
        <SoftSavePrompt onDismiss={() => setShowSavePrompt(false)} />
      )}

      {/* Paywall Modal */}
      {showPaywall && (
        <PaywallModal
          feature="More daily message repairs"
          onDismiss={() => setShowPaywall(false)}
        />
      )}
    </main>
  );
}
