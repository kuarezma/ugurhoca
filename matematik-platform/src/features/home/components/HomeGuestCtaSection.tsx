'use client';

import Link from 'next/link';
import { Brain, Play } from 'lucide-react';

type HomeGuestCtaSectionProps = {
  isLight: boolean;
};

export function HomeGuestCtaSection({ isLight }: HomeGuestCtaSectionProps) {
  return (
    <section className="defer-section px-4 py-12 sm:py-16">
      <div className="max-w-6xl mx-auto">
        <div
          className={`border rounded-3xl p-6 sm:p-8 text-center ${
            isLight
              ? 'light-soft-panel shadow-[0_18px_42px_rgba(99,102,241,0.14)]'
              : 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-500/20'
          }`}
        >
          <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h2
            className={`text-xl sm:text-2xl font-bold mb-2 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            Hemen Başla, Ücretsiz!
          </h2>
          <p
            className={`mb-6 max-w-md mx-auto ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            Tüm içeriklere erişmek için kayıt ol. Sadece 30 saniye!
          </p>
          <Link
            href="/kayit"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all"
          >
            <Play className="w-5 h-5" />
            Ücretsiz Kayıt Ol
          </Link>
        </div>
      </div>
    </section>
  );
}
