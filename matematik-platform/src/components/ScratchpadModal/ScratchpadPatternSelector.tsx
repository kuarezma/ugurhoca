'use client';

import { CircleDot, Grid, ChevronDown, Check } from 'lucide-react';
import { PATTERN_NAMES, type BackgroundPattern } from './types';

const PATTERN_OPTIONS: Array<{
  id: BackgroundPattern;
  label: string;
  desc: string;
}> = [
  { id: 'grid', label: 'Kareli', desc: 'Geometri & Cebir' },
  { id: 'dot', label: 'Noktalı (Geoboard)', desc: 'Noktalı Zemin & Şekil' },
  { id: 'lined', label: 'Çizgili', desc: 'İşlem & Açıklama' },
  { id: 'isometric', label: 'İzometrik 3D', desc: 'Katı Cisim & Prizma' },
  { id: 'coordinate', label: 'Koordinat', desc: 'X-Y Fonksiyon Grafiği' },
  { id: 'dark', label: 'Düz Tahta', desc: 'Serbest Çizim' },
];

type ScratchpadPatternSelectorProps = {
  isLight: boolean;
  backgroundPattern: BackgroundPattern;
  setBackgroundPattern: (pattern: BackgroundPattern) => void;
  showPatternMenu: boolean;
  setShowPatternMenu: (fn: (v: boolean) => boolean) => void;
};

export function ScratchpadPatternSelector({
  isLight,
  backgroundPattern,
  setBackgroundPattern,
  showPatternMenu,
  setShowPatternMenu,
}: ScratchpadPatternSelectorProps) {
  const handlePatternToggle = () => {
    const patterns = Object.keys(PATTERN_NAMES) as BackgroundPattern[];
    const nextIdx = (patterns.indexOf(backgroundPattern) + 1) % patterns.length;
    setBackgroundPattern(patterns[nextIdx]);
  };

  return (
    <div
      className={`relative flex items-center rounded-xl p-0.5 border ${
        isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'
      }`}
    >
      <button
        type="button"
        onClick={handlePatternToggle}
        title={`Zemin Deseni: ${PATTERN_NAMES[backgroundPattern]}`}
        className={`inline-flex h-8 items-center gap-1 px-2 text-xs font-semibold ${
          isLight
            ? 'text-slate-700 hover:text-slate-900'
            : 'text-slate-300 hover:text-white'
        }`}
      >
        {backgroundPattern === 'dot' ? (
          <CircleDot className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
        ) : (
          <Grid className="h-3.5 w-3.5" />
        )}
        <span className="capitalize text-[11px]">
          {PATTERN_NAMES[backgroundPattern]}
        </span>
      </button>
      <button
        type="button"
        onClick={() => setShowPatternMenu((prev) => !prev)}
        title="Zemin Menüsünü Aç"
        aria-label="Zemin Menüsünü Aç"
        className={`h-8 px-1 rounded-r-lg border-l transition-colors ${
          isLight
            ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200 border-slate-200'
            : 'text-slate-400 hover:text-white hover:bg-white/10 border-white/10'
        }`}
      >
        <ChevronDown className="h-3 w-3" />
      </button>

      {showPatternMenu && (
        <div
          className={`absolute top-full mt-1.5 left-0 z-50 w-44 rounded-2xl border p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 ${
            isLight
              ? 'border-slate-200 bg-white/95 text-slate-900'
              : 'border-slate-700/80 bg-slate-900/95 text-white'
          }`}
        >
          <div
            className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider border-b mb-1 ${
              isLight
                ? 'text-slate-500 border-slate-200'
                : 'text-slate-400 border-white/10'
            }`}
          >
            Zemin Şablonu Seç
          </div>
          {PATTERN_OPTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setBackgroundPattern(item.id);
                setShowPatternMenu(() => false);
              }}
              className={`w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition-all ${
                backgroundPattern === item.id
                  ? 'bg-brand-primary font-bold shadow-sm text-slate-950 dark:text-slate-950'
                  : isLight
                    ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div>
                <div className="font-semibold">{item.label}</div>
                <div className="text-[9px] opacity-75">{item.desc}</div>
              </div>
              {backgroundPattern === item.id && (
                <Check className="h-3.5 w-3.5" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
