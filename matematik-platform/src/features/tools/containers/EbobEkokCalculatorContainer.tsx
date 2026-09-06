'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  ArrowLeft,
  Sparkles,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { FaqAccordion, type FaqItem } from '../components/FaqAccordion';

type DivisionStep = {
  nums: number[];
  prime: number;
  dividesAll: boolean;
};

const EBOB_FAQS: FaqItem[] = [
  {
    q: "EBOB ve EKOK nedir?",
    a: "EBOB (En Büyük Ortak Bölen), iki veya daha fazla sayıyı kalansız bölen en büyük pozitif tam sayıdır. EKOK (En Küçük Ortak Kat) ise bu sayıların katı olan en küçük ortak pozitif tam sayıdır."
  },
  {
    q: "EBOB ve EKOK arasındaki temel bağıntı nedir?",
    a: "İki doğal sayının çarpımı, bu iki sayının EBOB'u ile EKOK'unun çarpımına daima eşittir: a × b = EBOB(a, b) × EKOK(a, b)."
  },
  {
    q: "Aralarında asal sayıların EBOB ve EKOK'u kaçtır?",
    a: "Aralarında asal iki sayının 1'den başka pozitif ortak böleni yoktur. Bu nedenle EBOB'ları 1, EKOK'ları ise sayıların doğrudan çarpımıdır: EKOK(a, b) = a × b."
  },
  {
    q: "LGS'de EBOB ve EKOK problemleri nasıl ayırt edilir?",
    a: "Büyük bir bütünü (tarla, çuval, kumaş) eşit parçalara bölme veya şişeleme soruları EBOB problemidir. Küçük parçalardan (ziller, nöbetler, fayanslar) büyük bir periyot oluşturma soruları ise EKOK problemidir."
  }
];

