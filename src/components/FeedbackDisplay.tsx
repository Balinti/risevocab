'use client';

import { useAuth } from '@/lib/AuthContext';

interface Feedback {
  score: number;
  tone_label: string;
  rewrites: string[];
  mistakes: string[];
  explanation: string;
}

interface FeedbackDisplayProps {
  feedback: Feedback;
  maxRewrites?: number;
  onSavePhrase?: (phrase: string) => void;
  canSavePhrase?: boolean;
}

export default function FeedbackDisplay({
  feedback,
  maxRewrites = 1,
  onSavePhrase,
  canSavePhrase = false
}: FeedbackDisplayProps) {
  const { user } = useAuth();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent!';
    if (score >= 80) return 'Great job!';
    if (score >= 70) return 'Good effort';
    if (score >= 60) return 'Getting there';
    return 'Keep practicing';
  };

  const visibleRewrites = feedback.rewrites.slice(0, maxRewrites);
  const hiddenCount = feedback.rewrites.length - maxRewrites;

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-6">
      {/* Score */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">Your Score</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-bold ${getScoreColor(feedback.score)}`}>
              {feedback.score}
            </span>
            <span className="text-gray-500">/100</span>
          </div>
          <p className="text-sm text-gray-400 mt-1">{getScoreLabel(feedback.score)}</p>
        </div>

        <div className="px-3 py-1.5 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-lg">
          Tone: {feedback.tone_label}
        </div>
      </div>

      {/* Explanation */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-2">Feedback</h4>
        <p className="text-gray-400">{feedback.explanation}</p>
      </div>

      {/* Mistakes */}
      {feedback.mistakes.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Areas to Improve</h4>
          <ul className="space-y-2">
            {feedback.mistakes.map((mistake, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-orange-400 mt-0.5">!</span>
                <span className="text-gray-400">{mistake}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rewrites */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-2">
          Suggested Rewrites
          {feedback.rewrites.length > 1 && (
            <span className="text-gray-500 font-normal ml-2">
              ({visibleRewrites.length} of {feedback.rewrites.length})
            </span>
          )}
        </h4>
        <div className="space-y-3">
          {visibleRewrites.map((rewrite, index) => (
            <div
              key={index}
              className="p-3 bg-emerald-900/20 border border-emerald-800/50 rounded-lg"
            >
              <p className="text-emerald-300 text-sm">{rewrite}</p>
              {canSavePhrase && onSavePhrase && (
                <button
                  onClick={() => onSavePhrase(rewrite)}
                  className="mt-2 text-xs text-emerald-500 hover:text-emerald-400"
                >
                  + Save to phrasebook
                </button>
              )}
              {!canSavePhrase && onSavePhrase && user && (
                <p className="mt-2 text-xs text-gray-500">
                  Upgrade to Plus to save phrases
                </p>
              )}
            </div>
          ))}

          {hiddenCount > 0 && (
            <div className="p-3 bg-gray-900/50 border border-gray-700 rounded-lg text-center">
              <p className="text-gray-400 text-sm">
                +{hiddenCount} more rewrite{hiddenCount > 1 ? 's' : ''} available with{' '}
                <a href="/pricing" className="text-emerald-400 hover:underline">
                  Plus or Pro
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
