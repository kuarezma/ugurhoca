import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Gamepad2,
  Zap,
  ArrowRight,
  Trophy,
  Flame,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { SafeLink } from '@/components/SafeLink';
import { HOME_CATEGORIES } from '@/features/home/constants';
import { HomeQuickToolsGrid } from '@/features/home/components/HomeQuickToolsGrid';
import { HomeDailyChallenge } from '@/features/home/components/HomeDailyChallenge';
import { HomeDailyGoalWidget } from '@/features/home/components/HomeDailyGoalWidget';
import { LgsTacticsCorner } from '@/features/home/components/LgsTacticsCorner';
import { HomeAssignmentsSection } from '@/features/home/components/HomeAssignmentsSection';
import type {
  AppUser,
  ContentDocument,
  SharedDocumentAssignment,
} from '@/types';

export type HomeCategoryTab = 'lessons' | 'games' | 'tools';

type HomeCategoryHubProps = {
  isLight: boolean;
  user?: AppUser | null;
  documents?: ContentDocument[];
  visibleAssignments?: SharedDocumentAssignment[];
  onDismissAllAssignments?: () => void;
  onDismissAssignment?: (assignment: SharedDocumentAssignment) => void;
  onOpenFlashcards: () => void;
  onOpenScratchpad: () => void;
  onOpenCalculator: () => void;
  onOpenPomodoro: () => void;
  onOpenChecklist: () => void;
  onOpenGraph: () => void;
  onOpenProofs: () => void;
  onOpenCheatSheet: () => void;
  onOpenGlossary: () => void;
  onOpenTopicWeights: () => void;
  onOpenWeeklyPlanner: () => void;
  onOpenSpeedDrill: () => void;
};

