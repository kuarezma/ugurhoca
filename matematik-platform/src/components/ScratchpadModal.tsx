'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import {
  Eraser,
  PenTool,
  RotateCcw,
  RotateCw,
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
  Compass,
  Shapes,
} from 'lucide-react';
import MathText from '@/components/MathText';
import Image from 'next/image';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export type ScratchpadQuestionContext = {
  questionText: string;
  options?: string[];
  imageUrl?: string | null;
  questionId?: string;
};

export type ScratchpadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  questionContext?: ScratchpadQuestionContext;
};

type ToolType = 'pen' | 'highlighter' | 'line' | 'eraser';
export type BackgroundPattern = 'dark' | 'grid' | 'lined' | 'isometric' | 'coordinate';

const PATTERN_NAMES: Record<BackgroundPattern, string> = {
  grid: 'Kareli',
  lined: 'Çizgili',
  isometric: 'İzometrik 3D',
  coordinate: 'Koordinat',
  dark: 'Düz Tahta',
};

const DARK_PALETTE = [
  { id: 'yellow', label: 'Sarı', value: '#facc15' },
  { id: 'white', label: 'Beyaz', value: '#f8fafc' },
  { id: 'cyan', label: 'Turkuaz', value: '#06b6d4' },
  { id: 'pink', label: 'Pembe', value: '#ec4899' },
  { id: 'emerald', label: 'Yeşil', value: '#22c55e' },
  { id: 'purple', label: 'Mor', value: '#a78bfa' },
];

