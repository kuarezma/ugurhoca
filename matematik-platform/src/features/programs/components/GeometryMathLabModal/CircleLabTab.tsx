'use client';

import { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

type CircleLabTabProps = {
  isLight: boolean;
};

export function CircleLabTab({ isLight }: CircleLabTabProps) {
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

  useEffect(() => {
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
    ctx.fillText(
      `cos = ${cosVal.toFixed(2)}`,
      cx + (px - cx) / 2 - 20,
      cy + (sinVal >= 0 ? 18 : -10),
    );

    ctx.fillStyle = '#ec4899';
    ctx.fillText(
      `sin = ${sinVal.toFixed(2)}`,
      px + (cosVal >= 0 ? 8 : -65),
      cy - (cy - py) / 2,
    );

    ctx.fillStyle = '#f59e0b';
    ctx.fillText(
      `${angleDeg}°`,
      cx + 38 * Math.cos(-angleRad / 2),
      cy + 38 * Math.sin(-angleRad / 2),
    );
  }, [angleDeg, angleRad, cosVal, sinVal, isLight]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-2xl border border-default dark:border-white/10 bg-surface-2/40 dark:bg-slate-950/40 p-3 shadow-inner">
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
                    ? 'bg-brand-primary border-brand-primary text-slate-950 dark:text-slate-950'
                    : 'border-default dark:border-white/10 hover:bg-surface-2 dark:hover:bg-white/10 text-secondary dark:text-slate-300'
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
            <span className="text-accent-success-ink font-bold block">
              cos({angleDeg}°) =
            </span>
            <span className="text-base font-black">{cosVal.toFixed(3)}</span>
          </div>
          <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-2.5">
            <span className="text-purple-400 font-bold block">
              sin({angleDeg}°) =
            </span>
            <span className="text-base font-black">{sinVal.toFixed(3)}</span>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 col-span-2">
            <span className="text-amber-400 font-bold block">
              tan({angleDeg}°) = sin/cos =
            </span>
            <span className="text-sm font-black">
              {tanVal === Infinity ? 'Tanımsız' : tanVal.toFixed(3)}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-default dark:border-white/10 bg-surface-2 dark:bg-white/5 p-3 text-xs">
          <div className="font-bold text-primary dark:text-slate-200 mb-1 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-sky-400" />
            Bölge Özellikleri:
          </div>
          <div className="text-slate-400">{getQuadrant(angleDeg)}</div>
        </div>
      </div>
    </div>
  );
}
