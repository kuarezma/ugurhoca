'use client';

import {
  PenTool,
  Highlighter,
  Ruler,
  Eraser,
  RotateCcw,
  RotateCw,
  Trash2,
  Download,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  type ToolType,
  type BackgroundPattern,
  type ScratchpadQuestionContext,
} from './types';
import { ScratchpadPatternSelector } from './ScratchpadPatternSelector';
import { ScratchpadColorPicker } from './ScratchpadColorPicker';
import { ScratchpadMathTools } from './ScratchpadMathTools';

type ScratchpadToolbarProps = {
  title: string;
  isLight: boolean;
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  color: string;
  setColor: (color: string) => void;
  lineWidth: number;
  setLineWidth: (fn: (w: number) => number) => void;
  backgroundPattern: BackgroundPattern;
  setBackgroundPattern: (pattern: BackgroundPattern) => void;
  showPatternMenu: boolean;
  setShowPatternMenu: (fn: (v: boolean) => boolean) => void;
  showShapesMenu: boolean;
  setShowShapesMenu: (fn: (v: boolean) => boolean) => void;
  showProtractor: boolean;
  setShowProtractor: (fn: (v: boolean) => boolean) => void;
  historyLength: number;
  redoHistoryLength: number;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExport: () => void;
  onToggleLight: () => void;
  onClose: () => void;
  questionContext?: ScratchpadQuestionContext;
  showQuestionPanel: boolean;
  setShowQuestionPanel: (fn: (v: boolean) => boolean) => void;
  onDrawCoordinatePlane: () => void;
  onDrawNumberLine: () => void;
  onDrawGeometricShape: (shape: 'triangle' | 'circle' | 'rectangle') => void;
};

