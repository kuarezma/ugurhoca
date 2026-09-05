'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Lightbulb,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { featuredExams } from '@/lib/examDates';

type TacticCategory =
  | 'Yeni Nesil Soru'
  | 'Zaman Yönetimi'
  | 'Cebir & Denklem'
  | 'Sayılar & İşlem'
  | 'Geometri & Şekil';

type LgsTactic = {
  id: number;
  category: TacticCategory;
  title: string;
  tip: string;
  example?: string;
};

export const LGS_TACTICS: LgsTactic[] = [
  {
    id: 1,
    category: 'Yeni Nesil Soru',
    title: 'Önce Soru Kökünü Oku',
    tip: 'Uzun metinli ve şekilli sorularda doğrudan metne dalma. Önce koyu renkli soru kökünü ("buna göre hangisi olamaz?", "en az kaçtır?") oku; zihnin neyi arayacağını bilerek metni süzsün.',
    example: 'Örnek: "En az" soruluyorsa EBOB veya en küçük ortak kat ihtimallerine odaklan.',
  },
  {
    id: 2,
    category: 'Zaman Yönetimi',
    title: 'Turlama Tekniğini Uygula',
    tip: 'Bir soruyla 2 dakikadan fazla inatlaşma. Çözüm yolu hemen belirmediyse yanına bir yıldız koyup diğer soruya geç. İlk turda bildiğin soruları cebe at, ikinci turda zor sorulara sakin kafayla dön.',
  },
  {
    id: 3,
    category: 'Sayılar & İşlem',
    title: 'EBOB mu EKOK mu? Parça-Bütün İlişkisi',
    tip: 'Büyük parçalar küçük parçalara bölünüyorsa (bidonlar şişelere, tarlalar parsellere) EBOB; küçük parçalar bir araya gelip büyüyorsa (otobüs seferleri, nöbetler, fayans döşeme) EKOK kullanılır.',
    example: 'Kural: Parçalama = EBOB, Birleştirme/Tekrarlama = EKOK.',
  },
  {
    id: 4,
    category: 'Sayılar & İşlem',
    title: 'Kareköklü Sayılarda Yaklaşık Değer',
    tip: 'Kareköklü bir sayının hangi tam sayılar arasında olduğunu bulurken en yakın tam kareleri sınır al. Virgüllü tahmin yaparken aradaki farkın hangi tarafa daha yakın olduğuna bak.',
    example: '√40 sayısı √36(6) ile √49(7) arasındadır. 36\'ya daha yakın olduğu için yaklaşık 6,3\'tür.',
  },
  {
    id: 5,
    category: 'Cebir & Denklem',
    title: 'Şıklardan Gitmeyi Bir Strateji Olarak Kullan',
    tip: 'Özellikle bilinmeyeni bulma veya denklem kurma sorularında denklem çok karmaşık görünüyorsa, şıklardaki sayıları sorudaki şartlara deneyerek hızlıca sonuca ulaşabilirsin.',
  },
  {
    id: 6,
    category: 'Geometri & Şekil',
    title: 'Pisagor Özel Üçgenlerini Ezberinde Tut',
    tip: 'LGS geometri sorularında hipotenüs hesaplarken zaman kaybetmemek için 3-4-5, 5-12-13, 8-15-17 ve 7-24-25 üçgenlerini ve bunların katlarını (örneğin 6-8-10) mutlaka ezbere bil.',
    example: 'Kat kuralı: 3-4-5\'in iki katı olan 6-8-10 soruların çoğunda doğrudan çıkar.',
  },
  {
    id: 7,
    category: 'Yeni Nesil Soru',
    title: 'Grafik Eksenlerinin Birimlerine Dikkat Et',
    tip: 'Çizgi veya sütun grafiklerinde dikey eksenin 0\'dan mı başladığına, verilerin "bin", "ton", "yüzde" cinsinden mi verildiğine dikkat et. Birim tuzağı en sık yapılan dikkatsizliktir.',
  },
  {
    id: 8,
    category: 'Cebir & Denklem',
    title: 'Özdeşlikleri Geometrik Olarak Zihninde Canlandır',
    tip: '(a + b)² = a² + 2ab + b² özdeşliğini kenarı (a+b) olan bir karenin dört alana ayrılması olarak hayal et. Ortadaki 2ab terimini unutma.',
  },
  {
    id: 9,
    category: 'Zaman Yönetimi',
    title: 'Optik Forma Sayfa Sayfa Kodla',
    tip: 'Soru soru kodlamak odak dağıtır; tüm sınavı son ana bırakmak ise kaydırma ve süre riskidir. En ideal yöntem iki sayfayı (2-4 soru) çözdükten sonra topluca optik forma kodlamaktır.',
  },
  {
    id: 10,
    category: 'Geometri & Şekil',
    title: 'Dönüşüm Geometrisinde Koordinat İşaretleri',
    tip: 'x eksenine göre yansımada y\'nin işareti değişir; y eksenine göre yansımada x\'in işareti değişir. Orijine göre yansımada ise her iki koordinatın da işareti tersine döner.',
  },
];

