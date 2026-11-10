'use client';

import { useState, useRef, useEffect } from 'react';

type ParabolaLabTabProps = {
  isLight: boolean;
};

export function ParabolaLabTab({ isLight }: ParabolaLabTabProps) {
  const [paramA, setParamA] = useState<number>(1);
  const [paramB, setParamB] = useState<number>(-2);
  const [paramC, setParamC] = useState<number>(-3);
  const parabolaCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const delta = paramB * paramB - 4 * paramA * paramC;
  const vertexR = paramA !== 0 ? -paramB / (2 * paramA) : 0;
  const vertexK = paramA * vertexR * vertexR + paramB * vertexR + paramC;

  useEffect(() => {
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
        vy - 8,
      );
    }
  }, [paramA, paramB, paramC, vertexR, vertexK, isLight]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-2xl border border-default dark:border-white/10 bg-surface-2/40 dark:bg-slate-950/40 p-3 shadow-inner">
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
            f(x) = {paramA}x²{' '}
            {paramB >= 0 ? `+ ${paramB}` : `- ${Math.abs(paramB)}`}x{' '}
            {paramC >= 0 ? `+ ${paramC}` : `- ${Math.abs(paramC)}`}
          </div>
          <div className="grid grid-cols-2 gap-2 font-mono pt-1">
            <div>
              <span className="text-slate-400 block text-[11px]">
                Tepe Noktası T(r, k):
              </span>
              <span className="font-bold text-rose-400 text-sm">
                ({vertexR.toFixed(2)}, {vertexK.toFixed(2)})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">
                Diskriminant (Δ):
              </span>
              <span className="font-bold text-amber-400 text-sm">
                {delta.toFixed(1)} (
                {delta > 0 ? '2 Kök' : delta === 0 ? '1 Kök' : 'Kök Yok'})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
