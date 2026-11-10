'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

type PythagorasLabTabProps = {
  isLight: boolean;
};

export function PythagorasLabTab({ isLight }: PythagorasLabTabProps) {
  const [sideA, setSideA] = useState<number>(3);
  const [sideB, setSideB] = useState<number>(4);
  const hypotenuse = Math.hypot(sideA, sideB);
  const pythagorasCanvasRef = useRef<HTMLCanvasElement | null>(null);

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

  useEffect(() => {
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

    ctx.fillStyle = isLight
      ? 'rgba(99, 102, 241, 0.15)'
      : 'rgba(99, 102, 241, 0.25)';
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
  }, [sideA, sideB, hypotenuse, isLight]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-2xl border border-default dark:border-white/10 bg-surface-2/40 dark:bg-slate-950/40 p-3 shadow-inner">
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
              <span className="text-indigo-400 font-mono text-sm">
                {sideA} birim
              </span>
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
              <span className="text-indigo-400 font-mono text-sm">
                {sideB} birim
              </span>
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
          <div className="text-sm font-mono font-bold">a² + b² = c²</div>
          <div className="text-xs text-secondary dark:text-slate-300 font-mono">
            {sideA}² + {sideB}² = {sideA * sideA} + {sideB * sideB} ={' '}
            {sideA * sideA + sideB * sideB}
          </div>
          <div className="text-base font-black text-purple-400 font-mono pt-1">
            c = √{sideA * sideA + sideB * sideB} ≈ {hypotenuse.toFixed(2)} birim
          </div>
        </div>

        {specialTriple && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs font-bold text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-accent-success-ink" />
            <span>{specialTriple}</span>
          </div>
        )}
      </div>
    </div>
  );
}