export function LgsTacticsCorner({ isLight = false }: { isLight?: boolean }) {
  // Select daily tactic deterministically based on day of year
  const defaultIndex = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return dayOfYear % LGS_TACTICS.length;
  }, []);

  const [currentIndex, setCurrentIndex] = useState(defaultIndex);
  const [appliedTactics, setAppliedTactics] = useState<Set<number>>(new Set());

  // Days left to LGS
  const lgsExam = featuredExams.find((e) => e.id === 'lgs-2026');
  const daysLeft = useMemo(() => {
    if (!lgsExam) return null;
    const target = new Date(lgsExam.targetDate).getTime();
    const now = Date.now();
    const diff = target - now;
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }, [lgsExam]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ugurhoca_applied_tactics');
      if (stored) {
        setAppliedTactics(new Set(JSON.parse(stored)));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleApplied = (id: number) => {
    setAppliedTactics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem(
          'ugurhoca_applied_tactics',
          JSON.stringify(Array.from(next)),
        );
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % LGS_TACTICS.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + LGS_TACTICS.length) % LGS_TACTICS.length,
    );
  };

  const currentTactic = LGS_TACTICS[currentIndex];
  const isCurrentApplied = appliedTactics.has(currentTactic.id);

  return (
    <section className="px-4 py-4 max-w-6xl mx-auto">
      <div
        className={`rounded-3xl p-5 sm:p-7 border shadow-xl transition-all relative overflow-hidden ${
          isLight
            ? 'bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-white border-amber-200/80 text-slate-800'
            : 'bg-gradient-to-br from-slate-900/95 via-indigo-950/40 to-slate-900 border-indigo-500/20 text-slate-100'
        }`}
      >
        {/* Glow ambient decoration */}
        <div className="absolute -right-16 -top-16 w-60 h-60 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Header with Title & LGS Countdown Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-md shadow-rose-500/20">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
                  LGS Matematik Taktik Köşesi
                  <Sparkles className="w-4 h-4 text-amber-500 inline" />
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Yeni nesil sorularda hız ve net kazandıran stratejiler
              </p>
            </div>
          </div>

          {daysLeft !== null && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>LGS&apos;ye Son {daysLeft} Gün</span>
            </div>
          )}
        </div>

        {/* Tactic Card */}
        <div className="py-5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {currentTactic.category}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Taktik {currentIndex + 1} / {LGS_TACTICS.length}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Önceki Taktik"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Sonraki Taktik"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentTactic.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <h4 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                {currentTactic.title}
              </h4>
              <p className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
                {currentTactic.tip}
              </p>

              {currentTactic.example && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-800 dark:text-amber-200 font-medium">
                  {currentTactic.example}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-200/60 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={() => toggleApplied(currentTactic.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              isCurrentApplied
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/15'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isCurrentApplied ? 'Uygulandı & Not Alındı' : 'Bu Taktiği Not Al'}
            </span>
          </button>

          <span className="text-slate-400">
            {appliedTactics.size > 0
              ? `${appliedTactics.size} taktik hafızaya eklendi`
              : 'Her gün yeni bir sınav stratejisi'}
          </span>
        </div>
      </div>
    </section>
  );
}
