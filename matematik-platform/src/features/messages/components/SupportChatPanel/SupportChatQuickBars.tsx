'use client';

import { useState } from 'react';
import { Calculator, LayoutGrid, Sparkles } from 'lucide-react';
import MathText from '@/components/MathText';
import { ScrollableChipRow } from './ScrollableChipRow';
import {
  MATH_QUICK_SYMBOLS,
  QUICK_FEEDBACK_TEMPLATES,
  STUDENT_QUICK_TEMPLATES,
} from './constants';

export type SupportChatQuickBarsProps = {
  appearance: 'navbar' | 'admin';
  isLight?: boolean;
  draft: string;
  onDraftChange: (value: string) => void;
};

export function SupportChatQuickBars({
  appearance,
  isLight = true,
  draft,
  onDraftChange,
}: SupportChatQuickBarsProps) {
  const [isSymbolsExpanded, setIsSymbolsExpanded] = useState(false);

  return (
    <>
      {/* Öğrenci Hızlı Soru Şablonları */}
      {appearance === 'navbar' && !draft && (
        <div className="mb-2">
          <ScrollableChipRow isLight={isLight}>
            <span className="text-[10px] font-bold text-indigo-500 shrink-0 flex items-center gap-1 pr-1 select-none">
              <Sparkles className="h-3 w-3 text-amber-400" />
              Soru Şablonu:
            </span>
            {STUDENT_QUICK_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl}
                type="button"
                onClick={() => onDraftChange(tmpl)}
                className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition shadow-2xs ${
                  isLight
                    ? 'border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-indigo-400 hover:bg-slate-700 hover:text-indigo-300'
                }`}
              >
                {tmpl}
              </button>
            ))}
          </ScrollableChipRow>
        </div>
      )}

      {/* Öğretmen / Admin Hızlı Geri Bildirim Şablonları */}
      {appearance === 'admin' && (
        <div className="mb-2">
          <ScrollableChipRow isLight={isLight}>
            <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1 pr-1 select-none">
              <Sparkles className="h-3 w-3 text-amber-400" />
              Hızlı Not:
            </span>
            {QUICK_FEEDBACK_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl}
                type="button"
                onClick={() => onDraftChange(draft ? `${draft} ${tmpl}` : tmpl)}
                className="shrink-0 rounded-lg border border-[var(--border)] bg-[var(--bg-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-strong)] hover:bg-[var(--bg-muted)] hover:border-indigo-400/40 transition shadow-sm"
              >
                {tmpl}
              </button>
            ))}
          </ScrollableChipRow>
        </div>
      )}

      {/* Hızlı Matematik Sembolleri Çubuğu / Izgara */}
      <div className="mb-2">
        {isSymbolsExpanded ? (
          <div
            className={`rounded-xl border p-2 transition-all shadow-xs ${
              isLight
                ? 'border-slate-200 bg-slate-50/90'
                : 'border-slate-700/80 bg-slate-800/80'
            }`}
          >
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-500 flex items-center gap-1 select-none">
                <Calculator className="h-3 w-3" />
                Matematik Sembolleri (Tümü):
              </span>
              <button
                type="button"
                onClick={() => setIsSymbolsExpanded(false)}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-slate-500 hover:text-indigo-600 transition"
                title="Satır görünümüne dön"
              >
                <LayoutGrid className="h-3 w-3 text-indigo-500" />
                Kapat
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {MATH_QUICK_SYMBOLS.map((sym) => (
                <button
                  key={sym.label}
                  type="button"
                  onClick={() =>
                    onDraftChange(
                      draft ? `${draft} ${sym.snippet}` : sym.snippet,
                    )
                  }
                  title={`${sym.label} ekle`}
                  className={`rounded-lg border px-2 py-0.5 text-xs font-medium transition shadow-2xs ${
                    appearance === 'navbar'
                      ? isLight
                        ? 'border-slate-200 bg-white text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600'
                        : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:border-indigo-400 hover:text-indigo-300'
                      : 'border-[var(--border)] bg-[var(--bg-soft)] text-[var(--text)] hover:border-indigo-400 hover:bg-[var(--bg-muted)]'
                  }`}
                >
                  {sym.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ScrollableChipRow isLight={isLight}>
            <div className="shrink-0 flex items-center gap-1 pr-1">
              <span className="text-[10px] font-bold text-indigo-500 flex items-center gap-1 select-none">
                <Calculator className="h-3 w-3" />
                Sembol:
              </span>
              <button
                type="button"
                onClick={() => setIsSymbolsExpanded(true)}
                className={`flex h-5 w-5 items-center justify-center rounded border transition shadow-2xs ${
                  isLight
                    ? 'border-slate-200 bg-slate-50 text-slate-600 hover:text-indigo-600 hover:border-indigo-300'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:text-indigo-400 hover:border-indigo-500'
                }`}
                title="Tüm sembolleri ızgara olarak göster"
                aria-label="Tüm sembolleri ızgara olarak göster"
              >
                <LayoutGrid className="h-3 w-3" />
              </button>
            </div>
            {MATH_QUICK_SYMBOLS.map((sym) => (
              <button
                key={sym.label}
                type="button"
                onClick={() =>
                  onDraftChange(draft ? `${draft} ${sym.snippet}` : sym.snippet)
                }
                title={`${sym.label} ekle`}
                className={`shrink-0 rounded-lg border px-2 py-0.5 text-xs font-medium transition shadow-2xs ${
                  appearance === 'navbar'
                    ? isLight
                      ? 'border-slate-200 bg-slate-100/80 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600'
                      : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:border-indigo-400 hover:text-indigo-300'
                    : 'border-[var(--border)] bg-[var(--bg-soft)] text-[var(--text)] hover:border-indigo-400 hover:bg-[var(--bg-muted)]'
                }`}
              >
                {sym.label}
              </button>
            ))}
          </ScrollableChipRow>
        )}
      </div>

      {/* Canlı Matematik Önizleme */}
      {draft.includes('$') && (
        <div className="mb-2 rounded-xl border border-indigo-400/30 bg-indigo-500/10 p-2 text-xs">
          <span className="block text-[10px] font-bold text-indigo-500 mb-0.5">
            Canlı Formül Önizleme:
          </span>
          <div className="text-[13px] font-serif text-slate-800 dark:text-slate-100">
            <MathText>{draft}</MathText>
          </div>
        </div>
      )}
    </>
  );
}
