'use client';

import React, { useState, useRef } from 'react';
import {
  Compass,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Sparkles,
  X,
  Eye,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';

interface InteractiveMathLabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type LabMode = 'triangle' | 'slope';

export function InteractiveMathLabModal({ isOpen, onClose }: InteractiveMathLabModalProps) {
  const containerRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);
  const [activeMode, setActiveMode] = useState<LabMode>('triangle');
  const [currentStep, setCurrentStep] = useState<'predict' | 'explore' | 'explain'>('predict');
  const [prediction, setPrediction] = useState<string | null>(null);
  const [showProofLines, setShowProofLines] = useState(false);

  // Üçgen Köşeleri (Kanvas koordinatları 0..500 x 0..350)
  const [pointA, setPointA] = useState({ x: 250, y: 80 });
  const [pointB, setPointB] = useState({ x: 100, y: 280 });
  const [pointC, setPointC] = useState({ x: 400, y: 280 });

  // Eğim Noktaları
  const [slopeP1, setSlopeP1] = useState({ x: 120, y: 250 });
  const [slopeP2, setSlopeP2] = useState({ x: 380, y: 110 });

  const draggingPointRef = useRef<'A' | 'B' | 'C' | 'P1' | 'P2' | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  if (!isOpen) return null;

  // Kenar uzunlukları
  const dist = (p1: { x: number; y: number }, p2: { x: number; y: number }) =>
    Math.hypot(p2.x - p1.x, p2.y - p1.y);

  const a = dist(pointB, pointC); // BC kenarı
  const b = dist(pointA, pointC); // AC kenarı
  const c = dist(pointA, pointB); // AB kenarı

  // Kosinüs teoremi ile açı hesapları (derece)
  const calcAngle = (opp: number, adj1: number, adj2: number) => {
    if (adj1 * adj2 === 0) return 0;
    const cosVal = (adj1 ** 2 + adj2 ** 2 - opp ** 2) / (2 * adj1 * adj2);
    const clamped = Math.max(-1, Math.min(1, cosVal));
    return Math.round((Math.acos(clamped) * 180) / Math.PI);
  };

  const angleA = calcAngle(a, b, c);
  const angleB = calcAngle(b, a, c);
  const angleC = Math.max(0, 180 - (angleA + angleB)); // Toplam daima 180

  // Üçgen Tipi Teşhisi
  let triangleType = 'Çeşitkenar';
  if (Math.abs(angleA - 90) <= 2 || Math.abs(angleB - 90) <= 2 || Math.abs(angleC - 90) <= 2) {
    triangleType = 'Dik Açılı Üçgen';
  } else if (angleA > 90 || angleB > 90 || angleC > 90) {
    triangleType = 'Geniş Açılı Üçgen';
  } else if (Math.abs(angleA - angleB) <= 2 || Math.abs(angleB - angleC) <= 2 || Math.abs(angleA - angleC) <= 2) {
    triangleType = 'İkizkenar Üçgen';
  } else {
    triangleType = 'Dar Açılı Üçgen';
  }

  // Eğim hesabı
  const dx = (slopeP2.x - slopeP1.x) / 30;
  const dy = -(slopeP2.y - slopeP1.y) / 30; // SVG Y ters
  const slope = dx !== 0 ? (dy / dx).toFixed(2) : 'Tanımsız (Dikey)';

  // Sürükleme Mantığı
  const handlePointerDown = (point: 'A' | 'B' | 'C' | 'P1' | 'P2') => {
    draggingPointRef.current = point;
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingPointRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(20, Math.min(480, e.clientX - rect.left));
    const y = Math.max(20, Math.min(330, e.clientY - rect.top));

    if (draggingPointRef.current === 'A') setPointA({ x, y });
    if (draggingPointRef.current === 'B') setPointB({ x, y });
    if (draggingPointRef.current === 'C') setPointC({ x, y });
    if (draggingPointRef.current === 'P1') setSlopeP1({ x, y });
    if (draggingPointRef.current === 'P2') setSlopeP2({ x, y });
  };

  const handlePointerUp = () => {
    draggingPointRef.current = null;
  };

  const handleResetTriangle = () => {
    setPointA({ x: 250, y: 80 });
    setPointB({ x: 100, y: 280 });
    setPointC({ x: 400, y: 280 });
    setShowProofLines(false);
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/85 p-3 sm:p-5 backdrop-blur-md overflow-y-auto">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        aria-labelledby="math-lab-title"
        className="relative flex flex-col w-full max-w-4xl max-h-[94vh] bg-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden text-white outline-none"
      >
        {/* Başlık */}
        <div className="flex flex-wrap items-center justify-between border-b border-white/10 bg-slate-950/80 px-6 py-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Etkileşimli Keşif Laboratuvarı
                </span>
              </div>
              <h2 id="math-lab-title" className="font-display text-base sm:text-lg font-bold text-white mt-0.5">
                Matematiği Dokunarak Keşfet: Tahmin Et → Sürükle → Gör
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mod Seçimi */}
            <div className="flex rounded-xl bg-slate-950 border border-white/10 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setActiveMode('triangle');
                  setCurrentStep('predict');
                }}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeMode === 'triangle' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Üçgen Açıları
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveMode('slope');
                  setCurrentStep('predict');
                }}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeMode === 'slope' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Doğrunun Eğimi
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition ml-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 3 Aşamalı Pedagojik Adım Navigasyonu */}
        <div className="flex border-b border-white/10 bg-slate-950/60 px-6 py-2.5 gap-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setCurrentStep('predict')}
            className={`flex items-center gap-1.5 transition ${
              currentStep === 'predict' ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="w-5 h-5 rounded-full flex items-center justify-center bg-white/10 text-[10px]">1</span>
            <span>1. Tahmin Et</span>
          </button>
          <span className="text-slate-700">→</span>
          <button
            type="button"
            onClick={() => setCurrentStep('explore')}
            className={`flex items-center gap-1.5 transition ${
              currentStep === 'explore' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="w-5 h-5 rounded-full flex items-center justify-center bg-white/10 text-[10px]">2</span>
            <span>2. Sürükle & Dene</span>
          </button>
          <span className="text-slate-700">→</span>
          <button
            type="button"
            onClick={() => setCurrentStep('explain')}
            className={`flex items-center gap-1.5 transition ${
              currentStep === 'explain' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="w-5 h-5 rounded-full flex items-center justify-center bg-white/10 text-[10px]">3</span>
            <span>3. İspat & Açıklama</span>
          </button>
        </div>

        {/* Ana Laboratuvar Alanı */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sol Panel: İnteraktif SVG Kanvas (7 Kolon) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full relative rounded-2xl bg-slate-950 border border-white/15 overflow-hidden shadow-inner touch-none">
              <svg
                ref={svgRef}
                viewBox="0 0 500 350"
                className="w-full h-auto cursor-crosshair select-none"
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                {/* Izgara Çizgileri */}
                <defs>
                  <pattern id="lab-grid" width="25" height="25" patternUnits="userSpaceOnUse">
                    <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="500" height="350" fill="url(#lab-grid)" />

                {activeMode === 'triangle' ? (
                  /* Üçgen Laboratuvarı Çizimleri */
                  <>
                    {/* İspat Modu Paralel Doğrusu */}
                    {showProofLines && (
                      <g stroke="rgba(245, 158, 11, 0.5)" strokeDasharray="5,5" strokeWidth="2">
                        <line x1="20" y1={pointA.y} x2="480" y2={pointA.y} />
                        <text x="440" y={pointA.y - 8} fill="#f59e0b" fontSize="11" fontWeight="bold">
                          d // BC
                        </text>
                      </g>
                    )}

                    {/* Üçgen Dolgusu ve Kenarları */}
                    <polygon
                      points={`${pointA.x},${pointA.y} ${pointB.x},${pointB.y} ${pointC.x},${pointC.y}`}
                      fill="rgba(99, 102, 241, 0.18)"
                      stroke="#818cf8"
                      strokeWidth="3"
                    />

                    {/* Köşe A Noktası */}
                    <g
                      className="cursor-grab active:cursor-grabbing"
                      onPointerDown={() => handlePointerDown('A')}
                    >
                      <circle cx={pointA.x} cy={pointA.y} r="14" fill="#6366f1" stroke="#ffffff" strokeWidth="2.5" />
                      <text x={pointA.x} y={pointA.y - 18} fill="#a5b4fc" fontSize="13" fontWeight="bold" textAnchor="middle">
                        A ({angleA}°)
                      </text>
                    </g>

                    {/* Köşe B Noktası */}
                    <g
                      className="cursor-grab active:cursor-grabbing"
                      onPointerDown={() => handlePointerDown('B')}
                    >
                      <circle cx={pointB.x} cy={pointB.y} r="14" fill="#ec4899" stroke="#ffffff" strokeWidth="2.5" />
                      <text x={pointB.x - 20} y={pointB.y + 22} fill="#f472b6" fontSize="13" fontWeight="bold" textAnchor="middle">
                        B ({angleB}°)
                      </text>
                    </g>

                    {/* Köşe C Noktası */}
                    <g
                      className="cursor-grab active:cursor-grabbing"
                      onPointerDown={() => handlePointerDown('C')}
                    >
                      <circle cx={pointC.x} cy={pointC.y} r="14" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
                      <text x={pointC.x + 20} y={pointC.y + 22} fill="#6ee7b7" fontSize="13" fontWeight="bold" textAnchor="middle">
                        C ({angleC}°)
                      </text>
                    </g>
                  </>
                ) : (
                  /* Eğim Laboratuvarı Çizimleri */
                  <>
                    {/* Eksenler */}
                    <line x1="250" y1="20" x2="250" y2="330" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                    <line x1="20" y1="175" x2="480" y2="175" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

                    {/* Dik Değişim Üçgeni (Δx, Δy) */}
                    <polygon
                      points={`${slopeP1.x},${slopeP1.y} ${slopeP2.x},${slopeP1.y} ${slopeP2.x},${slopeP2.y}`}
                      fill="rgba(245, 158, 11, 0.15)"
                      stroke="#f59e0b"
                      strokeDasharray="4,4"
                      strokeWidth="1.5"
                    />

                    {/* Doğru Parçası */}
                    <line
                      x1={slopeP1.x}
                      y1={slopeP1.y}
                      x2={slopeP2.x}
                      y2={slopeP2.y}
                      stroke="#6366f1"
                      strokeWidth="4"
                    />

                    {/* P1 Handle */}
                    <g
                      className="cursor-grab active:cursor-grabbing"
                      onPointerDown={() => handlePointerDown('P1')}
                    >
                      <circle cx={slopeP1.x} cy={slopeP1.y} r="12" fill="#ec4899" stroke="#fff" strokeWidth="2.5" />
                      <text x={slopeP1.x} y={slopeP1.y - 16} fill="#f472b6" fontSize="12" fontWeight="bold" textAnchor="middle">
                        P₁
                      </text>
                    </g>

                    {/* P2 Handle */}
                    <g
                      className="cursor-grab active:cursor-grabbing"
                      onPointerDown={() => handlePointerDown('P2')}
                    >
                      <circle cx={slopeP2.x} cy={slopeP2.y} r="12" fill="#10b981" stroke="#fff" strokeWidth="2.5" />
                      <text x={slopeP2.x} y={slopeP2.y - 16} fill="#6ee7b7" fontSize="12" fontWeight="bold" textAnchor="middle">
                        P₂
                      </text>
                    </g>
                  </>
                )}
              </svg>

              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-slate-400 pointer-events-none">
                <span>💡 Renkli noktaları tut ve sürükle!</span>
                <span className="font-mono">{activeMode === 'triangle' ? `${triangleType}` : `Eğim: ${slope}`}</span>
              </div>
            </div>

            {/* Canlı İstatistik Çubuğu */}
            {activeMode === 'triangle' ? (
              <div className="w-full mt-3 grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-950/80 border border-indigo-500/30">
                  <span className="text-slate-400 block text-[10px]">A Açısı</span>
                  <span className="font-bold text-indigo-300">{angleA}°</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-pink-500/30">
                  <span className="text-slate-400 block text-[10px]">B Açısı</span>
                  <span className="font-bold text-pink-300">{angleB}°</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-emerald-500/30">
                  <span className="text-slate-400 block text-[10px]">C Açısı</span>
                  <span className="font-bold text-emerald-300">{angleC}°</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-amber-500/30">
                  <span className="text-slate-400 block text-[10px]">Toplam</span>
                  <span className="font-black text-amber-300">180°</span>
                </div>
              </div>
            ) : (
              <div className="w-full mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-950/80 border border-amber-500/30">
                  <span className="text-slate-400 block text-[10px]">Dikey Değişim (Δy)</span>
                  <span className="font-bold text-amber-300">{dy.toFixed(1)}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-cyan-500/30">
                  <span className="text-slate-400 block text-[10px]">Yatay Değişim (Δx)</span>
                  <span className="font-bold text-cyan-300">{dx.toFixed(1)}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-indigo-500/30">
                  <span className="text-slate-400 block text-[10px]">Eğim (m = Δy/Δx)</span>
                  <span className="font-black text-indigo-300">{slope}</span>
                </div>
              </div>
            )}
          </div>

          {/* Sağ Panel: Pedagojik Akış & Keşif Kartları (5 Kolon) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            {currentStep === 'predict' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3.5">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <HelpCircle className="w-4 h-4" />
                  <span>1. Aşama: Hipotez Kur & Tahmin Et</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {activeMode === 'triangle'
                    ? 'A köşesini olabildiğince yukarı çekip üçgeni uzatırsan, üçgenin iç açıları toplamı nasıl değişir?'
                    : 'Doğruyu sağa doğru yatay hale getirirsen (düz bir zemin gibi), eğim değeri neye yaklaşır?'}
                </p>

                <div className="space-y-2 pt-1">
                  {(activeMode === 'triangle'
                    ? [
                        'Açıların toplamı 180° kalmaya devam eder.',
                        'Üçgen büyüdüğü için toplam 180°den büyük olur.',
                        'Tepe açısı küçüldüğü için toplam azalır.',
                      ]
                    : ['Eğim 0 (sıfır) olur.', 'Eğim sonsuz olur.', 'Eğim negatif olur.']
                  ).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setPrediction(option)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition ${
                        prediction === option
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-950/60 border-white/10 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {prediction && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep('explore')}
                    className="w-full mt-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <span>Tahmini Test Etmek İçin Sürükle</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {currentStep === 'explore' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 space-y-3.5">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>2. Aşama: Serbest Deney & Gözlem</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  Kanvas üzerindeki renkli noktaları istediğin yöne sürükle.
                  Açılar anlık değişirken toplamın hiçbir zaman değişmediğini fark ettin mi?
                </p>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Senin Tahminin:</span>
                  </div>
                  <div className="font-semibold text-amber-300">{prediction || 'Tahmin yapılmadı'}</div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleResetTriangle}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Konumu Sıfırla</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep('explain');
                      setShowProofLines(true);
                    }}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>İspatı Açıkla</span>
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'explain' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-3.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>3. Aşama: Matematiksel İspat & Kavrayış</span>
                </div>

                {activeMode === 'triangle' ? (
                  <div className="text-xs text-slate-200 space-y-2.5 leading-relaxed">
                    <p>
                      <strong>Öklid'in İspatı (Z Kuralı):</strong> A köşesinden [BC] tabanına paralel bir doğru
                      çizdiğimizde, iç ters açılardan dolayı B açısı tepeye, C açısı da diğer yana taşınır.
                    </p>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-emerald-300 font-mono text-center">
                      A + B + C = Doğru Açı = 180°
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Bu kural evrendeki tüm düzlemsel üçgenler için (ne kadar uzatırsan uzat) istisnasız geçerlidir!
                    </p>
                  </div>
                ) : (
                  <div className="text-xs text-slate-200 space-y-2.5 leading-relaxed">
                    <p>
                      <strong>Eğim Analizi:</strong> Eğim, dikeydeki değişimin yataydaki değişime oranıdır. Doğru
                      sağa yatıkken eğim pozitif (+), sola yatıkken negatif (-), tamamen yatayken sıfırdır (0).
                    </p>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-emerald-300 font-mono text-center">
                      m = (y₂ - y₁) / (x₂ - x₁)
                    </div>
                  </div>
                )}

                <div className="pt-2 flex gap-2">
                  {activeMode === 'triangle' && (
                    <button
                      type="button"
                      onClick={() => setShowProofLines(!showProofLines)}
                      className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1.5 transition"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>{showProofLines ? 'Paralel Çizgiyi Gizle' : 'Paralel Çizgiyi Göster'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep('predict');
                      setPrediction(null);
                    }}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Yeni Deney</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
