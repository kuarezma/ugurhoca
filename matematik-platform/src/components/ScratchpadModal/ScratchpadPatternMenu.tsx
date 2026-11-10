'use client';

import { Grid, ChevronDown, Check } from 'lucide-react';
import { PATTERN_NAMES, type BackgroundPattern } from './types';

type ScratchpadPatternMenuProps = {
  isLight: boolean;
  backgroundPattern: BackgroundPattern;
  setBackgroundPattern: (pattern: BackgroundPattern) => void;
  showPatternMenu: boolean;
  setShowPatternMenu: (fn: (v: boolean) => boolean) => void;
};

export function ScratchpadPatternMenu({
  isLight,
  backgroundPattern,
  setBackgroundPattern,
  showPatternMenu,
  setShowPatternMenu,
}: ScratchpadPatternMenuProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowPatternMenu((prev) => !prev)}
        title="Arka Plan Deseni Değiştir"
        className={`inline-flex h-8 items-center gap-1 rounded-xl px-2 text-xs font-semibold border transition ${
          isLight
            ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
        }`}
      >
        <Grid className="h-3.5 w-3.5" />
        <span className="hidden lg:inline">
          {PATTERN_NAMES[backgroundPattern]}
        </span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {showPatternMenu && (
        <div
          className={`absolute right-0 top-full mt-1.5 z-50 w-44 rounded-2xl border p-1.5 shadow-2xl backdrop-blur-xl ${
            isLight
              ? 'border-slate-200 bg-white/95 text-slate-900'
              : 'border-white/10 bg-slate-900/95 text-white'
          }`}
        >
          {(Object.keys(PATTERN_NAMES) as BackgroundPattern[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setBackgroundPattern(p);
                setShowPatternMenu(() => false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition ${
                backgroundPattern === p
                  ? 'bg-brand-primary text-slate-950 font-bold'
                  : 'hover:bg-white/10'
              }`}
            >
              <span>{PATTERN_NAMES[p]}</span>
              {backgroundPattern === p && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
