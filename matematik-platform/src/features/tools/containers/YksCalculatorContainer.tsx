'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  ArrowLeft,
  Sparkles,
  RotateCcw,
  Target,
} from 'lucide-react';
import {
  calculateYksScoreTable,
  createInitialYksInputs,
  tytSubjectKeys,
  aytSubjectKeys,
  yksSubjects,
  type YksInputs,
  type YksSubjectKey,
  type YksScoreType,
} from '@/lib/examCalculators';
import { FaqAccordion, type FaqItem } from '../components/FaqAccordion';

const YKS_FAQS: FaqItem[] = [
  {
    q: "YKS'de 4 yanlış 1 doğruyu götürür mü?",
    a: "Evet. ÖSYM YKS sınavında (TYT ve AYT oturumlarının tamamında) her 4 yanlış cevap, 1 doğru cevabı eksiltir (Net = Doğru - Yanlış / 4)."
  },
  {
    q: "OBP (Ortaöğretim Başarı Puanı) nasıl hesaplanır?",
    a: "Lise mezuniyet diploma notu (50-100 aralığında) 5 ile çarpılarak 250-500 aralığına getirilir. Bu puan 0.12 katsayısı ile çarpılarak (en fazla 60 puan) ham puana eklenir."
  },
  {
    q: "Önceki yıl bir bölüme yerleşenlerin OBP'si kırılır mı?",
    a: "Evet. Önceki yıl merkezi yerleştirmeyle bir lisans veya önlisans programına yerleşen adayların OBP katsayısı bir sonraki yıl yarı yarıya (0.12 yerine 0.06) düşer."
  },
  {
    q: "AYT puanının hesaplanması için TYT barajı var mıdır?",
    a: "YKS'de baraj puanı uygulaması kaldırılmıştır. Ancak adayın Sayısal, Eşit Ağırlık veya Sözel puanının hesaplanabilmesi için ilgili testlerden en az 0.5 net yapması gerekir."
  }
];

