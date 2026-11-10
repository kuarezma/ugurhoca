'use client';

import {
  Sparkles,
  TrendingUp,
  Award,
  Target,
  Flame,
  RotateCcw,
} from 'lucide-react';
import {
  lgsSubjects,
  type LgsInputs,
  type LgsSubjectKey,
} from '@/lib/examCalculators';
import {
  LGS_TARGET_PRESETS,
  type LgsResultData,
  type LgsGapAnalysis,
} from './types';

type LgsCalculatorTabProps = {
  lgsInputs: LgsInputs;
  lgsResult: LgsResultData;
  lgsGapAnalysis: LgsGapAnalysis;
  selectedLgsTarget: string;
  setSelectedLgsTarget: (target: string) => void;
  onInputChange: (
    subject: LgsSubjectKey,
    field: 'correct' | 'wrong',
    val: number,
  ) => void;
  onReset: () => void;
};

export function LgsCalculatorTab({
  lgsInputs,
  lgsResult,
  lgsGapAnalysis,
  selectedLgsTarget,
  setSelectedLgsTarget,
  onInputChange,
  onReset,
}: LgsCalculatorTabProps) {
  return (
    <div className="space-y-6">
      {/* Sonuç Özeti Bento Kartı */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/30 p-4">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>LGS Puanı</span>
          </div>
          <div className="mt-1 font-display text-3xl font-extrabold text-indigo-700 dark:text-indigo-300 tabular-nums">
            {lgsResult.score.toFixed(2)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            500 tam puan üzerinden
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="h-4 w-4 text-accent-success-ink" />
            <span>Toplam Net</span>
          </div>
          <div className="mt-1 font-display text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {lgsResult.totalNet}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            90 soru arasından (3 yanlış 1 doğruyu götürür)
          </div>
        </div>

        <div className="rounded-2xl border border-purple-200/80 dark:border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/30 p-4">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
            <Award className="h-4 w-4" />
            <span>Tahmini Dilim</span>
          </div>
          <div className="mt-1 font-display text-2xl font-extrabold text-purple-700 dark:text-purple-300">
            {lgsResult.estimatedPercentile}
          </div>
          <div
            className="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400"
            title={lgsResult.targetBand}
          >
            {lgsResult.targetBand}
          </div>
        </div>
      </div>

      {/* Hedef Lise & Tersine Net İhtiyacı Simülatörü */}
      <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-500/20 bg-slate-50/70 dark:bg-slate-800/40 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="font-display text-xs font-bold text-slate-900 dark:text-white">
              Hedef Lise & Tersine Net Simülatörü
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Hedef Okul:
            </span>
            <select
              value={selectedLgsTarget}
              onChange={(e) => setSelectedLgsTarget(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {LGS_TARGET_PRESETS.map((preset) => (
                <option key={preset.name} value={preset.name}>
                  {preset.name} ({preset.score} Puan)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reçete Çıktısı */}
        <div
          className={`rounded-xl border p-3 text-xs leading-relaxed ${
            lgsGapAnalysis.isReached
              ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200'
              : 'border-amber-200 bg-amber-50/70 dark:border-amber-500/20 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200'
          }`}
        >
          {lgsGapAnalysis.isReached ? (
            <div className="flex items-center gap-2 font-bold">
              <Sparkles className="h-4 w-4 text-accent-success-ink shrink-0" />
              <span>
                🎉 Harika Gidiyorsun! Mevcut netlerin (
                {lgsResult.score.toFixed(2)} puan) {selectedLgsTarget} taban
                puanının ({lgsGapAnalysis.targetScore} puan) üzerinde.
              </span>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>
                  {selectedLgsTarget} ({lgsGapAnalysis.targetScore} Puan) İçin
                  Kalan Fark: +{lgsGapAnalysis.diff} Puan
                </span>
              </p>
              <p className="text-[11px] opacity-90">
                💡 <strong>Aksiyon Reçetesi:</strong> Bu taban puan farkını
                kapatmak için kalan sürede:{' '}
                <strong>Matematikten +{lgsGapAnalysis.mathNeeded} net</strong>{' '}
                VEYA <strong>Fenden +{lgsGapAnalysis.fenNeeded} net</strong>{' '}
                artırman hedefe ulaşman için yeterli!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Ders Giriş Tablosu */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden min-w-0">
        <div className="grid grid-cols-12 bg-slate-100 dark:bg-white/5 px-2.5 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-white/10">
          <div className="col-span-5 sm:col-span-4">Ders Adı (Soru)</div>
          <div className="col-span-2 text-center">Doğru</div>
          <div className="col-span-2 text-center">Yanlış</div>
          <div className="col-span-1 text-center hidden sm:block">Boş</div>
          <div className="col-span-3 text-right">Net</div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-slate-900">
          {lgsSubjects.map((sub) => {
            const input = lgsInputs[sub.key] || { correct: 0, wrong: 0 };
            const empty = Math.max(
              0,
              sub.questions - (input.correct + input.wrong),
            );
            const net = Math.max(0, input.correct - input.wrong / 3);

            return (
              <div
                key={sub.key}
                className="grid grid-cols-12 items-center px-2.5 sm:px-4 py-2 text-xs hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
              >
                <div className="col-span-5 sm:col-span-4 min-w-0 pr-1">
                  <div className="font-semibold text-slate-900 dark:text-white truncate">
                    {sub.label}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {sub.questions} Soru • Kat: {sub.coefficient}
                  </div>
                </div>

                <div className="col-span-2 flex justify-center">
                  <input
                    type="number"
                    min={0}
                    max={sub.questions}
                    value={input.correct || ''}
                    placeholder="0"
                    aria-label={`${sub.label} doğru sayısı`}
                    onChange={(e) =>
                      onInputChange(
                        sub.key,
                        'correct',
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="w-12 sm:w-14 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 py-1 text-center font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="col-span-2 flex justify-center">
                  <input
                    type="number"
                    min={0}
                    max={sub.questions - input.correct}
                    value={input.wrong || ''}
                    placeholder="0"
                    aria-label={`${sub.label} yanlış sayısı`}
                    onChange={(e) =>
                      onInputChange(
                        sub.key,
                        'wrong',
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="w-12 sm:w-14 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 py-1 text-center font-bold text-rose-600 dark:text-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div className="col-span-1 text-center text-slate-400 font-medium hidden sm:block">
                  {empty}
                </div>

                <div className="col-span-3 text-right">
                  <span className="inline-block rounded-md bg-slate-100 dark:bg-white/5 px-2 py-0.5 font-display text-xs font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {net.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>LGS Girişlerini Sıfırla</span>
        </button>
      </div>
    </div>
  );
}
