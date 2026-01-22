'use client';

import Link from 'next/link';
import GoogleAuth from './GoogleAuth';

export default function Header() {
  return (
    <header className="border-b border-white/10 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white">
          Rise<span className="text-emerald-400">Vocab</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <Link href="/app" className="text-gray-300 hover:text-white transition-colors">
            Practice
          </Link>
          <Link href="/app/phrasebook" className="text-gray-300 hover:text-white transition-colors">
            Phrasebook
          </Link>
          <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
            Pricing
          </Link>
        </nav>

        <GoogleAuth />
      </div>
    </header>
  );
}
