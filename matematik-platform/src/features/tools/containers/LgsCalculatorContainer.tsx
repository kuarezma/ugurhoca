'use client';

import { useState } from 'react';
import { applyAnswerChange } from '@/lib/examInputs';
import { serializeLgsInputs } from '@/lib/lgsInputTransfer';
import { SafeLink as Link } from '@/components/SafeLink';
import {
  School,
  ArrowLeft,
  Sparkles,
  RotateCcw,
  Target,
  Award,
} from 'lucide-react';
import {
  calculateLgsScore,
  createInitialLgsInputs,
  lgsSubjects,
  type LgsInputs,
  type LgsSubjectKey,
} from '@/lib/examCalculators';
import { LGS_TARGET_PRESETS } from '@/components/ExamScoreCalculatorModal';
import { FaqAccordion } from '../components/FaqAccordion';
import { LGS_CALCULATOR_TITLE, LGS_FAQS } from '../lgs-content';

export function LgsCalculatorContainer() {
  const [inputs, setInputs] = useState<LgsInputs>(createInitialLgsInputs());

  const handleInputChange = (
    key: LgsSubjectKey,
    field: 'correct' | 'wrong',
    rawValue: string | number,
  ) => {
    const maxQ = lgsSubjects.find((s) => s.key === key)?.questions || 20;
    setInputs((prev) => ({
      ...prev,
      [key]: applyAnswerChange(prev[key], field, rawValue, maxQ),
    }));
  };

  const handleReset = () => {
    setInputs(createInitialLgsInputs());
  };

  const result = calculateLgsScore(inputs);

  return (
    <main className="page-surface min-h-screen gradient-bg px-4 pb-16 pt-20 sm:px-6 sm:pt-24">
      <div className="mx-auto max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-secondary">
          <Link
            href="/araclar"
            className="hover:text-primary transition flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tüm Araçlar
          </Link>
          <span>/</span>
          <span className="text-accent-fg font-bold">
            LGS Puan Hesaplama Robotu
          </span>
        </div>

        {/* Header Hero */}
        <div className="rounded-3xl border border-default bg-surface-1 dark:bg-slate-900/80 p-6 sm:p-8 backdrop-blur-md shadow-2xl mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white dark:text-white shadow-lg">
                <School className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-black text-primary font-display">
                  {LGS_CALCULATOR_TITLE}
                </h1>
                <p className="text-xs sm:text-sm text-secondary mt-1">
                  Netlerine ve ders ağırlıklarına göre tahmini puan hesaplanır.
                  Gerçek sonuç sınavın istatistiklerine göre değişir.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-xl border border-default bg-surface-2 px-3 py-2 text-xs font-bold text-secondary hover:bg-surface-3 hover:text-primary transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Sıfırla
            </button>
          </div>
        </div>

        {/* Main Grid: Inputs and Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Subject Inputs (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="rounded-3xl border border-default bg-surface-1 p-5 shadow-xl backdrop-blur-md">
              <div className="hidden items-center justify-between border-b border-default pb-3 mb-4 text-xs font-bold text-secondary min-[400px]:flex">
                <span>Ders Adı (Soru Sayısı)</span>
                <div className="flex items-center gap-6 pr-2">
                  <span className="text-emerald-800 dark:text-emerald-300">
                    Doğru
                  </span>
                  <span className="text-rose-800 dark:text-rose-300">
                    Yanlış
                  </span>
                  <span className="text-accent-fg">Net</span>
                </div>
              </div>

              <div className="space-y-3">
                {lgsSubjects.map((sub) => {
                  const item = inputs[sub.key];
                  const netVal =
                    result.subjectNets.find(
                      (subject) => subject.key === sub.key,
                    )?.net ?? 0;

                  return (
                    <div
                      key={sub.key}
                      className="flex flex-col items-stretch gap-3 rounded-2xl border border-default bg-surface-2 p-3 text-xs min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-primary block">
                          {sub.label}
                        </span>
                        <span className="text-[10px] text-secondary">
                          {sub.questions} Soru · Katsayı: {sub.coefficient}x
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 min-[400px]:flex min-[400px]:shrink-0 sm:gap-3">
                        <label className="block min-w-0">
                          <span className="mb-1 block text-xs font-semibold text-secondary min-[400px]:hidden">
                            Doğru
                          </span>
                          <input
                            type="number"
                            min={0}
                            max={sub.questions}
                            value={item.correct || ''}
                            placeholder="0"
                            onChange={(e) =>
                              handleInputChange(
                                sub.key,
                                'correct',
                                e.target.value,
                              )
                            }
                            aria-label={`${sub.label} doğru`}
                            inputMode="numeric"
                            className="h-11 w-full min-[400px]:w-12 rounded-xl border border-emerald-500/40 bg-surface-1 text-center font-mono font-bold text-accent-success-ink dark:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </label>

                        <label className="block min-w-0">
                          <span className="mb-1 block text-xs font-semibold text-secondary min-[400px]:hidden">
                            Yanlış
                          </span>
                          <input
                            type="number"
                            min={0}
                            max={sub.questions}
                            value={item.wrong || ''}
                            placeholder="0"
                            onChange={(e) =>
                              handleInputChange(
                                sub.key,
                                'wrong',
                                e.target.value,
                              )
                            }
                            aria-label={`${sub.label} yanlış`}
                            inputMode="numeric"
                            className="h-11 w-full min-[400px]:w-12 rounded-xl border border-rose-500/40 bg-surface-1 text-center font-mono font-bold text-rose-600 dark:text-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                          />
                        </label>

                        <div className="min-w-0">
                          <span className="mb-1 block text-xs font-semibold text-secondary min-[400px]:hidden">
                            Net
                          </span>
                          <div className="h-11 w-full min-[400px]:w-14 rounded-xl border border-cyan-500/40 bg-surface-1 flex items-center justify-center font-mono font-black text-accent-fg">
                            {netVal.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Result Card (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl border border-default bg-surface-1 p-6 shadow-2xl backdrop-blur-md text-center space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-accent-fg flex items-center justify-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Tahmini LGS Puanı
              </div>

              <div className="text-4xl sm:text-5xl font-black font-mono text-primary tracking-tight">
                {result.estimatedScore.toFixed(3)}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-2xl border border-default bg-surface-2 p-3">
                  <span className="text-[11px] text-secondary block">
                    Toplam Net
                  </span>
                  <span className="text-lg font-black font-mono text-emerald-800 dark:text-emerald-300">
                    {result.totalNet.toFixed(2)} / 90
                  </span>
                </div>
                <div className="rounded-2xl border border-default bg-surface-2 p-3">
                  <span className="text-[11px] text-secondary block">
                    Tahmini Yüzdelik
                  </span>
                  <span className="text-lg font-black font-mono text-accent-fg">
                    %{result.estimatedPercentile.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/programlar/lgs?${serializeLgsInputs(inputs)}`}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold transition hover:scale-[1.02] active:scale-[0.98] bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
                >
                  <Target className="h-4 w-4" />
                  Bu Puanla Hangi Liselere Girersin?
                </Link>
              </div>
            </div>

            {/* Target Presets Card */}
            <div className="rounded-3xl border border-default bg-surface-1 p-5 backdrop-blur-md">
              <h3 className="text-xs font-bold text-primary mb-3 flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                Örnek Lise Hedef Karşılaştırması
              </h3>
              <div className="space-y-2 text-xs">
                {LGS_TARGET_PRESETS.slice(0, 4).map((preset) => {
                  const diff = result.estimatedScore - preset.score;
                  const reached = diff >= 0;
                  return (
                    <div
                      key={preset.name}
                      className="flex items-center justify-between rounded-xl border border-default bg-surface-2 p-2.5"
                    >
                      <span className="font-semibold text-primary">
                        {preset.name}
                      </span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-secondary">{preset.score}</span>
                        <span
                          className={`font-bold ${
                            reached
                              ? 'text-emerald-800 dark:text-emerald-300'
                              : 'text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {reached
                            ? `+${diff.toFixed(1)}`
                            : `${diff.toFixed(1)}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Educational FAQ Section */}
        <FaqAccordion
          title="LGS Puan Hesaplama Hakkında Sıkça Sorulan Sorular"
          items={LGS_FAQS}
          iconColorClass="text-cyan-400"
        />
      </div>
    </main>
  );
}
export default LgsCalculatorContainer;