const LIGHT_PALETTE = [
  { id: 'ink', label: 'Lacivert', value: '#1e3a8a' },
  { id: 'black', label: 'Mürekkep Siyah', value: '#0f172a' },
  { id: 'blue', label: 'Mavi Kalem', value: '#2563eb' },
  { id: 'red', label: 'Kırmızı Kalem', value: '#dc2626' },
  { id: 'emerald', label: 'Zümrüt Yeşili', value: '#16a34a' },
  { id: 'purple', label: 'Mor Kalem', value: '#7c3aed' },
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

const scratchpadCache = new Map<string, ImageData>();

export default function ScratchpadModal({
  isOpen,
  onClose,
  title = 'Karalama & İşlem Tahtası',
  questionContext,
}: ScratchpadModalProps) {
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLight, setIsLight] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolType>('pen');
  const [color, setColor] = useState('#facc15');
  const [lineWidth, setLineWidth] = useState(3);
  const [backgroundPattern, setBackgroundPattern] = useState<BackgroundPattern>('grid');
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineStart, setLineStart] = useState<{ x: number; y: number } | null>(null);
  const [preLineState, setPreLineState] = useState<ImageData | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [redoHistory, setRedoHistory] = useState<ImageData[]>([]);
  const [showQuestionPanel, setShowQuestionPanel] = useState(Boolean(questionContext));
  const [eliminatedOptions, setEliminatedOptions] = useState<Set<number>>(new Set());

  const cacheKey = questionContext?.questionId || (questionContext?.questionText ? questionContext.questionText.trim().slice(0, 100) : null);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const light = document.documentElement.getAttribute('data-theme') === 'light';
      setIsLight(light);
      if (light && color === '#facc15') {
        setColor('#1e3a8a');
      } else if (!light && color === '#1e3a8a') {
        setColor('#facc15');
      }
    }
  }, [isOpen, color]);

  // Background pattern painter
  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, pattern: BackgroundPattern, lightMode = false) => {
    ctx.fillStyle = lightMode ? '#ffffff' : '#090d16';
    ctx.fillRect(0, 0, width, height);

    const strokeColor = lightMode ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.07)';

    if (pattern === 'grid') {
      ctx.strokeStyle = strokeColor;
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
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      const step = 32;
      ctx.beginPath();
      for (let y = step; y < height; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
    } else if (pattern === 'isometric') {
      ctx.strokeStyle = lightMode ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      const step = 32;
      const slope = Math.tan(Math.PI / 6); // 30 derece izometrik açı (~0.577)

      ctx.beginPath();
      // 1. Dikey çizgiler (90°)
      for (let x = 0; x <= width; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      // 2. +30° eğimli çizgiler
      for (let y0 = -width * slope; y0 <= height; y0 += step * 0.866) {
        ctx.moveTo(0, y0);
        ctx.lineTo(width, y0 + width * slope);
      }
      // 3. -30° eğimli çizgiler
      for (let y0 = 0; y0 <= height + width * slope; y0 += step * 0.866) {
        ctx.moveTo(0, y0);
        ctx.lineTo(width, y0 - width * slope);
      }
      ctx.stroke();
    } else if (pattern === 'coordinate') {
      // 1. İnce arka plan ızgarası
      ctx.strokeStyle = lightMode ? 'rgba(15, 23, 42, 0.05)' : 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      const step = 35;
      const cx = Math.round(width / 2);
      const cy = Math.round(height / 2);

      ctx.beginPath();
      for (let x = cx % step; x < width; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = cy % step; y < height; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // 2. Belirgin Kartezyen X-Y Eksenleri
      ctx.save();
      const axisColor = lightMode ? '#2563eb' : '#38bdf8';
      ctx.strokeStyle = axisColor;
      ctx.fillStyle = axisColor;
      ctx.lineWidth = 1.5;
      ctx.font = '11px ui-monospace, SFMono-Regular, monospace';

      // X Ekseni ve Ok
      ctx.beginPath();
      ctx.moveTo(25, cy);
      ctx.lineTo(width - 25, cy);
      ctx.lineTo(width - 33, cy - 5);
      ctx.moveTo(width - 25, cy);
      ctx.lineTo(width - 33, cy + 5);
      ctx.stroke();
      ctx.fillText('x', width - 20, cy - 8);

      // Y Ekseni ve Ok
      ctx.beginPath();
      ctx.moveTo(cx, height - 25);
      ctx.lineTo(cx, 25);
      ctx.lineTo(cx - 5, 33);
      ctx.moveTo(cx, 25);
      ctx.lineTo(cx + 5, 33);
      ctx.stroke();
      ctx.fillText('y', cx + 10, 25);

      // Eksen Çentikleri ve Sayı Değerleri
      for (let x = cx + step, val = 1; x < width - 40; x += step, val++) {
        ctx.beginPath();
        ctx.moveTo(x, cy - 3);
        ctx.lineTo(x, cy + 3);
        ctx.stroke();
        ctx.fillText(String(val), x - 4, cy + 15);
      }
      for (let x = cx - step, val = -1; x > 40; x -= step, val--) {
        ctx.beginPath();
        ctx.moveTo(x, cy - 3);
        ctx.lineTo(x, cy + 3);
        ctx.stroke();
        ctx.fillText(String(val), x - 7, cy + 15);
      }
      for (let y = cy - step, val = 1; y > 40; y -= step, val++) {
        ctx.beginPath();
        ctx.moveTo(cx - 3, y);
        ctx.lineTo(cx + 3, y);
        ctx.stroke();
        ctx.fillText(String(val), cx + 7, y + 4);
      }
      for (let y = cy + step, val = -1; y < height - 40; y += step, val--) {
        ctx.beginPath();
        ctx.moveTo(cx - 3, y);
        ctx.lineTo(cx + 3, y);
        ctx.stroke();
        ctx.fillText(String(val), cx + 7, y + 4);
      }
      ctx.fillText('0', cx - 10, cy + 14);
      ctx.restore();
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

    if (cacheKey && scratchpadCache.has(cacheKey)) {
      const cached = scratchpadCache.get(cacheKey)!;
      try {
        ctx.putImageData(cached, 0, 0);
        setHistory([cached]);
        setRedoHistory([]);
        return;
      } catch {
        // Fallback to fresh background if dimension mismatch
      }
    }

    drawBackground(ctx, rect.width, rect.height, backgroundPattern, isLight);
    const initial = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initial]);
    setRedoHistory([]);
  }, [backgroundPattern, cacheKey, drawBackground, isLight]);

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
    setRedoHistory([]);
    if (cacheKey) {
      scratchpadCache.set(cacheKey, data);
    }
  }, [cacheKey]);

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
      ctx.strokeStyle = isLight ? '#ffffff' : '#090d16';
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

    const currentState = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    const previousState = newHistory[newHistory.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setHistory(newHistory);
    setRedoHistory((prev) => [...prev, currentState]);
    if (cacheKey) {
      scratchpadCache.set(cacheKey, previousState);
    }
  };

  const handleRedo = () => {
    if (redoHistory.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nextState = redoHistory[redoHistory.length - 1];
    const newRedo = redoHistory.slice(0, -1);
    ctx.putImageData(nextState, 0, 0);
    setHistory((prev) => [...prev, nextState]);
    setRedoHistory(newRedo);
    if (cacheKey) {
      scratchpadCache.set(cacheKey, nextState);
    }
  };

  const handlePatternToggle = () => {
    const patternOrder: BackgroundPattern[] = ['grid', 'lined', 'isometric', 'coordinate', 'dark'];
    const currentIndex = patternOrder.indexOf(backgroundPattern);
    const nextPattern = patternOrder[(currentIndex + 1) % patternOrder.length];
    setBackgroundPattern(nextPattern);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();

    if (history.length > 1) {
      const temp = document.createElement('canvas');
      temp.width = canvas.width;
      temp.height = canvas.height;
      const tempCtx = temp.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(canvas, 0, 0);
        drawBackground(ctx, rect.width, rect.height, nextPattern, isLight);
        ctx.drawImage(temp, 0, 0, rect.width, rect.height);
        saveState();
      }
    } else {
      drawBackground(ctx, rect.width, rect.height, nextPattern, isLight);
      saveState();
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    drawBackground(ctx, rect.width, rect.height, backgroundPattern, isLight);
    setRedoHistory([]);
    saveState();
    if (cacheKey) {
      scratchpadCache.delete(cacheKey);
    }
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

  const drawCoordinatePlane = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const cx = Math.round(width / 2);
    const cy = Math.round(height / 2);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Math.max(1.5, lineWidth);
    ctx.font = '12px ui-monospace, SFMono-Regular, monospace';

    // X Ekseni
    ctx.beginPath();
    ctx.moveTo(25, cy);
    ctx.lineTo(width - 25, cy);
    // X oku
    ctx.lineTo(width - 33, cy - 5);
    ctx.moveTo(width - 25, cy);
    ctx.lineTo(width - 33, cy + 5);
    ctx.stroke();
    ctx.fillText('x', width - 20, cy - 8);

    // Y Ekseni
    ctx.beginPath();
    ctx.moveTo(cx, height - 25);
    ctx.lineTo(cx, 25);
    // Y oku
    ctx.lineTo(cx - 5, 33);
    ctx.moveTo(cx, 25);
    ctx.lineTo(cx + 5, 33);
    ctx.stroke();
    ctx.fillText('y', cx + 10, 25);

    // Çentikler
    const step = 35;
    for (let x = cx + step, val = 1; x < width - 40; x += step, val++) {
      ctx.beginPath();
      ctx.moveTo(x, cy - 4);
      ctx.lineTo(x, cy + 4);
      ctx.stroke();
      ctx.fillText(String(val), x - 4, cy + 16);
    }
    for (let x = cx - step, val = -1; x > 40; x -= step, val--) {
      ctx.beginPath();
      ctx.moveTo(x, cy - 4);
      ctx.lineTo(x, cy + 4);
      ctx.stroke();
      ctx.fillText(String(val), x - 8, cy + 16);
    }
    for (let y = cy - step, val = 1; y > 40; y -= step, val++) {
      ctx.beginPath();
      ctx.moveTo(cx - 4, y);
      ctx.lineTo(cx + 4, y);
      ctx.stroke();
      ctx.fillText(String(val), cx + 8, y + 4);
    }
    for (let y = cy + step, val = -1; y < height - 40; y += step, val--) {
      ctx.beginPath();
      ctx.moveTo(cx - 4, y);
      ctx.lineTo(cx + 4, y);
      ctx.stroke();
      ctx.fillText(String(val), cx + 8, y + 4);
    }
    // Orijin
    ctx.fillText('0', cx - 12, cy + 14);
    ctx.restore();
    saveState();
  };

  const drawNumberLine = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const cx = Math.round(width / 2);
    const cy = Math.round(height / 2);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Math.max(2, lineWidth);
    ctx.font = '12px ui-monospace, SFMono-Regular, monospace';

    // Sayı Doğrusu Ana Çizgi
    ctx.beginPath();
    ctx.moveTo(35, cy);
    ctx.lineTo(width - 35, cy);
    // Sol ok
    ctx.moveTo(35, cy);
    ctx.lineTo(45, cy - 6);
    ctx.moveTo(35, cy);
    ctx.lineTo(45, cy + 6);
    // Sağ ok
    ctx.moveTo(width - 35, cy);
    ctx.lineTo(width - 45, cy - 6);
    ctx.moveTo(width - 35, cy);
    ctx.lineTo(width - 45, cy + 6);
    ctx.stroke();

    const step = 45;
    const count = Math.min(5, Math.floor((width - 120) / (2 * step)));
    for (let i = -count; i <= count; i++) {
      const x = cx + i * step;
      ctx.beginPath();
      ctx.moveTo(x, cy - 6);
      ctx.lineTo(x, cy + 6);
      ctx.stroke();
      ctx.fillText(String(i), x - (i < 0 ? 8 : 4), cy + 22);
    }
    ctx.restore();
    saveState();
  };

  const drawGeometricShape = (shape: 'triangle' | 'circle' | 'rectangle') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const cx = Math.round(width / 2);
    const cy = Math.round(height / 2);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Math.max(2, lineWidth);
    ctx.font = '12px ui-monospace, SFMono-Regular, monospace';

    if (shape === 'triangle') {
      // Dik Üçgen
      const x1 = cx - 90;
      const y1 = cy + 70;
      const x2 = cx + 90;
      const y2 = cy + 70;
      const x3 = cx - 90;
      const y3 = cy - 70;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.closePath();
      ctx.stroke();

      // Dik açı simgesi (90°)
      const s = 14;
      ctx.beginPath();
      ctx.moveTo(x1 + s, y1);
      ctx.lineTo(x1 + s, y1 - s);
      ctx.lineTo(x1, y1 - s);
      ctx.stroke();
      // Nokta
      ctx.beginPath();
      ctx.arc(x1 + s / 2, y1 - s / 2, 2, 0, Math.PI * 2);
      ctx.fill();

      // Köşe Harfleri
      ctx.fillText('A', x3 - 15, y3);
      ctx.fillText('B', x1 - 15, y1 + 5);
      ctx.fillText('C', x2 + 8, y2 + 5);
    } else if (shape === 'circle') {
      // Çember & Yarıçap
      const radius = Math.min(width, height) * 0.22;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Merkez Noktası
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText('M', cx - 14, cy - 8);

      // Yarıçap çizgisi
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillText('r', cx + radius / 2 - 4, cy - 6);
    } else if (shape === 'rectangle') {
      // Dikdörtgen
      const rw = 200;
      const rh = 120;
      const rx = cx - rw / 2;
      const ry = cy - rh / 2;
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.stroke();

      // Köşe Harfleri
      ctx.fillText('A', rx - 14, ry);
      ctx.fillText('B', rx + rw + 6, ry);
      ctx.fillText('C', rx + rw + 6, ry + rh + 12);
      ctx.fillText('D', rx - 14, ry + rh + 12);
    }

    ctx.restore();
    saveState();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4">
      <button
        type="button"
        aria-label="Pencereyi kapat"
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
      />
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 flex h-full max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border shadow-2xl ${
          isLight ? 'border-slate-200 bg-white text-slate-900 shadow-xl' : 'border-white/15 bg-slate-900 text-white shadow-2xl'
        }`}
      >
        <ErrorBoundary
          fallback={({ reset }) => (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-slate-300 gap-4">
              <p className="text-sm">Karalama tahtası yüklenirken beklenmedik bir durum oluştu.</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={reset}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-semibold text-xs transition"
                >
                  Tuvali Yeniden Başlat
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white font-semibold text-xs transition"
                >
                  Kapat
                </button>
              </div>
            </div>
          )}
        >
        {/* Header & Araç Çubuğu */}
        <div className={`flex flex-wrap items-center justify-between gap-2 border-b px-3 sm:px-4 py-2 sm:py-3 ${
          isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-slate-950/90'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-300">
              <PenTool className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <span className={`font-display text-xs sm:text-sm font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
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

            {/* Matematik Şablon & Araç Seti */}
            <div className="flex items-center gap-1 rounded-xl bg-indigo-500/10 p-0.5 border border-indigo-500/30">
              <button
                type="button"
                onClick={drawCoordinatePlane}
                title="Kartezyen Koordinat Düzlemi Ekle (x, y eksenleri)"
                className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 hover:text-white transition"
              >
                <Compass className="h-3.5 w-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Koordinat</span>
              </button>

              <button
                type="button"
                onClick={drawNumberLine}
                title="Sayı Doğrusu Ekle"
                className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 hover:text-white transition"
              >
                <Minus className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">Sayı Doğrusu</span>
              </button>

              <div className="relative group">
                <button
                  type="button"
                  title="Geometrik Şekil Ekle"
                  className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 hover:text-white transition"
                >
                  <Shapes className="h-3.5 w-3.5 text-pink-400" />
                  <span className="hidden sm:inline">Şekil</span>
                </button>
                <div className="absolute left-0 top-full mt-1 hidden group-hover:flex flex-col gap-1 rounded-xl border border-white/10 bg-slate-900 p-1.5 shadow-xl z-50 min-w-[130px]">
                  <button
                    type="button"
                    onClick={() => drawGeometricShape('triangle')}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 hover:bg-white/10 hover:text-white text-left font-medium"
                  >
                    <span>📐 Dik Üçgen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => drawGeometricShape('circle')}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 hover:bg-white/10 hover:text-white text-left font-medium"
                  >
                    <span>⭕ Çember (r)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => drawGeometricShape('rectangle')}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 hover:bg-white/10 hover:text-white text-left font-medium"
                  >
                    <span>▭ Dikdörtgen</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Renk Paleti */}
            {activeTool !== 'eraser' && (
              <div className={`flex items-center gap-1 rounded-xl p-1 border ${
                isLight ? 'bg-slate-100 border-slate-300' : 'bg-white/5 border-white/10'
              }`}>
                {(isLight ? LIGHT_PALETTE : DARK_PALETTE).map((c) => (
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
                onClick={handlePatternToggle}
                title={`Zemin Deseni: ${PATTERN_NAMES[backgroundPattern]}`}
                className="inline-flex h-8 items-center gap-1 px-2 text-xs font-semibold text-slate-300 hover:text-white"
              >
                <Grid className="h-3.5 w-3.5" />
                <span className="capitalize text-[11px]">{PATTERN_NAMES[backgroundPattern]}</span>
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

            {/* İleri Al */}
            <button
              type="button"
              onClick={handleRedo}
              disabled={redoHistory.length === 0}
              title="İleri al"
              aria-label="İleri al"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-40"
            >
              <RotateCw className="h-3.5 w-3.5" />
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
            <div className={`w-full md:w-80 lg:w-96 shrink-0 border-r p-4 overflow-y-auto hidden md:flex flex-col gap-4 ${
              isLight ? 'border-slate-200 bg-slate-50 text-slate-800' : 'border-white/10 bg-slate-950/70 text-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400">
                  Aktif Soru Metni
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Şıklara tıklayarak eleyebilirsin</span>
              </div>

              <div className={`rounded-2xl border p-4 text-sm font-medium leading-relaxed ${
                isLight ? 'border-slate-200 bg-white text-slate-900 shadow-sm' : 'border-white/10 bg-slate-900/80 text-white'
              }`}>
                <MathText>{questionContext.questionText}</MathText>
              </div>

              {questionContext.imageUrl && (
                <div className={`relative h-36 w-full overflow-hidden rounded-xl border ${
                  isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-slate-900'
                }`}>
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
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Şıklar & Eleme:</span>
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
                              ? 'bg-rose-50 dark:bg-rose-950/25 border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-300/60 line-through'
                              : isLight
                              ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100 shadow-sm'
                              : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
                              isEliminated
                                ? 'bg-rose-500/20 text-rose-500'
                                : isLight
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-white/10 text-slate-300'
                            }`}
                          >
                            {optLabel}
                          </span>
                          <span className="flex-1 truncate">
                            <MathText>{opt}</MathText>
                          </span>
                          {isEliminated && <X className="h-3.5 w-3.5 text-rose-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Canvas Çizim Alanı */}
          <div className={`relative flex-1 cursor-crosshair touch-none transition-colors ${
            isLight ? 'bg-white' : 'bg-[#090d16]'
          }`}>
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
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-1 border-t px-3 sm:px-4 py-2 text-[11px] text-center sm:text-left ${
          isLight ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-white/10 bg-slate-950/80 text-slate-400'
        }`}>
          <div className="flex items-center gap-2">
            <span>Kalem, fosforlu kalem ve düz cetvel ile işlemlerini yapabilirsin.</span>
            {questionContext && (
              <span className="text-amber-600 dark:text-amber-400 font-medium">Sol panelde şıkları eleyebilirsin.</span>
            )}
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-300 hidden sm:inline">Soruyu çözerken tahtayı kapatıp açabilirsin.</span>
        </div>
        </ErrorBoundary>
      </div>
    </div>
  );
}
