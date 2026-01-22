'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import DrillCard from '@/components/DrillCard';
import FeedbackDisplay from '@/components/FeedbackDisplay';
import { getPromptById, SeedPrompt } from '@/lib/contentSeed';
import {
  getLocalSrsItems,
  updateLocalSrsItem,
  addLocalAttempt,
  generateLocalId,
  LocalSrsItem
} from '@/lib/localStore';
import { getDueCards, gradeCard } from '@/lib/srs';

interface Feedback {
  score: number;
  tone_label: string;
  rewrites: string[];
  mistakes: string[];
  explanation: string;
}

export default function ReviewPage() {
  const [dueItems, setDueItems] = useState<LocalSrsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState<SeedPrompt | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    loadDueItems();
  }, []);

  const loadDueItems = () => {
    const allItems = getLocalSrsItems();
    const due = getDueCards(allItems);
    setDueItems(due);
    setCurrentIndex(0);
    setCompletedCount(0);

    if (due.length > 0 && due[0].prompt_id) {
      const prompt = getPromptById(due[0].prompt_id);
      setCurrentPrompt(prompt || null);
    }
  };

  const handleSubmit = useCallback(async (input: string) => {
    if (!currentPrompt || currentIndex >= dueItems.length) return;

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

      // Update SRS item
      const currentItem = dueItems[currentIndex];
      const gradedCard = gradeCard(
        {
          id: currentItem.id,
          prompt_id: currentItem.prompt_id,
          phrase_id: currentItem.phrase_id,
          due_at: currentItem.due_at,
          interval_days: currentItem.interval_days,
          ease: currentItem.ease,
          last_score: currentItem.last_score,
          error_tags: currentItem.error_tags
        },
        feedbackData.score,
        feedbackData.mistakes?.map((m: string) => m.slice(0, 50)) || []
      );

      updateLocalSrsItem(currentItem.id, {
        due_at: gradedCard.due_at,
        interval_days: gradedCard.interval_days,
        ease: gradedCard.ease,
        last_score: gradedCard.last_score,
        error_tags: gradedCard.error_tags
      });
    } catch (error) {
      console.error('Review error:', error);
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
  }, [currentPrompt, currentIndex, dueItems]);

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    setCompletedCount(c => c + 1);
    setFeedback(null);

    if (nextIndex >= dueItems.length) {
      // All done
      setCurrentPrompt(null);
      return;
    }

    setCurrentIndex(nextIndex);
    const nextItem = dueItems[nextIndex];
    if (nextItem.prompt_id) {
      const prompt = getPromptById(nextItem.prompt_id);
      setCurrentPrompt(prompt || null);
    }
  };

  const allDone = completedCount > 0 && currentIndex >= dueItems.length - 1 && feedback;

  return (
    <main className="min-h-[calc(100vh-60px)] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Review Queue</h1>
            <p className="text-gray-400 text-sm mt-1">
              Practice items scheduled for today
            </p>
          </div>

          <Link
            href="/app"
            className="text-gray-400 hover:text-white text-sm"
          >
            ← Back to Practice
          </Link>
        </div>

        {/* Progress */}
        {dueItems.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>{completedCount} of {dueItems.length} completed</span>
              <span>{dueItems.length - completedCount} remaining</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${(completedCount / dueItems.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {dueItems.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">All caught up!</h2>
            <p className="text-gray-400 mb-6">
              No items due for review. Complete more drills to add items to your review queue.
            </p>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors"
            >
              Practice Drills
            </Link>
          </div>
        )}

        {/* All Done State */}
        {allDone && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Review Complete!</h2>
            <p className="text-gray-400 mb-6">
              You&apos;ve completed {completedCount} review{completedCount !== 1 ? 's' : ''} today. Great work!
            </p>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors"
            >
              Continue Practicing
            </Link>
          </div>
        )}

        {/* Current Review Item */}
        {currentPrompt && !allDone && (
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
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors"
                  >
                    {currentIndex >= dueItems.length - 1 ? 'Finish Review' : 'Next Item'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
