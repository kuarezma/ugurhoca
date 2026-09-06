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
} from 'lucide-react';
import { SafeLink } from '@/components/SafeLink';
import { HOME_CATEGORIES } from '@/features/home/constants';
import { HomeQuickToolsGrid } from '@/features/home/components/HomeQuickToolsGrid';
import { HomeDailyChallenge } from '@/features/home/components/HomeDailyChallenge';
import { HomeDailyGoalWidget } from '@/features/home/components/HomeDailyGoalWidget';
import { LgsTacticsCorner } from '@/features/home/components/LgsTacticsCorner';
import { HomeSuccessRoadmap } from '@/features/home/components/HomeSuccessRoadmap';
import { HomeRecentDocumentsSection } from '@/features/home/components/HomeRecentDocumentsSection';
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
  documents: ContentDocument[];
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
  documents,
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
  const [activeTab, setActiveTab] = useState<HomeCategoryTab>('lessons');
  const sectionRef = useRef<HTMLElement>(null);

  // Dersler sekmesindeki hızlı erişim: Oyunlar hariç tüm ders alanları
  const lessonCategories = HOME_CATEGORIES.filter(
    (cat) => cat.id !== 'oyunlar',
  );

  const handleTabChange = (tabId: HomeCategoryTab) => {
    setActiveTab(tabId);
    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect();
      if (rect.top < 0) {
        window.scrollTo({
          top: window.scrollY + rect.top - 80,
          behavior: 'smooth',
        });
      }
    }
  };

  const tabs: {
    id: HomeCategoryTab;
    title: string;
    subtitle: string;
    badge: string;
    icon: typeof BookOpen;
    gradient: string;
    activeBorder: string;
    activeBg: string;
  }[] = [
    {
      id: 'lessons',
      title: 'Dersler',
      subtitle: 'Yaprak test, konu, video ve dokümanlar',
      badge: '8 Alan',
      icon: BookOpen,
      gradient: 'from-blue-600 via-indigo-600 to-violet-600',
      activeBorder: 'border-indigo-500',
      activeBg: isLight ? 'bg-indigo-50/70' : 'bg-indigo-500/10',
    },
    {
      id: 'games',
      title: 'Oyun',
      subtitle: 'Günün sorusu, meydan okuma & yarışlar',
      badge: 'Eğlen & Öğren',
      icon: Gamepad2,
      gradient: 'from-emerald-500 via-teal-600 to-cyan-600',
      activeBorder: 'border-emerald-500',
      activeBg: isLight ? 'bg-emerald-50/70' : 'bg-emerald-500/10',
    },
    {
      id: 'tools',
      title: 'Araçlar',
      subtitle: 'Süper güçler, net hesaplama & Pomodoro',
      badge: '12 Araç',
      icon: Zap,
      gradient: 'from-amber-500 via-rose-500 to-purple-600',
      activeBorder: 'border-amber-500',
      activeBg: isLight ? 'bg-amber-50/70' : 'bg-amber-500/10',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative px-3.5 pb-8 pt-1 sm:px-4 sm:pb-10 sm:pt-2"
      aria-label="Ana Kategoriler"
    >
      <div className="mx-auto max-w-6xl">
        {/* Sticky Mobil & Masaüstü Kategori Seçici Barı */}
        <div className="sticky top-[calc(3.75rem+env(safe-area-inset-top))] sm:top-[calc(4.5rem+env(safe-area-inset-top))] z-20 -mx-3.5 px-3.5 py-2 sm:-mx-4 sm:px-4 sm:py-3 mb-3 sm:mb-6 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border-y border-slate-200/80 dark:border-white/10 shadow-xs transition-all">
          {/* Mobilde Segmented Control Bar (3 Ergonomik Hap Buton) */}
          <div
            className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 dark:bg-slate-800/90 p-1 sm:hidden border border-slate-200/80 dark:border-white/10"
            role="tablist"
            aria-label="İçerik Kategorileri"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={`mobile-${tab.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  id={`tab-${tab.id}`}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative flex h-11 items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-bold transition-all touch-manipulation active:scale-[0.98] ${
                    isActive
                      ? 'text-white shadow-sm'
                      : isLight
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobileActivePill"
                      className={`absolute inset-0 rounded-xl bg-gradient-to-r ${tab.gradient}`}
                      transition={{
                        type: 'spring',
                        bounce: 0.15,
                        duration: 0.35,
                      }}
                    />
                  )}
                  <Icon className="relative z-10 h-4 w-4 shrink-0" />
                  <span className="relative z-10 truncate">{tab.title}</span>
                </button>
              );
            })}
          </div>

          {/* Masaüstü Zengin Bento Kart Switcher */}
          <div
            className="hidden sm:grid sm:grid-cols-3 sm:gap-4"
            role="tablist"
            aria-label="İçerik Kategorileri Masaüstü"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={`desktop-${tab.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => handleTabChange(tab.id)}
                  className={`group relative flex flex-col items-start rounded-3xl border p-5 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isActive
                      ? `${tab.activeBorder} ${tab.activeBg} shadow-lg scale-[1.01]`
                      : isLight
                        ? 'border-slate-200/90 bg-white/90 hover:border-slate-300 hover:bg-slate-50/80 shadow-sm'
                        : 'border-white/10 bg-slate-900/60 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className={`absolute inset-x-0 -top-px h-1 rounded-t-3xl bg-gradient-to-r ${tab.gradient}`}
                      transition={{
                        type: 'spring',
                        bounce: 0.2,
                        duration: 0.5,
                      }}
                    />
                  )}

                  <div className="flex w-full items-center justify-between mb-2">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105 ${
                        isActive
                          ? `bg-gradient-to-br ${tab.gradient} text-white shadow-md`
                          : isLight
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isActive
                          ? isLight
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'bg-white/15 text-white'
                          : isLight
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  </div>

                  <h3
                    className={`font-display text-base font-bold transition-colors ${
                      isActive
                        ? isLight
                          ? 'text-slate-900'
                          : 'text-white'
                        : isLight
                          ? 'text-slate-700 group-hover:text-slate-900'
                          : 'text-slate-300 group-hover:text-white'
                    }`}
                  >
                    {tab.title}
                  </h3>

                  <p
                    className={`line-clamp-1 text-xs mt-0.5 transition-colors ${
                      isActive
                        ? isLight
                          ? 'text-slate-600 font-medium'
                          : 'text-slate-300'
                        : isLight
                          ? 'text-slate-500'
                          : 'text-slate-400'
                    }`}
                  >
                    {tab.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Seçili Kategori İçeriği */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            {activeTab === 'lessons' && (
              <motion.div
                key="lessons-panel"
                id="panel-lessons"
                role="tabpanel"
                aria-labelledby="tab-lessons"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Hızlı Erişim Kartları (Oyun hariç - Mobilde 4'lü Uygulama Izgarası) */}
                <div
                  className={`rounded-2xl sm:rounded-3xl border p-3.5 sm:p-7 ${
                    isLight
                      ? 'border-slate-200/90 bg-gradient-to-br from-white via-slate-50/50 to-indigo-50/20 shadow-bento'
                      : 'border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950 shadow-xl'
                  }`}
                >
                  <div className="mb-3 sm:mb-4 flex items-center justify-between">
                    <div>
                      <h3
                        className={`font-display text-base font-bold sm:text-xl ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        Hızlı Erişim & Ders Materyalleri
                      </h3>
                      <p
                        className={`hidden sm:block text-xs sm:text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}
                      >
                        Müfredata uygun tüm konu, test, video ve çalışma
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

                  <div className="grid grid-cols-4 gap-1.5 sm:gap-3.5">
                    {lessonCategories.map((category) => (
                      <SafeLink
                        key={category.id}
                        href={category.href}
                        aria-label={`${category.title} kategorisi`}
                        className={`group relative flex flex-col items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl border p-2 sm:p-4 text-center transition-all duration-200 hover:-translate-y-0.5 touch-manipulation active:scale-95 ${
                          isLight
                            ? 'border-slate-200/80 bg-white shadow-xs hover:border-indigo-200 hover:shadow-md'
                            : `${category.bgColor} ${category.borderColor} hover:border-white/20 hover:shadow-lg`
                        }`}
                      >
                        <div
                          aria-hidden="true"
                          className={`mx-auto mb-1.5 sm:mb-2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br ${category.color} shadow-sm transition-transform duration-200 group-hover:scale-105`}
                        >
                          <category.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <h4
                          className={`font-display text-[10px] sm:text-sm font-bold truncate max-w-full ${
                            isLight ? 'text-slate-900' : 'text-white'
                          }`}
                        >
                          {category.title}
                        </h4>
                      </SafeLink>
                    ))}
                  </div>
                </div>

                {/* Ödevler (Giriş Yapmış Öğrenci İçin) */}
                {visibleAssignments.length > 0 && (
                  <HomeAssignmentsSection
                    assignments={visibleAssignments}
                    isLight={isLight}
                    onDismissAll={onDismissAllAssignments}
                    onDismissAssignment={onDismissAssignment}
                  />
                )}

                {/* Son Eklenen Belgeler */}
                <HomeRecentDocumentsSection
                  documents={documents}
                  isLight={isLight}
                />

                {/* Başarı Yol Haritası */}
                <HomeSuccessRoadmap
                  isLight={isLight}
                  onOpenFlashcards={onOpenFlashcards}
                />
              </motion.div>
            )}

            {activeTab === 'games' && (
              <motion.div
                key="games-panel"
                id="panel-games"
                role="tabpanel"
                aria-labelledby="tab-games"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Günlük Matematik Meydan Okuması */}
                <HomeDailyChallenge isLight={isLight} />

                {/* Hızlı İşlem ve Oyun Vitrini */}
                <div
                  className={`rounded-2xl sm:rounded-3xl border p-4 sm:p-7 ${
                    isLight
                      ? 'border-slate-200/90 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/20 shadow-bento'
                      : 'border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950 shadow-xl'
                  }`}
                >
                  <div className="mb-4 sm:mb-5 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <Flame className="h-3.5 w-3.5 text-emerald-500" />
                        Oyunla Öğrenme Merkezi
                      </div>
                      <h3
                        className={`font-display text-base font-bold sm:text-2xl ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        Matematik Oyunları & Hızlı Egzersizler
                      </h3>
                      <p
                        className={`hidden sm:block text-xs sm:text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}
                      >
                        Reflekslerini geliştir, zamana karşı işlem yap ve
                        liderlik tablosunda yüksel!
                      </p>
                    </div>

                    <SafeLink
                      href="/oyunlar"
                      className="inline-flex h-9 sm:h-10 items-center gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 px-3.5 sm:px-4 text-xs font-bold text-white shadow-md transition-transform hover:-translate-y-0.5 touch-manipulation active:scale-95"
                    >
                      <Gamepad2 className="h-4 w-4" />
                      Tüm Oyunlar
                      <ArrowRight className="h-3.5 w-3.5" />
                    </SafeLink>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:gap-3.5 sm:grid-cols-3">
                    {/* Hızlı Formül Düellosu */}
                    <div
                      className={`flex flex-col justify-between rounded-2xl border p-4 sm:p-5 transition-all ${
                        isLight
                          ? 'border-slate-200 bg-white hover:border-emerald-300 shadow-sm'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                          <Zap className="h-5 w-5" />
                        </div>
                        <h4
                          className={`font-display text-sm font-bold ${
                            isLight ? 'text-slate-900' : 'text-white'
                          }`}
                        >
                          60 Saniye Formül Eşleştirme
                        </h4>
                        <p
                          className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}
                        >
                          Zamana karşı kural ve KaTeX formüllerini aktif
                          hatırla, serilik kazan.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={onOpenSpeedDrill}
                        className="mt-4 inline-flex h-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-500/25 transition-colors"
                      >
                        Hız Antrenmanını Başlat
                      </button>
                    </div>

                    {/* Dört İşlem & Hızlı Aritmetik */}
                    <div
                      className={`flex flex-col justify-between rounded-2xl border p-4 sm:p-5 transition-all ${
                        isLight
                          ? 'border-slate-200 bg-white hover:border-emerald-300 shadow-sm'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
                          <Trophy className="h-5 w-5" />
                        </div>
                        <h4
                          className={`font-display text-sm font-bold ${
                            isLight ? 'text-slate-900' : 'text-white'
                          }`}
                        >
                          Aritmetik & Zihin Jimnastiği
                        </h4>
                        <p
                          className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}
                        >
                          Toplama, çıkarma, çarpma ve bölmede hız rekorları kır.
                        </p>
                      </div>
                      <SafeLink
                        href="/oyunlar"
                        className="mt-4 inline-flex h-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-500/25 transition-colors"
                      >
                        Yarışa Başla
                      </SafeLink>
                    </div>

                    {/* Çarpım Tablosu Arena */}
                    <div
                      className={`flex flex-col justify-between rounded-2xl border p-4 sm:p-5 transition-all ${
                        isLight
                          ? 'border-slate-200 bg-white hover:border-emerald-300 shadow-sm'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-white shadow-sm">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <h4
                          className={`font-display text-sm font-bold ${
                            isLight ? 'text-slate-900' : 'text-white'
                          }`}
                        >
                          Çarpım Tablosu Meydan Okuma
                        </h4>
                        <p
                          className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}
                        >
                          Ortaokul ve ilkokul için ezberbozan interaktif
                          alıştırmalar.
                        </p>
                      </div>
                      <SafeLink
                        href="/oyunlar"
                        className="mt-4 inline-flex h-9 items-center justify-center rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-300 text-xs font-bold hover:bg-teal-500/25 transition-colors"
                      >
                        Arenaya Gir
                      </SafeLink>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'tools' && (
              <motion.div
                key="tools-panel"
                id="panel-tools"
                role="tabpanel"
                aria-labelledby="tab-tools"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Günlük Hedef & İlerleme Takipçisi */}
                <HomeDailyGoalWidget isLight={isLight} />

                {/* LGS Taktik Köşesi */}
                <LgsTacticsCorner isLight={isLight} />

                {/* Süper Güçler & Hızlı Araçlar Izgarası (Oyun hariç) */}
                <div className="-mx-4 sm:mx-0">
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
