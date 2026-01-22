'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import DrillCard from '@/components/DrillCard';
import FeedbackDisplay from '@/components/FeedbackDisplay';
import SoftSavePrompt from '@/components/SoftSavePrompt';
import PaywallModal from '@/components/PaywallModal';
import { getPromptById, getScenarioById, getTrackById, isContentFree, SeedPrompt } from '@/lib/contentSeed';
import { addLocalAttempt, generateLocalId, hasDrillBeenSubmitted, markDrillSubmitted } from '@/lib/localStore';

interface Feedback {
  score: number;
  tone_label: string;
  rewrites: string[];
  mistakes: string[];
  explanation: string;
}

export default function DrillPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState<SeedPrompt | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const loadedPrompt = getPromptById(resolvedParams.id);
    if (!loadedPrompt) {
      router.push('/app');
      return;
    }

    setPrompt(loadedPrompt);
    const isFree = isContentFree(resolvedParams.id);
    setIsPremium(!isFree);

    // Show paywall for premium content if not subscribed
    // For now, always allow access but show upgrade prompt later
  }, [resolvedParams.id, router]);

  const handleSubmit = useCallback(async (input: string) => {
    if (!prompt) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_text: prompt.prompt_text,
          prompt_type: prompt.prompt_type,
          target_tone: prompt.target_tone,
          user_input: input
        })
      });

      const feedbackData = await response.json();
      setFeedback(feedbackData);

      // Save attempt locally
      addLocalAttempt({
        id: generateLocalId(),
        prompt_id: prompt.id,
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
  }, [prompt, user]);

  if (!prompt) {
    return (
      <main className="min-h-[calc(100vh-60px)] py-8 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </main>
    );
  }

  const scenario = getScenarioById(prompt.scenario_id);
  const track = scenario ? getTrackById(scenario.track_id) : null;

  return (
    <main className="min-h-[calc(100vh-60px)] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <button onClick={() => router.push('/app')} className="hover:text-white">
            Practice
          </button>
          <span>/</span>
          {track && <span>{track.name}</span>}
          <span>/</span>
          {scenario && <span>{scenario.title}</span>}
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold">{scenario?.title || 'Drill'}</h1>
            {isPremium && (
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">
                Premium
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm">
            {scenario?.description || 'Complete this drill to improve your skills'}
          </p>
        </div>

        {/* Drill Content */}
        <div className="space-y-6">
          <DrillCard
            prompt={prompt}
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

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => router.push('/app')}
                  className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                >
                  Back to Practice
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Save Prompt Modal */}
      {showSavePrompt && !user && (
        <SoftSavePrompt onDismiss={() => setShowSavePrompt(false)} />
      )}

      {/* Paywall Modal */}
      {showPaywall && (
        <PaywallModal
          feature="This premium drill"
          onDismiss={() => setShowPaywall(false)}
        />
      )}
    </main>
  );
}
