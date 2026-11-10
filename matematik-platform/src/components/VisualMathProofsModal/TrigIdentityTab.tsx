'use client';

import { useState } from 'react';
import { Lightbulb } from 'lucide-react';

export function TrigIdentityTab() {
  const [trigAngle, setTrigAngle] = useState(35);

  const trigRad = (trigAngle * Math.PI) / 180;
  const cosVal = Math.cos(trigRad);
  const sinVal = Math.sin(trigRad);
  const cosSq = cosVal * cosVal;
  const sinSq = sinVal * sinVal;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Sol İnteraktif Birim Çember */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-950 p-4 min-h-[300px]">
          <svg
            viewBox="-140 -140 280 280"
            className="w-full max-h-[300px] select-none"
          >
            {/* Eksenler */}
            <line
              x1="-125"
              y1="0"
              x2="125"
              y2="0"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1.5"
            />
            <line
              x1="0"
              y1="-125"
              x2="0"
              y2="125"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1.5"
            />

            {/* Birim Çember (r = 100) */}
            <circle
              cx="0"
              cy="0"
              r="100"
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
              strokeDasharray="3 3"
            />

            {/* Nokta P(x, y) */}
            {(() => {
              const px = cosVal * 100;
              const py = -sinVal * 100;

              return (
                <g>
                  {/* Yatay dik kenar cos(theta) */}
                  <line
                    x1="0"
                    y1="0"
                    x2={px}
                    y2="0"
                    stroke="#38bdf8"
                    strokeWidth="3"
                  />
                  {/* Dikey dik kenar sin(theta) */}
                  <line
                    x1={px}
                    y1="0"
                    x2={px}
                    y2={py}
                    stroke="#f43f5e"
                    strokeWidth="3"
                  />
                  {/* Hipotenüs = 1 */}
                  <line
                    x1="0"
                    y1="0"
                    x2={px}
                    y2={py}
                    stroke="#facc15"
                    strokeWidth="2.5"
                  />

                  {/* P Noktası */}
                  <circle
                    cx={px}
                    cy={py}
                    r="5"
                    fill="#facc15"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />

                  {/* Açı Yayı */}
                  <path
                    d={`M 25 0 A 25 25 0 ${trigAngle > 180 ? 1 : 0} 0 ${Math.cos(trigRad) * 25} ${-Math.sin(trigRad) * 25}`}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2"
                  />
                </g>
              );
            })()}
          </svg>
          <div className="flex items-center gap-4 text-xs font-semibold mt-2">
            <span className="text-sky-400">■ cos(θ) = {cosVal.toFixed(3)}</span>
            <span className="text-rose-400">
              ■ sin(θ) = {sinVal.toFixed(3)}
            </span>
            <span className="text-amber-400">■ Hipotenüs = 1</span>
          </div>
        </div>

        {/* Sağ Kontrol Paneli */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/50 p-4 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Açıyı Değiştir (θ):
            </span>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-300">Açı θ = {trigAngle}°</span>
                <span className="text-slate-400">
                  ({((trigAngle * Math.PI) / 180).toFixed(2)} radyan)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={trigAngle}
                onChange={(e) => setTrigAngle(parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-sky-500/20 bg-sky-950/30 p-2.5">
                <span className="text-sky-300 font-bold">
                  cos²({trigAngle}°)
                </span>
                <div className="font-mono text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {cosSq.toFixed(4)}
                </div>
              </div>
              <div className="rounded-xl border border-rose-500/20 bg-rose-950/30 p-2.5">
                <span className="text-rose-300 font-bold">
                  sin²({trigAngle}°)
                </span>
                <div className="font-mono text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {sinSq.toFixed(4)}
                </div>
              </div>
            </div>
          </div>

          {/* Eşitlik Kartı */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-center">
            <div className="text-xs font-semibold text-emerald-300 mb-1">
              Özdeşlik Doğrulaması:
            </div>
            <div className="text-lg font-mono font-black text-slate-900 dark:text-white">
              sin²(θ) + cos²(θ) = 1
            </div>
            <div className="text-sm font-bold text-accent-success-ink mt-1">
              {sinSq.toFixed(3)} + {cosSq.toFixed(3)} ={' '}
              {(sinSq + cosSq).toFixed(3)}
            </div>
          </div>
        </div>
      </div>

      {/* Pedagojik Açıklama */}
      <div className="flex items-start gap-3 rounded-2xl border border-sky-500/25 bg-sky-500/10 p-4">
        <Lightbulb className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed text-slate-200">
          <strong className="text-sky-300">Birim Çember Sırrı:</strong> Birim
          çemberin yarıçapı daima <strong>1</strong> olduğu için, çember
          üzerindeki herhangi bir noktanın oluşturduğu dik üçgende Pisagor
          teoremi doğrudan <strong>cos²θ + sin²θ = 1² = 1</strong> verir. Bu
          eşitlik 360 derecenin tamamında ve negatif bölgelerde de karesi
          alındığı için daima 1 çıkar!
        </div>
      </div>
    </div>
  );
}
