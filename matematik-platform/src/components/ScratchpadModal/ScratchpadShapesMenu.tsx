'use client';

import {
  Shapes,
  ChevronDown,
  Grid,
  Minus,
  CircleDot,
  Ruler,
} from 'lucide-react';

type ScratchpadShapesMenuProps = {
  isLight: boolean;
  showShapesMenu: boolean;
  setShowShapesMenu: (fn: (v: boolean) => boolean) => void;
  onDrawCoordinatePlane: () => void;
  onDrawNumberLine: () => void;
  onDrawGeometricShape: (shape: 'triangle' | 'circle' | 'rectangle') => void;
};

export function ScratchpadShapesMenu({
  isLight,
  showShapesMenu,
  setShowShapesMenu,
  onDrawCoordinatePlane,
  onDrawNumberLine,
  onDrawGeometricShape,
}: ScratchpadShapesMenuProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowShapesMenu((prev) => !prev)}
        title="Geometrik Araçlar & Şekiller"
        className={`inline-flex h-8 items-center gap-1 rounded-xl px-2 text-xs font-semibold border transition ${
          showShapesMenu
            ? 'bg-brand-primary text-slate-950 font-bold'
            : isLight
              ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
        }`}
      >
        <Shapes className="h-3.5 w-3.5" />
        <span className="hidden xl:inline">Şekiller</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {showShapesMenu && (
        <div
          className={`absolute right-0 top-full mt-1.5 z-50 w-52 rounded-2xl border p-2 shadow-2xl backdrop-blur-xl ${
            isLight
              ? 'border-slate-200 bg-white/95 text-slate-900'
              : 'border-white/10 bg-slate-900/95 text-white'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
            Eksen & Doğrular
          </div>
          <button
            type="button"
            onClick={() => {
              onDrawCoordinatePlane();
              setShowShapesMenu(() => false);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs hover:bg-brand-primary/20 text-left transition"
          >
            <Grid className="h-3.5 w-3.5 text-sky-400" />
            <span>Kartezyen Koordinat</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onDrawNumberLine();
              setShowShapesMenu(() => false);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs hover:bg-brand-primary/20 text-left transition"
          >
            <Minus className="h-3.5 w-3.5 text-emerald-400" />
            <span>Sayı Doğrusu (-5..+5)</span>
          </button>

          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 mt-1 border-t border-white/10">
            Temel Geometri
          </div>
          <button
            type="button"
            onClick={() => {
              onDrawGeometricShape('triangle');
              setShowShapesMenu(() => false);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs hover:bg-brand-primary/20 text-left transition"
          >
            <Shapes className="h-3.5 w-3.5 text-amber-400" />
            <span>Dik Üçgen (ABC)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onDrawGeometricShape('circle');
              setShowShapesMenu(() => false);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs hover:bg-brand-primary/20 text-left transition"
          >
            <CircleDot className="h-3.5 w-3.5 text-rose-400" />
            <span>Çember & Yarıçap (r)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onDrawGeometricShape('rectangle');
              setShowShapesMenu(() => false);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs hover:bg-brand-primary/20 text-left transition"
          >
            <Ruler className="h-3.5 w-3.5 text-purple-400" />
            <span>Dikdörtgen & Köşegen</span>
          </button>
        </div>
      )}
    </div>
  );
}
