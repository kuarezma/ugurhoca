'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, ChevronDown, ChevronUp, Sparkles, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';
import MathText from '@/components/MathText';
import type { QuizQuestion } from '@/types/quiz';

type QuestionHintLadderProps = {
  question: QuizQuestion;
  questionIndex: number;
};

// Pedagojik Heuristik: Soru metnindeki anahtar kelimelere göre akıllı ipuçları türetir
function deriveQuestionHints(question: QuizQuestion) {
  const text = (question.question || '').toLowerCase();
  const explanation = question.explanation || '';

  // 1. Kademe: Formül & Kural
  let level1 = 'Soruda verilenleri ve isteneni belirle. Bilinen değerleri bir kenara not et.';
  if (text.includes('oran') || text.includes('orantı')) {
    level1 = 'İçler dışlar çarpımı kuralını hatırla: a/b = c/d ise a · d = b · c.';
  } else if (text.includes('üslü') || text.includes('üs') || text.includes('kuvvet')) {
    level1 = 'Tabanları aynı üslü ifadelerde çarpma yapılırken üsler toplanır (aᵐ · aⁿ = aᵐ⁺ⁿ), bölmede çıkarılır.';
  } else if (text.includes('karekö') || text.includes('kök') || text.includes('√')) {
    level1 = 'Kök içindeki sayıyı çarpanlarına ayır ve tam kare çarpanları dışarı çıkar (√(a² · b) = a√b).';
  } else if (text.includes('yüzde') || text.includes('%')) {
    level1 = 'Bir sayının %X\'i bulunurken sayı X ile çarpılıp 100\'e bölünür (A · X / 100).';
  } else if (text.includes('alan') || text.includes('çevre')) {
    level1 = 'Geometrik şeklin temel alan ve çevre formüllerini hatırla (Dikdörtgen Alanı = a · b, Üçgen Alanı = (taban · yükseklik) / 2).';
  } else if (text.includes('eğim') || text.includes('doğru') || text.includes('grafik')) {
    level1 = 'Doğrunun eğimi m = (y₂ - y₁) / (x₂ - x₁) veya y = mx + b denklemindeki m katsayısıdır.';
  } else if (text.includes('parabol') || text.includes('ikinci derece')) {
    level1 = 'Parabol tepe noktası T(r, k) için r = -b / (2a) ve diskriminant Δ = b² - 4ac formüllerini hatırla.';
  } else if (text.includes('olasılık')) {
    level1 = 'Olasılık = (İstenen Olayların Sayısı) / (Tüm Olası Durumların Sayısı).';
  }

  // 2. Kademe: İlk İşlem Adımı
  let level2 = 'Denklem kurmak için bilinmeyene x de ve soruda verilen eşitliği matematik diline dök.';
  if (text.includes('karekö') || text.includes('kök')) {
    level2 = 'İlk adım olarak kök dışındaki katsayıları kök içine al veya kök içindeki sayıları en sade a√b haline getir.';
  } else if (text.includes('oran') || text.includes('yüzde')) {
    level2 = 'İlk olarak verilen yüzdeyi kesre çevir (örn: %25 = 1/4) ve ana sayı ile sadeleştirme yap.';
  } else if (text.includes('çarpan') || text.includes('ebob') || text.includes('ekok')) {
    level2 = 'İlk adım olarak verilen sayıları asal çarpanlarına ayır veya ortak bölen listesini çıkar.';
  } else if (text.includes('denklem') || text.includes('bilinmeyen')) {
    level2 = 'Benzer terimleri bir araya topla, bilinenleri bir tarafa, bilinmeyenleri (x) diğer tarafa aktar.';
  }

  // 3. Kademe: Çözüm Stratejisi
  const level3 = explanation
    ? explanation
    : 'İşlem adımlarını sırayla uygula, bulduğun sonucun şıklardaki karşılığını kontrol et ve gerekirse yerine koyarak sağlama yap.';

  return { level1, level2, level3 };
}

export function QuestionHintLadder({ question, questionIndex }: QuestionHintLadderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unlockedLevel, setUnlockedLevel] = useState<number>(0);

  // Soru değiştiğinde ipucu kutusunu sıfırla
  useEffect(() => {
    setIsOpen(false);
    setUnlockedLevel(0);
  }, [questionIndex]);

  const hints = deriveQuestionHints(question);

  const handleToggleOpen = () => {
    if (!isOpen && unlockedLevel === 0) {
      setUnlockedLevel(1); // Açıldığında ilk kademe hazır gelsin
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 sm:p-4 backdrop-blur-sm transition-all">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleToggleOpen}
          className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-300 hover:text-amber-200 transition focus:outline-none"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
            <Lightbulb className="h-4 w-4" />
          </div>
          <span>Kademeli İpucu Sistemi</span>
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
            {unlockedLevel > 0 ? `${unlockedLevel}/3 Kademe` : '3 Seviye'}
          </span>
        </button>

        <button
          type="button"
          onClick={handleToggleOpen}
          className="rounded-lg p-1 text-slate-400 hover:text-white transition"
          aria-label={isOpen ? 'İpuçlarını daralt' : 'İpuçlarını genişlet'}
        >
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pt-3 space-y-3"
          >
            {/* 1. Kademe: Temel Kural & Formül */}
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <BookOpen className="h-3.5 w-3.5" />
                <span>1. Kademe: Temel Kural & Formül</span>
              </div>
              <div className="text-xs text-slate-300 leading-relaxed pl-5">
                <MathText>{hints.level1}</MathText>
              </div>
            </div>

            {/* 2. Kademe: İlk İşlem Adımı */}
            {unlockedLevel >= 2 ? (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-indigo-500/30 bg-indigo-950/40 p-3 space-y-1"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                  <ArrowRight className="h-3.5 w-3.5" />
                  <span>2. Kademe: İlk İşlem Hamlesi</span>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed pl-5">
                  <MathText>{hints.level2}</MathText>
                </div>
              </motion.div>
            ) : (
              <button
                type="button"
                onClick={() => setUnlockedLevel(2)}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/15 py-2 text-xs font-semibold text-slate-400 hover:border-indigo-500/40 hover:text-indigo-300 transition"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>2. Kademe İpucunu Aç (İlk Hamle)</span>
              </button>
            )}

            {/* 3. Kademe: Çözüm Yolu & Strateji */}
            {unlockedLevel >= 3 ? (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-purple-500/30 bg-purple-950/40 p-3 space-y-1"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>3. Kademe: Çözüm Stratejisi</span>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed pl-5">
                  <MathText>{hints.level3}</MathText>
                </div>
              </motion.div>
            ) : unlockedLevel >= 2 ? (
              <button
                type="button"
                onClick={() => setUnlockedLevel(3)}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/15 py-2 text-xs font-semibold text-slate-400 hover:border-purple-500/40 hover:text-purple-300 transition"
              >
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                <span>3. Kademe İpucunu Aç (Çözüm Stratejisi)</span>
              </button>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
