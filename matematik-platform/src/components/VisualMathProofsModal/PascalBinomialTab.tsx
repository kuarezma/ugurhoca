'use client';

import { useState } from 'react';
import { Lightbulb } from 'lucide-react';

const PASCAL_ROWS = [
  [1],
  [1, 1],
  [1, 2, 1],
  [1, 3, 3, 1],
  [1, 4, 6, 4, 1],
  [1, 5, 10, 10, 5, 1],
];

const BINOMIAL_EXPANSIONS = [
  '1',
  'a + b',
  'a^2 + 2ab + b^2',
  'a^3 + 3a^2b + 3ab^2 + b^3',
  'a^4 + 4a^3b + 6a^2b^2 + 4ab^3 + b^4',
  'a^5 + 5a^4b + 10a^3b^2 + 10a^2b^3 + 5ab^4 + b^5',
];

export function PascalBinomialTab() {
  const [binomialPower, setBinomialPower] = useState(3);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Sol Görsel Pascal Üçgeni */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-950 p-6 min-h-[300px]">
          <div className="space-y-2.5 text-center">
            {PASCAL_ROWS.map((row, rIdx) => {
              const isSelected = rIdx === binomialPower;
              return (
                <div
                  key={rIdx}
                  className="flex items-center justify-center gap-2"
                >
                  <span className="w-8 text-[10px] font-mono text-slate-500">
                    n={rIdx}
                  </span>
                  <div className="flex gap-1.5">
                    {row.map((val, cIdx) => (
                      <div
                        key={cIdx}
                        className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl font-mono text-xs sm:text-sm font-bold transition-all ${
                          isSelected
                            ? 'shadow-lg scale-110 bg-brand-primary text-slate-950 dark:text-slate-950'
                            : 'bg-white/5 border border-white/10 text-slate-300'
                        }`}
                      >
                        {val}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <span className="text-[11px] text-slate-400 mt-4">
            Her sayı, üstündeki iki sayının toplamıdır (Örn: 1 + 2 = 3).
          </span>
        </div>

        {/* Sağ Kontrol Paneli */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-slate-950/50 p-4 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Kuvvet Derecesi (n):
            </span>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-900 dark:text-white">
                  (a + b)ⁿ açılımı için n = {binomialPower}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                value={binomialPower}
                onChange={(e) => setBinomialPower(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4, 5].map((pow) => (
                <button
                  key={pow}
                  type="button"
                  onClick={() => setBinomialPower(pow)}
                  className={`flex-1 py-1 rounded-lg text-xs font-bold transition ${
                    binomialPower === pow
                      ? 'bg-brand-primary text-slate-950 dark:text-slate-950'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  n={pow}
                </button>
              ))}
            </div>
          </div>

          {/* Binom Açılım Kartı */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-center">
            <div className="text-xs font-semibold text-amber-300 mb-1">
              (a + b)^{binomialPower} Cebirsel Açılımı:
            </div>
            <div className="text-sm sm:text-base font-mono font-bold text-slate-900 dark:text-white leading-relaxed">
              {BINOMIAL_EXPANSIONS[binomialPower]}
            </div>
            <div className="text-xs text-slate-300 mt-2">
              Katsayılar: [ {PASCAL_ROWS[binomialPower].join(', ')} ]
            </div>
          </div>
        </div>
      </div>

      {/* Pedagojik Açıklama */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
        <Lightbulb className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed text-slate-200">
          <strong className="text-amber-300">Kombinasyon Bağlantısı:</strong>{' '}
          Pascal üçgenindeki her eleman aslında bir kombinasyondur: C(n, r). (a
          + b)³ açılımında a²b teriminin katsayısının 3 olmasının sebebi, 3
          parantezden birini seçmenin 3 farklı yolu olmasıdır!
        </div>
      </div>
    </div>
  );
}
