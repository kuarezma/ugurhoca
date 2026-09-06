'use client';

import { useState } from 'react';
import Link from 'next/link';
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
import { FaqAccordion, type FaqItem } from '../components/FaqAccordion';

const LGS_FAQS: FaqItem[] = [
  {
    q: "LGS puanı nasıl hesaplanır?",
    a: "MEB LGS'de öğrencilerin her derse ait net sayısı (Doğru - Yanlış / 3) hesaplanır. Türkçe, Matematik ve Fen Bilimleri netleri 4 katsayısıyla; T.C. İnkılap Tarihi, Din Kültürü ve Yabancı Dil netleri ise 1 katsayısıyla çarpılarak standart puan hesaplanır."
  },
  {
    q: "LGS'de 3 yanlış 1 doğruyu götürür mü?",
    a: "Evet. MEB LGS sınavında her ders için yapılan 3 yanlış cevap, o dersteki 1 doğru cevabı eksiltir. Bu nedenle emin olunmayan sorularda rastgele tahmin yapmak yerine boş bırakmak net kaybını önler."
  },
  {
    q: "Lise tercihlerinde puan mı yoksa yüzdelik dilim mi önemlidir?",
    a: "Kesinlikle yüzdelik dilim önemlidir. Sınavın zorluğuna göre taban puanlar her yıl 10-30 puan arasında değişebilir ancak okulların yüzdelik dilimleri çok daha kararlı ve güvenilirdir."
  },
  {
    q: "Tüm soruları doğru yapan öğrenci kaç puan alır?",
    a: "LGS'de toplam 90 soru (50 sözel + 40 sayısal) bulunur. Tüm soruları doğru yanıtlayan bir öğrenci tam 500.000 puan alarak Türkiye 1.si olur."
  }
];

export function LgsCalculatorContainer() {
  const [inputs, setInputs] = useState<LgsInputs>(createInitialLgsInputs());

  const handleInputChange = (
    key: LgsSubjectKey,
    field: 'correct' | 'wrong',
    val: number
  ) => {
    const maxQ = lgsSubjects.find((s) => s.key === key)?.questions || 20;
    const clampedVal = Math.max(0, Math.min(maxQ, val || 0));

    setInputs((prev) => {
      const current = prev[key];
      const nextObj = { ...current, [field]: clampedVal };

      if (nextObj.correct + nextObj.wrong > maxQ) {
        if (field === 'correct') {
          nextObj.wrong = maxQ - nextObj.correct;
        } else {
          nextObj.correct = maxQ - nextObj.wrong;
        }
      }

      return { ...prev, [key]: nextObj };
    });
  };

  const handleReset = () => {
    setInputs(createInitialLgsInputs());
  };

  const result = calculateLgsScore(inputs);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: LGS_FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };

  return (
    <main className="min-h-screen gradient-bg px-4 pb-16 pt-20 sm:px-6 sm:pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link href="/araclar" className="hover:text-white transition flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            Tüm Araçlar
          </Link>
          <span>/</span>
          <span className="text-cyan-400 font-bold">LGS Puan Hesaplama Robotu</span>
        </div>

        {/* Header Hero */}
        <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-indigo-950/40 p-6 sm:p-8 backdrop-blur-md shadow-2xl mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg">
                <School className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-black text-white font-display">
                  2026/2027 MEB LGS Puan & Yüzdelik Dilim Robotu
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  MEB standart sapma ve ağırlıklı katsayılarıyla birebir uyumlu anlık net ve puan hesabı.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition"
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
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 text-xs font-bold text-slate-300">
                <span>Ders Adı (Soru Sayısı)</span>
                <div className="flex items-center gap-6 pr-2">
                  <span className="text-emerald-400">Doğru</span>
                  <span className="text-rose-400">Yanlış</span>
                  <span className="text-cyan-400">Net</span>
                </div>
              </div>

              <div className="space-y-3">
                {lgsSubjects.map((sub) => {
                  const item = inputs[sub.key];
                  const netVal = Math.max(0, item.correct - item.wrong / 3);

                  return (
                    <div
                      key={sub.key}
                      className="flex items-center justify-between gap-2 rounded-2xl border border-white/5 bg-white/5 p-3 text-xs"
                    >
                      <div className="flex-1">
                        <span className="font-bold text-white block">{sub.label}</span>
                        <span className="text-[10px] text-slate-400">
                          {sub.questions} Soru · Katsayı: {sub.coefficient}x
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min={0}
                          max={sub.questions}
                          value={item.correct || ''}
                          placeholder="0"
                          onChange={(e) =>
                            handleInputChange(sub.key, 'correct', parseInt(e.target.value, 10))
                          }
                          aria-label={`${sub.label} doğru`}
                          className="h-9 w-12 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-center font-mono font-bold text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />

                        <input
                          type="number"
                          min={0}
                          max={sub.questions}
                          value={item.wrong || ''}
                          placeholder="0"
                          onChange={(e) =>
                            handleInputChange(sub.key, 'wrong', parseInt(e.target.value, 10))
                          }
                          aria-label={`${sub.label} yanlış`}
                          className="h-9 w-12 rounded-xl border border-rose-500/30 bg-rose-950/20 text-center font-mono font-bold text-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />

                        <div className="h-9 w-14 rounded-xl border border-cyan-500/30 bg-cyan-950/20 flex items-center justify-center font-mono font-black text-cyan-300">
                          {netVal.toFixed(2)}
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
            <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/60 to-slate-900/90 p-6 shadow-2xl backdrop-blur-md text-center space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Tahmini LGS Puanı
              </div>

              <div className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                {result.estimatedScore.toFixed(3)}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <span className="text-[11px] text-slate-400 block">Toplam Net</span>
                  <span className="text-lg font-black font-mono text-emerald-400">
                    {result.totalNet.toFixed(2)} / 90
                  </span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <span className="text-[11px] text-slate-400 block">Tahmini Yüzdelik</span>
                  <span className="text-lg font-black font-mono text-cyan-300">
                    %{result.estimatedPercentile.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/programlar/lgs"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Target className="h-4 w-4" />
                  Bu Puanla Hangi Liselere Girersin?
                </Link>
              </div>
            </div>

            {/* Target Presets Card */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-md">
              <h3 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-amber-400" />
                Örnek Lise Hedef Karşılaştırması
              </h3>
              <div className="space-y-2 text-xs">
                {LGS_TARGET_PRESETS.slice(0, 4).map((preset) => {
                  const diff = result.estimatedScore - preset.score;
                  const reached = diff >= 0;
                  return (
                    <div
                      key={preset.name}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-2.5"
                    >
                      <span className="font-semibold text-slate-200">{preset.name}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-slate-400">{preset.score}</span>
                        <span
                          className={`font-bold ${
                            reached ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {reached ? `+${diff.toFixed(1)}` : `${diff.toFixed(1)}`}
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
