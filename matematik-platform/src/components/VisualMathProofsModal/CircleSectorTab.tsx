'use client';

import { useState, useMemo } from 'react';
import { Lightbulb } from 'lucide-react';

export function CircleSectorTab() {
  const [circleRadius, setCircleRadius] = useState(5);
  const [circleAngle, setCircleAngle] = useState(60);

  const arcLength = useMemo(
    () => ((2 * Math.PI * circleRadius * circleAngle) / 360).toFixed(2),
    [circleRadius, circleAngle],
  );
  const sectorArea = useMemo(
    () =>
      ((Math.PI * circleRadius * circleRadius * circleAngle) / 360).toFixed(2),
    [circleRadius, circleAngle],
  );
  const totalCircleArea = useMemo(
    () => (Math.PI * circleRadius * circleRadius).toFixed(2),
    [circleRadius],
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Sol İnteraktif SVG */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-950 p-4 min-h-[320px]">
          <svg
            viewBox="0 0 340 320"
            className="w-full max-h-[320px] select-none"
          >
            {/* Arka plan daire */}
            <circle
              cx="170"
              cy="160"
              r="110"
              fill="none"
              stroke="#334155"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Daire Dilimi (Sector Wedge) */}
            {(() => {
              const cx = 170;
              const cy = 160;
              const r = 110;
              const startAngle = 0;
              const endAngle = (circleAngle * Math.PI) / 180;
              const x1 = cx + r * Math.cos(startAngle);
              const y1 = cy - r * Math.sin(startAngle);
              const x2 = cx + r * Math.cos(endAngle);
              const y2 = cy - r * Math.sin(endAngle);
              const largeArcFlag = circleAngle > 180 ? 1 : 0;

              if (circleAngle >= 360) {
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="#f59e0b"
                    fillOpacity="0.25"
                    stroke="#f59e0b"
                    strokeWidth="3"
                  />
                );
              }

              const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 0 ${x2} ${y2} Z`;
              const arcPath = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 0 ${x2} ${y2}`;

              return (
                <g>
                  <path
                    d={pathData}
                    fill="#f59e0b"
                    fillOpacity="0.25"
                    stroke="#f59e0b"
                    strokeWidth="2"
                  />
                  {/* Vurgulu Yay (Arc) */}
                  <path
                    d={arcPath}
                    fill="none"
                    stroke="#ec4899"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  {/* Yarıçap Çizgileri */}
                  <line
                    x1={cx}
                    y1={cy}
                    x2={x1}
                    y2={y1}
                    stroke="#f59e0b"
                    strokeWidth="2"
                  />
                  <line
                    x1={cx}
                    y1={cy}
                    x2={x2}
                    y2={y2}
                    stroke="#f59e0b"
                    strokeWidth="2"
                  />
                </g>
              );
            })()}

            {/* Merkez Noktası */}
            <circle cx="170" cy="160" r="4" fill="#ffffff" />
            <text
              x="175"
              y="175"
              fill="#94a3b8"
              fontSize="11"
              fontWeight="bold"
            >
              O (Merkez)
            </text>

            {/* Açı etiketi */}
            <text
              x="170"
              y="140"
              textAnchor="middle"
              fill="#f59e0b"
              fontSize="14"
              fontWeight="bold"
            >
              θ = {circleAngle}°
            </text>

            {/* Yay etiketi */}
            <text
              x="170"
              y="30"
              textAnchor="middle"
              fill="#ec4899"
              fontSize="12"
              fontWeight="bold"
            >
              Yay Uzunluğu (L)
            </text>
          </svg>
        </div>

        {/* Sağ Kontroller ve Hesaplamalar */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100/60 dark:bg-slate-950/60 p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Dinamik Parametreler
            </h4>

            {/* Yarıçap (r) */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400">
                  Yarıçap (r):
                </span>
                <span className="font-mono font-bold text-amber-500 dark:text-amber-400">
                  {circleRadius} cm
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={circleRadius}
                onChange={(e) => setCircleRadius(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Merkez Açı (theta) */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400">
                  Merkez Açı (θ):
                </span>
                <span className="font-mono font-bold text-pink-500 dark:text-pink-400">
                  {circleAngle}°
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="360"
                step="5"
                value={circleAngle}
                onChange={(e) => setCircleAngle(Number(e.target.value))}
                className="w-full accent-pink-500"
              />
            </div>
          </div>

          {/* Hesaplama Sonuç Kartları */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-pink-500/30 bg-pink-950/20 p-3.5">
              <div className="text-[11px] text-pink-300 font-medium">
                Yay Uzunluğu (L)
              </div>
              <div className="text-lg font-black font-mono text-slate-900 dark:text-white mt-1">
                {arcLength} cm
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                2 · π · r · (θ/360)
              </div>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-3.5">
              <div className="text-[11px] text-amber-300 font-medium">
                Dilim Alanı (A)
              </div>
              <div className="text-lg font-black font-mono text-slate-900 dark:text-white mt-1">
                {sectorArea} cm²
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                π · r² · (θ/360)
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100/40 dark:bg-slate-800/40 p-3 text-xs text-slate-700 dark:text-slate-300 flex justify-between">
            <span>
              Toplam Daire Alanı: <strong>{totalCircleArea} cm²</strong>
            </span>
            <span>
              Oran: <strong>%{Math.round((circleAngle / 360) * 100)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Pedagojik Açıklama */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
        <Lightbulb className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed text-slate-200">
          <strong className="text-amber-300">LGS Soru Çözüm İpucu:</strong>{' '}
          Daire diliminde hem alan hem de yay uzunluğu, merkez açının 360
          dereceye oranıyla doğru orantılıdır. Örneğin 60° tam altıda bir (1/6),
          90° çeyrek (1/4), 180° ise yarım (1/2) dairedir!
        </div>
      </div>
    </div>
  );
}
