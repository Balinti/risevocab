'use client';

import { useState } from 'react';
import { SeedPrompt } from '@/lib/contentSeed';

interface DrillCardProps {
  prompt: SeedPrompt;
  onSubmit: (input: string) => Promise<void>;
  isSubmitting?: boolean;
}

export default function DrillCard({ prompt, onSubmit, isSubmitting }: DrillCardProps) {
  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;
    await onSubmit(input.trim());
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'rewrite':
        return 'Rewrite';
      case 'tone_rewrite':
        return `Tone: ${prompt.target_tone}`;
      case 'cloze':
        return 'Fill in the blank';
      case 'short_reply':
        return 'Short Reply';
      default:
        return type;
    }
  };

  const getPlaceholder = (type: string) => {
    switch (type) {
      case 'rewrite':
        return 'Write your improved version here...';
      case 'tone_rewrite':
        return `Write a ${prompt.target_tone} version here...`;
      case 'cloze':
        return 'Enter the missing word or phrase...';
      case 'short_reply':
        return 'Write your response here...';
      default:
        return 'Your answer...';
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded">
          {getTypeLabel(prompt.prompt_type)}
        </span>
        {prompt.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded">
            {tag}
          </span>
        ))}
      </div>

      <div className="prose prose-invert mb-6">
        <p className="text-gray-200 whitespace-pre-wrap">{prompt.prompt_text}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={getPlaceholder(prompt.prompt_type)}
          rows={prompt.prompt_type === 'cloze' ? 2 : 4}
          className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
          disabled={isSubmitting}
        />

        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={!input.trim() || isSubmitting}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              'Submit'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
