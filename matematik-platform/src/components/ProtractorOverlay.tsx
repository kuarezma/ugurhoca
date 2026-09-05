'use client';

import { useState, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { RotateCw, RotateCcw, X, Compass } from 'lucide-react';

export type ProtractorOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  isLight?: boolean;
};

export default function ProtractorOverlay({
  isOpen,
  onClose,
  isLight = false,
}: ProtractorOverlayProps) {
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 80, y: 60 });
  const [angle, setAngle] = useState(0); // degrees: 0..360
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Dragging center handle
  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    });
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.stopPropagation();
    setPos({
      x: Math.max(10, e.clientX - dragOffset.x),
      y: Math.max(10, e.clientY - dragOffset.y),
    });
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      e.stopPropagation();
      setIsDragging(false);
    }
  };

  const rotateBy = (delta: number) => {
    setAngle((prev) => {
      const next = (prev + delta) % 360;
      return next < 0 ? next + 360 : next;
    });
  };

  const setFixedAngle = (val: number) => {
    setAngle(val % 360);
  };

  if (!isOpen) return null;

  // SVG parameters
  const width = 340;
  const height = 200;
  const cx = 170;
  const cy = 175;
  const r = 145;

  // Generate 0° to 180° tick lines
  const ticks = [];
  for (let deg = 0; deg <= 180; deg += 1) {
    const rad = (deg * Math.PI) / 180;
    // deg=0 is right, deg=90 is top, deg=180 is left
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const is10 = deg % 10 === 0;
    const is5 = deg % 5 === 0;
    const tickLen = is10 ? 14 : is5 ? 9 : 5;

    const x1 = cx + r * cos;
    const y1 = cy - r * sin;
    const x2 = cx + (r - tickLen) * cos;
    const y2 = cy - (r - tickLen) * sin;

    let textElem = null;
    if (is10) {
      const textR = r - 23;
      const tx = cx + textR * cos;
      const ty = cy - textR * sin + 3;
      textElem = (
        <text
          key={`txt-${deg}`}
          x={tx}
          y={ty}
          fontSize="9"
          fontWeight="600"
          textAnchor="middle"
          fill={isLight ? '#0f172a' : '#e2e8f0'}
        >
          {deg}°
        </text>
      );
    }

    ticks.push(
      <g key={`tick-${deg}`}>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={isLight ? (is10 ? '#0f172a' : '#64748b') : is10 ? '#38bdf8' : '#94a3b8'}
          strokeWidth={is10 ? 1.5 : 0.8}
        />
        {textElem}
      </g>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
      }}
      className="absolute top-0 left-0 z-40 select-none shadow-2xl rounded-2xl"
    >
      {/* Mini Kontrol Paneli */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-t-2xl border border-b-0 cursor-move backdrop-blur-md ${
          isLight
            ? 'bg-slate-100/90 border-slate-300 text-slate-800'
            : 'bg-slate-900/90 border-cyan-500/40 text-cyan-200'
        }`}
      >
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <Compass className="h-3.5 w-3.5 text-cyan-400" />
          <span>Açıölçer:</span>
          <span className="font-mono text-amber-400 text-sm">{Math.round(angle)}°</span>
        </div>

        {/* Hızlı Açı Çevirme Düğmeleri */}
        <div className="flex items-center gap-1 text-[11px]">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              rotateBy(-15);
            }}
            title="Saat yönü tersine 15° döndür"
            className="p-1 rounded hover:bg-white/10"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              rotateBy(15);
            }}
            title="Saat yönünde 15° döndür"
            className="p-1 rounded hover:bg-white/10"
          >
            <RotateCw className="h-3 w-3" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFixedAngle(0);
            }}
            className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-semibold hover:bg-white/20"
          >
            0°
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFixedAngle(90);
            }}
            className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-semibold hover:bg-white/20"
          >
            90°
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFixedAngle(45);
            }}
            className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-semibold hover:bg-white/20"
          >
            45°
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Açıölçeri Kapat"
            className="ml-1 p-1 rounded hover:bg-rose-500/20 text-rose-400"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Açıölçer Yarı Dairesel SVG Katmanı */}
      <div
        style={{
          transform: `rotate(${angle}deg)`,
          transformOrigin: `${cx}px ${cy}px`,
        }}
        className="relative transition-transform duration-75"
      >
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className={`drop-shadow-lg ${
            isLight
              ? 'fill-white/80 stroke-slate-400'
              : 'fill-slate-900/80 stroke-cyan-400/60'
          }`}
        >
          {/* Yarı Çember Zemin */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z`}
            className={isLight ? 'fill-sky-50/85 stroke-sky-400' : 'fill-cyan-950/65 stroke-cyan-400/80'}
            strokeWidth="1.5"
          />

          {/* İç Çember Boşluğu */}
          <path
            d={`M ${cx - 50} ${cy} A 50 50 0 0 1 ${cx + 50} ${cy} Z`}
            className={isLight ? 'fill-white/90 stroke-slate-300' : 'fill-slate-900/90 stroke-white/20'}
            strokeWidth="1"
          />

          {/* Çentikler ve Açı Dereceleri */}
          {ticks}

          {/* Taban Çizgisi ve Merkez Noktası */}
          <line
            x1={cx - r}
            y1={cy}
            x2={cx + r}
            y2={cy}
            stroke={isLight ? '#2563eb' : '#38bdf8'}
            strokeWidth="1.5"
          />

          {/* Merkez Artı (Crosshair) */}
          <line
            x1={cx}
            y1={cy - 12}
            x2={cx}
            y2={cy + 4}
            stroke="#f59e0b"
            strokeWidth="1.5"
          />
          <line
            x1={cx - 12}
            y1={cy}
            x2={cx + 12}
            y2={cy}
            stroke="#f59e0b"
            strokeWidth="1.5"
          />
          <circle
            cx={cx}
            cy={cy}
            r="3"
            fill="#f59e0b"
            stroke="#ffffff"
            strokeWidth="1"
          />
        </svg>

        {/* Merkez Taşıma / Hizalama İpucu */}
        <div
          style={{ left: `${cx - 10}px`, top: `${cy - 10}px` }}
          className="absolute h-5 w-5 rounded-full pointer-events-none flex items-center justify-center text-[8px] font-bold text-amber-300"
          title="Açının Köşe Noktası"
        />
      </div>
    </div>
  );
}
