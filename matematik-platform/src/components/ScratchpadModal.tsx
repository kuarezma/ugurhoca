'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  Eraser,
  PenTool,
  RotateCcw,
  Trash2,
  X,
  Minus,
  Plus,
  Highlighter,
  Ruler,
  Grid,
  Download,
  Eye,
  EyeOff,
} from 'lucide-react';
import MathText from '@/components/MathText';
import Image from 'next/image';

export type ScratchpadQuestionContext = {
  questionText: string;
  options?: string[];
  imageUrl?: string | null;
};

export type ScratchpadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  questionContext?: ScratchpadQuestionContext;
};

type ToolType = 'pen' | 'highlighter' | 'line' | 'eraser';
type BackgroundPattern = 'dark' | 'grid' | 'lined';

const COLOR_PALETTE = [
  { id: 'yellow', label: 'Sarı', value: '#facc15' },
  { id: 'white', label: 'Beyaz', value: '#f8fafc' },
  { id: 'cyan', label: 'Turkuaz', value: '#06b6d4' },
  { id: 'pink', label: 'Pembe', value: '#ec4899' },
  { id: 'emerald', label: 'Yeşil', value: '#22c55e' },
  { id: 'purple', label: 'Mor', value: '#a78bfa' },
];

function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
}

export default function ScratchpadModal({
  isOpen,
  onClose,
  title = 'Karalama & İşlem Tahtası',
  questionContext,
}: ScratchpadModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('pen');
  const [color, setColor] = useState('#facc15');
  const [lineWidth, setLineWidth] = useState(3);
  const [backgroundPattern, setBackgroundPattern] = useState<BackgroundPattern>('grid');
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineStart, setLineStart] = useState<{ x: number; y: number } | null>(null);
  const [preLineState, setPreLineState] = useState<ImageData | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [showQuestionPanel, setShowQuestionPanel] = useState(Boolean(questionContext));
  const [eliminatedOptions, setEliminatedOptions] = useState<Set<number>>(new Set());

  // Background pattern painter
  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, pattern: BackgroundPattern) => {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    if (pattern === 'grid') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 1;
      const step = 28;
      ctx.beginPath();
      for (let x = step; x < width; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = step; y < height; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
    } else if (pattern === 'lined') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      const step = 32;
      ctx.beginPath();
      for (let y = step; y < height; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
    }
  }, []);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    drawBackground(ctx, rect.width, rect.height, backgroundPattern);
    const initial = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initial]);
  }, [backgroundPattern, drawBackground]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(setupCanvas, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen, setupCanvas]);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), data]);
  }, []);

  const handlePointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.setPointerCapture(e.pointerId);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'line') {
      setLineStart({ x, y });
      setPreLineState(ctx.getImageData(0, 0, canvas.width, canvas.height));
      setIsDrawing(true);
      return;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (activeTool === 'eraser') {
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = lineWidth * 5;
    } else if (activeTool === 'highlighter') {
      ctx.strokeStyle = hexToRgba(color, 0.35);
      ctx.lineWidth = lineWidth * 4;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }

    setIsDrawing(true);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'line') {
      if (!lineStart || !preLineState) return;
      ctx.putImageData(preLineState, 0, 0);
      ctx.beginPath();
      ctx.moveTo(lineStart.x, lineStart.y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
      return;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setLineStart(null);
      setPreLineState(null);
      saveState();
    }
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = history.slice(0, -1);
    const previousState = newHistory[newHistory.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setHistory(newHistory);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    drawBackground(ctx, rect.width, rect.height, backgroundPattern);
    saveState();
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imageUri = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `karalama-${Date.now()}.png`;
    link.href = imageUri;
    link.click();
  };

  const toggleEliminateOption = (idx: number) => {
    setEliminatedOptions((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/85 p-2 sm:p-4 backdrop-blur-md"
    >
      <div className="flex h-full max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-slate-900 shadow-2xl">
        {/* Header & Araç Çubuğu */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-slate-950/90 px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
              <PenTool className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <span className="font-display text-xs sm:text-sm font-bold text-white truncate">
              {title}
            </span>

            {questionContext && (
              <button
                type="button"
                onClick={() => setShowQuestionPanel((prev) => !prev)}
                className={`hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                  showQuestionPanel
                    ? 'bg-amber-500/20 border-amber-500/30 text-amber-300'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                }`}
                title="Soru panelini aç/kapat"
              >
                {showQuestionPanel ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                <span>{showQuestionPanel ? 'Soruyu Gizle' : 'Soruyu Gör'}</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            {/* Araç Seçimi: Kalem, Fosforlu, Çizgi, Silgi */}
            <div className="flex items-center rounded-xl bg-white/5 p-0.5 border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTool('pen')}
                title="Kalem"
                className={`inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold transition ${
                  activeTool === 'pen'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
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
                    ? 'bg-amber-400/90 text-slate-950 font-bold shadow-md'
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
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
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
                    ? 'bg-rose-500 text-white font-bold shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Eraser className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Silgi</span>
              </button>
            </div>

            {/* Renk Paleti */}
            {activeTool !== 'eraser' && (
              <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1 border border-white/10">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    title={c.label}
                    onClick={() => setColor(c.value)}
                    className={`h-5 w-5 sm:h-6 sm:w-6 rounded-lg transition-transform ${
                      color === c.value
                        ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-slate-900'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            )}

            {/* Çizgi Kalınlığı */}
            <div className="flex items-center gap-1 rounded-xl bg-white/5 px-2 py-1 border border-white/10 text-xs text-slate-300">
              <button
                type="button"
                onClick={() => setLineWidth((prev) => Math.max(1, prev - 1))}
                aria-label="Kalınlığı azalt"
                className="rounded p-1 hover:bg-white/10"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-3 text-center font-bold text-[11px]">{lineWidth}</span>
              <button
                type="button"
                onClick={() => setLineWidth((prev) => Math.min(12, prev + 1))}
                aria-label="Kalınlığı artır"
                className="rounded p-1 hover:bg-white/10"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {/* Arka Plan Deseni */}
            <div className="hidden sm:flex items-center rounded-xl bg-white/5 p-0.5 border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setBackgroundPattern((p) => (p === 'grid' ? 'lined' : p === 'lined' ? 'dark' : 'grid'));
                }}
                title={`Zemin Deseni: ${backgroundPattern === 'grid' ? 'Kareli' : backgroundPattern === 'lined' ? 'Çizgili' : 'Düz Tahta'}`}
                className="inline-flex h-8 items-center gap-1 px-2 text-xs font-semibold text-slate-300 hover:text-white"
              >
                <Grid className="h-3.5 w-3.5" />
                <span className="capitalize text-[11px]">{backgroundPattern === 'grid' ? 'Kareli' : backgroundPattern === 'lined' ? 'Çizgili' : 'Düz'}</span>
              </button>
            </div>

            {/* Geri Al */}
            <button
              type="button"
              onClick={handleUndo}
              disabled={history.length <= 1}
              title="Geri al"
              aria-label="Geri al"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-40"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            {/* İndir PNG */}
            <button
              type="button"
              onClick={handleDownload}
              title="Çizimi PNG Olarak İndir"
              aria-label="Çizimi PNG Olarak İndir"
              className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            >
              <Download className="h-3.5 w-3.5" />
            </button>

            {/* Temizle */}
            <button
              type="button"
              onClick={handleClear}
              title="Tümünü temizle"
              aria-label="Tümünü temizle"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 hover:text-rose-200"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>

            {/* Kapat */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Karalama tahtasını kapat"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Gövde: Soru Bölmesi + Çizim Alanı */}
        <div className="relative flex flex-1 overflow-hidden">
          {/* Sol Soru Paneli (Varsa ve açıksa) */}
          {questionContext && showQuestionPanel && (
            <div className="w-full md:w-80 lg:w-96 shrink-0 border-r border-white/10 bg-slate-950/70 p-4 overflow-y-auto hidden md:flex flex-col gap-4 text-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Aktif Soru Metni
                </span>
                <span className="text-[11px] text-slate-400">Şıklara tıklayarak eleyebilirsin</span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm font-medium leading-relaxed">
                <MathText>{questionContext.questionText}</MathText>
              </div>

              {questionContext.imageUrl && (
                <div className="relative h-36 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900">
                  <Image
                    src={questionContext.imageUrl}
                    alt="Soru Görseli"
                    fill
                    sizes="20rem"
                    className="object-contain p-2"
                  />
                </div>
              )}

              {/* Şıklar ve Eleme */}
              {questionContext.options && questionContext.options.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400">Şıklar & Eleme:</span>
                  <div className="space-y-1.5">
                    {questionContext.options.map((opt, idx) => {
                      const optLabel = String.fromCharCode(65 + idx);
                      const isEliminated = eliminatedOptions.has(idx);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleEliminateOption(idx)}
                          className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs transition border ${
                            isEliminated
                              ? 'bg-rose-950/25 border-rose-500/30 text-rose-300/60 line-through'
                              : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
                              isEliminated
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-white/10 text-slate-300'
                            }`}
                          >
                            {optLabel}
                          </span>
                          <span className="flex-1 truncate">
                            <MathText>{opt}</MathText>
                          </span>
                          {isEliminated && <X className="h-3.5 w-3.5 text-rose-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Canvas Çizim Alanı */}
          <div className="relative flex-1 cursor-crosshair bg-[#090d16] touch-none">
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="h-full w-full block"
            />
          </div>
        </div>

        {/* Alt Bilgi */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1 border-t border-white/10 bg-slate-950/80 px-3 sm:px-4 py-2 text-[11px] text-slate-400 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span>Kalem, fosforlu kalem ve düz cetvel ile işlemlerini yapabilirsin.</span>
            {questionContext && (
              <span className="text-amber-400/90 font-medium">Sol panelde şıkları eleyebilirsin.</span>
            )}
          </div>
          <span className="font-semibold text-slate-300 hidden sm:inline">Soruyu çözerken tahtayı kapatıp açabilirsin.</span>
        </div>
      </div>
    </div>
  );
}
