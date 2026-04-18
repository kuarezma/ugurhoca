'use client';

import Link from 'next/link';
import { Calculator } from 'lucide-react';

type HomeFooterProps = {
  isLight: boolean;
};

export function HomeFooter({ isLight }: HomeFooterProps) {
  return (
    <footer
      className={`defer-section px-4 py-6 border-t mt-8 ${
        isLight
          ? 'border-slate-200 bg-slate-50/70 backdrop-blur-sm'
          : 'border-slate-800/50'
      }`}
    >
      <div className="max-w-6xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Calculator className="w-4 h-4 text-white" />
          </div>
          <span
            className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}
          >
            Uğur Hoca Matematik
          </span>
        </div>
        <nav
          className={`mb-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs ${
            isLight ? 'text-slate-600' : 'text-slate-400'
          }`}
          aria-label="Yasal bağlantılar"
        >
          <Link
            href="/gizlilik"
            className={`underline-offset-2 hover:underline ${
              isLight ? 'text-slate-700' : 'text-slate-300'
            }`}
          >
            Gizlilik
          </Link>
          <span
            aria-hidden
            className={isLight ? 'text-slate-300' : 'text-slate-600'}
          >
            ·
          </span>
          <Link
            href="/kvkk"
            className={`underline-offset-2 hover:underline ${
              isLight ? 'text-slate-700' : 'text-slate-300'
            }`}
          >
            KVKK
          </Link>
        </nav>
        <p
          className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-500'}`}
        >
          © 2026 Uğur Hoca Matematik, tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
