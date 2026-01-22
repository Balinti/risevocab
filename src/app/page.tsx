'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-60px)]">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Write{' '}
            <span className="text-emerald-400">naturally</span>
            {' '}at work
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Business communication microtraining for non-native professionals.
            10-minute scenario drills, instant AI feedback, and spaced repetition.
          </p>

          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-semibold rounded-xl transition-colors"
          >
            Try it now
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          <p className="text-sm text-gray-500 mt-4">
            No login required - start practicing in seconds
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Scenario Drills</h3>
              <p className="text-gray-400 text-sm">
                Practice real workplace scenarios: emails, standups, meeting requests, and sales conversations.
              </p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">AI Feedback</h3>
              <p className="text-gray-400 text-sm">
                Get instant feedback on tone, clarity, and professionalism. See multiple rewrite suggestions.
              </p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Spaced Repetition</h3>
              <p className="text-gray-400 text-sm">
                Review phrases at optimal intervals. Build lasting habits with our lightweight SRS system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Drill Types */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Practice Types</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded">Rewrite</span>
              <p className="text-sm text-gray-400">Transform casual or unclear messages into professional communication</p>
            </div>

            <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">Tone</span>
              <p className="text-sm text-gray-400">Adjust messages to be polite, neutral, direct, or confident</p>
            </div>

            <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">Cloze</span>
              <p className="text-sm text-gray-400">Fill in the blank with professional collocations and phrases</p>
            </div>

            <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-medium rounded">Reply</span>
              <p className="text-sm text-gray-400">Write short professional responses to workplace scenarios</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-slate-800/50 to-transparent">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to improve?</h2>
          <p className="text-gray-400 mb-8">
            Start with free drills - no account needed. Sign in later to save your progress.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors"
          >
            Start practicing
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-800">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>RiseVocab - Business communication microtraining</p>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-gray-300 transition-colors">Pricing</Link>
            <Link href="/app" className="hover:text-gray-300 transition-colors">Practice</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
