'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Triangle,
  ArrowLeft,
  Sparkles,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { FaqAccordion, type FaqItem } from '../components/FaqAccordion';

const PISAGOR_FAQS: FaqItem[] = [
  {
    q: "Pisagor bağıntısı nedir?",
    a: "Bir dik üçgende dik kenarların uzunluklarının kareleri toplamı, hipotenüsün (90 derecelik açının karşısındaki kenarın) uzunluğunun karesine eşittir: a² + b² = c²."
  },
  {
    q: "En sık karşılaşılan özel dik üçgenler hangileridir?",
    a: "LGS ve YKS'de en çok çıkan tam sayılı özel dik üçgenler: (3-4-5), (5-12-13), (8-15-17), (7-24-25) ve bunların tam katlarıdır (örneğin 6-8-10 veya 10-24-26)."
  },
  {
    q: "Açılara göre özel dik üçgenler nelerdir?",
    a: "30°-60°-90° üçgeninde 30° karşısı a ise 90° karşısı 2a, 60° karşısı a√3'tür. 45°-45°-90° ikizkenar dik üçgeninde ise dik kenarlar a ise hipotenüs a√2'dir."
  }
];

export function PisagorCalculatorContainer() {
  const [mode, setMode] = useState<'hypotenuse' | 'leg'>('hypotenuse');
  const [valA, setValA] = useState<number>(3);
  const [valB, setValB] = useState<number>(4);
  const [valC, setValC] = useState<number>(5);

  let result = 0;
  let explanation = '';

  if (mode === 'hypotenuse') {
    const a2 = valA * valA;
    const b2 = valB * valB;
    const c2 = a2 + b2;
    result = Math.sqrt(c2);
    explanation = `${valA}² + ${valB}² = ${a2} + ${b2} = ${c2}  -->  c = √${c2} ≈ ${result.toFixed(2)}`;
  } else {
    const c2 = valC * valC;
    const a2 = valA * valA;
    if (valC <= valA) {
      explanation = 'Hipotenüs (c), daima dik kenardan (a) büyük olmalıdır!';
      result = 0;
    } else {
      const b2 = c2 - a2;
      result = Math.sqrt(b2);
      explanation = `${valC}² - ${valA}² = ${c2} - ${a2} = ${b2}  -->  b = √${b2} ≈ ${result.toFixed(2)}`;
    }
  }

  const specialTriple = (() => {
    const a = valA;
    const b = mode === 'hypotenuse' ? valB : result;
    const c = mode === 'hypotenuse' ? result : valC;

    const roundC = Math.round(c * 100) / 100;
    const roundB = Math.round(b * 100) / 100;
    const minLeg = Math.min(a, roundB);
    const maxLeg = Math.max(a, roundB);

    if (minLeg === 3 && maxLeg === 4 && roundC === 5) return '3 - 4 - 5 Özel Üçgeni';
    if (minLeg === 6 && maxLeg === 8 && roundC === 10) return '6 - 8 - 10 (3-4-5 katı)';
    if (minLeg === 5 && maxLeg === 12 && roundC === 13) return '5 - 12 - 13 Özel Üçgeni';
    if (minLeg === 8 && maxLeg === 15 && roundC === 17) return '8 - 15 - 17 Özel Üçgeni';
    if (minLeg === 7 && maxLeg === 24 && roundC === 25) return '7 - 24 - 25 Özel Üçgeni';
    if (minLeg === maxLeg) return `İkizkenar Dik Üçgen (a, a, a√2) --> c = ${minLeg}√2 ≈ ${roundC}`;
    return null;
  })();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PISAGOR_FAQS.map((f) => ({
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
          <span className="text-amber-400 font-bold">Pisagor & Hipotenüs Hesaplayıcı</span>
        </div>

        <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-slate-900/80 to-rose-950/40 p-6 sm:p-8 backdrop-blur-md shadow-2xl mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 text-white shadow-lg">
                <Triangle className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-black text-white font-display">
                  Pisagor Bağıntısı & Hipotenüs Hesaplayıcı
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  a² + b² = c² bağıntısıyla dik kenar ve hipotenüsü adım adım çöz.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setValA(3);
                setValB(4);
                setValC(5);
                setMode('hypotenuse');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Sıfırla
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 space-y-4">
            <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setMode('hypotenuse')}
                className={`flex-1 py-2 rounded-xl transition ${
                  mode === 'hypotenuse'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Hipotenüs Bul (c)
              </button>
              <button
                type="button"
                onClick={() => setMode('leg')}
                className={`flex-1 py-2 rounded-xl transition ${
                  mode === 'leg'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Dik Kenar Bul (b)
              </button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md space-y-4">
              <div>
                <label htmlFor="valA-input" className="text-xs font-semibold text-slate-300 block mb-1.5">
                  1. Dik Kenar (a)
                </label>
                <input
                  id="valA-input"
                  type="number"
                  min={0.1}
                  step={0.5}
                  value={valA}
                  onChange={(e) => setValA(Math.max(0.1, parseFloat(e.target.value) || 1))}
                  className="w-full h-11 rounded-xl border border-white/15 bg-white/5 px-4 font-mono text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {mode === 'hypotenuse' ? (
                <div>
                  <label htmlFor="valB-input" className="text-xs font-semibold text-slate-300 block mb-1.5">
                    2. Dik Kenar (b)
                  </label>
                  <input
                    id="valB-input"
                    type="number"
                    min={0.1}
                    step={0.5}
                    value={valB}
                    onChange={(e) => setValB(Math.max(0.1, parseFloat(e.target.value) || 1))}
                    className="w-full h-11 rounded-xl border border-white/15 bg-white/5 px-4 font-mono text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="valC-input" className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Hipotenüs (c)
                  </label>
                  <input
                    id="valC-input"
                    type="number"
                    min={valA + 0.1}
                    step={0.5}
                    value={valC}
                    onChange={(e) => setValC(parseFloat(e.target.value) || valA + 1)}
                    className="w-full h-11 rounded-xl border border-white/15 bg-white/5 px-4 font-mono text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  [3, 4],
                  [5, 12],
                  [8, 15],
                  [7, 24],
                  [6, 8],
                ].map(([a, b]) => (
                  <button
                    key={`${a}-${b}`}
                    type="button"
                    onClick={() => {
                      setValA(a);
                      if (mode === 'hypotenuse') {
                        setValB(b);
                      } else {
                        setValC(Math.hypot(a, b));
                      }
                    }}
                    className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition"
                  >
                    {a}, {b}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-950/60 to-slate-900/90 p-5 shadow-2xl backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">
                  {mode === 'hypotenuse' ? 'Hipotenüs (c)' : '2. Dik Kenar (b)'}
                </span>
                <span className="text-3xl font-black font-mono text-amber-400">
                  ≈ {result.toFixed(2)}
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs font-mono text-slate-300 leading-relaxed">
                {explanation}
              </div>

              {specialTriple && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{specialTriple}</span>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md flex flex-col items-center justify-center min-h-[360px]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Dinamik Üçgen Önizlemesi
              </h3>

              <div className="relative w-64 h-64 flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <line x1="20" y1="20" x2="20" y2="180" stroke="#334155" strokeWidth="1" strokeDasharray="2,2" />
                  <line x1="20" y1="180" x2="180" y2="180" stroke="#334155" strokeWidth="1" strokeDasharray="2,2" />
                  <polygon points="30,170 170,170 30,30" fill="rgba(245, 158, 11, 0.15)" stroke="#f59e0b" strokeWidth="3" />
                  <path d="M30,154 L46,154 L46,170" fill="none" stroke="#f59e0b" strokeWidth="2" />
                  <text x="100" y="190" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="bold" fontFamily="monospace">
                    a = {valA}
                  </text>
                  <text x="14" y="105" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="bold" fontFamily="monospace">
                    b = {mode === 'hypotenuse' ? valB : result.toFixed(1)}
                  </text>
                  <text x="115" y="90" textAnchor="middle" fill="#ec4899" fontSize="14" fontWeight="bold" fontFamily="monospace">
                    c = {mode === 'hypotenuse' ? result.toFixed(1) : valC}
                  </text>
                </svg>
              </div>

              <div className="text-[11px] text-slate-400 text-center mt-4">
                Dik üçgende 90° açının karşısındaki en uzun kenara <strong>hipotenüs</strong> denir.
              </div>
            </div>
          </div>
        </div>

        <FaqAccordion
          title="Pisagor Bağıntısı ve Özel Üçgenler İpuçları"
          items={PISAGOR_FAQS}
          iconColorClass="text-amber-400"
        />
      </div>
    </main>
  );
}
export default PisagorCalculatorContainer;
