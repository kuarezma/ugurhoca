'use client';

import {
  BookmarkPlus,
  Check,
  History,
  Printer,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import type { SavedExamTrial } from '@/lib/examHistoryStorage';
import ExamTrendChart from '@/features/profile/components/ExamTrendChart';

type ExamTrialHistorySectionProps = {
  examType: 'lgs' | 'yks';
  savedTrials: SavedExamTrial[];
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  saveSuccess: boolean;
  onSaveTrial: () => void;
  onDeleteTrial: (id: string) => void;
  peakTrial: SavedExamTrial | null;
  targetNet?: number;
};

export function ExamTrialHistorySection({
  examType,
  savedTrials,
  showHistory,
  setShowHistory,
  saveSuccess,
  onSaveTrial,
  onDeleteTrial,
  peakTrial,
  targetNet = 15,
}: ExamTrialHistorySectionProps) {
  const isLgs = examType === 'lgs';

  return (
    <div className="space-y-4">
      {/* Aksiyon Barı: Deneme Kaydet & Geçmiş Gelişim */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSaveTrial}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-sm ${
              saveSuccess
                ? 'bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none'
                : 'active:scale-95 bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none'
            }`}
          >
            {saveSuccess ? (
              <Check className="h-4 w-4" />
            ) : (
              <BookmarkPlus className="h-4 w-4" />
            )}
            <span>
              {saveSuccess ? 'Deneme Kaydedildi!' : 'Bu Denemeyi Kaydet'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
              showHistory
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-200'
                : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Deneme Gelişim Çizelgesi ({savedTrials.length})</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"
          >
            <Printer className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>Karnemi Yazdır (A4)</span>
          </button>
        </div>

        {peakTrial && (
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span>🏆 Zirve Denemen:</span>
            <strong className="text-amber-600 dark:text-amber-400">
              {peakTrial.score.toFixed(1)} Puan
            </strong>
            <span>(Mat: {peakTrial.mathNet} Net)</span>
          </div>
        )}
      </div>

      {/* Deneme Gelişim Çizelgesi & Net Artış Eğrisi */}
      {showHistory && (
        <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <h4 className="font-display text-xs font-bold text-slate-900 dark:text-white">
                Kayıtlı {isLgs ? 'LGS' : 'YKS'} Deneme Geçmişi (
                {savedTrials.length})
              </h4>
            </div>
          </div>

          <ExamTrendChart
            trials={savedTrials}
            examType={examType}
            targetNet={targetNet}
            isLight={false}
            className="border-none !p-0 !bg-transparent shadow-none"
          />

          {savedTrials.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-3 text-center">
              Henüz kayıtlı deneme sınavı bulunmuyor. Yukarıdaki &quot;Bu
              Denemeyi Kaydet&quot; butonuna basarak ilk sonucunu
              ekleyebilirsin.
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 [scrollbar-width:thin]">
              {savedTrials.map((trial, idx) => {
                const nextTrial = savedTrials[idx + 1];
                const netDiff = nextTrial
                  ? trial.totalNet - nextTrial.totalNet
                  : null;
                return (
                  <div
                    key={trial.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-800/80 p-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {trial.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {trial.date}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-300">
                        <span>
                          Puan:{' '}
                          <strong className="text-indigo-600 dark:text-indigo-400">
                            {trial.score}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Matematik: <strong>{trial.mathNet} Net</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Toplam: <strong>{trial.totalNet} Net</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {netDiff !== null && (
                        <span
                          className={`inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                            netDiff >= 0
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {netDiff >= 0 ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          <span>
                            {netDiff >= 0
                              ? `+${netDiff.toFixed(2)}`
                              : netDiff.toFixed(2)}{' '}
                            Net
                          </span>
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => onDeleteTrial(trial.id)}
                        title="Bu denemeyi sil"
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
