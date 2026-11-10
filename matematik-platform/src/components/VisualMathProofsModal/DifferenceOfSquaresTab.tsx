'use client';

import { useState } from 'react';
import { Lightbulb } from 'lucide-react';

export function DifferenceOfSquaresTab() {
  const [diffA, setDiffA] = useState(6);
  const [diffB, setDiffB] = useState(2);
  const [diffStep, setDiffStep] = useState(0);

  const safeDiffB = Math.min(diffB, diffA - 1);
  const diffAreaOrig = diffA * diffA - safeDiffB * safeDiffB;
  const diffFactored = (diffA - safeDiffB) * (diffA + safeDiffB);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Sol İnteraktif SVG */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-950 p-4 min-h-[300px]">
          <svg
            viewBox="0 0 380 280"
            className="w-full max-h-[300px] select-none"
          >
            {(() => {
              const scale = 22;
              const ox = 50;
              const oy = 40;
              const sideA = diffA * scale;
              const sideB = safeDiffB * scale;

              // Transformation offset based on diffStep
              const moveX = (diffStep / 100) * (sideA - sideB);
              const moveY = (diffStep / 100) * sideB;

              return (
                <g>
                  {/* Ana Parça 1: (a - b) x a taban dikdörtgeni */}
                  <rect
                    x={ox}
                    y={oy + sideB}
                    width={sideA}
                    height={sideA - sideB}
                    fill="#6366f1"
                    fillOpacity="0.5"
                    stroke="#818cf8"
                    strokeWidth="2"
                    rx="2"
                  />
                  <text
                    x={ox + sideA / 2}
                    y={oy + sideB + (sideA - sideB) / 2 + 4}
                    textAnchor="middle"
                    fill="#c7d2fe"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    (a - b) × a
                  </text>

                  {/* Parça 2: (a - b) x b */}
                  <g transform={`translate(${moveX}, ${moveY})`}>
                    <rect
                      x={ox}
                      y={oy}
                      width={sideA - sideB}
                      height={sideB}
                      fill="#ec4899"
                      fillOpacity="0.6"
                      stroke="#f472b6"
                      strokeWidth="2"
                      rx="2"
                    />
                    <text
                      x={ox + (sideA - sideB) / 2}
                      y={oy + sideB / 2 + 4}
                      textAnchor="middle"
                      fill="#fbcfe8"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      (a - b) × b
                    </text>
                  </g>

                  {/* Kesilip atılan b x b köşesi */}
                  <rect
                    x={ox + sideA - sideB}
                    y={oy}
                    width={sideB}
                    height={sideB}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                  />
                  <text
                    x={ox + sideA - sideB / 2}
                    y={oy + sideB / 2 + 4}
                    textAnchor="middle"
                    fill="#f87171"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    - b²
                  </text>
                </g>
              );
            })()}
          </svg>
          <span className="text-[11px] text-slate-400 mt-2">
            Pembe parça kaydırıldığında tek parça bir{' '}
            <strong className="text-slate-900 dark:text-white">
              (a - b) × (a + b)
            </strong>{' '}
            dikdörtgeni oluşur!
          </span>
        </div>

        {/* Sağ Kontrol Paneli */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/50 p-4 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Kare Kenarlarını Ayarla:
            </span>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-indigo-400">
                  Büyük Kare a: {diffA} birim
                </span>
                <span className="text-slate-400">a² = {diffA * diffA}</span>
              </div>
              <input
                type="range"
                min="4"
                max="8"
                value={diffA}
                onChange={(e) => setDiffA(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-400">
                  Çıkarılan Kare b: {safeDiffB} birim
                </span>
                <span className="text-slate-400">
                  b² = {safeDiffB * safeDiffB}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max={diffA - 1}
                value={safeDiffB}
                onChange={(e) => setDiffB(parseInt(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-pink-400">
                  Parçayı Taşı & Dikdörtgen Yap: %{diffStep}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={diffStep}
                onChange={(e) => setDiffStep(parseInt(e.target.value))}
                className="w-full accent-pink-500"
              />
            </div>
          </div>

          {/* Sonuç Özeti */}
          <div className="rounded-2xl border border-pink-500/30 bg-pink-950/20 p-4 text-center">
            <div className="text-xs font-semibold text-pink-300 mb-1">
              İki Kare Farkı Formülü:
            </div>
            <div className="text-base sm:text-lg font-mono font-black text-slate-900 dark:text-white">
              {diffA}² - {safeDiffB}² = ({diffA} - {safeDiffB}) × ({diffA} +{' '}
              {safeDiffB})
            </div>
            <div className="text-sm font-bold text-pink-400 mt-1">
              {diffAreaOrig} = {diffA - safeDiffB} × {diffA + safeDiffB} ={' '}
              {diffFactored}
            </div>
          </div>
        </div>
      </div>

      {/* Pedagojik Açıklama */}
      <div className="flex items-start gap-3 rounded-2xl border border-indigo-500/25 bg-indigo-500/10 p-4">
        <Lightbulb className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed text-slate-200">
          <strong className="text-indigo-300">Neden (a - b)(a + b)?</strong>{' '}
          Büyük kareden küçük kare kesildiğinde kalan L-şeklindeki parça,
          ortasından kesilip yan yana konduğunda yüksekliği{' '}
          <strong>(a - b)</strong>, tabanı ise <strong>(a + b)</strong> olan
          mükemmel bir dikdörtgene dönüşür.
        </div>
      </div>
    </div>
  );
}