export function YksCalculatorContainer() {
  const [inputs, setInputs] = useState<YksInputs>(createInitialYksInputs());
  const [obp, setObp] = useState<number>(85);
  const [prevYearPlaced, setPrevYearPlaced] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tyt' | 'ayt'>('tyt');

  const handleInputChange = (
    key: YksSubjectKey,
    field: 'correct' | 'wrong',
    val: number
  ) => {
    const meta = yksSubjects.find((s) => s.key === key);
    const maxQ = meta?.questions || 40;
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
    setInputs(createInitialYksInputs());
    setObp(85);
    setPrevYearPlaced(false);
  };

  const results = calculateYksScoreTable(inputs, obp, prevYearPlaced);

  const getScoreCard = (type: YksScoreType) => {
    return results.rows.find((r) => r.scoreType === type);
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: YKS_FAQS.map((f) => ({
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
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link href="/araclar" className="hover:text-white transition flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            Tüm Araçlar
          </Link>
          <span>/</span>
          <span className="text-purple-400 font-bold">YKS Puan & Sıralama Hesaplayıcı</span>
        </div>

        <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-950/40 via-slate-900/80 to-pink-950/40 p-6 sm:p-8 backdrop-blur-md shadow-2xl mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-black text-white font-display">
                  2026/2027 ÖSYM YKS (TYT-AYT) Puan & Sıralama Hesaplayıcı
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  ÖSYM standart sapma verileri ve güncel yerleştirme katsayılarıyla puan ve başarı sıranı hesapla.
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

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-8 space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-200">Diploma Notu (OBP)</span>
                <span className="text-purple-400 font-mono text-sm">{obp.toFixed(1)} / 100</span>
              </div>
              <input
                type="range"
                min={50}
                max={100}
                step={0.5}
                value={obp}
                onChange={(e) => setObp(parseFloat(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
                aria-label="Diploma Notu"
              />
              <span className="text-[10px] text-slate-400">
                Yerleştirmeye eklenen net katkı: +{(obp * 5 * (prevYearPlaced ? 0.06 : 0.12)).toFixed(2)} puan
              </span>
            </div>

            <div className="sm:col-span-4 flex items-center justify-end">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prevYearPlaced}
                  onChange={(e) => setPrevYearPlaced(e.target.checked)}
                  className="rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500"
                />
                <span>Önceki yıl yerleştim (Kırık OBP)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('tyt')}
                className={`flex-1 py-2 rounded-xl transition ${
                  activeTab === 'tyt'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                TYT Testleri (120 Soru)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ayt')}
                className={`flex-1 py-2 rounded-xl transition ${
                  activeTab === 'ayt'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                AYT Testleri (160 Soru)
              </button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 text-xs font-bold text-slate-300">
                <span>Ders Adı</span>
                <div className="flex items-center gap-6 pr-2">
                  <span className="text-emerald-400">Doğru</span>
                  <span className="text-rose-400">Yanlış</span>
                  <span className="text-purple-400">Net</span>
                </div>
              </div>

              <div className="space-y-3">
                {(activeTab === 'tyt' ? tytSubjectKeys : aytSubjectKeys).map((key) => {
                  const meta = yksSubjects.find((s) => s.key === key);
                  if (!meta) return null;
                  const item = inputs[key];
                  const netVal = Math.max(0, item.correct - item.wrong / 4);

                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-2 rounded-2xl border border-white/5 bg-white/5 p-3 text-xs"
                    >
                      <div className="flex-1">
                        <span className="font-bold text-white block">{meta.label}</span>
                        <span className="text-[10px] text-slate-400">{meta.questions} Soru</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min={0}
                          max={meta.questions}
                          value={item.correct || ''}
                          placeholder="0"
                          onChange={(e) =>
                            handleInputChange(key, 'correct', parseInt(e.target.value, 10))
                          }
                          aria-label={`${meta.label} doğru`}
                          className="h-9 w-12 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-center font-mono font-bold text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />

                        <input
                          type="number"
                          min={0}
                          max={meta.questions}
                          value={item.wrong || ''}
                          placeholder="0"
                          onChange={(e) =>
                            handleInputChange(key, 'wrong', parseInt(e.target.value, 10))
                          }
                          aria-label={`${meta.label} yanlış`}
                          className="h-9 w-12 rounded-xl border border-rose-500/30 bg-rose-950/20 text-center font-mono font-bold text-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />

                        <div className="h-9 w-14 rounded-xl border border-purple-500/30 bg-purple-950/20 flex items-center justify-center font-mono font-black text-purple-300">
                          {netVal.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-950/60 to-slate-900/90 p-5 shadow-2xl backdrop-blur-md space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Yerleştirme Puanları & Sıralamalar
              </div>

              {(['TYT', 'SAY', 'EA', 'SOZ'] as YksScoreType[]).map((type) => {
                const row = getScoreCard(type);
                if (!row) return null;

                return (
                  <div
                    key={type}
                    className="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-purple-300">
                        {type === 'TYT' ? 'Temel Yeterlilik (TYT)' : `${type} Puanı`}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Ham: {row.rawScore.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-2xl font-black font-mono text-white">
                        {row.placementScore.toFixed(2)}
                      </span>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Tahmini Sıra:</span>
                        <span className="text-sm font-bold font-mono text-emerald-400">
                          ~{row.placementRank.toLocaleString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="pt-2">
                <Link
                  href="/programlar/yks"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Target className="h-4 w-4" />
                  Bu Puanla Üniversite Tercih Sihirbazı
                </Link>
              </div>
            </div>
          </div>
        </div>

        <FaqAccordion
          title="YKS Puan Hesaplama ve Tercih Rehberi"
          items={YKS_FAQS}
          iconColorClass="text-purple-400"
        />
      </div>
    </main>
  );
}
export default YksCalculatorContainer;
