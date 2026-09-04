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
} from 'lucide-react';

type ScratchpadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
};

const COLOR_PALETTE = [
  { id: 'white', label: 'Beyaz/Açık', value: '#f8fafc' },
  { id: 'yellow', label: 'Sarı', value: '#facc15' },
  { id: 'cyan', label: 'Turkuaz', value: '#06b6d4' },
  { id: 'pink', label: 'Pembe', value: '#ec4899' },
  { id: 'emerald', label: 'Yeşil', value: '#22c55e' },
  { id: 'indigo', label: 'Mor', value: '#a78bfa' },
];

export default function ScratchpadModal({
  isOpen,
  onClose,
  title = 'Karalama & İşlem Tahtası',
}: ScratchpadModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState('#facc15');
  const [lineWidth, setLineWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Arka plan rengi (koyu tahta görünümü)
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // İlk durum geçmişe kaydet
    const initial = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initial]);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(setupCanvas, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, setupCanvas]);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), data]);
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.setPointerCapture(e.pointerId);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = isEraser ? '#090d16' : color;
    ctx.lineWidth = isEraser ? lineWidth * 4 : lineWidth;
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

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
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
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, rect.width, rect.height);
    saveState();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/80 p-2 sm:p-4 backdrop-blur-md"
    >
      <div className="flex h-full max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-slate-900 shadow-2xl">
        {/* Header & Araç Çubuğu */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-slate-950/80 px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-brand-primary/20 text-brand-primary-soft">
              <PenTool className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <span className="font-display text-xs sm:text-base font-bold text-white truncate">
              {title}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            {/* Kalem / Silgi Modu */}
            <button
              type="button"
              onClick={() => setIsEraser(false)}
              className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition ${
                !isEraser
                  ? 'bg-brand-primary text-white shadow-md'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <PenTool className="h-3.5 w-3.5" />
              Kalem
            </button>

            <button
              type="button"
              onClick={() => setIsEraser(true)}
              className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition ${
                isEraser
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Eraser className="h-3.5 w-3.5" />
              Silgi
            </button>

            {/* Renk Paleti (Kalem Modunda) */}
            {!isEraser && (
              <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1 border border-white/10">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    title={c.label}
                    onClick={() => setColor(c.value)}
                    className={`h-6 w-6 rounded-lg transition-transform ${
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
              <span className="w-4 text-center font-bold">{lineWidth}</span>
              <button
                type="button"
                onClick={() => setLineWidth((prev) => Math.min(10, prev + 1))}
                aria-label="Kalınlığı artır"
                className="rounded p-1 hover:bg-white/10"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {/* Geri Al */}
            <button
              type="button"
              onClick={handleUndo}
              disabled={history.length <= 1}
              title="Geri al"
              aria-label="Geri al"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-40"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Temizle */}
            <button
              type="button"
              onClick={handleClear}
              title="Tümünü temizle"
              aria-label="Tümünü temizle"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 hover:text-rose-200"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            {/* Kapat */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Karalama tahtasını kapat"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

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

        {/* Alt Bilgi */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1 border-t border-white/10 bg-slate-950/60 px-3 sm:px-4 py-2 text-[11px] text-slate-400 text-center sm:text-left">
          <span>İşlemlerini burada serbestçe karalayabilirsin.</span>
          <span className="font-semibold text-slate-300 hidden sm:inline">Soruyu çözerken tahtayı kapatıp açabilirsin.</span>
        </div>
      </div>
    </div>
  );
}
