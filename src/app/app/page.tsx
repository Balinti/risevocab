'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import DrillCard from '@/components/DrillCard';
import FeedbackDisplay from '@/components/FeedbackDisplay';
import SoftSavePrompt from '@/components/SoftSavePrompt';
import { SeedPrompt, getFreeContent } from '@/lib/contentSeed';
import { addLocalAttempt, generateLocalId, hasDrillBeenSubmitted, markDrillSubmitted, getLocalSrsItems } from '@/lib/localStore';
import { getDueCards } from '@/lib/srs';

interface Feedback {
  score: number;
  tone_label: string;
  rewrites: string[];
  mistakes: string[];
  explanation: string;
}

export default function AppPage() {
  const { user } = useAuth();
  const [currentPrompt, setCurrentPrompt] = useState<SeedPrompt | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    // Load a random free prompt on mount
    const freePrompts = getFreeContent().prompts;
    const randomPrompt = freePrompts[Math.floor(Math.random() * freePrompts.length)];
    setCurrentPrompt(randomPrompt);

    // Check due SRS items
    const srsItems = getLocalSrsItems();
    const dueItems = getDueCards(srsItems);
    setDueCount(dueItems.length);
  }, []);

  const handleSubmit = useCallback(async (input: string) => {
    if (!currentPrompt) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_text: currentPrompt.prompt_text,
          prompt_type: currentPrompt.prompt_type,
          target_tone: currentPrompt.target_tone,
          user_input: input
        })
      });

      const feedbackData = await response.json();
      setFeedback(feedbackData);

      // Save attempt locally
      addLocalAttempt({
        id: generateLocalId(),
        prompt_id: currentPrompt.id,
        input_text: input,
        feedback_json: feedbackData,
        score: feedbackData.score,
        created_at: new Date().toISOString()
      });

      // Show save prompt after first drill submission (if not logged in)
      if (!user && !hasDrillBeenSubmitted()) {
        markDrillSubmitted();
        setTimeout(() => setShowSavePrompt(true), 1500);
      }
    } catch (error) {
      console.error('Feedback error:', error);
      setFeedback({
        score: 50,
        tone_label: 'neutral',
        rewrites: ['Please try submitting again.'],
        mistakes: ['Unable to analyze at this time.'],
        explanation: 'An error occurred. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [currentPrompt, user]);

  const handleNextDrill = () => {
    const freePrompts = getFreeContent().prompts;
    const randomPrompt = freePrompts[Math.floor(Math.random() * freePrompts.length)];
    setCurrentPrompt(randomPrompt);
    setFeedback(null);
  };

  return (
    <main className="min-h-[calc(100vh-60px)] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Today&apos;s Practice</h1>
            <p className="text-gray-400 text-sm mt-1">
              Complete drills to improve your business communication
            </p>
          </div>

          {dueCount > 0 && (
            <Link
              href="/app/review"
              className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-600/30 transition-colors"
            >
              {dueCount} due for review
            </Link>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <Link
            href="/app/message-repair"
            className="p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-emerald-600/50 transition-colors"
          >
            <h3 className="font-medium text-sm mb-1">Message Repair</h3>
            <p className="text-xs text-gray-500">Paste and fix text</p>
          </Link>

          <Link
            href="/app/review"
            className="p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-purple-600/50 transition-colors"
          >
            <h3 className="font-medium text-sm mb-1">Review Queue</h3>
            <p className="text-xs text-gray-500">Practice due items</p>
          </Link>

          <Link
            href="/app/phrasebook"
            className="p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-blue-600/50 transition-colors"
          >
            <h3 className="font-medium text-sm mb-1">Phrasebook</h3>
            <p className="text-xs text-gray-500">Saved phrases</p>
          </Link>
        </div>

        {/* Current Drill */}
        {currentPrompt && (
          <div className="space-y-6">
            <DrillCard
              prompt={currentPrompt}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />

            {feedback && (
              <>
                <FeedbackDisplay
                  feedback={feedback}
                  maxRewrites={1}
                  canSavePhrase={false}
                />

                <div className="flex justify-center">
                  <button
                    onClick={handleNextDrill}
                    className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Next Drill
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tracks Preview */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold mb-4">Practice Tracks</h2>
          <div className="space-y-3">
            <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-between">
              <div>
                <h3 className="font-medium">Office Basics</h3>
                <p className="text-sm text-gray-400">Emails, meetings, status updates</p>
              </div>
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded">Free</span>
            </div>

            <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-between opacity-70">
              <div>
                <h3 className="font-medium">PM Standups</h3>
                <p className="text-sm text-gray-400">Daily updates, blocker escalation</p>
              </div>
              <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs font-medium rounded">Plus</span>
            </div>

            <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-between opacity-70">
              <div>
                <h3 className="font-medium">Sales Discovery</h3>
                <p className="text-sm text-gray-400">Discovery calls, objection handling</p>
              </div>
              <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs font-medium rounded">Plus</span>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link href="/pricing" className="text-emerald-400 text-sm hover:underline">
              Upgrade for all tracks →
            </Link>
          </div>
        </div>
      </div>

      {/* Save Prompt Modal */}
      {showSavePrompt && !user && (
        <SoftSavePrompt onDismiss={() => setShowSavePrompt(false)} />
      )}
    </main>
  );
}
