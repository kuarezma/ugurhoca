'use client';

import { Minus, Plus } from 'lucide-react';
import { DARK_PALETTE, LIGHT_PALETTE, type ToolType } from './types';

type ScratchpadColorPickerProps = {
  isLight: boolean;
  activeTool: ToolType;
  color: string;
  setColor: (color: string) => void;
  lineWidth: number;
  setLineWidth: (fn: (w: number) => number) => void;
};

export function ScratchpadColorPicker({
  isLight,
  activeTool,
  color,
  setColor,
  lineWidth,
  setLineWidth,
}: ScratchpadColorPickerProps) {
  const currentPalette = isLight ? LIGHT_PALETTE : DARK_PALETTE;

  return (
    <>
      {activeTool !== 'eraser' && (
        <div
          className={`flex items-center gap-1 rounded-xl p-1 border ${
            isLight
              ? 'bg-slate-100 border-slate-300'
              : 'bg-white/5 border-white/10'
          }`}
        >
          {currentPalette.map((c) => (
            <button
              key={c.id}
              type="button"
              title={c.label}
              onClick={() => setColor(c.value)}
              className={`h-5 w-5 sm:h-6 sm:w-6 rounded-lg transition-transform ${
                color === c.value
                  ? `scale-125 ring-2 shadow-sm ${
                      isLight
                        ? 'ring-slate-900 ring-offset-1 ring-offset-white'
                        : 'ring-white ring-offset-1 ring-offset-slate-900'
                    }`
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      )}

      {/* Çizgi Kalınlığı */}
      <div
        className={`flex items-center gap-1 rounded-xl px-2 py-1 border text-xs ${
          isLight
            ? 'bg-slate-100 border-slate-200 text-slate-700'
            : 'bg-white/5 border-white/10 text-slate-300'
        }`}
      >
        <button
          type="button"
          onClick={() => setLineWidth((prev) => Math.max(1, prev - 1))}
          aria-label="Kalınlığı azalt"
          className={`rounded p-1 ${
            isLight ? 'hover:bg-slate-200' : 'hover:bg-white/10'
          }`}
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-3 text-center font-bold text-[11px]">
          {lineWidth}
        </span>
        <button
          type="button"
          onClick={() => setLineWidth((prev) => Math.min(12, prev + 1))}
          aria-label="Kalınlığı artır"
          className={`rounded p-1 ${
            isLight ? 'hover:bg-slate-200' : 'hover:bg-white/10'
          }`}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </>
  );
}
