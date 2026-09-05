'use client';

import { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  RotateCw,
  Sparkles,
  CheckCircle,
  Printer,
} from 'lucide-react';
import MathText from '@/components/MathText';

type Flashcard = {
  id: string;
  category: 'lgs' | 'yks';
  subject: string;
  title: string;
  frontText: string;
  formula: string;
  tip: string;
  example?: string;
};

export type LeitnerBoxLevel = 1 | 2 | 3 | 4 | 5;

export type CardLeitnerState = {
  box: LeitnerBoxLevel;
  lastReviewedAt: string;
  nextReviewAt: string;
  reviewCount: number;
};

export const LEITNER_INTERVALS: Record<LeitnerBoxLevel, number> = {
  1: 1,  // 1 gün
  2: 3,  // 3 gün
  3: 7,  // 7 gün
  4: 14, // 14 gün
  5: 30, // 30 gün (kalıcı)
};

export const LEITNER_STORAGE_KEY = 'ugurhoca_leitner_box_v1';

export function getLeitnerStates(): Record<string, CardLeitnerState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LEITNER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCardLeitnerState(
  cardId: string,
  result: 'forgot' | 'hard' | 'known'
): CardLeitnerState {
  const all = getLeitnerStates();
  const current = all[cardId] || {
    box: 1,
    lastReviewedAt: new Date().toISOString(),
    nextReviewAt: new Date().toISOString(),
    reviewCount: 0,
  };

  let newBox: LeitnerBoxLevel = current.box;
  if (result === 'forgot') {
    newBox = 1;
  } else if (result === 'hard') {
    newBox = current.box;
  } else if (result === 'known') {
    newBox = Math.min(5, current.box + 1) as LeitnerBoxLevel;
  }

  const intervalDays = LEITNER_INTERVALS[newBox];
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + intervalDays);

  const updated: CardLeitnerState = {
    box: newBox,
    lastReviewedAt: new Date().toISOString(),
    nextReviewAt: nextDate.toISOString(),
    reviewCount: (current.reviewCount || 0) + 1,
  };

  all[cardId] = updated;
  try {
    localStorage.setItem(LEITNER_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
  return updated;
}

const FLASHCARDS_DATA: Flashcard[] = [
  // LGS
  {
    id: 'lgs-1',
    category: 'lgs',
    subject: 'Çarpanlara Ayırma',
    title: 'Tam Kare Özdeşlikleri',
    frontText: '(a + b)² ve (a - b)² açılımları nasıldır?',
    formula: '$$(a + b)^2 = a^2 + 2ab + b^2$$\n$$(a - b)^2 = a^2 - 2ab + b^2$$',
    tip: 'Birincinin karesi, birinciyle ikincinin çarpımının iki katı, ikincinin karesi!',
    example: '$(x + 3)^2 = x^2 + 6x + 9$',
  },
  {
    id: 'lgs-2',
    category: 'lgs',
    subject: 'Çarpanlara Ayırma',
    title: 'İki Kare Farkı Özdeşliği',
    frontText: 'a² - b² ifadesi nasıl çarpanlarına ayrılır?',
    formula: '$$a^2 - b^2 = (a - b)(a + b)$$',
    tip: 'İki terimin farkı ile toplamının çarpımıdır.',
    example: '$x^2 - 16 = (x - 4)(x + 4)$',
  },
  {
    id: 'lgs-3',
    category: 'lgs',
    subject: 'Geometri / Üçgenler',
    title: 'Pisagor Bağıntısı',
    frontText: 'Dik üçgende hipotenüs ve dik kenarlar arasındaki ilişki nedir?',
    formula: '$$a^2 + b^2 = c^2$$',
    tip: 'c hipotenüstür (90° nin karşısı). Popüler özel üçgenler: 3-4-5, 5-12-13, 8-15-17, 7-24-25.',
  },
  {
    id: 'lgs-4',
    category: 'lgs',
    subject: 'Üslü İfadeler',
    title: 'Üslerin Kuvveti ve Çarpımı',
    frontText: 'Tabanları aynı üslü sayılar çarpılırken üsler ne yapılır?',
    formula: '$$a^x \\cdot a^y = a^{x+y}, \\quad \\frac{a^x}{a^y} = a^{x-y}, \\quad (a^x)^y = a^{x \\cdot y}$$',
    tip: 'Çarpmada üsler toplanır, bölmede çıkarılır, üssün üssünde çarpılır.',
  },
  {
    id: 'lgs-5',
    category: 'lgs',
    subject: 'Kareköklü İfadeler',
    title: 'Karekökte Çarpma ve Bölme',
    frontText: 'Kareköklü sayılarda çarpma ve bölme kuralları nasıldır?',
    formula: '$$\\sqrt{a} \\cdot \\sqrt{b} = \\sqrt{a \\cdot b}, \\quad \\frac{\\sqrt{a}}{\\sqrt{b}} = \\sqrt{\\frac{a}{b}}$$',
    tip: 'Toplama ve çıkarma yaparken kök içlerinin birebir aynı olması gerekir ($a\\sqrt{x} + b\\sqrt{x} = (a+b)\\sqrt{x}$).',
  },
  // YKS
  {
    id: 'yks-1',
    category: 'yks',
    subject: 'Trigonometri',
    title: 'Temel Trigonometrik Özdeşlik',
    frontText: 'sin²x ve cos²x toplamı neye eşittir?',
    formula: '$$\\sin^2(x) + \\cos^2(x) = 1, \\quad \\tan(x) = \\frac{\\sin(x)}{\\cos(x)}, \\quad 1 + \\tan^2(x) = \\sec^2(x)$$',
    tip: 'Birim çember üzerindeki her nokta $(x, y) = (\\cos\\theta, \\sin\\theta)$ dir.',
  },
  {
    id: 'yks-2',
    category: 'yks',
    subject: 'Trigonometri',
    title: 'Yarım Açı Formülleri',
    frontText: 'sin(2x) ve cos(2x) açılımları nelerdir?',
    formula: '$$\\sin(2x) = 2\\sin(x)\\cos(x)$$\n$$\\cos(2x) = \\cos^2(x) - \\sin^2(x) = 2\\cos^2(x) - 1 = 1 - 2\\sin^2(x)$$',
    tip: 'İntegral ve türev sorularında dereceden kurtulmak için cos(2x) formülleri hayat kurtarır!',
  },
  {
    id: 'yks-3',
    category: 'yks',
    subject: 'Logaritma',
    title: 'Logaritma Temel Özellikleri',
    frontText: 'Logaritmada çarpım, bölüm ve üs taban değiştirme kuralları nasıldır?',
    formula: '$$\\log_a(x \\cdot y) = \\log_a(x) + \\log_a(y)$$\n$$\\log_a\\left(\\frac{x}{y}\\right) = \\log_a(x) - \\log_a(y)$$\n$$\\log_{a^n}(x^m) = \\frac{m}{n}\\log_a(x), \\quad \\log_a(b) = \\frac{\\ln(b)}{\\ln(a)}$$',
    tip: 'Tanım aralığı: $a > 0, a \\neq 1$ ve $x > 0$ olmalıdır.',
  },
  {
    id: 'yks-4',
    category: 'yks',
    subject: 'Türev',
    title: 'Çarpım ve Bölümün Türevi',
    frontText: '(f · g)\' ve (f / g)\' türevleri nasıl alınır?',
    formula: '$$(f \\cdot g)\' = f\' \\cdot g + f \\cdot g\'$$\n$$\\left(\\frac{f}{g}\\right)\' = \\frac{f\' \\cdot g - f \\cdot g\'}{g^2}$$',
    tip: 'Bölümün türevinde paydada $g^2$ olduğunu ve aradaki işaretin eksi olduğunu unutma.',
  },
  {
    id: 'yks-5',
    category: 'yks',
    subject: 'İntegral',
    title: 'Belirli İntegral & Alan Hesabı',
    frontText: 'Eğri altında kalan alan integralle nasıl hesaplanır?',
    formula: '$$\\text{Alan} = \\int_{a}^{b} [f(x) - g(x)] \\, dx$$\n$$\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)$$',
    tip: 'Üstteki fonksiyondan alttaki fonksiyon çıkarılarak integral alınır.',
  },
];

type FormulaFlashcardsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function FormulaFlashcardsModal({
  isOpen,
  onClose,
}: FormulaFlashcardsModalProps) {
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'lgs' | 'yks' | 'due'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedCards, setLearnedCards] = useState<Set<string>>(new Set());
  const [leitnerStates, setLeitnerStates] = useState<Record<string, CardLeitnerState>>({});

  // Leitner durumlarını localStorage'dan yükle
  useState(() => {
    if (typeof window !== 'undefined') {
      try {
        setLeitnerStates(getLeitnerStates());
      } catch {
        // ignore
      }
    }
  });

  if (!isOpen) return null;

  const now = new Date();

  // Tekrarı gelen kartlar: Henüz hiç çalışılmamış veya nextReviewAt zamanı dolmuş olanlar
  const isDueCard = (card: Flashcard) => {
    const st = leitnerStates[card.id];
    if (!st) return true;
    return new Date(st.nextReviewAt) <= now;
  };

  const dueCount = FLASHCARDS_DATA.filter(isDueCard).length;

  const filteredCards = FLASHCARDS_DATA.filter((card) => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'due') return isDueCard(card);
    return card.category === categoryFilter;
  });

  const currentCard = filteredCards[currentIndex] || filteredCards[0];
  const currentLeitner = currentCard ? leitnerStates[currentCard.id] || { box: 1, lastReviewedAt: '', nextReviewAt: '', reviewCount: 0 } : null;

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % (filteredCards.length || 1));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + (filteredCards.length || 1)) % (filteredCards.length || 1));
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const rand = Math.floor(Math.random() * (filteredCards.length || 1));
    setCurrentIndex(rand);
  };

  const handleLeitnerReview = (cardId: string, result: 'forgot' | 'hard' | 'known') => {
    const updated = saveCardLeitnerState(cardId, result);
    setLeitnerStates((prev) => ({ ...prev, [cardId]: updated }));
    if (result === 'known' && updated.box >= 4) {
      setLearnedCards((prev) => new Set(prev).add(cardId));
    }
    // Otomatik sonraki karta geçiş
    handleNext();
  };

  const toggleLearned = (id: string) => {
    setLearnedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Kutu bazlı istatistikler
  const boxCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  FLASHCARDS_DATA.forEach((c) => {
    const b = leitnerStates[c.id]?.box || 1;
    boxCounts[b as 1 | 2 | 3 | 4 | 5]++;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Matematik Formül & Bilgi Kartları"
      className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/85 p-3 sm:p-4 backdrop-blur-md"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden !important; }
          .print-flashcards-area, .print-flashcards-area * { visibility: visible !important; }
          .print-flashcards-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-height: none !important;
            background: #ffffff !important;
            color: #000000 !important;
            border: none !important;
            box-shadow: none !important;
            padding: 8mm !important;
          }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
        @media screen {
          .print-only { display: none !important; }
        }
      `}} />

      <div className="print-flashcards-area flex h-full max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-slate-900 shadow-2xl">
        {/* A4 Yazdırma Görünümü (Yalnızca print esnasında görünür) */}
        <div className="print-only mb-6 border-b-2 border-black pb-4 text-black">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">Uğur Hoca Matematik — Formül & Bilgi Cep Kitapçığı</h1>
              <p className="mt-1 text-xs text-gray-700">Kategori: {categoryFilter === 'all' ? 'Tüm Konular (LGS & YKS)' : categoryFilter.toUpperCase()} | Öğrenci Çalışma Notu</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-gray-600">Toplam {filteredCards.length} Formül Kartı</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            {filteredCards.map((card, idx) => (
              <div key={card.id || idx} className="rounded-lg border border-gray-400 p-2.5 break-inside-avoid">
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-600 uppercase mb-1">
                  <span>{card.subject}</span>
                  <span>{card.category.toUpperCase()}</span>
                </div>
                <div className="font-bold text-sm text-black mb-1">{card.title}</div>
                <div className="font-mono text-xs bg-gray-100 p-1.5 rounded border border-gray-300 text-black mb-1">
                  <MathText>{card.formula}</MathText>
                </div>
                <div className="text-[11px] text-gray-800">{card.frontText}</div>
                {card.tip && (
                  <div className="mt-1 text-[10px] italic text-gray-600">💡 {card.tip}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="no-print flex items-center justify-between gap-2.5 border-b border-white/10 bg-slate-950/80 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-sm sm:text-lg font-bold text-white truncate">
                Formül & Bilgi Kartları
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Leitner aralıklı tekrar sistemiyle kalıcı matematik hafızası
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => typeof window !== 'undefined' && window.print()}
              aria-label="A4 Formül Kitapçığı Yazdır"
              title="Tüm formülleri A4 formatında yazdır veya PDF al"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Printer className="h-4 w-4 text-slate-400" />
              <span className="hidden sm:inline">A4 Yazdır</span>
            </button>
            <button
              type="button"
              onClick={handleShuffle}
              aria-label="Kartları karıştır"
              title="Rastgele kart seç"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            >
              <Shuffle className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filtre Çipleri */}
        <div className="no-print flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 border-b border-white/10 bg-slate-950/40 px-4 sm:px-6 py-2 sm:py-2.5">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('all');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
                categoryFilter === 'all'
                  ? 'bg-brand-primary text-white'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              Tümü ({FLASHCARDS_DATA.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('due');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`rounded-xl px-3 py-1 text-xs font-semibold transition flex items-center gap-1 ${
                categoryFilter === 'due'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-white/5 text-amber-300 hover:bg-white/10'
              }`}
            >
              <span>Tekrar Vakti</span>
              <span className="rounded-full bg-amber-400/30 px-1.5 py-0.2 text-[10px] font-bold">
                {dueCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('lgs');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
                categoryFilter === 'lgs'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              LGS (8. Sınıf)
            </button>
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('yks');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
                categoryFilter === 'yks'
                  ? 'bg-pink-500 text-white font-bold'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              YKS (TYT / AYT)
            </button>
          </div>

          <span className="text-xs font-medium text-slate-400">
            {filteredCards.length > 0 ? `${currentIndex + 1} / ${filteredCards.length}` : '0 / 0'}
          </span>
        </div>

        {/* Kart Sahnesi */}
        <div className="no-print flex flex-1 flex-col items-center justify-center p-4 sm:p-6">
          {currentCard ? (
            <div
              role="button"
              tabIndex={0}
              aria-label={currentCard.title}
              onClick={() => setIsFlipped((prev) => !prev)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsFlipped((prev) => !prev);
                }
              }}
              className="group relative flex min-h-[300px] w-full max-w-lg cursor-pointer flex-col justify-between rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 p-5 sm:p-6 text-center shadow-2xl transition-all duration-300 hover:border-brand-primary/50 hover:shadow-brand-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              {/* Üst Bilgi */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-lg bg-white/10 px-2.5 py-1 font-semibold text-brand-primary-soft">
                    {currentCard.subject}
                  </span>
                  {currentLeitner && (
                    <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                      Kutu {currentLeitner.box} ({LEITNER_INTERVALS[currentLeitner.box]} Gün)
                    </span>
                  )}
                </div>
                <span className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-white">
                  <RotateCw className="h-3 w-3" />
                  {isFlipped ? 'Ön yüze dön' : 'Cevap için tıkla'}
                </span>
              </div>

              {/* Kart Gövdesi */}
              <div className="my-auto py-4">
                {!isFlipped ? (
                  <div className="space-y-3">
                    <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
                      {currentCard.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                      {currentCard.frontText}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 animate-fade-in">
                    <div className="text-base sm:text-lg font-bold text-amber-300">
                      <MathText>{currentCard.formula}</MathText>
                    </div>
                    {currentCard.tip && (
                      <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-xs text-emerald-200">
                        💡 {currentCard.tip}
                      </p>
                    )}
                    {currentCard.example && (
                      <p className="text-xs text-slate-300 font-mono">
                        Örn: <MathText>{currentCard.example}</MathText>
                      </p>
                    )}

                    {/* Leitner Puanlama Aksiyonları (Arka Yüz) */}
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <div className="text-[11px] text-slate-400 mb-2 font-semibold">Bu formülü ne kadar hatırladın?</div>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLeitnerReview(currentCard.id, 'forgot');
                          }}
                          className="rounded-xl border border-rose-500/30 bg-rose-500/15 py-1.5 px-2 text-[11px] font-bold text-rose-300 hover:bg-rose-500/25 transition"
                          title="Kutu 1'e geri dön (1 gün sonra tekrar)"
                        >
                          Unuttum (K1)
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLeitnerReview(currentCard.id, 'hard');
                          }}
                          className="rounded-xl border border-amber-500/30 bg-amber-500/15 py-1.5 px-2 text-[11px] font-bold text-amber-300 hover:bg-amber-500/25 transition"
                          title="Aynı kutuda kal (yarın tekrar)"
                        >
                          Zorlandım
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLeitnerReview(currentCard.id, 'known');
                          }}
                          className="rounded-xl border border-emerald-500/30 bg-emerald-500/15 py-1.5 px-2 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/25 transition"
                          title="Sonraki kutuya ilerlet"
                        >
                          Biliyorum (+1)
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Alt Bilgi */}
              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/5 pt-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLearned(currentCard.id);
                  }}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 transition ${
                    learnedCards.has(currentCard.id)
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                      : 'hover:bg-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  {learnedCards.has(currentCard.id) ? 'Öğrenildi' : 'Öğrendim olarak işaretle'}
                </button>
                <span className="text-[11px] text-slate-500">Kartı çevirmek için tıkla</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm font-semibold text-slate-300">Bu filtrede gösterilecek kart bulunamadı.</p>
            </div>
          )}
        </div>

        {/* Alt Navigasyon & Leitner Dağılımı */}
        <div className="no-print flex items-center justify-between border-t border-white/10 bg-slate-950/80 px-3 sm:px-6 py-3 sm:py-4 gap-2">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Önceki Kart"
            disabled={filteredCards.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-white hover:bg-white/10 disabled:opacity-40 shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Önceki <span className="hidden sm:inline">Kart</span></span>
          </button>

          <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-slate-400 font-mono">
            <span className="text-slate-500 font-sans hidden sm:inline">Hafıza Kutuları:</span>
            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10" title="Kutu 1: Günlük">K1:{boxCounts[1]}</span>
            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10" title="Kutu 2: 3 Günlük">K2:{boxCounts[2]}</span>
            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10" title="Kutu 3: 7 Günlük">K3:{boxCounts[3]}</span>
            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10" title="Kutu 4: 14 Günlük">K4:{boxCounts[4]}</span>
            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-emerald-400" title="Kutu 5: Kalıcı (30 Gün)">K5:{boxCounts[5]}</span>
          </div>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Sonraki Kart"
            disabled={filteredCards.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-primary-deep disabled:opacity-40 shrink-0"
          >
            <span>Sonraki <span className="hidden sm:inline">Kart</span></span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
