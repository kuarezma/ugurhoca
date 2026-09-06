'use client';

import { useState, useId, useRef, useEffect } from 'react';
import {
  X,
  Compass,
  Triangle,
  CircleDot,
  TrendingUp,
  Sliders,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import { useTheme } from '@/components/ThemeProvider';

export type GeometryMathLabModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'pythagoras' | 'circle' | 'parabola' | 'slope';
};

type LabTab = 'pythagoras' | 'circle' | 'parabola' | 'slope';

export function GeometryMathLabModal({
  isOpen,
  onClose,
  initialTab = 'pythagoras',
}: GeometryMathLabModalProps) {
  const titleId = useId();
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [activeTab, setActiveTab] = useState<LabTab>(initialTab);

  // --- Pythagoras State ---
  const [sideA, setSideA] = useState<number>(3);
  const [sideB, setSideB] = useState<number>(4);
  const hypotenuse = Math.hypot(sideA, sideB);
  const pythagorasCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Detect special triple
  const specialTriple = (() => {
    const a = sideA;
    const b = sideB;
    const c = Math.round(hypotenuse * 100) / 100;
    if (a === 3 && b === 4) return '3 - 4 - 5 Özel Dik Üçgeni';
    if (a === 6 && b === 8) return '6 - 8 - 10 (3-4-5 katı)';
    if (a === 5 && b === 12) return '5 - 12 - 13 Özel Dik Üçgeni';
    if (a === 8 && b === 15) return '8 - 15 - 17 Özel Dik Üçgeni';
    if (a === 7 && b === 24) return '7 - 24 - 25 Özel Dik Üçgeni';
    if (a === b) return `İkizkenar Dik Üçgen (a, a, a√2) -> c = ${a}√2 ≈ ${c}`;
    return null;
  })();

  // --- Circle & Trigonometry State ---
  const [angleDeg, setAngleDeg] = useState<number>(45);
  const circleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const angleRad = (angleDeg * Math.PI) / 180;
  const sinVal = Math.sin(angleRad);
  const cosVal = Math.cos(angleRad);
  const tanVal = Math.abs(cosVal) < 0.0001 ? Infinity : Math.tan(angleRad);

  const getQuadrant = (deg: number) => {
    const norm = ((deg % 360) + 360) % 360;
    if (norm === 0) return 'Başlangıç Ekseni (Pozitif x)';
    if (norm < 90) return '1. Bölge (sin > 0, cos > 0)';
    if (norm === 90) return '+y Ekseni (sin=1, cos=0)';
    if (norm < 180) return '2. Bölge (sin > 0, cos < 0)';
    if (norm === 180) return '-x Ekseni (sin=0, cos=-1)';
    if (norm < 270) return '3. Bölge (sin < 0, cos < 0)';
    if (norm === 270) return '-y Ekseni (sin=-1, cos=0)';
    return '4. Bölge (sin < 0, cos > 0)';
  };

  // --- Parabola State ---
  const [paramA, setParamA] = useState<number>(1);
  const [paramB, setParamB] = useState<number>(-2);
  const [paramC, setParamC] = useState<number>(-3);
  const parabolaCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const delta = paramB * paramB - 4 * paramA * paramC;
  const vertexR = paramA !== 0 ? -paramB / (2 * paramA) : 0;
  const vertexK = paramA * vertexR * vertexR + paramB * vertexR + paramC;

  // --- Slope & Line State ---
  const [x1, setX1] = useState<number>(-2);
  const [y1, setY1] = useState<number>(-1);
  const [x2, setX2] = useState<number>(3);
  const [y2, setY2] = useState<number>(4);
  const slopeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const dx = x2 - x1;
  const dy = y2 - y1;
  const slope = dx === 0 ? undefined : dy / dx;

  // --- Render Pythagoras Canvas ---
  useEffect(() => {
    if (!isOpen || activeTab !== 'pythagoras') return;
    const canvas = pythagorasCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Padding and scaling
    const maxSide = Math.max(sideA, sideB, 8);
    const scale = Math.min((width * 0.55) / maxSide, (height * 0.55) / maxSide);

    const originX = width * 0.25;
    const originY = height * 0.8;

    const bPixels = sideA * scale; // horizontal
    const aPixels = sideB * scale; // vertical

    // Draw Grid Background
    ctx.strokeStyle = isLight ? '#e2e8f0' : '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Triangle
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + bPixels, originY); // to right
    ctx.lineTo(originX, originY - aPixels); // to top
    ctx.closePath();

    ctx.fillStyle = isLight ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.25)';
    ctx.fill();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Right angle marker
    const marker = 16;
    ctx.beginPath();
    ctx.moveTo(originX, originY - marker);
    ctx.lineTo(originX + marker, originY - marker);
    ctx.lineTo(originX + marker, originY);
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Labels
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = isLight ? '#0f172a' : '#f8fafc';

    // Base
    ctx.fillText(`a = ${sideA}`, originX + bPixels / 2 - 15, originY + 22);
    // Height
    ctx.fillText(`b = ${sideB}`, originX - 50, originY - aPixels / 2);
    // Hypotenuse
    const hypMidX = originX + bPixels / 2 + 10;
    const hypMidY = originY - aPixels / 2 - 10;
    ctx.fillStyle = '#ec4899';
    ctx.fillText(`c ≈ ${hypotenuse.toFixed(2)}`, hypMidX, hypMidY);
  }, [isOpen, activeTab, sideA, sideB, hypotenuse, isLight]);

  // --- Render Circle Canvas ---
  useEffect(() => {
    if (!isOpen || activeTab !== 'circle') return;
    const canvas = circleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(width, height) * 0.38;

    // Draw Axes
    ctx.strokeStyle = isLight ? '#cbd5e1' : '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();

    // Draw Unit Circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = isLight ? '#64748b' : '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Angle Point P(cos, -sin) in canvas coords
    const px = cx + r * cosVal;
    const py = cy - r * sinVal;

    // Angle arc
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, -angleRad, true);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Radius line to P
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Drop line for Sin (vertical)
    ctx.beginPath();
    ctx.moveTo(px, cy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Line for Cos (horizontal)
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, cy);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Point P
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#f43f5e';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Labels
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText(`cos = ${cosVal.toFixed(2)}`, cx + (px - cx) / 2 - 20, cy + (sinVal >= 0 ? 18 : -10));

    ctx.fillStyle = '#ec4899';
    ctx.fillText(`sin = ${sinVal.toFixed(2)}`, px + (cosVal >= 0 ? 8 : -65), cy - (cy - py) / 2);

    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`${angleDeg}°`, cx + 38 * Math.cos(-angleRad / 2), cy + 38 * Math.sin(-angleRad / 2));
  }, [isOpen, activeTab, angleDeg, angleRad, cosVal, sinVal, isLight]);

  // --- Render Parabola Canvas ---
  useEffect(() => {
    if (!isOpen || activeTab !== 'parabola') return;
    const canvas = parabolaCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const scale = 22; // pixels per unit

    // Draw Grid & Axes
    ctx.strokeStyle = isLight ? '#e2e8f0' : '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.strokeStyle = isLight ? '#64748b' : '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();

    // Plot Parabola: y = a x^2 + b x + c
    ctx.beginPath();
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 3;

    let first = true;
    for (let px = 0; px < width; px += 2) {
      const x = (px - cx) / scale;
      const y = paramA * x * x + paramB * x + paramC;
      const py = cy - y * scale;

      if (py >= -100 && py <= height + 100) {
        if (first) {
          ctx.moveTo(px, py);
          first = false;
        } else {
          ctx.lineTo(px, py);
        }
      }
    }
    ctx.stroke();

    // Vertex Point
    const vx = cx + vertexR * scale;
    const vy = cy - vertexK * scale;
    if (vx >= 0 && vx <= width && vy >= 0 && vy <= height) {
      ctx.beginPath();
      ctx.arc(vx, vy, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = isLight ? '#0f172a' : '#f8fafc';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(
        `T(${vertexR.toFixed(1)}, ${vertexK.toFixed(1)})`,
        vx + 8,
        vy - 8
      );
    }
  }, [isOpen, activeTab, paramA, paramB, paramC, vertexR, vertexK, isLight]);

  // --- Render Slope Canvas ---
  useEffect(() => {
    if (!isOpen || activeTab !== 'slope') return;
    const canvas = slopeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const scale = 24;

    // Draw Grid & Axes
    ctx.strokeStyle = isLight ? '#e2e8f0' : '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.strokeStyle = isLight ? '#64748b' : '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();

    // Plot points A and B
    const ax = cx + x1 * scale;
    const ay = cy - y1 * scale;
    const bx = cx + x2 * scale;
    const by = cy - y2 * scale;

    // Line through points
    if (slope !== undefined) {
      ctx.beginPath();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;

      const leftX = -cx / scale;
      const rightX = (width - cx) / scale;
      const leftY = y1 + slope * (leftX - x1);
      const rightY = y1 + slope * (rightX - x1);

      ctx.moveTo(0, cy - leftY * scale);
      ctx.lineTo(width, cy - rightY * scale);
      ctx.stroke();
    } else {
      // Vertical line
      ctx.beginPath();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.moveTo(ax, 0);
      ctx.lineTo(ax, height);
      ctx.stroke();
    }

    // Draw slope triangle
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, ay);
    ctx.lineTo(bx, by);
    ctx.strokeStyle = '#f59e0b';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    // Point A
    ctx.beginPath();
    ctx.arc(ax, ay, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Point B
    ctx.beginPath();
    ctx.arc(bx, by, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#8b5cf6';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = isLight ? '#0f172a' : '#f8fafc';
    ctx.fillText(`A(${x1}, ${y1})`, ax - 25, ay - 10);
    ctx.fillText(`B(${x2}, ${y2})`, bx + 10, by - 10);
  }, [isOpen, activeTab, x1, y1, x2, y2, slope, isLight]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-testid="geometry-math-lab-modal"
    >
      <div
        ref={modalRef}
        className={`relative flex flex-col w-full max-w-4xl max-h-[92vh] rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-900 border-white/10 text-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id={titleId} className="text-base sm:text-lg font-black tracking-tight">
                  Etkileşimli Matematik & Geometri Laboratuvarı
                </h2>
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-400">
                  Canlı Simülatör
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Sürükle, değiştir ve formüllerin geometrik mantığını anında gör.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
              isLight
                ? 'hover:bg-slate-100 text-slate-500'
                : 'hover:bg-white/10 text-slate-400'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-white/10 px-4 py-2 gap-1.5 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('pythagoras')}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'pythagoras'
                ? 'bg-indigo-600 text-white shadow-md'
                : isLight
                ? 'text-slate-600 hover:bg-slate-100'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Triangle className="h-3.5 w-3.5" />
            Pisagor & Üçgen Bağıntısı
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('circle')}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'circle'
                ? 'bg-sky-600 text-white shadow-md'
                : isLight
                ? 'text-slate-600 hover:bg-slate-100'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <CircleDot className="h-3.5 w-3.5" />
            Birim Çember & Açı
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('parabola')}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'parabola'
                ? 'bg-purple-600 text-white shadow-md'
                : isLight
                ? 'text-slate-600 hover:bg-slate-100'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Parabol & Tepe Noktası
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('slope')}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'slope'
                ? 'bg-emerald-600 text-white shadow-md'
                : isLight
                ? 'text-slate-600 hover:bg-slate-100'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            Eğim & Doğru Denklemi
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: PYTHAGORAS */}
          {activeTab === 'pythagoras' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40 p-3 shadow-inner">
                <canvas
                  ref={pythagorasCanvasRef}
                  width={420}
                  height={320}
                  className="w-full max-w-[420px] h-[300px] rounded-xl"
                  data-testid="pythagoras-canvas"
                />
              </div>

              <div className="lg:col-span-5 space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Yatay Kenar (a)</span>
                      <span className="text-indigo-400 font-mono text-sm">{sideA} birim</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={15}
                      step={1}
                      value={sideA}
                      onChange={(e) => setSideA(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                      aria-label="Yatay Kenar a"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Düşey Kenar (b)</span>
                      <span className="text-indigo-400 font-mono text-sm">{sideB} birim</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={15}
                      step={1}
                      value={sideB}
                      onChange={(e) => setSideB(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                      aria-label="Düşey Kenar b"
                    />
                  </div>
                </div>

                {/* Calculation Cards */}
                <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-4 space-y-2">
                  <div className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Pisagor Teoremi Kanıtı:
                  </div>
                  <div className="text-sm font-mono font-bold">
                    a² + b² = c²
                  </div>
                  <div className="text-xs text-slate-300 font-mono">
                    {sideA}² + {sideB}² = {sideA * sideA} + {sideB * sideB} = {sideA * sideA + sideB * sideB}
                  </div>
                  <div className="text-base font-black text-pink-400 font-mono pt-1">
                    c = √{sideA * sideA + sideB * sideB} ≈ {hypotenuse.toFixed(2)} birim
                  </div>
                </div>

                {specialTriple && (
                  <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs font-bold text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{specialTriple}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CIRCLE & TRIGONOMETRY */}
          {activeTab === 'circle' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40 p-3 shadow-inner">
                <canvas
                  ref={circleCanvasRef}
                  width={420}
                  height={320}
                  className="w-full max-w-[420px] h-[300px] rounded-xl"
                  data-testid="circle-canvas"
                />
              </div>

              <div className="lg:col-span-5 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Açı (θ)</span>
                    <span className="text-sky-400 font-mono text-sm">{angleDeg}°</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={1}
                    value={angleDeg}
                    onChange={(e) => setAngleDeg(Number(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer"
                    aria-label="Açı Derecesi"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {[0, 30, 45, 60, 90, 120, 180, 270, 360].map((deg) => (
                      <button
                        key={deg}
                        type="button"
                        onClick={() => setAngleDeg(deg)}
                        className={`px-2 py-0.5 text-[11px] font-bold rounded-lg border transition ${
                          angleDeg === deg
                            ? 'bg-sky-500 text-slate-950 border-sky-400'
                            : 'border-white/10 hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trigonometric Values Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5">
                    <span className="text-emerald-400 font-bold block">cos({angleDeg}°) =</span>
                    <span className="text-base font-black">{cosVal.toFixed(3)}</span>
                  </div>
                  <div className="rounded-xl border border-pink-500/20 bg-pink-500/10 p-2.5">
                    <span className="text-pink-400 font-bold block">sin({angleDeg}°) =</span>
                    <span className="text-base font-black">{sinVal.toFixed(3)}</span>
                  </div>
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 col-span-2">
                    <span className="text-amber-400 font-bold block">tan({angleDeg}°) = sin/cos =</span>
                    <span className="text-sm font-black">
                      {tanVal === Infinity ? 'Tanımsız' : tanVal.toFixed(3)}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
                  <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-sky-400" />
                    Bölge Özellikleri:
                  </div>
                  <div className="text-slate-400">{getQuadrant(angleDeg)}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PARABOLA */}
          {activeTab === 'parabola' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40 p-3 shadow-inner">
                <canvas
                  ref={parabolaCanvasRef}
                  width={420}
                  height={320}
                  className="w-full max-w-[420px] h-[300px] rounded-xl"
                  data-testid="parabola-canvas"
                />
              </div>

              <div className="lg:col-span-5 space-y-3">
                <div className="space-y-2 text-xs font-bold">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>a Katsayısı (Kolların Yönü)</span>
                      <span className="font-mono text-purple-400">{paramA}</span>
                    </div>
                    <input
                      type="range"
                      min={-3}
                      max={3}
                      step={0.5}
                      value={paramA}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setParamA(val === 0 ? 0.5 : val);
                      }}
                      className="w-full accent-purple-500 cursor-pointer"
                      aria-label="a Katsayısı"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>b Katsayısı</span>
                      <span className="font-mono text-purple-400">{paramB}</span>
                    </div>
                    <input
                      type="range"
                      min={-6}
                      max={6}
                      step={1}
                      value={paramB}
                      onChange={(e) => setParamB(Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                      aria-label="b Katsayısı"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>c Katsayısı (y-kesişimi)</span>
                      <span className="font-mono text-purple-400">{paramC}</span>
                    </div>
                    <input
                      type="range"
                      min={-6}
                      max={6}
                      step={1}
                      value={paramC}
                      onChange={(e) => setParamC(Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                      aria-label="c Katsayısı"
                    />
                  </div>
                </div>

                {/* Parabola Metrics */}
                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-3.5 space-y-2 text-xs">
                  <div className="font-mono font-bold text-sm text-purple-300">
                    f(x) = {paramA}x² {paramB >= 0 ? `+ ${paramB}` : `- ${Math.abs(paramB)}`}x {paramC >= 0 ? `+ ${paramC}` : `- ${Math.abs(paramC)}`}
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono pt-1">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Tepe Noktası T(r, k):</span>
                      <span className="font-bold text-rose-400 text-sm">
                        ({vertexR.toFixed(2)}, {vertexK.toFixed(2)})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Diskriminant (Δ):</span>
                      <span className="font-bold text-amber-400 text-sm">
                        {delta.toFixed(1)} ({delta > 0 ? '2 Kök' : delta === 0 ? '1 Kök' : 'Kök Yok'})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SLOPE & LINE */}
          {activeTab === 'slope' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40 p-3 shadow-inner">
                <canvas
                  ref={slopeCanvasRef}
                  width={420}
                  height={320}
                  className="w-full max-w-[420px] h-[300px] rounded-xl"
                  data-testid="slope-canvas"
                />
              </div>

              <div className="lg:col-span-5 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2 rounded-xl border border-blue-500/20 bg-blue-500/5 p-2.5">
                    <span className="font-bold text-blue-400 block">A Noktası (x₁, y₁)</span>
                    <div>
                      <span className="text-[10px] text-slate-400">x₁: {x1}</span>
                      <input
                        type="range"
                        min={-5}
                        max={5}
                        step={1}
                        value={x1}
                        onChange={(e) => setX1(Number(e.target.value))}
                        className="w-full accent-blue-500"
                        aria-label="A noktası x"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">y₁: {y1}</span>
                      <input
                        type="range"
                        min={-5}
                        max={5}
                        step={1}
                        value={y1}
                        onChange={(e) => setY1(Number(e.target.value))}
                        className="w-full accent-blue-500"
                        aria-label="A noktası y"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 rounded-xl border border-purple-500/20 bg-purple-500/5 p-2.5">
                    <span className="font-bold text-purple-400 block">B Noktası (x₂, y₂)</span>
                    <div>
                      <span className="text-[10px] text-slate-400">x₂: {x2}</span>
                      <input
                        type="range"
                        min={-5}
                        max={5}
                        step={1}
                        value={x2}
                        onChange={(e) => setX2(Number(e.target.value))}
                        className="w-full accent-purple-500"
                        aria-label="B noktası x"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">y₂: {y2}</span>
                      <input
                        type="range"
                        min={-5}
                        max={5}
                        step={1}
                        value={y2}
                        onChange={(e) => setY2(Number(e.target.value))}
                        className="w-full accent-purple-500"
                        aria-label="B noktası y"
                      />
                    </div>
                  </div>
                </div>

                {/* Slope Result Card */}
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 space-y-2 font-mono">
                  <div className="text-xs font-bold text-emerald-400">
                    Eğim Formülü: m = (y₂ - y₁) / (x₂ - x₁)
                  </div>
                  <div className="text-sm">
                    m = ({y2} - {y1}) / ({x2} - {x1}) = {dy} / {dx}
                  </div>
                  <div className="text-base font-black text-emerald-300">
                    {slope === undefined
                      ? 'Eğim: Tanımsız (Dikey Doğru)'
                      : `m = ${slope.toFixed(2)} (${slope > 0 ? 'Pozitif, Artan' : slope < 0 ? 'Negatif, Azalan' : 'Sıfır, Yatay'})`}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default GeometryMathLabModal;
