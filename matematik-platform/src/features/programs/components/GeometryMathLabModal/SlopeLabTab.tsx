'use client';

import { useState, useRef, useEffect } from 'react';

type SlopeLabTabProps = {
  isLight: boolean;
};

export function SlopeLabTab({ isLight }: SlopeLabTabProps) {
  const [x1, setX1] = useState<number>(-2);
  const [y1, setY1] = useState<number>(-1);
  const [x2, setX2] = useState<number>(3);
  const [y2, setY2] = useState<number>(4);
  const slopeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const dx = x2 - x1;
  const dy = y2 - y1;
  const slope = dx === 0 ? undefined : dy / dx;

  useEffect(() => {
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
  }, [x1, y1, x2, y2, slope, isLight]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-2xl border border-default dark:border-white/10 bg-surface-2/40 dark:bg-slate-950/40 p-3 shadow-inner">
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
            <span className="font-bold text-blue-400 block">
              A Noktası (x₁, y₁)
            </span>
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
            <span className="font-bold text-purple-400 block">
              B Noktası (x₂, y₂)
            </span>
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
          <div className="text-xs font-bold text-accent-success-ink">
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
  );
}
