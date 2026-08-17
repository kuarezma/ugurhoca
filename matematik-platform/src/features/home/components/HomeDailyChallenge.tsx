'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Flame,
  Award,
  Lightbulb,
} from 'lucide-react';
import MathText from '@/components/MathText';
import { fireConfetti } from '@/components/ConfettiBurst';

type Challenge = {
  id: string;
  gradeTag: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  tip: string;
};

const DAILY_CHALLENGES: Challenge[] = [
  {
    id: 'dc-1',
    gradeTag: 'Mantık & Cebir',
    question: 'Bir sayının 3 katının 5 fazlası, aynı sayının 5 katının 7 eksiğine eşittir. Bu sayı kaçtır?',
    options: ['4', '5', '6', '7'],
    correctIndex: 2,
    explanation: 'Denklem: $$3x + 5 = 5x - 7 \\implies 5 + 7 = 5x - 3x \\implies 12 = 2x \\implies x = 6$$',
    tip: 'Bilinmeyenleri bir tarafa, bilinen sayıları diğer tarafa toplayarak çözebilirsin.',
  },
  {
    id: 'dc-2',
    gradeTag: 'Geometri Pratiği',
    question: 'Bir dik üçgenin dik kenarları 6 cm ve 8 cm ise hipotenüs uzunluğu kaç cm\'dir?',
    options: ['9 cm', '10 cm', '12 cm', '14 cm'],
    correctIndex: 1,
    explanation: 'Pisagor Bağıntısı: $$a^2 + b^2 = c^2 \\implies 6^2 + 8^2 = 36 + 64 = 100 \\implies c = \\sqrt{100} = 10$$ cm (3-4-5 üçgeninin 2 katı).',
    tip: '3-4-5 özel üçgeninin katları (6-8-10, 9-12-15) işlem hızını 5 kat artırır!',
  },
  {
    id: 'dc-3',
    gradeTag: 'Üslü Sayı Pratiği',
    question: '$$2^{10} \\cdot 5^8$$ çarpımının sonucu kaç basamaklı bir sayıdır?',
    options: ['8 basamaklı', '9 basamaklı', '10 basamaklı', '11 basamaklı'],
    correctIndex: 1,
    explanation: '$$2^{10} \\cdot 5^8 = 2^2 \\cdot (2^8 \\cdot 5^8) = 4 \\cdot (2 \\cdot 5)^8 = 4 \\cdot 10^8$$. Bu sayı 4\'ün yanına 8 sıfır eklenerek yazılır, yani toplam 9 basamaklıdır.',
    tip: 'Basamak sayısı sorularında tabanları 2 ve 5 yaparak 10 tabanına dönüştür!',
  },
];

export function HomeDailyChallenge({ isLight }: { isLight: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [streakCount, setStreakCount] = useState(1);

  const challenge = DAILY_CHALLENGES[currentIndex] || DAILY_CHALLENGES[0];
  const isCorrect = selectedOption === challenge.correctIndex;

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === challenge.correctIndex) {
      setStreakCount((prev) => prev + 1);
      void fireConfetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const handleNextChallenge = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setCurrentIndex((prev) => (prev + 1) % DAILY_CHALLENGES.length);
  };

  return (
    <section className="relative px-4 py-8 sm:py-10">
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 ${
            isLight
              ? 'border-slate-200 bg-gradient-to-br from-violet-50/80 via-white to-amber-50/50 shadow-xl'
              : 'border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-850/80 to-slate-900/90 shadow-2xl backdrop-blur-md'
          }`}
        >
          {/* Arka Plan Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl"
          />

          <div className="relative">
            {/* Üst Başlık & Streak Bilgisi */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black shadow-md">
                  <Zap className="h-5 w-5 fill-slate-950 text-slate-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2
                      className={`font-display text-base font-bold sm:text-lg ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      Günün Matematik Meydan Okuması
                    </h2>
                    <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                      {challenge.gradeTag}
                    </span>
                  </div>
                  <p
                    className={`text-xs ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    Her gün yeni bir beyin jimnastiği ile matematiğini formda tut!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 shadow-sm">
                  <Flame className="h-4 w-4 fill-amber-400 text-amber-400 animate-bounce" />
                  <span>{streakCount} Günlük Seri</span>
                </div>

                <button
                  type="button"
                  onClick={handleNextChallenge}
                  title="Farklı bir soru dene"
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                    isLight
                      ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Başka Soru</span>
                </button>
              </div>
            </div>

            {/* Soru Metni */}
            <div className="mb-6">
              <p
                className={`font-display text-base font-semibold sm:text-xl leading-relaxed ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                <MathText>{challenge.question}</MathText>
              </p>
            </div>

            {/* Seçenekler */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {challenge.options.map((option, optIdx) => {
                const isSelected = selectedOption === optIdx;
                const isCorrectChoice = challenge.correctIndex === optIdx;

                let optStyle = isLight
                  ? 'border-slate-200 bg-white text-slate-800 hover:border-brand-primary/50 hover:bg-violet-50/40 shadow-sm'
                  : 'border-white/10 bg-slate-800/60 text-slate-200 hover:border-white/20 hover:bg-slate-800';

                if (isAnswered) {
                  if (isCorrectChoice) {
                    optStyle =
                      'border-emerald-500/50 bg-emerald-500/20 text-emerald-200 font-bold shadow-md';
                  } else if (isSelected) {
                    optStyle =
                      'border-rose-500/50 bg-rose-500/20 text-rose-200 font-semibold';
                  } else {
                    optStyle = 'opacity-50 border-white/5 bg-slate-900/40 text-slate-400';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`flex min-h-[3.25rem] items-center justify-between rounded-2xl border p-4 text-left transition-all duration-200 ${optStyle} ${
                      !isAnswered ? 'hover:-translate-y-0.5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                          isSelected
                            ? 'bg-brand-primary text-white'
                            : isLight
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="text-sm font-semibold">
                        <MathText>{option}</MathText>
                      </span>
                    </div>

                    {isAnswered && isCorrectChoice && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                    )}
                    {isAnswered && isSelected && !isCorrectChoice && (
                      <XCircle className="h-5 w-5 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Çözüm ve Açıklama Alanı (Cevaplandıktan Sonra Açılır) */}
            <AnimatePresence>
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                          <Award className="h-5 w-5" />
                          <span>Tebrikler! Doğru Cevap.</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                          <XCircle className="h-5 w-5" />
                          <span>İpuçlarına dikkat! Doğru seçenek {String.fromCharCode(65 + challenge.correctIndex)}.</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleNextChallenge}
                      className="rounded-xl bg-brand-primary px-3.5 py-1.5 text-xs font-bold text-white shadow transition hover:bg-brand-primary-deep"
                    >
                      Sıradaki Soruya Geç →
                    </button>
                  </div>

                  <div className="text-xs text-slate-300 leading-relaxed border-t border-white/10 pt-3">
                    <span className="font-bold text-white block mb-1">Ayrıntılı Çözüm:</span>
                    <MathText>{challenge.explanation}</MathText>
                  </div>

                  {challenge.tip && (
                    <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs text-amber-200">
                      <Lightbulb className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                      <span>{challenge.tip}</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
