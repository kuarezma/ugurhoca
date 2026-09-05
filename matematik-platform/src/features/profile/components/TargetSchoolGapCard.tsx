'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Target,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  School,
  GraduationCap,
} from 'lucide-react';
import {
  getSavedExamTrials,
  type SavedExamTrial,
  type ExamHistoryType,
} from '@/lib/examHistoryStorage';

export type SchoolTargetModel = {
  id: string;
  name: string;
  examType: ExamHistoryType;
  baseScore: number;
  city?: string;
  type: string;
  baseNets: {
    math: number;
    science?: number;
    turkish: number;
    total: number;
  };
};

export const POPULAR_TARGET_SCHOOLS: SchoolTargetModel[] = [
  // LGS
  {
    id: 'lgs-gs',
    name: 'Galatasaray Lisesi',
    examType: 'lgs',
    baseScore: 498.0,
    city: 'İstanbul',
    type: 'Anadolu Lisesi',
    baseNets: { math: 19.33, science: 20.0, turkish: 20.0, total: 89.33 },
  },
  {
    id: 'lgs-afl',
    name: 'Ankara Fen Lisesi',
    examType: 'lgs',
    baseScore: 494.5,
    city: 'Ankara',
    type: 'Fen Lisesi',
    baseNets: { math: 18.67, science: 19.67, turkish: 20.0, total: 88.33 },
  },
  {
    id: 'lgs-kel',
    name: 'Kabataş Erkek Lisesi',
    examType: 'lgs',
    baseScore: 489.0,
    city: 'İstanbul',
    type: 'Anadolu Lisesi',
    baseNets: { math: 17.67, science: 19.33, turkish: 19.67, total: 86.67 },
  },
  {
    id: 'lgs-kal',
    name: 'Kadıköy Anadolu Lisesi',
    examType: 'lgs',
    baseScore: 476.5,
    city: 'İstanbul',
    type: 'Anadolu Lisesi',
    baseNets: { math: 15.67, science: 18.33, turkish: 19.33, total: 82.67 },
  },
  {
    id: 'lgs-genel-fen',
    name: 'Nitelikli Fen Lisesi',
    examType: 'lgs',
    baseScore: 460.0,
    city: 'Genel',
    type: 'Fen Lisesi',
    baseNets: { math: 14.0, science: 17.0, turkish: 18.67, total: 78.0 },
  },
  // YKS
  {
    id: 'yks-tip',
    name: 'Tıp Fakültesi (Devlet)',
    examType: 'yks',
    baseScore: 490.0,
    type: 'Sayısal',
    baseNets: { math: 70.0, science: 51.0, turkish: 33.0, total: 175.0 },
  },
  {
    id: 'yks-muh',
    name: 'Mühendislik (İTÜ / ODTÜ)',
    examType: 'yks',
    baseScore: 455.0,
    type: 'Sayısal',
    baseNets: { math: 65.0, science: 46.0, turkish: 31.0, total: 160.0 },
  },
  {
    id: 'yks-boun-ea',
    name: 'İktisat / İşletme (Boğaziçi)',
    examType: 'yks',
    baseScore: 440.0,
    type: 'Eşit Ağırlık',
    baseNets: { math: 62.0, science: 10.0, turkish: 35.0, total: 155.0 },
  },
  {
    id: 'yks-hukuk',
    name: 'Hukuk Fakültesi (Devlet)',
    examType: 'yks',
    baseScore: 425.0,
    type: 'Eşit Ağırlık',
    baseNets: { math: 51.0, science: 8.0, turkish: 34.0, total: 145.0 },
  },
];

type TargetSchoolGapCardProps = {
  isLight?: boolean;
  initialExamType?: ExamHistoryType;
  customTrial?: SavedExamTrial;
};

