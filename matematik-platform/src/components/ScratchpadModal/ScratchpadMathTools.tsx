'use client';

import { Compass, Minus, Shapes } from 'lucide-react';

type ScratchpadMathToolsProps = {
  isLight: boolean;
  showProtractor: boolean;
  setShowProtractor: (fn: (v: boolean) => boolean) => void;
  showShapesMenu: boolean;
  setShowShapesMenu: (fn: (v: boolean) => boolean) => void;
  onDrawCoordinatePlane: () => void;
  onDrawNumberLine: () => void;
  onDrawGeometricShape: (shape: 'triangle' | 'circle' | 'rectangle') => void;
};

export function ScratchpadMathTools({
  isLight,
  showProtractor,
  setShowProtractor,
  showShapesMenu,
  setShowShapesMenu,
  onDrawCoordinatePlane,
  onDrawNumberLine,
  onDrawGeometricShape,
}: ScratchpadMathToolsProps) {
  return (
    <div className="flex items-center gap-1 rounded-xl bg-indigo-500/10 p-0.5 border border-indigo-500/30">
      <button
        type="button"
        onClick={onDrawCoordinatePlane}
        title="Kartezyen Koordinat Düzlemi Ekle (x, y eksenleri)"
        className={`inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold transition ${
          isLight
            ? 'text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900'
            : 'text-indigo-300 hover:bg-indigo-500/20 hover:text-white'
        }`}
      >
        <Compass className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
        <span className="hidden sm:inline">Koordinat</span>
      </button>

      <button
        type="button"
        onClick={onDrawNumberLine}
        title="Sayı Doğrusu Ekle"
        className={`inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold transition ${
          isLight
            ? 'text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900'
            : 'text-indigo-300 hover:bg-indigo-500/20 hover:text-white'
        }`}
      >
        <Minus className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        <span className="hidden sm:inline">Sayı Doğrusu</span>
      </button>

      <button
        type="button"
        onClick={() => setShowProtractor((prev) => !prev)}
        title={showProtractor ? 'Açıölçeri Gizle' : 'Açıölçer (İletki) Aç'}
        className={`inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold transition ${
          showProtractor
            ? 'bg-brand-primary font-bold shadow-md text-slate-950 dark:text-slate-950'
            : isLight
              ? 'text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900'
              : 'text-indigo-300 hover:bg-indigo-500/20 hover:text-white'
        }`}
      >
        <Compass className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        <span className="hidden sm:inline">Açıölçer</span>
      </button>

      <div className="relative">
        <button
          type="button"
          title="Geometrik Şekil Ekle"
          aria-label="Geometrik Şekil Ekle"
          onClick={() => setShowShapesMenu((prev) => !prev)}
          className={`inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold transition ${
            isLight
              ? 'text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900'
              : 'text-indigo-300 hover:bg-indigo-500/20 hover:text-white'
          }`}
        >
          <Shapes className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
          <span className="hidden sm:inline">Şekil</span>
        </button>
        <div
          className={`absolute left-0 top-full mt-1 ${
            showShapesMenu ? 'flex' : 'hidden'
          } flex-col gap-1 rounded-xl border p-1.5 shadow-xl z-50 min-w-[130px] ${
            isLight
              ? 'border-slate-200 bg-white text-slate-900'
              : 'border-white/10 bg-surface-1 text-primary'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              onDrawGeometricShape('triangle');
              setShowShapesMenu(() => false);
            }}
            className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-left font-medium ${
              isLight
                ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                : 'text-slate-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>📐 Dik Üçgen</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onDrawGeometricShape('circle');
              setShowShapesMenu(() => false);
            }}
            className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-left font-medium ${
              isLight
                ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                : 'text-slate-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>⭕ Çember (r)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onDrawGeometricShape('rectangle');
              setShowShapesMenu(() => false);
            }}
            className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-left font-medium ${
              isLight
                ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                : 'text-slate-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>▭ Dikdörtgen</span>
          </button>
        </div>
      </div>
    </div>
  );
}
