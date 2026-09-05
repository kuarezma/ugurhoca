'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp,
  Award,
  Calendar,
  BarChart2,
  ChevronRight,
  Flame,
} from 'lucide-react';
import {
  getSavedExamTrials,
  type SavedExamTrial,
  type ExamHistoryType,
} from '@/lib/examHistoryStorage';

export type ExamTrendChartProps = {
  trials?: SavedExamTrial[];
  examType?: ExamHistoryType;
  targetNet?: number;
  isLight?: boolean;
  className?: string;
  onOpenCalculator?: () => void;
};

type ViewMode = 'all' | 'math' | 'total';

export default function ExamTrendChart({
  trials: propTrials,
  examType,
  targetNet,
  isLight = false,
  className = '',
  onOpenCalculator,
}: ExamTrendChartProps) {
  const [localTrials, setLocalTrials] = useState<SavedExamTrial[]>([]);
  const [selectedTrialId, setSelectedTrialId] = useState<string | null>(null);
  const [hoveredTrialId, setHoveredTrialId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('all');

  const loadTrials = useCallback(() => {
    setLocalTrials(getSavedExamTrials(examType));
  }, [examType]);

  useEffect(() => {
    if (!propTrials) {
      loadTrials();
      const handler = () => loadTrials();
      window.addEventListener('ugurhoca:exam-trials-updated', handler);
      return () => window.removeEventListener('ugurhoca:exam-trials-updated', handler);
    }
  }, [propTrials, loadTrials]);

  const rawTrials = propTrials ?? localTrials;

  // Kronolojik sıralama (eskiden yeniye)
  const sortedTrials = useMemo(() => {
    return [...rawTrials].sort((a, b) => {
      const dateDiff = a.date.localeCompare(b.date);
      if (dateDiff !== 0) return dateDiff;
      return a.id.localeCompare(b.id);
    });
  }, [rawTrials]);

  // Zirve ve istatistikler
  const stats = useMemo(() => {
    if (sortedTrials.length === 0) {
      return {
        peakMath: 0,
        peakTotal: 0,
        latestMath: 0,
        latestTotal: 0,
        mathGrowth: 0,
        totalGrowth: 0,
        avgMath: 0,
      };
    }
    const mathNets = sortedTrials.map((t) => t.mathNet);
    const totalNets = sortedTrials.map((t) => t.totalNet);

    const peakMath = Math.max(...mathNets);
    const peakTotal = Math.max(...totalNets);
    const first = sortedTrials[0];
    const latest = sortedTrials[sortedTrials.length - 1];

    const mathGrowth = Number((latest.mathNet - first.mathNet).toFixed(2));
    const totalGrowth = Number((latest.totalNet - first.totalNet).toFixed(2));
    const sumMath = mathNets.reduce((acc, v) => acc + v, 0);
    const avgMath = Number((sumMath / mathNets.length).toFixed(1));

    return {
      peakMath,
      peakTotal,
      latestMath: latest.mathNet,
      latestTotal: latest.totalNet,
      mathGrowth,
      totalGrowth,
      avgMath,
    };
  }, [sortedTrials]);

  // SVG Ölçüleri ve Koordinat Hesaplama
  const width = 640;
  const height = 240;
  const padLeft = 45;
  const padRight = 35;
  const padTop = 30;
  const padBottom = 45;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const yMax = useMemo(() => {
    if (sortedTrials.length === 0) return 40;
    const maxVal = Math.max(
      ...sortedTrials.map((t) => Math.max(t.mathNet, t.totalNet)),
      targetNet || 0,
      10
    );
    return Math.ceil(maxVal / 10) * 10;
  }, [sortedTrials, targetNet]);

  const points = useMemo(() => {
    if (sortedTrials.length < 2) return [];

    return sortedTrials.map((trial, idx) => {
      const x = padLeft + (idx / (sortedTrials.length - 1)) * plotWidth;
      const mathY = padTop + plotHeight - (Math.max(0, trial.mathNet) / yMax) * plotHeight;
      const totalY = padTop + plotHeight - (Math.max(0, trial.totalNet) / yMax) * plotHeight;
      return {
        trial,
        idx,
        x,
        mathY,
        totalY,
      };
    });
  }, [sortedTrials, plotWidth, plotHeight, yMax]);

  // Çizgi Polylines
  const mathPolyline = useMemo(() => {
    return points.map((p) => `${p.x.toFixed(1)},${p.mathY.toFixed(1)}`).join(' ');
  }, [points]);

  const totalPolyline = useMemo(() => {
    return points.map((p) => `${p.x.toFixed(1)},${p.totalY.toFixed(1)}`).join(' ');
  }, [points]);

  const totalAreaPath = useMemo(() => {
    if (points.length < 2) return '';
    const firstX = points[0].x.toFixed(1);
    const lastX = points[points.length - 1].x.toFixed(1);
    const bottomY = (padTop + plotHeight).toFixed(1);
    return `M ${firstX},${bottomY} L ${totalPolyline.replace(/ /g, ' L ')} L ${lastX},${bottomY} Z`;
  }, [points, totalPolyline, padTop, plotHeight]);

  const activeTrialId = hoveredTrialId || selectedTrialId || (sortedTrials.length > 0 ? sortedTrials[sortedTrials.length - 1].id : null);
  const activePoint = points.find((p) => p.trial.id === activeTrialId);

  // Y Eksen basamakları
  const yTicks = useMemo(() => {
    const step = yMax <= 40 ? 10 : 20;
    const ticks: number[] = [];
    for (let val = 0; val <= yMax; val += step) {
      ticks.push(val);
    }
    return ticks;
  }, [yMax]);

  return (
    <div
      className={`rounded-3xl border transition-all ${
        isLight
          ? 'border-slate-200 bg-white text-slate-900 shadow-sm'
          : 'border-white/10 bg-slate-900/90 text-white shadow-2xl backdrop-blur-md'
      } p-4 sm:p-6 ${className}`}
      data-testid="exam-trend-chart"
    >
      {/* Başlık ve Görünüm Seçimi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 mb-4 border-slate-200/80 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 shadow-inner">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold">
                Deneme Sınavı Net Gelişim Çizelgesi
              </h3>
              {sortedTrials.length > 0 && (
                <span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[11px] font-bold text-indigo-400 border border-indigo-500/30">
                  {sortedTrials.length} Deneme
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              LGS ve YKS denemelerinde netlerinizin zamana bağlı gelişim eğrisi
            </p>
          </div>
        </div>

        {/* Görünüm Filtresi */}
        {sortedTrials.length >= 2 && (
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-950/60 p-1 border border-slate-200 dark:border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                viewMode === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tümü
            </button>
            <button
              type="button"
              onClick={() => setViewMode('math')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                viewMode === 'math'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Matematik
            </button>
            <button
              type="button"
              onClick={() => setViewMode('total')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                viewMode === 'total'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Toplam Net
            </button>
          </div>
        )}
      </div>

      {/* Yetersiz Veri Durumu (< 2 Deneme) */}
      {sortedTrials.length < 2 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/15 bg-slate-50/50 dark:bg-slate-950/30 p-8 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
            <BarChart2 className="h-6 w-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {sortedTrials.length === 0
                ? 'Henüz Kayıtlı Deneme Sınavı Yok'
                : 'Net Eğrisi İçin En Az 2 Deneme Gerekiyor'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {sortedTrials.length === 0
                ? 'Deneme sınavı puan hesaplayıcıyı kullanarak ilk sonucunu kaydettiğinde net gelişim takibin başlayacak.'
                : `Şu an 1 deneme kayıtlı (${sortedTrials[0].title} - Mat: ${sortedTrials[0].mathNet} Net). Bir deneme daha eklediğinde gelişim eğrin burada belirecek.`}
            </p>
          </div>
          {onOpenCalculator && (
            <button
              type="button"
              onClick={onOpenCalculator}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-sm"
            >
              <span>Deneme Puanı Hesapla & Kaydet</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* İstatistik Göstergeleri */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-950/40 p-3">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Son Mat Neti</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {stats.latestMath}
                </span>
                <span className="text-[10px] text-slate-400">Net</span>
                {stats.mathGrowth !== 0 && (
                  <span
                    className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      stats.mathGrowth > 0
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-300'
                    }`}
                  >
                    {stats.mathGrowth > 0 ? `+${stats.mathGrowth}` : stats.mathGrowth}
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-950/40 p-3">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Zirve Mat Neti</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-amber-500 font-mono">
                  {stats.peakMath}
                </span>
                <span className="text-[10px] text-slate-400">Net</span>
                <Award className="ml-auto h-4 w-4 text-amber-500" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-950/40 p-3">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Son Toplam Net</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400 font-mono">
                  {stats.latestTotal}
                </span>
                <span className="text-[10px] text-slate-400">Net</span>
                {stats.totalGrowth !== 0 && (
                  <span
                    className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      stats.totalGrowth > 0
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-300'
                    }`}
                  >
                    {stats.totalGrowth > 0 ? `+${stats.totalGrowth}` : stats.totalGrowth}
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-950/40 p-3">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Ort. Matematik</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                  {stats.avgMath}
                </span>
                <span className="text-[10px] text-slate-400">Net</span>
                <Flame className="ml-auto h-4 w-4 text-cyan-500" />
              </div>
            </div>
          </div>

          {/* SVG Çizgi Grafiği */}
          <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-950/50 p-2 sm:p-4">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto select-none"
              style={{ maxHeight: '280px' }}
            >
              <defs>
                <linearGradient id="totalAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9333ea" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#9333ea" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="mathLineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>

              {/* Yatay Kılavuz Çizgileri ve Değerler */}
              {yTicks.map((val) => {
                const y = padTop + plotHeight - (val / yMax) * plotHeight;
                return (
                  <g key={`ytick-${val}`}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={width - padRight}
                      y2={y}
                      stroke={isLight ? '#e2e8f0' : '#334155'}
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 3.5}
                      textAnchor="end"
                      fontSize="10"
                      fill={isLight ? '#64748b' : '#94a3b8'}
                      className="font-mono font-medium select-none"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Hedef Net Referans Çizgisi (varsa) */}
              {targetNet && targetNet <= yMax && (
                <g>
                  {(() => {
                    const targetY = padTop + plotHeight - (targetNet / yMax) * plotHeight;
                    return (
                      <>
                        <line
                          x1={padLeft}
                          y1={targetY}
                          x2={width - padRight}
                          y2={targetY}
                          stroke="#f59e0b"
                          strokeDasharray="6 3"
                          strokeWidth="1.5"
                        />
                        <text
                          x={width - padRight}
                          y={targetY - 5}
                          textAnchor="end"
                          fontSize="10"
                          fill="#f59e0b"
                          className="font-bold font-mono"
                        >
                          Hedef: {targetNet} Net
                        </text>
                      </>
                    );
                  })()}
                </g>
              )}

              {/* Toplam Net Alanı ve Çizgisi */}
              {(viewMode === 'all' || viewMode === 'total') && (
                <>
                  <path d={totalAreaPath} fill="url(#totalAreaGrad)" />
                  <polyline
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={totalPolyline}
                  />
                </>
              )}

              {/* Matematik Neti Çizgisi */}
              {(viewMode === 'all' || viewMode === 'math') && (
                <polyline
                  fill="none"
                  stroke="url(#mathLineGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={mathPolyline}
                />
              )}

              {/* Düşey İnce Kılavuz Çizgileri & Tarih Etiketleri */}
              {points.map((p) => {
                const dateParts = p.trial.date.split('-');
                const shortDate = `${dateParts[2]}/${dateParts[1]}`;
                const isSelected = p.trial.id === activeTrialId;

                return (
                  <g key={`pt-${p.trial.id}`}>
                    {isSelected && (
                      <line
                        x1={p.x}
                        y1={padTop}
                        x2={p.x}
                        y2={padTop + plotHeight}
                        stroke={isLight ? '#cbd5e1' : '#475569'}
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                    )}

                    {/* Tarih Etiketi */}
                    <text
                      x={p.x}
                      y={padTop + plotHeight + 18}
                      textAnchor="middle"
                      fontSize="9"
                      fill={isSelected ? (isLight ? '#0f172a' : '#ffffff') : isLight ? '#64748b' : '#94a3b8'}
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      className="font-mono select-none"
                    >
                      {shortDate}
                    </text>

                    {/* Toplam Net Noktası */}
                    {(viewMode === 'all' || viewMode === 'total') && (
                      <circle
                        cx={p.x}
                        cy={p.totalY}
                        r={isSelected ? 5.5 : 3.5}
                        fill="#a855f7"
                        stroke={isLight ? '#ffffff' : '#0f172a'}
                        strokeWidth="2"
                        className="cursor-pointer transition-all hover:scale-125"
                        onMouseEnter={() => setHoveredTrialId(p.trial.id)}
                        onMouseLeave={() => setHoveredTrialId(null)}
                        onClick={() => setSelectedTrialId(p.trial.id)}
                      />
                    )}

                    {/* Matematik Net Noktası */}
                    {(viewMode === 'all' || viewMode === 'math') && (
                      <circle
                        cx={p.x}
                        cy={p.mathY}
                        r={isSelected ? 6 : 4}
                        fill="#10b981"
                        stroke={isLight ? '#ffffff' : '#0f172a'}
                        strokeWidth="2"
                        className="cursor-pointer transition-all hover:scale-125"
                        onMouseEnter={() => setHoveredTrialId(p.trial.id)}
                        onMouseLeave={() => setHoveredTrialId(null)}
                        onClick={() => setSelectedTrialId(p.trial.id)}
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Lejant (Gösterge) */}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>Matematik Neti</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-500 inline-block" />
                <span>Toplam Net</span>
              </div>
              {targetNet && (
                <div className="flex items-center gap-1.5">
                  <span className="h-0.5 w-3 border-t-2 border-dashed border-amber-500 inline-block" />
                  <span>Hedef Net ({targetNet})</span>
                </div>
              )}
            </div>
          </div>

          {/* Aktif Seçili Deneme Detay Kartı */}
          {activePoint && (
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/90 dark:bg-slate-950/60 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {activePoint.trial.title}
                  </span>
                  <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/20 uppercase">
                    {activePoint.trial.examType}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {activePoint.trial.date}
                  </span>
                  <span>•</span>
                  <span>Skor: <strong className="text-slate-800 dark:text-slate-200">{activePoint.trial.score.toFixed(1)} Puan</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                <div>
                  <span className="text-[10px] text-slate-400 block">Matematik Neti</span>
                  <strong className="text-emerald-500 text-sm font-mono">{activePoint.trial.mathNet} Net</strong>
                </div>
                <div className="h-7 w-px bg-slate-200 dark:bg-white/10" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Toplam Net</span>
                  <strong className="text-purple-500 text-sm font-mono">{activePoint.trial.totalNet} Net</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