export function HomeCategoryHub({
  isLight,
  user: _user,
  documents: _documents,
  visibleAssignments = [],
  onDismissAllAssignments = () => {},
  onDismissAssignment = () => {},
  onOpenFlashcards,
  onOpenScratchpad,
  onOpenCalculator,
  onOpenPomodoro,
  onOpenChecklist,
  onOpenGraph,
  onOpenProofs,
  onOpenCheatSheet,
  onOpenGlossary,
  onOpenTopicWeights,
  onOpenWeeklyPlanner,
  onOpenSpeedDrill,
}: HomeCategoryHubProps) {
  // Varsayılan olarak Dersler açık, kullanıcı dilerse kapatabilir veya diğerini açabilir
  const [activeCategory, setActiveCategory] = useState<HomeCategoryTab | null>(
    'lessons',
  );
  const cardRefs = useRef<Record<HomeCategoryTab, HTMLDivElement | null>>({
    lessons: null,
    games: null,
    tools: null,
  });

  // Dersler sekmesindeki hızlı erişim: Oyunlar hariç tüm ders alanları
  const lessonCategories = HOME_CATEGORIES.filter(
    (cat) => cat.id !== 'oyunlar',
  );

  const handleToggle = (categoryId: HomeCategoryTab) => {
    setActiveCategory((prev) => {
      const next = prev === categoryId ? null : categoryId;
      if (next && cardRefs.current[next]) {
        setTimeout(() => {
          cardRefs.current[next]?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }, 80);
      }
      return next;
    });
  };

  const categories: {
    id: HomeCategoryTab;
    title: string;
    subtitle: string;
    badge: string;
    icon: typeof BookOpen;
    gradient: string;
    activeBorder: string;
    activeBg: string;
    badgeActiveColor: string;
  }[] = [
    {
      id: 'lessons',
      title: 'Dersler',
      subtitle: 'Yaprak test, konu anlatımı, video ve çalışma dokümanları',
      badge: '8 Alan',
      icon: BookOpen,
      gradient: 'from-blue-600 via-indigo-600 to-violet-600',
      activeBorder: 'border-indigo-400/80 dark:border-indigo-500/80',
      activeBg: isLight ? 'bg-indigo-50/40' : 'bg-indigo-950/20',
      badgeActiveColor: isLight
        ? 'bg-indigo-100 text-indigo-700'
        : 'bg-indigo-500/20 text-indigo-300',
    },
    {
      id: 'games',
      title: 'Oyun',
      subtitle: 'Günün sorusu, formül antrenmanı & eğitici matematik oyunları',
      badge: 'Eğlen & Öğren',
      icon: Gamepad2,
      gradient: 'from-emerald-500 via-teal-600 to-cyan-600',
      activeBorder: 'border-emerald-400/80 dark:border-emerald-500/80',
      activeBg: isLight ? 'bg-emerald-50/40' : 'bg-emerald-950/20',
      badgeActiveColor: isLight
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-emerald-500/20 text-emerald-300',
    },
    {
      id: 'tools',
      title: 'Araçlar',
      subtitle: 'Puan/net hesaplayıcı, Pomodoro, tahta, formül kartları & taktikler',
      badge: '12 Araç',
      icon: Zap,
      gradient: 'from-amber-500 via-rose-500 to-purple-600',
      activeBorder: 'border-amber-400/80 dark:border-amber-500/80',
      activeBg: isLight ? 'bg-amber-50/40' : 'bg-amber-950/20',
      badgeActiveColor: isLight
        ? 'bg-amber-100 text-amber-700'
        : 'bg-amber-500/20 text-amber-300',
    },
  ];

  return (
    <section
      className="relative px-3.5 pb-8 pt-2 sm:px-4 sm:pb-10 sm:pt-3"
      aria-label="Ana Kategoriler"
    >
      <div className="mx-auto max-w-6xl space-y-3.5 sm:space-y-4">
        {categories.map((category) => {
          const isOpen = activeCategory === category.id;
          const Icon = category.icon;

          return (
            <div
              key={category.id}
              ref={(el) => {
                cardRefs.current[category.id] = el;
              }}
              className={`overflow-hidden rounded-2xl sm:rounded-3xl border transition-all duration-300 ${
                isOpen
                  ? `${category.activeBorder} ${category.activeBg} shadow-md`
                  : isLight
                    ? 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs'
                    : 'border-white/10 bg-slate-900/60 hover:border-white/20'
              }`}
            >
              {/* Tıklanabilir Akordeon Başlığı */}
              <button
                type="button"
                role="tab"
                id={`tab-${category.id}`}
                aria-selected={isOpen}
                aria-expanded={isOpen}
                aria-controls={`panel-${category.id}`}
                onClick={() => handleToggle(category.id)}
                className="group flex w-full items-center justify-between p-3.5 sm:p-5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl sm:rounded-3xl"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div
                    className={`flex h-11 w-11 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${category.gradient} text-white shadow-sm transition-transform duration-300 group-hover:scale-105`}
                  >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`font-display text-base sm:text-lg font-bold transition-colors ${
                          isOpen
                            ? isLight
                              ? 'text-slate-900'
                              : 'text-white'
                            : isLight
                              ? 'text-slate-800 group-hover:text-slate-900'
                              : 'text-slate-200 group-hover:text-white'
                        }`}
                      >
                        {category.title}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          isOpen
                            ? category.badgeActiveColor
                            : isLight
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-white/10 text-slate-400'
                        }`}
                      >
                        {category.badge}
                      </span>
                    </div>

                    <p
                      className={`text-xs sm:text-sm line-clamp-1 mt-0.5 transition-colors ${
                        isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      {category.subtitle}
                    </p>
                  </div>
                </div>

                {/* Sağ Taraf: Aksiyon İpucu ve Dönen Chevron */}
                <div className="flex items-center gap-2 shrink-0 ml-2 sm:ml-4">
                  <span
                    className={`hidden sm:inline-block text-xs font-semibold transition-colors ${
                      isOpen
                        ? isLight
                          ? 'text-slate-700'
                          : 'text-slate-200'
                        : isLight
                          ? 'text-slate-400 group-hover:text-slate-600'
                          : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  >
                    {isOpen ? 'Daralt' : 'İncele'}
                  </span>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300 ${
                      isOpen
                        ? 'rotate-180 bg-black/10 dark:bg-white/15 text-slate-900 dark:text-white shadow-xs'
                        : isLight
                          ? 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                          : 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-slate-200'
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </button>

              {/* Genişleyen Akordeon İçerik Alanı */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`panel-${category.id}`}
                    role="tabpanel"
                    aria-labelledby={`tab-${category.id}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.28, ease: 'easeInOut' }}
                    className="border-t border-slate-200/70 dark:border-white/10 px-3.5 pb-5 pt-4 sm:px-6 sm:pb-7 sm:pt-6"
                  >
                    {/* DERSLER İÇERİĞİ */}
                    {category.id === 'lessons' && (
                      <div className="space-y-6">
                        <div
                          className={`rounded-2xl border p-3.5 sm:p-6 ${
                            isLight
                              ? 'border-slate-200/80 bg-white shadow-xs'
                              : 'border-white/10 bg-white/5'
                          }`}
                        >
                          <div className="mb-3.5 sm:mb-4 flex items-center justify-between">
                            <div>
                              <h4
                                className={`font-display text-base font-bold sm:text-lg ${
                                  isLight ? 'text-slate-900' : 'text-white'
                                }`}
                              >
                                Hızlı Erişim & Ders Materyalleri
                              </h4>
                              <p
                                className={`hidden sm:block text-xs sm:text-sm ${
                                  isLight ? 'text-slate-500' : 'text-slate-400'
                                }`}
                              >
                                Müfredata uygun tüm test, video, kitap ve konu
                                dokümanları
                              </p>
                            </div>
                            <SafeLink
                              href="/icerikler"
                              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                            >
                              Tümü <ArrowRight className="h-3.5 w-3.5" />
                            </SafeLink>
                          </div>

                          {/* 4 Sütunlu Kompakt App Izgarası */}
                          <div className="grid grid-cols-4 gap-1.5 sm:gap-3.5">
                            {lessonCategories.map((cat) => (
                              <SafeLink
                                key={cat.id}
                                href={cat.href}
                                aria-label={`${cat.title} kategorisi`}
                                className={`group/item relative flex flex-col items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl border p-2 sm:p-4 text-center transition-all duration-200 hover:-translate-y-0.5 touch-manipulation active:scale-95 ${
                                  isLight
                                    ? 'border-slate-200/80 bg-slate-50/50 shadow-xs hover:border-indigo-200 hover:bg-white hover:shadow-md'
                                    : `${cat.bgColor} ${cat.borderColor} hover:border-white/20 hover:shadow-lg`
                                }`}
                              >
                                <div
                                  aria-hidden="true"
                                  className={`mx-auto mb-1.5 sm:mb-2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br ${cat.color} shadow-sm transition-transform duration-200 group/item:scale-105`}
                                >
                                  <cat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                </div>
                                <span
                                  className={`font-display text-[10px] sm:text-xs font-bold truncate max-w-full ${
                                    isLight ? 'text-slate-900' : 'text-white'
                                  }`}
                                >
                                  {cat.title}
                                </span>
                              </SafeLink>
                            ))}
                          </div>
                        </div>

                        {/* Ödevler (Varsa) */}
                        {visibleAssignments.length > 0 && (
                          <HomeAssignmentsSection
                            assignments={visibleAssignments}
                            isLight={isLight}
                            onDismissAll={onDismissAllAssignments}
                            onDismissAssignment={onDismissAssignment}
                          />
                        )}
                      </div>
                    )}

                    {/* OYUN İÇERİĞİ */}
                    {category.id === 'games' && (
                      <div className="space-y-6">
                        {/* Günlük Matematik Meydan Okuması */}
                        <HomeDailyChallenge isLight={isLight} />

                        {/* Oyun Vitrini */}
                        <div
                          className={`rounded-2xl border p-4 sm:p-6 ${
                            isLight
                              ? 'border-slate-200/80 bg-white shadow-xs'
                              : 'border-white/10 bg-white/5'
                          }`}
                        >
                          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                <Flame className="h-3.5 w-3.5 text-emerald-500" />
                                Oyunla Öğrenme Merkezi
                              </div>
                              <h4
                                className={`font-display text-base font-bold sm:text-xl ${
                                  isLight ? 'text-slate-900' : 'text-white'
                                }`}
                              >
                                Matematik Oyunları & Hızlı Egzersizler
                              </h4>
                            </div>

                            <SafeLink
                              href="/oyunlar"
                              className="inline-flex h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 px-3.5 text-xs font-bold text-white shadow-md transition-transform hover:-translate-y-0.5 active:scale-95"
                            >
                              <Gamepad2 className="h-4 w-4" />
                              Tüm Oyunlar
                              <ArrowRight className="h-3.5 w-3.5" />
                            </SafeLink>
                          </div>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {/* 60 Saniye Formül Antrenmanı */}
                            <div
                              className={`flex flex-col justify-between rounded-xl sm:rounded-2xl border p-4 transition-all ${
                                isLight
                                  ? 'border-slate-200 bg-slate-50/50 hover:border-emerald-300 hover:bg-white'
                                  : 'border-white/10 bg-white/5 hover:border-white/20'
                              }`}
                            >
                              <div>
                                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                                  <Zap className="h-4.5 w-4.5" />
                                </div>
                                <h5
                                  className={`font-display text-sm font-bold ${
                                    isLight ? 'text-slate-900' : 'text-white'
                                  }`}
                                >
                                  60 Saniye Formül Eşleştirme
                                </h5>
                                <p
                                  className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}
                                >
                                  Zamana karşı formülleri eşleştir, serilik kazan.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={onOpenSpeedDrill}
                                className="mt-3.5 inline-flex h-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-500/25 transition-colors"
                              >
                                Hız Antrenmanını Başlat
                              </button>
                            </div>

                            {/* Zihin Jimnastiği */}
                            <div
                              className={`flex flex-col justify-between rounded-xl sm:rounded-2xl border p-4 transition-all ${
                                isLight
                                  ? 'border-slate-200 bg-slate-50/50 hover:border-emerald-300 hover:bg-white'
                                  : 'border-white/10 bg-white/5 hover:border-white/20'
                              }`}
                            >
                              <div>
                                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
                                  <Trophy className="h-4.5 w-4.5" />
                                </div>
                                <h5
                                  className={`font-display text-sm font-bold ${
                                    isLight ? 'text-slate-900' : 'text-white'
                                  }`}
                                >
                                  Aritmetik & Zihin Jimnastiği
                                </h5>
                                <p
                                  className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}
                                >
                                  Dört işlemde hız rekorları kır.
                                </p>
                              </div>
                              <SafeLink
                                href="/oyunlar"
                                className="mt-3.5 inline-flex h-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-500/25 transition-colors"
                              >
                                Yarışa Başla
                              </SafeLink>
                            </div>

                            {/* Çarpım Tablosu */}
                            <div
                              className={`flex flex-col justify-between rounded-xl sm:rounded-2xl border p-4 transition-all ${
                                isLight
                                  ? 'border-slate-200 bg-slate-50/50 hover:border-emerald-300 hover:bg-white'
                                  : 'border-white/10 bg-white/5 hover:border-white/20'
                              }`}
                            >
                              <div>
                                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500 text-white shadow-sm">
                                  <CheckCircle2 className="h-4.5 w-4.5" />
                                </div>
                                <h5
                                  className={`font-display text-sm font-bold ${
                                    isLight ? 'text-slate-900' : 'text-white'
                                  }`}
                                >
                                  Çarpım Tablosu Meydan Okuma
                                </h5>
                                <p
                                  className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}
                                >
                                  Ezberbozan interaktif alıştırmalarla hızlan.
                                </p>
                              </div>
                              <SafeLink
                                href="/oyunlar"
                                className="mt-3.5 inline-flex h-8 items-center justify-center rounded-lg bg-teal-500/15 text-teal-700 dark:text-teal-300 text-xs font-bold hover:bg-teal-500/25 transition-colors"
                              >
                                Arenaya Gir
                              </SafeLink>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ARAÇLAR İÇERİĞİ */}
                    {category.id === 'tools' && (
                      <div className="space-y-6">
                        {/* Günlük Hedef & Takip */}
                        <HomeDailyGoalWidget isLight={isLight} />

                        {/* LGS Taktik Köşesi */}
                        <LgsTacticsCorner isLight={isLight} />

                        {/* Süper Güçler & Hızlı Araçlar Izgarası */}
                        <div className="-mx-3.5 sm:mx-0">
                          <HomeQuickToolsGrid
                            isLight={isLight}
                            excludeGames={true}
                            onOpenFlashcards={onOpenFlashcards}
                            onOpenScratchpad={onOpenScratchpad}
                            onOpenCalculator={onOpenCalculator}
                            onOpenPomodoro={onOpenPomodoro}
                            onOpenChecklist={onOpenChecklist}
                            onOpenGraph={onOpenGraph}
                            onOpenProofs={onOpenProofs}
                            onOpenCheatSheet={onOpenCheatSheet}
                            onOpenGlossary={onOpenGlossary}
                            onOpenTopicWeights={onOpenTopicWeights}
                            onOpenWeeklyPlanner={onOpenWeeklyPlanner}
                            onOpenSpeedDrill={onOpenSpeedDrill}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