export function ScratchpadToolbar({
  title,
  isLight,
  activeTool,
  setActiveTool,
  color,
  setColor,
  lineWidth,
  setLineWidth,
  backgroundPattern,
  setBackgroundPattern,
  showPatternMenu,
  setShowPatternMenu,
  showShapesMenu,
  setShowShapesMenu,
  showProtractor,
  setShowProtractor,
  historyLength,
  redoHistoryLength,
  onUndo,
  onRedo,
  onClear,
  onExport,
  onToggleLight,
  onClose,
  questionContext,
  showQuestionPanel,
  setShowQuestionPanel,
  onDrawCoordinatePlane,
  onDrawNumberLine,
  onDrawGeometricShape,
}: ScratchpadToolbarProps) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 border-b px-3 sm:px-4 py-2 sm:py-3 ${
        isLight
          ? 'border-slate-200 bg-slate-50'
          : 'border-white/10 bg-slate-950/90'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-300">
          <PenTool className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
        <span
          className={`font-display text-xs sm:text-sm font-bold truncate ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          {title}
        </span>

        {questionContext && (
          <button
            type="button"
            onClick={() => setShowQuestionPanel((prev) => !prev)}
            className={`hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
              showQuestionPanel
                ? 'bg-brand-primary/20 border-brand-primary/30 text-tone-success-fg dark:text-brand-primary-soft'
                : isLight
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
            }`}
            title="Soru panelini aç/kapat"
          >
            {showQuestionPanel ? (
              <EyeOff className="h-3 w-3" />
            ) : (
              <Eye className="h-3 w-3" />
            )}
            <span>{showQuestionPanel ? 'Soruyu Gizle' : 'Soruyu Gör'}</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
        {/* Araç Seçimi: Kalem, Fosforlu, Çizgi, Silgi */}
        <div
          className={`flex items-center rounded-xl p-0.5 border ${
            isLight
              ? 'bg-slate-100 border-slate-200'
              : 'bg-white/5 border-white/10'
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTool('pen')}
            title="Kalem"
            className={`inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold transition ${
              activeTool === 'pen'
                ? 'bg-brand-primary font-bold shadow-md text-slate-950 dark:text-slate-950'
                : isLight
                  ? 'text-slate-700 hover:text-slate-900'
                  : 'text-slate-300 hover:text-white'
            }`}
          >
            <PenTool className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Kalem</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('highlighter')}
            title="Fosforlu Kalem"
            className={`inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold transition ${
              activeTool === 'highlighter'
                ? 'bg-brand-primary/90 text-slate-950 font-bold shadow-md'
                : isLight
                  ? 'text-slate-700 hover:text-slate-900'
                  : 'text-slate-300 hover:text-white'
            }`}
          >
            <Highlighter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Fosforlu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('line')}
            title="Düz Çizgi / Cetvel"
            className={`inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold transition ${
              activeTool === 'line'
                ? 'bg-brand-primary font-bold shadow-md text-slate-950 dark:text-slate-950'
                : isLight
                  ? 'text-slate-700 hover:text-slate-900'
                  : 'text-slate-300 hover:text-white'
            }`}
          >
            <Ruler className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Çizgi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('eraser')}
            title="Silgi"
            className={`inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold transition ${
              activeTool === 'eraser'
                ? 'bg-brand-primary font-bold shadow-md text-slate-950 dark:text-slate-950'
                : isLight
                  ? 'text-slate-700 hover:text-slate-900'
                  : 'text-slate-300 hover:text-white'
            }`}
          >
            <Eraser className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Silgi</span>
          </button>
        </div>

        {/* Matematik Şablon & Araç Seti */}
        <ScratchpadMathTools
          isLight={isLight}
          showProtractor={showProtractor}
          setShowProtractor={setShowProtractor}
          showShapesMenu={showShapesMenu}
          setShowShapesMenu={setShowShapesMenu}
          onDrawCoordinatePlane={onDrawCoordinatePlane}
          onDrawNumberLine={onDrawNumberLine}
          onDrawGeometricShape={onDrawGeometricShape}
        />

        {/* Renk Paleti ve Çizgi Kalınlığı */}
        <ScratchpadColorPicker
          isLight={isLight}
          activeTool={activeTool}
          color={color}
          setColor={setColor}
          lineWidth={lineWidth}
          setLineWidth={setLineWidth}
        />

        {/* Arka Plan Deseni */}
        <ScratchpadPatternSelector
          isLight={isLight}
          backgroundPattern={backgroundPattern}
          setBackgroundPattern={setBackgroundPattern}
          showPatternMenu={showPatternMenu}
          setShowPatternMenu={setShowPatternMenu}
        />

        {/* Geri / İleri */}
        <div
          className={`flex items-center rounded-xl p-0.5 border ${
            isLight
              ? 'bg-slate-100 border-slate-200'
              : 'bg-white/5 border-white/10'
          }`}
        >
          <button
            type="button"
            onClick={onUndo}
            disabled={historyLength <= 1}
            title="Geri al"
            aria-label="Geri al"
            className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-white/10 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={redoHistoryLength === 0}
            title="İleri al"
            aria-label="İleri al"
            className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-white/10 transition"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Temizle */}
        <button
          type="button"
          onClick={onClear}
          title="Tümünü temizle"
          aria-label="Tümünü temizle"
          className="p-1.5 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>

        {/* Dışa Aktar */}
        <button
          type="button"
          onClick={onExport}
          title="Çizimi PNG Olarak İndir"
          aria-label="Çizimi PNG Olarak İndir"
          className={`hidden sm:inline-flex p-1.5 rounded-xl border transition ${
            isLight
              ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
              : 'border-white/10 text-slate-300 hover:bg-white/10'
          }`}
        >
          <Download className="h-3.5 w-3.5" />
        </button>

        {/* Aydınlık/Karanlık Tahta Modu Toggle */}
        <button
          type="button"
          onClick={onToggleLight}
          title={
            isLight ? 'Karanlık Tahtaya Geç' : 'Aydınlık Beyaz Tahtaya Geç'
          }
          className={`p-1.5 rounded-xl border text-xs font-bold transition ${
            isLight
              ? 'border-slate-200 bg-white text-slate-800 hover:bg-slate-100'
              : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
          }`}
        >
          {isLight ? '🌙' : '☀️'}
        </button>

        {/* Kapat */}
        <button
          type="button"
          onClick={onClose}
          title="Karalama tahtasını kapat"
          aria-label="Karalama tahtasını kapat"
          className={`p-1.5 rounded-xl transition ${
            isLight
              ? 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900'
              : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
          }`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