export function EbobEkokCalculatorContainer() {
  const [num1, setNum1] = useState<number>(36);
  const [num2, setNum2] = useState<number>(48);

  const computeSteps = (n1: number, n2: number) => {
    let a = Math.abs(Math.floor(n1)) || 1;
    let b = Math.abs(Math.floor(n2)) || 1;

    const steps: DivisionStep[] = [];
    let divisor = 2;

    while (a > 1 || b > 1) {
      if (a % divisor === 0 || b % divisor === 0) {
        const dividesBoth = a % divisor === 0 && b % divisor === 0;
        steps.push({
          nums: [a, b],
          prime: divisor,
          dividesAll: dividesBoth,
        });

        if (a % divisor === 0) a = a / divisor;
        if (b % divisor === 0) b = b / divisor;
      } else {
        divisor++;
      }
    }

    return steps;
  };

  const steps = computeSteps(num1, num2);
  const ebob = steps
    .filter((s) => s.dividesAll)
    .reduce((acc, s) => acc * s.prime, 1);
  const ekok = steps.reduce((acc, s) => acc * s.prime, 1);
  const areCoprime = ebob === 1;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: EBOB_FAQS.map((f) => ({
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
          <span className="text-emerald-400 font-bold">EBOB - EKOK Hesaplayıcı</span>
        </div>

        <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-teal-950/40 p-6 sm:p-8 backdrop-blur-md shadow-2xl mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-black text-white font-display">
                  Adım Adım EBOB - EKOK Hesaplayıcı
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Bölen listesi algoritmasını adım adım gör, ortak asal çarpanları keşfet.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setNum1(36);
                setNum2(48);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Varsayılan
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Sayıları Giriniz
              </h2>

              <div>
                <label htmlFor="num1-input" className="text-xs font-semibold text-slate-300 block mb-1.5">
                  1. Sayı (a)
                </label>
                <input
                  id="num1-input"
                  type="number"
                  min={1}
                  max={99999}
                  value={num1}
                  onChange={(e) => setNum1(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full h-11 rounded-xl border border-white/15 bg-white/5 px-4 font-mono text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="num2-input" className="text-xs font-semibold text-slate-300 block mb-1.5">
                  2. Sayı (b)
                </label>
                <input
                  id="num2-input"
                  type="number"
                  min={1}
                  max={99999}
                  value={num2}
                  onChange={(e) => setNum2(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full h-11 rounded-xl border border-white/15 bg-white/5 px-4 font-mono text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  [24, 36],
                  [15, 25],
                  [36, 48],
                  [45, 60],
                  [7, 12],
                ].map(([n1, n2]) => (
                  <button
                    key={`${n1}-${n2}`}
                    type="button"
                    onClick={() => {
                      setNum1(n1);
                      setNum2(n2);
                    }}
                    className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition"
                  >
                    {n1}, {n2}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/60 to-slate-900/90 p-5 shadow-2xl backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">EBOB({num1}, {num2})</span>
                <span className="text-2xl font-black font-mono text-emerald-400">{ebob}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-2">
                <span className="text-xs font-bold text-slate-400">EKOK({num1}, {num2})</span>
                <span className="text-2xl font-black font-mono text-teal-300">{ekok}</span>
              </div>

              {areCoprime && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-300 font-semibold flex items-center gap-1.5 mt-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>{num1} ve {num2} sayıları <strong>aralarında asaldır</strong>.</span>
                </div>
              )}

              <div className="border-t border-white/10 pt-2 text-[11px] font-mono text-slate-400">
                Doğrulama: EBOB × EKOK = {ebob} × {ekok} = {ebob * ekok} (a × b = {num1 * num2})
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  Asal Çarpan Bölen Listesi
                </h3>
                <span className="text-[11px] text-emerald-400 font-semibold">
                  ★ Her iki sayıyı da bölenler
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-center font-mono text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs text-slate-400">
                      <th className="py-2 px-3">Sayı 1</th>
                      <th className="py-2 px-3">Sayı 2</th>
                      <th className="py-2 px-3 text-right">Bölen Asal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {steps.map((step, idx) => (
                      <tr
                        key={idx}
                        className={`border-b border-white/5 transition ${
                          step.dividesAll ? 'bg-emerald-500/10 font-bold' : ''
                        }`}
                      >
                        <td className="py-2 px-3 text-slate-200">{step.nums[0]}</td>
                        <td className="py-2 px-3 text-slate-200">{step.nums[1]}</td>
                        <td className="py-2 px-3 text-right flex items-center justify-end gap-1.5 font-bold">
                          <span className={step.dividesAll ? 'text-emerald-400' : 'text-slate-400'}>
                            {step.prime}
                          </span>
                          {step.dividesAll ? (
                            <span className="text-xs text-emerald-400" title="Her iki sayıyı böldü">
                              ★
                            </span>
                          ) : (
                            <span className="text-xs text-transparent">★</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr className="text-xs text-slate-500">
                      <td className="py-2 px-3">1</td>
                      <td className="py-2 px-3">1</td>
                      <td className="py-2 px-3 text-right">Tamamlandı</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/5 p-3.5 text-xs text-slate-300 space-y-1.5">
                <div>
                  <span className="font-bold text-emerald-400">EBOB Hesabı: </span>
                  Yalnızca yıldızlı (★) bölenlerin çarpımıdır ={' '}
                  <span className="font-mono font-bold">
                    {steps.filter((s) => s.dividesAll).map((s) => s.prime).join(' × ') || '1'} = {ebob}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-teal-400">EKOK Hesabı: </span>
                  Sağ taraftaki tüm asal bölenlerin çarpımıdır ={' '}
                  <span className="font-mono font-bold">
                    {steps.map((s) => s.prime).join(' × ')} = {ekok}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <FaqAccordion
          title="EBOB ve EKOK Hakkında Bilinmesi Gerekenler"
          items={EBOB_FAQS}
          iconColorClass="text-emerald-400"
        />
      </div>
    </main>
  );
}
export default EbobEkokCalculatorContainer;
