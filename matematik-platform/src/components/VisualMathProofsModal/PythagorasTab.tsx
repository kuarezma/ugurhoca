'use client';

import { useState, useMemo } from 'react';
import { Lightbulb } from 'lucide-react';

export function PythagorasTab() {
  const [pythA, setPythA] = useState(3);
  const [pythB, setPythB] = useState(4);
  const [pythProgress, setPythProgress] = useState(0);

  const pythC = useMemo(
    () => Math.sqrt(pythA * pythA + pythB * pythB),
    [pythA, pythB],
  );
  const pythAreaA = pythA * pythA;
  const pythAreaB = pythB * pythB;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Sol İnteraktif SVG */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-950 p-4 min-h-[300px]">
          <svg
            viewBox="0 0 400 320"
            className="w-full max-h-[320px] select-none"
          >
            {(() => {
              const scale = 20;
              const ox = 150;
              const oy = 210;
              const ax = ox + pythA * scale;
              const by = oy - pythB * scale;

              return (
                <g>
                  {/* Kenar A Karesi (Alt) */}
                  <rect
                    x={ox}
                    y={oy}
                    width={pythA * scale}
                    height={pythA * scale}
                    fill="#3b82f6"
                    fillOpacity="0.4"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    rx="3"
                  />
                  <text
                    x={ox + (pythA * scale) / 2}
                    y={oy + (pythA * scale) / 2 + 5}
                    textAnchor="middle"
                    fill="#93c5fd"
                    fontSize="13"
                    fontWeight="bold"
                  >
                    a² = {pythAreaA}
                  </text>

                  {/* Kenar B Karesi (Sol) */}
                  <rect
                    x={ox - pythB * scale}
                    y={by}
                    width={pythB * scale}
                    height={pythB * scale}
                    fill="#10b981"
                    fillOpacity="0.4"
                    stroke="#10b981"
                    strokeWidth="2"
                    rx="3"
                  />
                  <text
                    x={ox - (pythB * scale) / 2}
                    y={by + (pythB * scale) / 2 + 5}
                    textAnchor="middle"
                    fill="#6ee7b7"
                    fontSize="13"
                    fontWeight="bold"
                  >
                    b² = {pythAreaB}
                  </text>

                  {/* Hipotenüs Karesi C (Eğimli alan) */}
                  <polygon
                    points={`${ox},${by} ${ax},${oy} ${ax + (oy - by)},${oy - (ax - ox)} ${ox + (oy - by)},${by - (ax - ox)}`}
                    fill="#f59e0b"
                    fillOpacity={0.25 + (pythProgress / 100) * 0.45}
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray={pythProgress < 50 ? '4 2' : 'none'}
                  />
                  <text
                    x={ox + (pythA * scale) / 2 + 30}
                    y={by - 10}
                    textAnchor="middle"
                    fill="#fcd34d"
                    fontSize="13"
                    fontWeight="bold"
                  >
                    c² = {pythAreaA + pythAreaB}
                  </text>

                  {/* Ana Dik Üçgen */}
                  <polygon
                    points={`${ox},${oy} ${ax},${oy} ${ox},${by}`}
                    fill="#a855f7"
                    fillOpacity="0.8"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                  />

                  {/* Dik Açı Sembolü */}
                  <rect
                    x={ox}
                    y={oy - 12}
                    width="12"
                    height="12"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <circle cx={ox + 6} cy={oy - 6} r="1.5" fill="#ffffff" />
                </g>
              );
            })()}
          </svg>
          <span className="text-[11px] text-slate-400 mt-2">
            Mavi alan (a²) + Yeşil alan (b²) = Sarı hipotenüs alanı (c²)
          </span>
        </div>

        {/* Sağ Kontrol Paneli */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/50 p-4 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Kenar Uzunluklarını Değiştir:
            </span>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-blue-400">
                  a Kenarı (Yatay): {pythA} birim
                </span>
                <span className="text-slate-400">a² = {pythAreaA}</span>
              </div>
              <input
                type="range"
                min="2"
                max="6"
                value={pythA}
                onChange={(e) => setPythA(parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-accent-success-ink">
                  b Kenarı (Dikey): {pythB} birim
                </span>
                <span className="text-slate-400">b² = {pythAreaB}</span>
              </div>
              <input
                type="range"
                min="2"
                max="6"
                value={pythB}
                onChange={(e) => setPythB(parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-400">
                  Alan Birleşim İspat Seviyesi (%{pythProgress})
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={pythProgress}
                onChange={(e) => setPythProgress(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          {/* Canlı Eşitlik Kartı */}
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/25 p-4 text-center">
            <div className="text-xs font-semibold text-indigo-300 mb-1">
              Pisagor Özdeşliği Doğrulaması:
            </div>
            <div className="text-lg sm:text-xl font-mono font-black text-slate-900 dark:text-white">
              <span className="text-blue-400">{pythAreaA}</span> +{' '}
              <span className="text-accent-success-ink">{pythAreaB}</span> ={' '}
              <span className="text-amber-400">{pythAreaA + pythAreaB}</span>
            </div>
            <div className="text-xs text-slate-300 mt-1">
              c = √{pythAreaA + pythAreaB} ≈ {pythC.toFixed(2)} birim
            </div>
          </div>
        </div>
      </div>

      {/* Pedagojik Açıklama */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
        <Lightbulb className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed text-slate-200">
          <strong className="text-amber-300">Uğur Hoca Pedagojik İpucu:</strong>{' '}
          Pisagor teoremi bir sayı oyunu değil,{' '}
          <strong>alan korunumudur</strong>. İki dik kenar üzerine kurulan
          karelerin toplam yüzey alanı, daima hipotenüs üzerine kurulan karenin
          yüzey alanına birebir eşittir.
        </div>
      </div>
    </div>
  );
}
