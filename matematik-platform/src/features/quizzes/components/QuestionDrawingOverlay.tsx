'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  PenTool,
  Highlighter,
  Eraser,
  RotateCcw,
  Trash2,
  X,
  MousePointer,
  Sparkles,
} from 'lucide-react';

export type QuestionDrawingOverlayProps = {
  isActive: boolean;
  onClose: () => void;
  questionIndex: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
};

type ToolMode = 'pen' | 'highlighter' | 'eraser';

const PEN_COLORS = [
  { id: 'red', label: 'Kırmızı', color: '#ef4444' },
  { id: 'blue', label: 'Mavi', color: '#3b82f6' },
  { id: 'amber', label: 'Turuncu', color: '#f59e0b' },
  { id: 'emerald', label: 'Yeşil', color: '#10b981' },
  { id: 'purple', label: 'Mor', color: '#8b5cf6' },
];

const HIGHLIGHTER_COLOR = 'rgba(250, 204, 21, 0.45)';

// In-memory cache for drawings across question navigations
const questionDrawingCache = new Map<number, string>();

export function QuestionDrawingOverlay({
  isActive,
  onClose,
  questionIndex,
  containerRef,
}: QuestionDrawingOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<ToolMode>('pen');
  const [penColor, setPenColor] = useState<string>('#ef4444');
  const [isPassthrough, setIsPassthrough] = useState<boolean>(false);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const historyRef = useRef<ImageData[]>([]);
  const isInteractingRef = useRef<boolean>(false);

  // Resize canvas to match container exactly
  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

    let existingDataUrl = '';
    if (canvas.width > 0 && canvas.height > 0) {
      try {
        existingDataUrl = canvas.toDataURL();
      } catch {
        existingDataUrl = '';
      }
    } else {
      existingDataUrl = questionDrawingCache.get(questionIndex) || '';
    }

    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      if (existingDataUrl) {
        const img = new Image();
        img.src = existingDataUrl;
        img.onload = () => {
          ctx.drawImage(img, 0, 0, rect.width, rect.height);
          setHasDrawn(true);
        };
      }
    }
  }, [containerRef, questionIndex]);

  // Load drawing for the current question
  useEffect(() => {
    if (!isActive) return;

    syncCanvasSize();

    const handleResize = () => {
      syncCanvasSize();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isActive, questionIndex, syncCanvasSize]);

  // Save current question drawing to cache before changing question or closing
  const saveToCache = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      questionDrawingCache.set(questionIndex, dataUrl);
    } catch {
      // Ignore if canvas tainted or unavailable
    }
  }, [questionIndex]);

  useEffect(() => {
    return () => {
      saveToCache();
    };
  }, [saveToCache]);

  const saveHistoryStep = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      historyRef.current.push(imgData);
      if (historyRef.current.length > 20) {
        historyRef.current.shift();
      }
      setCanUndo(true);
    } catch {
      // Context might be tainted
    }
  };

  const getCanvasCoords = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (isPassthrough) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.setPointerCapture) {
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // Ignore in test envs
      }
    }
    isInteractingRef.current = true;

    saveHistoryStep();

    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 26;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else if (tool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = HIGHLIGHTER_COLOR;
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = penColor;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isInteractingRef.current || isPassthrough) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isInteractingRef.current) return;
    const canvas = canvasRef.current;
    if (canvas && canvas.releasePointerCapture) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
    }
    isInteractingRef.current = false;
    saveToCache();
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || historyRef.current.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previousState = historyRef.current.pop();
    setCanUndo(historyRef.current.length > 0);
    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
      saveToCache();
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveHistoryStep();
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    questionDrawingCache.delete(questionIndex);
    setHasDrawn(false);
  };

  if (!isActive) return null;

  return (
    <div
      className="absolute inset-0 z-30 pointer-events-none rounded-3xl overflow-hidden"
      aria-label="Soru üzerine çizim katmanı"
      data-testid="question-drawing-overlay"
    >
      {/* Çizim Canvas'ı */}
      <canvas
        ref={canvasRef}
        data-testid="drawing-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`absolute inset-0 w-full h-full touch-none ${
          isPassthrough ? 'pointer-events-none' : 'pointer-events-auto cursor-crosshair'
        }`}
        style={{ touchAction: 'none' }}
      />

      {/* Yüzen Kontrol Çubuğu (Floating Toolbar) */}
      <div className="absolute top-3 right-3 z-40 pointer-events-auto flex flex-wrap items-center gap-1.5 rounded-2xl border border-white/20 bg-slate-900/90 p-1.5 shadow-2xl backdrop-blur-xl transition-all">
        {/* Kalem Modu */}
        <button
          type="button"
          onClick={() => {
            setTool('pen');
            setIsPassthrough(false);
          }}
          title="Tükenmez Kalem"
          aria-label="Tükenmez Kalem"
          className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
            tool === 'pen' && !isPassthrough
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md scale-105'
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <PenTool className="h-4 w-4" />
        </button>

        {/* Vurgulayıcı / Fosforlu Kalem */}
        <button
          type="button"
          onClick={() => {
            setTool('highlighter');
            setIsPassthrough(false);
          }}
          title="Fosforlu Kalem"
          aria-label="Fosforlu Kalem"
          className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
            tool === 'highlighter' && !isPassthrough
              ? 'bg-yellow-400 text-slate-950 font-bold shadow-md scale-105'
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Highlighter className="h-4 w-4" />
        </button>

        {/* Silgi */}
        <button
          type="button"
          onClick={() => {
            setTool('eraser');
            setIsPassthrough(false);
          }}
          title="Silgi"
          aria-label="Silgi"
          className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
            tool === 'eraser' && !isPassthrough
              ? 'bg-rose-500 text-white font-bold shadow-md scale-105'
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Eraser className="h-4 w-4" />
        </button>

        <div className="h-5 w-[1px] bg-white/15 mx-0.5" />

        {/* Renk Seçiciler (Yalnızca Kalem modundayken) */}
        {tool === 'pen' && !isPassthrough && (
          <div className="flex items-center gap-1">
            {PEN_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setPenColor(c.color)}
                title={c.label}
                aria-label={`Renk: ${c.label}`}
                className={`h-5 w-5 rounded-full transition transform ${
                  penColor === c.color
                    ? 'ring-2 ring-white scale-110 shadow-sm'
                    : 'opacity-70 hover:opacity-100 hover:scale-105'
                }`}
                style={{ backgroundColor: c.color }}
              />
            ))}
            <div className="h-5 w-[1px] bg-white/15 mx-0.5" />
          </div>
        )}

        {/* Passthrough Modu (Tıklamaları Alttaki Şıklara Geçir) */}
        <button
          type="button"
          onClick={() => setIsPassthrough((prev) => !prev)}
          title={
            isPassthrough
              ? 'Çizim moduna geri dön'
              : 'Cevap seçme modu (Çizimleri koruyarak alttaki şıkları tıkla)'
          }
          aria-label={isPassthrough ? 'Çizime Dön' : 'Şık İşaretle'}
          className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold transition ${
            isPassthrough
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <MousePointer className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">
            {isPassthrough ? 'Çizime Dön' : 'Şık İşaretle'}
          </span>
        </button>

        {/* Geri Al */}
        <button
          type="button"
          onClick={handleUndo}
          title="Geri Al"
          aria-label="Geri Al"
          disabled={!canUndo}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>

        {/* Temizle */}
        <button
          type="button"
          onClick={handleClear}
          title="Tüm Çizimi Temizle"
          aria-label="Tüm Çizimi Temizle"
          disabled={!hasDrawn}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-300 hover:bg-rose-500/20 hover:text-rose-300 disabled:opacity-30 disabled:pointer-events-none transition"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>

        <div className="h-5 w-[1px] bg-white/15 mx-0.5" />

        {/* Çizim Katmanını Kapat */}
        <button
          type="button"
          onClick={() => {
            saveToCache();
            onClose();
          }}
          title="Çizim Modundan Çık"
          aria-label="Çizim Modundan Çık"
          className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-500 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Passthrough Modu Bilgi Rozeti */}
      {isPassthrough && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/80 px-4 py-1 text-xs font-semibold text-emerald-300 shadow-xl backdrop-blur-md animate-fade-in pointer-events-auto">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Şık seçebilirsiniz; çizimleriniz korunuyor.</span>
          <button
            type="button"
            onClick={() => setIsPassthrough(false)}
            className="ml-1 text-xs font-bold underline hover:text-white"
          >
            Çizime Dön
          </button>
        </div>
      )}
    </div>
  );
}
export default QuestionDrawingOverlay;
