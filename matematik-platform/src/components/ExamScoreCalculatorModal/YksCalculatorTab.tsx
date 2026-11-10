'use client';

import {
  GraduationCap,
  Target,
  Sparkles,
  Flame,
  RotateCcw,
} from 'lucide-react';
import {
  tytSubjectKeys,
  aytSubjectKeys,
  yksSubjects,
  type YksInputs,
  type YksScoreType,
  type YksSubjectKey,
} from '@/lib/examCalculators';
import { YKS_TARGET_PRESETS, type YksGapAnalysis } from './types';

type YksCalculatorTabProps = {
  yksInputs: YksInputs;
  diplomaScore: number;
  setDiplomaScore: (score: number) => void;
  selectedYksType: YksScoreType;
  setSelectedYksType: (type: YksScoreType) => void;
  selectedYksTarget: string;
  setSelectedYksTarget: (target: string) => void;
  yksResult: {
    activeRow: { placementScore: number; placementRank: number };
    tytNet: number;
    aytNet: number;
  };
  yksGapAnalysis: YksGapAnalysis;
  onInputChange: (
    subject: YksSubjectKey,
    field: 'correct' | 'wrong',
    val: number,
    maxQuestions: number,
  ) => void;
  onReset: () => void;
};

export function YksCalculatorTab({
  yksInputs,
  diplomaScore,
  setDiplomaScore,
  selectedYksType,
  setSelectedYksType,
  selectedYksTarget,
  setSelectedYksTarget,
  yksResult,
  yksGapAnalysis,
  onInputChange,
  onReset,
}: YksCalculatorTabProps) {
  return (
    <div className="space-y-6">
      {/* Puan Türü ve Diploma Notu Seçimi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-1">
            Hedef Alan:
          </span>
          {(['SAY', 'EA', 'SOZ', 'TYT'] as YksScoreType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedYksType(type)}
              className={`rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold transition-all ${
                selectedYksType === type
                  ? 'shadow-sm bg-brand-primary text-slate-950 dark:text-slate-950'
                  : 'border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {type === 'SAY'
                ? 'Sayısal'
                : type === 'EA'
                  ? 'Eşit Ağırlık'
                  : type === 'SOZ'
                    ? 'Sözel'
                    : 'Sadece TYT'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <GraduationCap className="h-4 w-4 text-indigo-500" />
          <label
            htmlFor="obp-input"
            className="text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            Diploma Notu (OBP):
          </label>
          <input
            id="obp-input"
            type="number"
            min="50"
            max="100"
            value={diplomaScore}
            onChange={(e) =>
              setDiplomaScore(
                Math.max(50, Math.min(100, parseInt(e.target.value, 10) || 50)),
              )
            }
            className="w-16 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-2 py-1 text-center text-xs font-bold text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* YKS Sonuç Özeti Bento */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/30 p-3.5">
          <div className="text-[11px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
            Yerleştirme Puanı
          </div>
          <div className="mt-1 font-display text-2xl font-extrabold text-indigo-700 dark:text-indigo-300 tabular-nums">
            {yksResult.activeRow.placementScore.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            OBP Eklenmiş
          </div>
        </div>

        <div className="rounded-2xl border border-purple-200 dark:border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/30 p-3.5">
          <div className="text-[11px] font-bold uppercase text-purple-600 dark:text-purple-400">
            Tahmini Sıralama
          </div>
          <div className="mt-1 font-display text-2xl font-extrabold text-purple-700 dark:text-purple-300 tabular-nums">
            {yksResult.activeRow.placementRank > 0
              ? `~${yksResult.activeRow.placementRank.toLocaleString('tr-TR')}`
              : '—'}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            Başarı Sırası Bandı
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3.5">
          <div className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300">
            TYT Toplam Net
          </div>
          <div className="mt-1 font-display text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {yksResult.tytNet}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            120 soru üzerinden
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3.5">
          <div className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300">
            AYT Toplam Net
          </div>
          <div className="mt-1 font-display text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {yksResult.aytNet}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            Seçilen testler üzerinden
          </div>
        </div>
      </div>

      {/* YKS Hedef Üniversite Simülatörü */}
      <div className="rounded-2xl border border-purple-200/80 dark:border-purple-500/20 bg-slate-50/70 dark:bg-slate-800/40 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h4 className="font-display text-xs font-bold text-slate-900 dark:text-white">
              Hedef Üniversite Programı & Net Simülatörü
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Hedef:
            </span>
            <select
              value={selectedYksTarget}
              onChange={(e) => setSelectedYksTarget(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              {YKS_TARGET_PRESETS.map((preset) => (
                <option key={preset.name} value={preset.name}>
                  {preset.name} ({preset.score} Puan - {preset.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* YKS Reçete Çıktısı */}
        <div
          className={`rounded-xl border p-3 text-xs leading-relaxed ${
            yksGapAnalysis.isReached
              ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200'
              : 'border-purple-200 bg-purple-50/70 dark:border-purple-500/20 dark:bg-purple-950/30 text-purple-950 dark:text-purple-200'
          }`}
        >
          {yksGapAnalysis.isReached ? (
            <div className="flex items-center gap-2 font-bold">
              <Sparkles className="h-4 w-4 text-accent-success-ink shrink-0" />
              <span>
                🎉 Harika Gidiyorsun! Yerleştirme puanın (
                {yksResult.activeRow.placementScore.toFixed(1)}){' '}
                {selectedYksTarget} taban puanının ({yksGapAnalysis.targetScore}
                ) üzerinde.
              </span>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>
                  {selectedYksTarget} ({yksGapAnalysis.targetScore} Puan) İçin
                  Kalan Fark: +{yksGapAnalysis.diff} Puan
                </span>
              </p>
              <p className="text-[11px] opacity-90">
                💡 <strong>Aksiyon Reçetesi:</strong> Bu taban puan farkını
                kapatmak için:{' '}
                <strong>
                  AYT Matematikten yaklaşık +{yksGapAnalysis.aytMathNeeded} net
                </strong>{' '}
                artırman hedefe ulaşman için yeterli!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* YKS Ders Giriş Tablosu */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* TYT Bölümü */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
          <div className="bg-indigo-600 text-white dark:text-white px-4 py-2 text-xs font-bold flex justify-between items-center">
            <span>TYT Testleri (120 Soru)</span>
            <span>Net: {yksResult.tytNet}</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs bg-white dark:bg-slate-900">
            {tytSubjectKeys.map((key) => {
              const meta = yksSubjects.find((s) => s.key === key);
              const current = yksInputs[key] || {
                correct: 0,
                wrong: 0,
              };
              const net = Math.max(0, current.correct - current.wrong / 4);
              return (
                <div
                  key={key}
                  className="flex items-center justify-between p-2 sm:p-2.5 gap-2 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate text-[11px] sm:text-xs">
                    {meta?.label} ({meta?.questions}s)
                  </span>
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <input
                      type="number"
                      min="0"
                      max={meta?.questions || 40}
                      placeholder="D"
                      aria-label={`${meta?.label || 'Test'} doğru sayısı`}
                      value={current.correct || ''}
                      onChange={(e) =>
                        onInputChange(
                          key,
                          'correct',
                          parseInt(e.target.value, 10) || 0,
                          meta?.questions || 40,
                        )
                      }
                      className="w-10 sm:w-12 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 p-1 text-center font-bold text-xs text-slate-900 dark:text-white"
                    />
                    <input
                      type="number"
                      min="0"
                      max={meta?.questions || 40}
                      placeholder="Y"
                      aria-label={`${meta?.label || 'Test'} yanlış sayısı`}
                      value={current.wrong || ''}
                      onChange={(e) =>
                        onInputChange(
                          key,
                          'wrong',
                          parseInt(e.target.value, 10) || 0,
                          meta?.questions || 40,
                        )
                      }
                      className="w-10 sm:w-12 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 p-1 text-center font-bold text-rose-500 text-xs"
                    />
                    <span className="w-10 sm:w-12 text-right font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                      {net.toFixed(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AYT Bölümü */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
          <div className="bg-purple-600 text-white dark:text-white px-4 py-2 text-xs font-bold flex justify-between items-center">
            <span>AYT Testleri (Seçilenler)</span>
            <span>Net: {yksResult.aytNet}</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs bg-white dark:bg-slate-900">
            {aytSubjectKeys.map((key) => {
              const meta = yksSubjects.find((s) => s.key === key);
              const current = yksInputs[key] || {
                correct: 0,
                wrong: 0,
              };
              const net = Math.max(0, current.correct - current.wrong / 4);
              return (
                <div
                  key={key}
                  className="flex items-center justify-between p-2 sm:p-2.5 gap-2 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate text-[11px] sm:text-xs">
                    {meta?.label} ({meta?.questions}s)
                  </span>
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <input
                      type="number"
                      min="0"
                      max={meta?.questions || 40}
                      placeholder="D"
                      aria-label={`${meta?.label || 'Test'} doğru sayısı`}
                      value={current.correct || ''}
                      onChange={(e) =>
                        onInputChange(
                          key,
                          'correct',
                          parseInt(e.target.value, 10) || 0,
                          meta?.questions || 40,
                        )
                      }
                      className="w-10 sm:w-12 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 p-1 text-center font-bold text-xs text-slate-900 dark:text-white"
                    />
                    <input
                      type="number"
                      min="0"
                      max={meta?.questions || 40}
                      placeholder="Y"
                      aria-label={`${meta?.label || 'Test'} yanlış sayısı`}
                      value={current.wrong || ''}
                      onChange={(e) =>
                        onInputChange(
                          key,
                          'wrong',
                          parseInt(e.target.value, 10) || 0,
                          meta?.questions || 40,
                        )
                      }
                      className="w-10 sm:w-12 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 p-1 text-center font-bold text-rose-500 text-xs"
                    />
                    <span className="w-10 sm:w-12 text-right font-bold text-purple-600 dark:text-purple-400 text-xs">
                      {net.toFixed(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Değerleri Sıfırla
        </button>
        <div className="text-[11px] text-slate-400">
          ÖSYM 2026 katsayılarına ve geçmiş yıl yığılım verilerine göre yaklaşık
          tahmindir.
        </div>
      </div>
    </div>
  );
}
