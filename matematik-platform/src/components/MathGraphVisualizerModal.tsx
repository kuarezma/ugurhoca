'use client';

import { useState, useId, useMemo } from 'react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  TrendingUp,
  Activity,
  Compass,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

type MathGraphVisualizerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isLight?: boolean;
};

type VisualizerTab = 'linear' | 'quadratic' | 'trig';

export function MathGraphVisualizerModal({
  isOpen,
  onClose,
  isLight = false,
}: MathGraphVisualizerModalProps) {
  const titleId = useId();
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);
  const [activeTab, setActiveTab] = useState<VisualizerTab>('linear');

  // Doğrusal Fonksiyon (y = mx + b)
  const [m, setM] = useState<number>(1);
  const [b, setB] = useState<number>(0);

  // Parabol (y = ax^2 + bx + c)
  const [a, setA] = useState<number>(1);
  const [quadB, setQuadB] = useState<number>(0);
  const [c, setC] = useState<number>(-4);

  // Birim Çember (Açı theta - derece)
  const [angleDeg, setAngleDeg] = useState<number>(45);

  // Doğrusal Hesaplamalar
  const linearMetrics = useMemo(() => {
    const xIntercept = m !== 0 ? -b / m : null;
    const isIncreasing = m > 0;
    const isDecreasing = m < 0;
    const isConstant = m === 0;
    return { xIntercept, isIncreasing, isDecreasing, isConstant };
  }, [m, b]);

  // Parabol Hesaplamaları
  const quadMetrics = useMemo(() => {
    const safeA = a === 0 ? 0.001 : a;
    const r = -quadB / (2 * safeA);
    const k = safeA * r * r + quadB * r + c;
    const delta = quadB * quadB - 4 * safeA * c;
    let roots: number[] = [];
    if (delta > 0) {
      const root1 = (-quadB - Math.sqrt(delta)) / (2 * safeA);
      const root2 = (-quadB + Math.sqrt(delta)) / (2 * safeA);
      roots = [root1, root2].sort((x, y) => x - y);
    } else if (Math.abs(delta) < 0.0001) {
      roots = [r];
    }
    return { r, k, delta, roots, armsUp: safeA > 0 };
  }, [a, quadB, c]);

  // Trigonometrik Hesaplamalar
  const trigMetrics = useMemo(() => {
    const rad = (angleDeg * Math.PI) / 180;
    const sinVal = Math.sin(rad);
    const cosVal = Math.cos(rad);
    const tanVal =
      Math.abs(cosVal) < 0.0001
        ? null
        : Math.tan(rad);
    let region = 1;
    if (angleDeg > 90 && angleDeg <= 180) region = 2;
    else if (angleDeg > 180 && angleDeg <= 270) region = 3;
    else if (angleDeg > 270 && angleDeg <= 360) region = 4;
    return { rad, sinVal, cosVal, tanVal, region };
  }, [angleDeg]);

  if (!isOpen) return null;

  // SVG Koordinat Dönüşümleri (Genişlik: 320, Yükseklik: 320, Merkez: 160, 160)
  const svgSize = 320;
  const center = svgSize / 2;
  const scale = 14; // 1 birim = 14px (Aralık yaklaşık -10..+10)

  const toSvgX = (mathX: number) => center + mathX * scale;
  const toSvgY = (mathY: number) => center - mathY * scale;

  // Parabol SVG Çizgi Yolu (Path)
  const generateParabolaPath = () => {
    const points: string[] = [];
    for (let mathX = -11; mathX <= 11; mathX += 0.25) {
      const mathY = a * mathX * mathX + quadB * mathX + c;
      const sx = toSvgX(mathX);
      const sy = toSvgY(mathY);
      if (sx >= -20 && sx <= svgSize + 20 && sy >= -20 && sy <= svgSize + 20) {
        points.push(`${points.length === 0 ? 'M' : 'L'} ${sx.toFixed(1)} ${sy.toFixed(1)}`);
      }
    }
    return points.join(' ');
  };

  // Doğrusal Fonksiyon Çizgi Uçları
  const linearP1 = { x: toSvgX(-11), y: toSvgY(m * -11 + b) };
  const linearP2 = { x: toSvgX(11), y: toSvgY(m * 11 + b) };

  // Birim Çember Çizimleri
  const unitScale = 110; // Birim çember yarıçapı px
  const trigX = center + Math.cos(trigMetrics.rad) * unitScale;
  const trigY = center - Math.sin(trigMetrics.rad) * unitScale;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Arka Plan Karartması */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Gövdesi */}
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            role="dialog"
            aria-labelledby={titleId}
            aria-modal="true"
            className={`relative w-full max-w-4xl overflow-hidden rounded-3xl border shadow-2xl z-10 my-auto ${
              isLight
                ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-900/20'
                : 'bg-slate-900/95 border-white/10 text-white shadow-black/60'
            } backdrop-blur-xl`}
          >
            <ErrorBoundary
              fallback={({ reset }) => (
                <div className="flex flex-col items-center justify-center p-12 text-center text-slate-300 gap-4">
                  <p className="text-sm">Grafik görselleştirici yüklenirken bir hesaplama hatası oluştu.</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={reset}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-semibold text-xs transition"
                    >
                      Grafiği Sıfırla
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white font-semibold text-xs transition"
                    >
                      Kapat
                    </button>
                  </div>
                </div>
              )}
            >
            {/* Üst Başlık Şeridi */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shadow-indigo-500/30">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h2 id={titleId} className="text-base sm:text-lg font-bold font-display leading-tight">
                  İnteraktif Fonksiyon & Grafik Laboratuvarı
                </h2>
                <p className="text-xs text-slate-400">
                  Kaydırıcılarla katsayıları değiştir, grafiği ve kazanım analizini anında canlı incele.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Sekme Seçiciler */}
          <div className="flex border-b border-white/10 px-4 sm:px-6 bg-white/[0.02]">
            <button
              type="button"
              onClick={() => setActiveTab('linear')}
              className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs sm:text-sm font-semibold transition ${
                activeTab === 'linear'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Doğrusal Fonksiyon (y = mx + b)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('quadratic')}
              className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs sm:text-sm font-semibold transition ${
                activeTab === 'quadratic'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Parabol (y = ax² + bx + c)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('trig')}
              className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs sm:text-sm font-semibold transition ${
                activeTab === 'trig'
                  ? 'border-pink-500 text-pink-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Birim Çember (sin, cos, tan)</span>
            </button>
          </div>

          {/* Ana İçerik Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 sm:p-6 max-h-[75vh] overflow-y-auto">
            {/* Sol Sütun: Grafik Alanı (6 Kolon) */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center">
              <div
                className={`relative w-full aspect-square max-w-[340px] rounded-3xl border overflow-hidden p-2 flex items-center justify-center ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-white/10'
                }`}
              >
                <svg
                  viewBox={`0 0 ${svgSize} ${svgSize}`}
                  className="w-full h-full select-none"
                >
                  {/* Izgara Çizgileri */}
                  {Array.from({ length: 21 }, (_, i) => i - 10).map((tick) => (
                    <g key={tick}>
                      <line
                        x1={toSvgX(tick)}
                        y1={0}
                        x2={toSvgX(tick)}
                        y2={svgSize}
                        stroke={isLight ? '#e2e8f0' : '#1e293b'}
                        strokeWidth="1"
                      />
                      <line
                        x1={0}
                        y1={toSvgY(tick)}
                        x2={svgSize}
                        y2={toSvgY(tick)}
                        stroke={isLight ? '#e2e8f0' : '#1e293b'}
                        strokeWidth="1"
                      />
                    </g>
                  ))}

                  {/* Ana Eksenler */}
                  <line
                    x1={0}
                    y1={center}
                    x2={svgSize}
                    y2={center}
                    stroke={isLight ? '#64748b' : '#94a3b8'}
                    strokeWidth="1.5"
                  />
                  <line
                    x1={center}
                    y1={0}
                    x2={center}
                    y2={svgSize}
                    stroke={isLight ? '#64748b' : '#94a3b8'}
                    strokeWidth="1.5"
                  />

                  {/* Eksen İsimleri */}
                  <text x={svgSize - 12} y={center - 6} fill="#94a3b8" fontSize="11" fontWeight="bold">x</text>
                  <text x={center + 6} y={14} fill="#94a3b8" fontSize="11" fontWeight="bold">y</text>

                  {/* Sekme 1: Doğrusal Fonksiyon */}
                  {activeTab === 'linear' && (
                    <>
                      <line
                        x1={linearP1.x}
                        y1={linearP1.y}
                        x2={linearP2.x}
                        y2={linearP2.y}
                        stroke="#6366f1"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      {/* y-keseni noktası */}
                      <circle cx={toSvgX(0)} cy={toSvgY(b)} r="4.5" fill="#ec4899" />
                      {/* x-keseni noktası */}
                      {linearMetrics.xIntercept !== null && (
                        <circle cx={toSvgX(linearMetrics.xIntercept)} cy={toSvgY(0)} r="4.5" fill="#06b6d4" />
                      )}
                    </>
                  )}

                  {/* Sekme 2: Parabol */}
                  {activeTab === 'quadratic' && (
                    <>
                      <path
                        d={generateParabolaPath()}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      {/* Tepe Noktası */}
                      <circle
                        cx={toSvgX(quadMetrics.r)}
                        cy={toSvgY(quadMetrics.k)}
                        r="5"
                        fill="#f59e0b"
                      />
                      {/* Kök Noktaları */}
                      {quadMetrics.roots.map((root, idx) => (
                        <circle
                          key={idx}
                          cx={toSvgX(root)}
                          cy={toSvgY(0)}
                          r="4"
                          fill="#10b981"
                        />
                      ))}
                    </>
                  )}

                  {/* Sekme 3: Birim Çember */}
                  {activeTab === 'trig' && (
                    <>
                      {/* Çember */}
                      <circle
                        cx={center}
                        cy={center}
                        r={unitScale}
                        fill="none"
                        stroke={isLight ? '#cbd5e1' : '#334155'}
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                      {/* Yarıçap Doğrusu */}
                      <line
                        x1={center}
                        y1={center}
                        x2={trigX}
                        y2={trigY}
                        stroke="#ec4899"
                        strokeWidth="2.5"
                      />
                      {/* cos(x) Çizgisi (Mavi yatay) */}
                      <line
                        x1={center}
                        y1={center}
                        x2={trigX}
                        y2={center}
                        stroke="#3b82f6"
                        strokeWidth="3"
                      />
                      {/* sin(x) Çizgisi (Yeşil dikey) */}
                      <line
                        x1={trigX}
                        y1={center}
                        x2={trigX}
                        y2={trigY}
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeDasharray="3 3"
                      />
                      {/* Açı Yayı */}
                      <path
                        d={`M ${center + 24} ${center} A 24 24 0 ${angleDeg > 180 ? 1 : 0} 0 ${
                          center + Math.cos(trigMetrics.rad) * 24
                        } ${center - Math.sin(trigMetrics.rad) * 24}`}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2"
                      />
                      {/* Çember Üzerindeki Nokta P(cos, sin) */}
                      <circle cx={trigX} cy={trigY} r="5" fill="#f43f5e" />
                    </>
                  )}
                </svg>
              </div>

              {/* Canlı Denklem Gösterimi */}
              <div className="mt-3 text-center">
                <span className="text-xs text-slate-400 font-medium">Güncel Fonksiyon:</span>
                <div className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                  {activeTab === 'linear' && (
                    `y = ${m !== 1 && m !== -1 ? m : m === -1 ? '-' : ''}x ${b > 0 ? `+ ${b}` : b < 0 ? `- ${Math.abs(b)}` : ''}`
                  )}
                  {activeTab === 'quadratic' && (
                    `y = ${a !== 1 && a !== -1 ? a : a === -1 ? '-' : ''}x² ${quadB > 0 ? `+ ${quadB}x` : quadB < 0 ? `- ${Math.abs(quadB)}x` : ''} ${c > 0 ? `+ ${c}` : c < 0 ? `- ${Math.abs(c)}` : ''}`
                  )}
                  {activeTab === 'trig' && (
                    `θ = ${angleDeg}° (${(angleDeg / 180).toFixed(2)}π radyan)`
                  )}
                </div>
              </div>
            </div>

            {/* Sağ Sütun: Kontroller & Pedagojik Analiz (6 Kolon) */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
              {/* Kaydırıcı Kontrolleri */}
              <div className="space-y-4 rounded-2xl border border-white/10 p-4 bg-white/[0.02]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Katsayılar & Değişkenler</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'linear') { setM(1); setB(0); }
                      if (activeTab === 'quadratic') { setA(1); setQuadB(0); setC(-4); }
                      if (activeTab === 'trig') { setAngleDeg(45); }
                    }}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Sıfırla
                  </button>
                </div>

                {activeTab === 'linear' && (
                  <>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Eğim (m): <strong className="text-indigo-400">{m}</strong></span>
                        <span className="text-slate-400">Doğrunun dikliği/açısı</span>
                      </div>
                      <input
                        type="range"
                        min="-4"
                        max="4"
                        step="0.5"
                        value={m}
                        onChange={(e) => setM(parseFloat(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>y-Keseni (b): <strong className="text-pink-400">{b}</strong></span>
                        <span className="text-slate-400">Eksen kesim noktası</span>
                      </div>
                      <input
                        type="range"
                        min="-6"
                        max="6"
                        step="1"
                        value={b}
                        onChange={(e) => setB(parseInt(e.target.value))}
                        className="w-full accent-pink-500 cursor-pointer"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'quadratic' && (
                  <>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Baş Katsayı (a): <strong className="text-purple-400">{a}</strong></span>
                        <span className="text-slate-400">Kolların yönü ve darlığı</span>
                      </div>
                      <input
                        type="range"
                        min="-2"
                        max="2"
                        step="0.25"
                        value={a}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setA(val === 0 ? 0.25 : val);
                        }}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>x Katsayısı (b): <strong className="text-amber-400">{quadB}</strong></span>
                        <span className="text-slate-400">Simetri ekseni kayması</span>
                      </div>
                      <input
                        type="range"
                        min="-4"
                        max="4"
                        step="0.5"
                        value={quadB}
                        onChange={(e) => setQuadB(parseFloat(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Sabit Terim (c): <strong className="text-emerald-400">{c}</strong></span>
                        <span className="text-slate-400">y-keseni</span>
                      </div>
                      <input
                        type="range"
                        min="-6"
                        max="6"
                        step="1"
                        value={c}
                        onChange={(e) => setC(parseInt(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'trig' && (
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Açı (θ): <strong className="text-pink-400">{angleDeg}°</strong></span>
                      <span className="text-slate-400">Dönme açısı</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="5"
                      value={angleDeg}
                      onChange={(e) => setAngleDeg(parseInt(e.target.value))}
                      className="w-full accent-pink-500 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Hızlı Şablonlar / Örnekler */}
              <div>
                <span className="text-xs font-bold text-slate-400 mb-2 block">Örnek Sınav Kalıpları:</span>
                <div className="flex flex-wrap gap-2">
                  {activeTab === 'linear' && (
                    <>
                      <button
                        type="button"
                        onClick={() => { setM(2); setB(-1); }}
                        className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium hover:bg-white/10 transition"
                      >
                        y = 2x - 1 (Artan)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setM(-1); setB(3); }}
                        className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium hover:bg-white/10 transition"
                      >
                        y = -x + 3 (Azalan)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setM(0); setB(4); }}
                        className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium hover:bg-white/10 transition"
                      >
                        y = 4 (Sabit Fonk.)
                      </button>
                    </>
                  )}

                  {activeTab === 'quadratic' && (
                    <>
                      <button
                        type="button"
                        onClick={() => { setA(1); setQuadB(0); setC(-4); }}
                        className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium hover:bg-white/10 transition"
                      >
                        y = x² - 4 (İki Reel Kök)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setA(-1); setQuadB(2); setC(3); }}
                        className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium hover:bg-white/10 transition"
                      >
                        y = -x² + 2x + 3 (Kollar Aşağı)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setA(1); setQuadB(-4); setC(4); }}
                        className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium hover:bg-white/10 transition"
                      >
                        y = (x-2)² (Teğet / Çakışık)
                      </button>
                    </>
                  )}

                  {activeTab === 'trig' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setAngleDeg(30)}
                        className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium hover:bg-white/10 transition"
                      >
                        30° (π/6)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAngleDeg(45)}
                        className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium hover:bg-white/10 transition"
                      >
                        45° (π/4)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAngleDeg(60)}
                        className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium hover:bg-white/10 transition"
                      >
                        60° (π/3)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAngleDeg(120)}
                        className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium hover:bg-white/10 transition"
                      >
                        120° (2. Bölge)
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Pedagojik Kazanım Özeti Kartı */}
              <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                  <Info className="h-4 w-4 shrink-0" />
                  <span>Kritik Sınav Notları & Çıkarımlar:</span>
                </div>

                {activeTab === 'linear' && (
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                    <li>
                      <strong>Eğim Durumu:</strong> {linearMetrics.isIncreasing ? 'm > 0 olduğundan fonksiyon daima ARTANDIR.' : linearMetrics.isDecreasing ? 'm < 0 olduğundan fonksiyon daima AZALANDIR.' : 'm = 0 olduğundan x eksenine PARALEL sabit doğrudur.'}
                    </li>
                    <li>
                      <strong>y-Eksenini Kestiği Yer:</strong> (0, {b}) noktasıdır.
                    </li>
                    <li>
                      <strong>x-Eksenini Kestiği Yer:</strong> {linearMetrics.xIntercept !== null ? `(${linearMetrics.xIntercept.toFixed(2)}, 0) noktasıdır.` : 'x eksenini kesmez.'}
                    </li>
                  </ul>
                )}

                {activeTab === 'quadratic' && (
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                    <li>
                      <strong>Tepe Noktası T(r, k):</strong> T({quadMetrics.r.toFixed(2)}, {quadMetrics.k.toFixed(2)}) noktasıdır. Parabolün en {quadMetrics.armsUp ? 'küçük (minimum)' : 'büyük (maksimum)'} değeri k = {quadMetrics.k.toFixed(2)} olur.
                    </li>
                    <li>
                      <strong>Diskriminant (Δ = b² - 4ac):</strong> Δ = {quadMetrics.delta.toFixed(2)} &rarr; {quadMetrics.delta > 0 ? 'Δ > 0 olduğu için parabol x eksenini 2 farklı noktada keser.' : quadMetrics.delta === 0 ? 'Δ = 0 olduğu için parabol x eksenine teğettir (çift katlı kök).' : 'Δ < 0 olduğu için parabol x eksenini kesmez (reel kök yoktur).'}
                    </li>
                    {quadMetrics.roots.length > 0 && (
                      <li>
                        <strong>Kökler:</strong> x₁ = {quadMetrics.roots[0].toFixed(2)}{quadMetrics.roots[1] !== undefined ? `, x₂ = ${quadMetrics.roots[1].toFixed(2)}` : ''}
                      </li>
                    )}
                  </ul>
                )}

                {activeTab === 'trig' && (
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                    <li>
                      <strong>Bölge:</strong> {trigMetrics.region}. Bölge
                    </li>
                    <li>
                      <strong>cos({angleDeg}°):</strong> {trigMetrics.cosVal.toFixed(3)} (Yatay mavi uzunluk)
                    </li>
                    <li>
                      <strong>sin({angleDeg}°):</strong> {trigMetrics.sinVal.toFixed(3)} (Dikey yeşil uzunluk)
                    </li>
                    <li>
                      <strong>tan({angleDeg}°):</strong> {trigMetrics.tanVal !== null ? trigMetrics.tanVal.toFixed(3) : 'Tanımsız (90°/270°)'}
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Alt Kapatma Çubuğu */}
          <div className="flex justify-end border-t border-white/10 px-5 py-3.5 sm:px-6 bg-white/[0.02]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 active:scale-95"
            >
              Anladım, Kapat
            </button>
            </div>
            </ErrorBoundary>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
