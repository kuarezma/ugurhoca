'use client';

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
        <p
          className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-500'}`}
        >
          © 2026 Uğur Hoca Matematik, tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
