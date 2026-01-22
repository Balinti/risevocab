'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import SoftSavePrompt from '@/components/SoftSavePrompt';
import { getLocalPhrasebook, addLocalPhrase, removeLocalPhrase, generateLocalId, LocalPhrase } from '@/lib/localStore';

export default function PhrasebookPage() {
  const { user } = useAuth();
  const [phrases, setPhrases] = useState<LocalPhrase[]>([]);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [newPhrase, setNewPhrase] = useState('');
  const [newTone, setNewTone] = useState('neutral');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const localPhrases = getLocalPhrasebook();
    setPhrases(localPhrases);
  }, []);

  const handleAddPhrase = () => {
    if (!newPhrase.trim()) return;

    const phrase: LocalPhrase = {
      id: generateLocalId(),
      phrase_text: newPhrase.trim(),
      tone: newTone,
      tags: [],
      created_at: new Date().toISOString()
    };

    addLocalPhrase(phrase);
    setPhrases([...phrases, phrase]);
    setNewPhrase('');
    setShowAddForm(false);

    // Show save prompt if not logged in
    if (!user) {
      setShowSavePrompt(true);
    }
  };

  const handleRemovePhrase = (id: string) => {
    removeLocalPhrase(id);
    setPhrases(phrases.filter(p => p.id !== id));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const groupedPhrases = phrases.reduce((acc, phrase) => {
    const tone = phrase.tone || 'neutral';
    if (!acc[tone]) acc[tone] = [];
    acc[tone].push(phrase);
    return acc;
  }, {} as Record<string, LocalPhrase[]>);

  return (
    <main className="min-h-[calc(100vh-60px)] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Phrasebook</h1>
            <p className="text-gray-400 text-sm mt-1">
              Save and organize professional phrases for quick reference
            </p>
          </div>

          <Link
            href="/app"
            className="text-gray-400 hover:text-white text-sm"
          >
            ← Back
          </Link>
        </div>

        {/* Sync Notice */}
        {!user && phrases.length > 0 && (
          <div className="p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg mb-6">
            <p className="text-sm text-blue-300">
              Your phrases are saved locally. Sign in to sync across devices.
            </p>
          </div>
        )}

        {/* Add Phrase Button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full p-4 border border-dashed border-slate-600 rounded-lg text-gray-400 hover:text-white hover:border-emerald-500 transition-colors mb-6"
          >
            + Add a phrase
          </button>
        )}

        {/* Add Phrase Form */}
        {showAddForm && (
          <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg mb-6">
            <textarea
              value={newPhrase}
              onChange={(e) => setNewPhrase(e.target.value)}
              placeholder="Enter a professional phrase..."
              rows={2}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none mb-3"
            />

            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-400">Tone:</span>
              {['polite', 'neutral', 'direct', 'confident'].map(tone => (
                <button
                  key={tone}
                  onClick={() => setNewTone(tone)}
                  className={`px-3 py-1 text-xs rounded ${
                    newTone === tone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-gray-400 hover:text-white'
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddPhrase}
                disabled={!newPhrase.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Save Phrase
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewPhrase('');
                }}
                className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {phrases.length === 0 && !showAddForm && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2">No saved phrases yet</h2>
            <p className="text-gray-400 text-sm mb-6">
              Save professional phrases from your drills or add your own for quick reference.
            </p>
          </div>
        )}

        {/* Phrase List by Tone */}
        {Object.entries(groupedPhrases).map(([tone, toneItems]) => (
          <div key={tone} className="mb-8">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
              {tone}
            </h2>
            <div className="space-y-2">
              {toneItems.map(phrase => (
                <div
                  key={phrase.id}
                  className="p-4 bg-slate-800 border border-slate-700 rounded-lg group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-gray-200 flex-1">{phrase.phrase_text}</p>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopy(phrase.phrase_text)}
                        className="p-1.5 text-gray-500 hover:text-white"
                        title="Copy"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleRemovePhrase(phrase.id)}
                        className="p-1.5 text-gray-500 hover:text-red-400"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Save Prompt Modal */}
      {showSavePrompt && !user && (
        <SoftSavePrompt onDismiss={() => setShowSavePrompt(false)} />
      )}
    </main>
  );
}