export default function TargetSchoolGapCard({
  isLight = false,
  initialExamType = 'lgs',
  customTrial,
}: TargetSchoolGapCardProps) {
  const [examType, setExamType] = useState<ExamHistoryType>(
    customTrial ? customTrial.examType : initialExamType,
  );
  const [trials, setTrials] = useState<SavedExamTrial[]>([]);

  const filteredSchools = useMemo(
    () => POPULAR_TARGET_SCHOOLS.filter((s) => s.examType === examType),
    [examType],
  );

  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(
    filteredSchools[0]?.id || POPULAR_TARGET_SCHOOLS[0].id,
  );

  useEffect(() => {
    const first = filteredSchools[0];
    if (first && !filteredSchools.some((s) => s.id === selectedSchoolId)) {
      setSelectedSchoolId(first.id);
    }
  }, [examType, filteredSchools, selectedSchoolId]);

  useEffect(() => {
    const sync = () => {
      setTrials(getSavedExamTrials(examType));
    };
    sync();

    if (typeof window !== 'undefined') {
      window.addEventListener('ugurhoca:exam-trials-updated', sync);
      window.addEventListener('storage', sync);
      return () => {
        window.removeEventListener('ugurhoca:exam-trials-updated', sync);
        window.removeEventListener('storage', sync);
      };
    }
  }, [examType]);

  const activeTrial = useMemo(() => {
    if (customTrial) return customTrial;
    return trials[trials.length - 1] || null;
  }, [customTrial, trials]);

  const selectedSchool = useMemo(() => {
    return (
      filteredSchools.find((s) => s.id === selectedSchoolId) ||
      filteredSchools[0] ||
      POPULAR_TARGET_SCHOOLS[0]
    );
  }, [filteredSchools, selectedSchoolId]);

  // Net kıyaslama metrikleri
  const comparison = useMemo(() => {
    if (!activeTrial) return null;

    const actualMath = activeTrial.mathNet;
    const targetMath = selectedSchool.baseNets.math;
    const mathDelta = Number((actualMath - targetMath).toFixed(2));
    const mathPct = Math.min(100, Math.max(0, Math.round((actualMath / targetMath) * 100)));

    const actualTotal = activeTrial.totalNet;
    const targetTotal = selectedSchool.baseNets.total;
    const totalDelta = Number((actualTotal - targetTotal).toFixed(2));
    const totalPct = Math.min(100, Math.max(0, Math.round((actualTotal / targetTotal) * 100)));

    const targetScore = selectedSchool.baseScore;
    const actualScore = activeTrial.score;
    const scoreDelta = Number((actualScore - targetScore).toFixed(2));
    const isScoreReached = scoreDelta >= 0;

    return {
      actualMath,
      targetMath,
      mathDelta,
      mathPct,
      actualTotal,
      targetTotal,
      totalDelta,
      totalPct,
      targetScore,
      actualScore,
      scoreDelta,
      isScoreReached,
    };
  }, [activeTrial, selectedSchool]);

  return (
    <div
      className={`rounded-3xl border p-5 sm:p-6 transition-all duration-300 ${
        isLight
          ? 'border-slate-200/90 bg-white/95 shadow-bento hover:shadow-bento-hover hover:border-indigo-300/60'
          : 'border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-xl hover:border-white/20 hover:shadow-2xl'
      }`}
    >
      {/* Üst Başlık & Hedef Seçici */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/80 dark:border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 text-white shadow-md">
            <School className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-display text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Hedef Okul Taban Net Açığı Köprüsü
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold">
                🎯 Hedef Kıyaslama
              </span>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Son deneme sınavı netlerini hedef okulun taban netleriyle karşılaştır.
            </p>
          </div>
        </div>

        {/* Sınav Türü Seçici */}
        {!customTrial && (
          <div className="flex rounded-xl bg-slate-100 dark:bg-white/10 p-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setExamType('lgs')}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                examType === 'lgs'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              LGS Liseleri
            </button>
            <button
              type="button"
              onClick={() => setExamType('yks')}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                examType === 'yks'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              YKS Üniversiteleri
            </button>
          </div>
        )}
      </div>

      {/* Okul Seçici Düğmeleri */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {filteredSchools.map((school) => {
          const isSelected = school.id === selectedSchoolId;
          return (
            <button
              key={school.id}
              type="button"
              onClick={() => setSelectedSchoolId(school.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-500/30 font-bold'
                  : isLight
                  ? 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <span>{school.name}</span>
              <span className="ml-1.5 text-[10px] opacity-75">({school.baseScore} Puan)</span>
            </button>
          );
        })}
      </div>

      {!activeTrial ? (
        /* Kayıtlı Deneme Yok Uyarısı */
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 dark:border-white/20 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 mb-2">
            <Target className="h-6 w-6" />
          </div>
          <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
            Henüz Kayıtlı {examType === 'lgs' ? 'LGS' : 'YKS'} Denemen Bulunmuyor
          </h4>
          <p className={`mt-1 text-xs max-w-md mx-auto ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Puan ve Net Hesaplayıcıdan son denemeni kaydederek {selectedSchool.name} için kalan net açığını ve ders çalışma önceliklerini anında görebilirsin.
          </p>
        </div>
      ) : (
        /* Kıyaslama Kartları */
        comparison && (
          <div className="mt-5 space-y-4">
            {/* Seçili Okul ve Son Deneme Başlığı */}
            <div className={`flex flex-wrap items-center justify-between gap-2 rounded-2xl p-3 text-xs border ${
              isLight ? 'bg-indigo-50/60 border-indigo-200/80 text-indigo-950' : 'bg-indigo-950/20 border-indigo-500/20 text-indigo-200'
            }`}>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-indigo-500" />
                <span className="font-bold">{selectedSchool.name}</span>
                <span className="opacity-75">Taban Puan: {selectedSchool.baseScore}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="opacity-75">Son Deneme ({activeTrial.title}):</span>
                <strong className={comparison.isScoreReached ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                  {activeTrial.score.toFixed(1)} Puan
                </strong>
                <span className="font-bold">
                  ({comparison.scoreDelta >= 0 ? `+${comparison.scoreDelta}` : comparison.scoreDelta} Puan)
                </span>
              </div>
            </div>

            {/* Ders Net Açığı Karşılaştırma Grid'i */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Matematik Neti Kıyası */}
              <div className={`rounded-2xl border p-3.5 transition-all ${
                isLight ? 'border-slate-200/90 bg-slate-50/70' : 'border-white/10 bg-white/5'
              }`}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Matematik Neti
                  </span>
                  <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                    comparison.mathDelta >= 0
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                  }`}>
                    {comparison.mathDelta >= 0 ? `+${comparison.mathDelta} Hedef Üstü` : `${comparison.mathDelta} Net Açık`}
                  </span>
                </div>

                <div className="flex items-baseline justify-between text-xs mt-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Mevcut: <strong className="text-slate-900 dark:text-white">{comparison.actualMath}</strong> / Hedef: {comparison.targetMath} Net
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    %{comparison.mathPct}
                  </span>
                </div>

                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      comparison.mathDelta >= 0 ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'
                    }`}
                    style={{ width: `${comparison.mathPct}%` }}
                  />
                </div>
              </div>

              {/* Toplam Net Kıyası */}
              <div className={`rounded-2xl border p-3.5 transition-all ${
                isLight ? 'border-slate-200/90 bg-slate-50/70' : 'border-white/10 bg-white/5'
              }`}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                    <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
                    Toplam Net
                  </span>
                  <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                    comparison.totalDelta >= 0
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                  }`}>
                    {comparison.totalDelta >= 0 ? `+${comparison.totalDelta} Hedef Üstü` : `${comparison.totalDelta} Net Açık`}
                  </span>
                </div>

                <div className="flex items-baseline justify-between text-xs mt-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Mevcut: <strong className="text-slate-900 dark:text-white">{comparison.actualTotal}</strong> / Hedef: {comparison.targetTotal} Net
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    %{comparison.totalPct}
                  </span>
                </div>

                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      comparison.totalDelta >= 0 ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                    }`}
                    style={{ width: `${comparison.totalPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stratejik Tavsiye & Pedagojik Reçete */}
            <div className={`flex items-start gap-2.5 rounded-2xl p-3.5 text-xs border ${
              comparison.isScoreReached
                ? isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                : isLight ? 'bg-amber-50 border-amber-200 text-amber-950' : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
            }`}>
              {comparison.isScoreReached ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              )}
              <div className="min-w-0 flex-1">
                <strong className="font-bold">
                  {comparison.isScoreReached ? '🎯 Hedef Taban Bandındasın!' : '💡 Hedef Kapatma Stratejisi:'}
                </strong>
                <p className="mt-0.5 leading-relaxed opacity-90">
                  {comparison.isScoreReached
                    ? `Son denemedeki skorun (${comparison.actualScore.toFixed(1)} Puan) ${selectedSchool.name} taban puanının üzerinde. Mevcut soru çözme temposunu koruyarak deneme analizlerine odaklan.`
                    : `Hedeflenen ${selectedSchool.name} taban puanına (${comparison.targetScore}) ulaşmak için kalan net açığını kapatmanın en hızlı yolu: Matematikten yaklaşık +${Math.max(1, Math.ceil(Math.abs(comparison.mathDelta)))} net artırmak.`}
                </p>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
