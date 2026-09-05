'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import {
  X,
  PenTool,
  RotateCcw,
  Download,
  Check,
  Palette,
  Eraser,
} from 'lucide-react';

type SubmissionDrawingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  studentName?: string;
  onSaveFeedback?: (notes: string) => void;
};

const COLORS = [
  { name: 'Kırmızı', value: '#ef4444' },
  { name: 'Sarı', value: '#f59e0b' },
  { name: 'Yeşil', value: '#10b981' },
  { name: 'Mavi', value: '#3b82f6' },
];

export function SubmissionDrawingModal({
  isOpen,
  onClose,
  imageUrl,
  studentName = 'Öğrenci',
  onSaveFeedback,
}: SubmissionDrawingModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#ef4444');
  const [lineWidth, setLineWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Initialize canvas with student image
  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      canvas.width = img.width || 800;
      canvas.height = img.height || 600;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    };
  }, [isOpen, imageUrl]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = isEraser ? '#ffffff' : currentColor;
    ctx.lineWidth = isEraser ? lineWidth * 3 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    };
  }, [imageUrl]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${studentName}_odev_kontrol.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCompleteAnnotation = () => {
    if (onSaveFeedback) {
      onSaveFeedback('Ödev üzerinde işaretlemeler ve çizim notları yapıldı.');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ödev Çizim ve İnceleme Paneli"
      className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/85 p-2 sm:p-4 backdrop-blur-md"
    >
      <div className="relative flex flex-col w-full max-w-5xl max-h-[94vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-700/80 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                Ödev İnceleme & Çizim Notu
              </h3>
              <p className="text-xs text-slate-400">
                {studentName} adlı öğrencinin ödev görseli üzerine kırmızı kalemle işaretleme yapın
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
              title="İşaretli görseli indir"
            >
              <Download className="w-3.5 h-3.5" />
              <span>İndir</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="p-1.5 rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-800/60 border-b border-slate-700/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5" />
              Renk:
            </span>
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => {
                  setCurrentColor(c.value);
                  setIsEraser(false);
                }}
                className={`w-6 h-6 rounded-full transition-transform ${
                  currentColor === c.value && !isEraser
                    ? 'ring-2 ring-white scale-110'
                    : 'opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}

            <button
              type="button"
              onClick={() => setIsEraser(!isEraser)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition ${
                isEraser
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : 'bg-slate-700/60 text-slate-300 border-slate-600'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Silgi</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Kalınlık:</span>
              <input
                type="range"
                min="1"
                max="8"
                value={lineWidth}
                onChange={(e) => setLineWidth(Number(e.target.value))}
                className="w-20 accent-rose-500"
              />
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 text-slate-400 hover:text-rose-400 font-medium transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Temizle</span>
            </button>
          </div>
        </div>

        {/* CANVAS WORKSPACE */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/80 min-h-[400px]">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="border border-slate-700/60 rounded-xl shadow-lg cursor-crosshair max-w-full max-h-[65vh] object-contain bg-slate-900"
          />
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between p-4 border-t border-slate-700/80 bg-slate-950/70 text-xs">
          <span className="text-slate-400">
            {hasDrawn ? '✏️ Görsel üzerine notlar çizildi' : 'Çizim yapmak için tıklayıp sürükleyin'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition font-medium"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleCompleteAnnotation}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-lg shadow-emerald-600/20"
            >
              <Check className="w-4 h-4" />
              <span>Değerlendirmeyi Tamamla</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
