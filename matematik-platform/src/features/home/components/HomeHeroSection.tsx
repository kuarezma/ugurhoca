'use client';

import type { ReactNode } from 'react';
import {
  ArrowRight,
  BookOpen,
  Calculator,
  CalendarDays,
  CheckSquare,
  Compass,
  FileSignature,
  Gamepad2,
  GraduationCap,
  Library,
  Lightbulb,
  PenTool,
  PieChart,
  Sigma,
  Target,
  Timer,
  Trophy,
  Wind,
  Zap,
} from 'lucide-react';
import { SafeLink } from '@/components/SafeLink';
import type { AppUser } from '@/types';

type HomeHeroSectionProps = {
  user?: AppUser | null;
  recentDocumentsSlot?: ReactNode;
  onOpenFlashcards?: () => void;
  onOpenScratchpad?: () => void;
  onOpenCalculator?: (tab?: 'lgs' | 'yks') => void;
  onOpenPomodoro?: () => void;
  onOpenChecklist?: () => void;
  onOpenGraph?: () => void;
  onOpenProofs?: () => void;
  onOpenCheatSheet?: () => void;
  onOpenGlossary?: () => void;
  onOpenTopicWeights?: () => void;
  onOpenWeeklyPlanner?: () => void;
  onOpenSpeedDrill?: () => void;
};

const grades = [5, 6, 7, 8] as const;

const gradeStyles = {
  5: {
    card: 'border-sky-200/80 bg-surface-1/80 dark:border-sky-400/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_28px_-10px_rgba(14,165,233,0.15)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_36px_-12px_rgba(2,6,23,0.5)] hover:border-sky-400/80',
    prismBar: 'from-sky-400 via-cyan-400 to-blue-500',
    number:
      'bg-gradient-to-br from-sky-700 to-blue-700 text-[var(--on-brand)] dark:from-sky-400 dark:to-cyan-300 dark:text-slate-950 shadow-md shadow-sky-500/25',
    svgWatermark: (
      <svg className="w-16 h-16 text-sky-500/10 dark:text-sky-400/10" viewBox="0 0 48 48" fill="none" stroke="currentColor">
        <circle cx="24" cy="24" r="18" strokeWidth="2" strokeDasharray="3 3" />
        <circle cx="24" cy="24" r="8" strokeWidth="2" />
        <line x1="24" y1="6" x2="24" y2="42" strokeWidth="1.5" />
      </svg>
    ),
  },
  6: {
    card: 'border-amber-200/80 bg-surface-1/80 dark:border-amber-400/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_28px_-10px_rgba(245,158,11,0.15)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_36px_-12px_rgba(2,6,23,0.5)] hover:border-amber-400/80',
    prismBar: 'from-amber-400 via-orange-400 to-yellow-500',
    number:
      'bg-gradient-to-br from-amber-700 to-orange-700 text-[var(--on-brand)] dark:from-amber-300 dark:to-orange-400 dark:text-slate-950 shadow-md shadow-amber-500/25',
    svgWatermark: (
      <svg className="w-16 h-16 text-amber-500/10 dark:text-amber-400/10" viewBox="0 0 48 48" fill="none" stroke="currentColor">
        <path d="M24 6 A18 18 0 0 1 42 24 L24 24 Z" strokeWidth="2" />
        <circle cx="24" cy="24" r="18" strokeWidth="2" strokeDasharray="4 2" />
      </svg>
    ),
  },
  7: {
    card: 'border-violet-200/80 bg-surface-1/80 dark:border-violet-400/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_28px_-10px_rgba(139,92,246,0.15)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_36px_-12px_rgba(2,6,23,0.5)] hover:border-violet-400/80',
    prismBar: 'from-violet-400 via-purple-400 to-indigo-500',
    number:
      'bg-gradient-to-br from-violet-700 to-purple-700 text-[var(--on-brand)] dark:from-violet-400 dark:to-purple-400 dark:text-slate-950 shadow-md shadow-violet-500/25',
    svgWatermark: (
      <svg className="w-16 h-16 text-violet-500/10 dark:text-violet-400/10" viewBox="0 0 48 48" fill="none" stroke="currentColor">
        <line x1="6" y1="24" x2="42" y2="24" strokeWidth="2" />
        <line x1="24" y1="6" x2="24" y2="42" strokeWidth="2" />
        <path d="M12 36 L36 12" strokeWidth="2" strokeDasharray="3 3" />
        <circle cx="24" cy="24" r="3" fill="currentColor" />
      </svg>
    ),
  },
  8: {
    card: 'border-emerald-300/90 bg-surface-1/85 dark:border-emerald-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_14px_32px_-10px_rgba(16,185,129,0.2)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_18px_40px_-12px_rgba(2,6,23,0.6)] hover:border-emerald-500/90 ring-1 ring-emerald-500/20',
    prismBar: 'from-emerald-400 via-teal-400 to-cyan-500',
    number:
      'bg-gradient-to-br from-emerald-700 to-teal-800 text-[var(--on-brand)] dark:from-emerald-400 dark:to-teal-400 dark:text-slate-950 shadow-md shadow-emerald-500/30',
    svgWatermark: (
      <svg className="w-16 h-16 text-emerald-500/15 dark:text-emerald-400/15" viewBox="0 0 48 48" fill="none" stroke="currentColor">
        <path d="M8 28 L14 28 L18 38 L24 10 L40 10" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <polygon points="26,16 38,36 26,36" strokeWidth="1.5" strokeDasharray="2 2" />
      </svg>
    ),
  },
};

const toolIconStyles = [
  'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 shadow-xs',
  'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-xs',
  'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 shadow-xs',
  'bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300 shadow-xs',
];

const portals = [
  {
    title: 'Yaprak Testler & İçerikler',
    href: '/icerikler?type=yaprak-test',
    label: 'Yaprak Testler ve Ders İçerikleri',
    icon: FileSignature,
    prismBar: 'from-sky-400 via-cyan-400 to-indigo-500',
    accent:
      'border border-sky-200/80 dark:border-sky-400/20 bg-surface-1/80 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_16px_36px_-12px_rgba(14,165,233,0.16)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_20px_45px_-15px_rgba(2,6,23,0.65)] hover:border-sky-400/80 hover:-translate-y-1 transition-all duration-300',
    iconStyle:
      'bg-gradient-to-br from-sky-700 to-indigo-700 text-[var(--on-brand)] dark:from-sky-400 dark:to-indigo-400 dark:text-slate-950 shadow-lg shadow-sky-500/25',
    chipStyle:
      'bg-sky-50/80 text-sky-950 border border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-200 dark:border-sky-400/20 backdrop-blur-md',
    actionStyle:
      'bg-gradient-to-r from-sky-700 to-indigo-700 text-[var(--on-brand)] dark:from-sky-400 dark:to-cyan-300 dark:text-slate-950 shadow-md shadow-sky-600/20 hover:opacity-95',
    description:
      'Kazanım testleri, yeni nesil soru föyleri ve çalışma kağıtlarıyla öğrendiklerini pekiştir.',
    topics: ['Yaprak testler', 'Çalışma kağıtları', 'Ders içerikleri'],
    action: 'Yaprak Test İçeriklerini Aç',
  },
  {
    title: 'Matematik Oyunları Dünyası',
    href: '/oyunlar',
    label: 'Matematik Oyunları Dünyası',
    icon: Gamepad2,
    prismBar: 'from-emerald-400 via-teal-400 to-cyan-500',
    accent:
      'border border-emerald-200/80 dark:border-emerald-400/20 bg-surface-1/80 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_16px_36px_-12px_rgba(16,185,129,0.16)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_20px_45px_-15px_rgba(2,6,23,0.65)] hover:border-emerald-400/80 hover:-translate-y-1 transition-all duration-300',
    iconStyle:
      'bg-gradient-to-br from-emerald-700 to-teal-800 text-[var(--on-brand)] dark:from-emerald-400 dark:to-teal-400 dark:text-slate-950 shadow-lg shadow-emerald-600/25',
    chipStyle:
      'bg-emerald-50/80 text-emerald-950 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-400/20 backdrop-blur-md',
    actionStyle:
      'bg-gradient-to-r from-emerald-700 to-teal-800 text-[var(--on-brand)] dark:from-emerald-400 dark:to-teal-300 dark:text-slate-950 shadow-md shadow-emerald-600/20 hover:opacity-95',
    description:
      'Sayılar, kesirler ve zihinden işlemlerle düşünme becerilerini oyun oynayarak geliştir.',
    topics: ['Zihin egzersizleri', 'İşlem becerileri', 'Eğlenerek öğren'],
    action: 'Tüm Oyunları Keşfet',
  },
];

const games = [
  {
    title: 'Çarpım Yarışı',
    borderStyle: 'border-amber-200/80 dark:border-amber-800/60',
    iconStyle:
      'bg-gradient-to-br from-amber-400 to-orange-500 text-[var(--on-brand)] dark:from-amber-300 dark:to-orange-400 dark:text-slate-950 shadow-xs',
    href: '/oyunlar?id=1',
    icon: Zap,
    description: 'Çarpma becerini geliştir',
  },
  {
    title: 'Kesir Pizzacısı',
    borderStyle: 'border-rose-200/80 dark:border-rose-800/60',
    iconStyle:
      'bg-gradient-to-br from-rose-400 to-pink-500 text-[var(--on-brand)] dark:from-rose-300 dark:to-pink-400 dark:text-slate-950 shadow-xs',
    href: '/oyunlar?id=13',
    icon: PieChart,
    description: 'Kesirleri keşfet',
  },
  {
    title: 'Sayı Düellosu',
    borderStyle: 'border-sky-200/80 dark:border-sky-800/60',
    iconStyle:
      'bg-gradient-to-br from-sky-400 to-blue-500 text-[var(--on-brand)] dark:from-sky-300 dark:to-blue-400 dark:text-slate-950 shadow-xs',
    href: '/oyunlar?id=19',
    icon: Trophy,
    description: 'Sayılarla düşün',
  },
  {
    title: 'Balon Patlatma',
    borderStyle: 'border-emerald-200/80 dark:border-emerald-800/60',
    iconStyle:
      'bg-gradient-to-br from-emerald-400 to-teal-500 text-[var(--on-brand)] dark:from-emerald-300 dark:to-teal-400 dark:text-slate-950 shadow-xs',
    href: '/oyunlar?id=11',
    icon: Wind,
    description: 'İşlemlerle pratik yap',
  },
];

const cardClassName =
  'rounded-3xl border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-info focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0';

export function HomeHeroSection({
  user,
  recentDocumentsSlot,
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
}: HomeHeroSectionProps) {
  const firstName = user?.name?.split(' ')[0];
  const greeting = firstName
    ? `Merhaba ${firstName}!`
    : 'Matematiğe Hoş Geldin!';
  const tools = [
    {
      title: 'LGS Puan & Net Hesaplama',
      icon: Calculator,
      onOpen: onOpenCalculator ? () => onOpenCalculator('lgs') : undefined,
    },
    { title: 'Odak Pomodoro Sayacı', icon: Timer, onOpen: onOpenPomodoro },
    {
      title: 'Karalama & İşlem Tahtası',
      icon: PenTool,
      onOpen: onOpenScratchpad,
    },
    {
      title: 'Hızlı Formül & Kural Kartları',
      icon: Sigma,
      onOpen: onOpenCheatSheet,
    },
    {
      title: 'Görsel İspatlar & Geometri',
      icon: Compass,
      onOpen: onOpenProofs,
    },
    {
      title: 'Matematik Terimler Sözlüğü',
      icon: BookOpen,
      onOpen: onOpenGlossary,
    },
    { title: 'Fonksiyon & Grafik Çizici', icon: Target, onOpen: onOpenGraph },
    {
      title: 'Haftalık Çalışma Planlayıcı',
      icon: CalendarDays,
      onOpen: onOpenWeeklyPlanner,
    },
    {
      title: 'LGS Konu Ağırlık Matrisi',
      icon: GraduationCap,
      onOpen: onOpenTopicWeights,
    },
    { title: 'Formül Hız Antrenmanı', icon: Zap, onOpen: onOpenSpeedDrill },
    {
      title: 'Konu Takip Çizelgesi',
      icon: CheckSquare,
      onOpen: onOpenChecklist,
    },
    {
      title: 'Formül Hafıza Kartları',
      icon: Library,
      onOpen: onOpenFlashcards,
    },
  ];

  return (
    <section
      aria-label="Matematik öğrenme merkezi"
      className="px-4 pb-10 pt-6 sm:pb-16 sm:pt-10"
    >
      <div className="mx-auto max-w-6xl space-y-8 sm:space-y-10">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-center lg:gap-8">
          <div className="relative overflow-hidden rounded-3xl border border-sky-200/75 dark:border-sky-400/20 bg-surface-1/75 backdrop-blur-2xl p-6 sm:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_45px_-15px_rgba(14,165,233,0.14)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_20px_50px_-15px_rgba(2,6,23,0.65)] space-y-5 lg:col-span-7">
            {/* Üst Prizmatik Işık Kırılım Çizgisi */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400" />
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-sky-400/15 via-indigo-400/10 to-transparent blur-3xl" />

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/80 bg-emerald-50/80 dark:border-emerald-700/60 dark:bg-emerald-950/50 px-3.5 py-1.5 text-xs font-semibold text-emerald-900 dark:text-emerald-200 backdrop-blur-md shadow-xs">
              <GraduationCap
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300"
              />
              <span>Ortaokul Matematik Platformu · MEB 2026-2027</span>
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-primary sm:text-5xl lg:text-6xl">
              {greeting}
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-secondary sm:text-lg">
              5, 6, 7 ve 8. sınıf MEB müfredatına uygun yaprak testler,
              anlaşılır ders içerikleri ve matematik oyunlarıyla kendi hızında
              öğren.
            </p>

            {/* Mini Kristal İstatistik Kapsülleri */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="rounded-2xl border border-sky-200/70 dark:border-sky-400/20 bg-surface-2/60 backdrop-blur-md px-3 py-2 text-center shadow-xs">
                <div className="text-sm sm:text-base font-black text-primary">120+</div>
                <div className="text-[11px] font-semibold text-secondary truncate">PDF Föy</div>
              </div>
              <div className="rounded-2xl border border-emerald-200/70 dark:border-emerald-400/20 bg-surface-2/60 backdrop-blur-md px-3 py-2 text-center shadow-xs">
                <div className="text-sm sm:text-base font-black text-primary">20+</div>
                <div className="text-[11px] font-semibold text-secondary truncate">Zihin Oyunu</div>
              </div>
              <div className="rounded-2xl border border-indigo-200/70 dark:border-indigo-400/20 bg-surface-2/60 backdrop-blur-md px-3 py-2 text-center shadow-xs">
                <div className="text-sm sm:text-base font-black text-primary">12</div>
                <div className="text-[11px] font-semibold text-secondary truncate">Akademik Stüdyo</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <p className="inline-flex items-start gap-2 rounded-xl border border-emerald-300/80 bg-emerald-100/70 px-3 py-2 text-sm font-semibold leading-relaxed text-emerald-900 dark:border-emerald-700/60 dark:bg-emerald-950/50 dark:text-emerald-200">
                <Lightbulb
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300"
                />
                <span>%100 Ücretsiz & Reklamsız · 100+ Yaprak Test & Föy</span>
              </p>
              {!user ? (
                <SafeLink
                  href="/deneme-salonu"
                  className="inline-flex items-center gap-2 rounded-xl border border-default bg-surface-1 px-3.5 py-2 text-sm font-semibold text-primary shadow-xs transition-colors hover:border-strong hover:bg-surface-2"
                >
                  <Trophy
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-accent-fg"
                  />
                  <span>Üye Olmadan Örnek Test & Oyun Dene</span>
                </SafeLink>
              ) : null}
            </div>
          </div>

          <div
            aria-label="Sınıfını seç"
            className="grid grid-cols-2 gap-3.5 lg:col-span-5"
          >
            {grades.map((grade) => (
              <SafeLink
                key={grade}
                href={`/icerikler?grade=${grade}`}
                className={`${cardClassName} relative overflow-hidden flex min-h-36 flex-col justify-between p-4.5 sm:p-5 ${gradeStyles[grade].card}`}
              >
                {/* Üst Parlayan Prizmatik Renk Kırılım Şeridi */}
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradeStyles[grade].prismBar}`}
                />
                {/* Sağ Alt Köşede Yarı Saydam SVG Geometrik Prizma/Motif */}
                <div className="pointer-events-none absolute -bottom-2 -right-2 select-none">
                  {gradeStyles[grade].svgWatermark}
                </div>

                <span
                  aria-hidden="true"
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl font-display text-3xl font-extrabold ${gradeStyles[grade].number}`}
                >
                  {grade}
                </span>
                <span className="flex w-full items-center justify-between gap-2 text-sm font-semibold text-primary z-10">
                  {grade === 8 ? '8. Sınıf (LGS)' : `${grade}. Sınıf Matematik`}
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-tertiary transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </SafeLink>
            ))}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {portals.map(
            ({
              title,
              href,
              label,
              icon: Icon,
              accent,
              prismBar,
              iconStyle,
              chipStyle,
              actionStyle,
              description,
              topics,
              action,
            }) => (
              <SafeLink
                key={href}
                href={href}
                aria-label={label}
                className={`${cardClassName} ${accent} flex flex-col justify-between gap-5 p-6 sm:p-8 relative overflow-hidden`}
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${prismBar}`}
                />
                <div className="space-y-4">
                  <span
                    className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl ${iconStyle}`}
                  >
                    <Icon aria-hidden="true" className="h-6 w-6 shrink-0" />
                  </span>
                  <div className="min-w-0 space-y-2">
                    <h2 className="font-display text-2xl font-extrabold text-primary sm:text-3xl">
                      {title}
                    </h2>
                    <p className="text-sm leading-relaxed text-secondary sm:text-base">
                      {description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {topics.map((topic) => (
                      <span
                        key={topic}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${chipStyle}`}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                <div
                  className={`mt-4 flex items-center justify-between gap-3 rounded-2xl px-5 py-3 text-sm font-bold ${actionStyle}`}
                >
                  <span>{action}</span>
                  <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0" />
                </div>
              </SafeLink>
            ),
          )}
        </div>

        {recentDocumentsSlot}

        <section aria-labelledby="popular-math-games" className="space-y-4">
          <h2
            id="popular-math-games"
            className="font-display text-2xl font-extrabold text-primary"
          >
            Popüler Matematik Oyunları
          </h2>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {games.map(
              ({
                title,
                href,
                icon: Icon,
                description,
                borderStyle,
                iconStyle,
              }) => (
                <SafeLink
                  key={href}
                  href={href}
                  className={`rounded-2xl border ${borderStyle} bg-surface-1/80 backdrop-blur-xl hover:bg-surface-2/90 flex items-start gap-3.5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:-translate-y-1 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-info`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
                  >
                    <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-primary">{title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-tertiary">
                      {description}
                    </p>
                  </div>
                </SafeLink>
              ),
            )}
          </div>
        </section>

        <section aria-labelledby="academic-study-tools" className="space-y-4">
          <h2
            id="academic-study-tools"
            className="font-display text-2xl font-extrabold text-primary"
          >
            Akademik Çalışma & Hesaplama Araçları
          </h2>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map(({ title, icon: Icon, onOpen }, index) => (
              <button
                key={title}
                type="button"
                onClick={onOpen}
                disabled={!onOpen}
                className="rounded-2xl border border-subtle bg-surface-1/80 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] font-sans transition-all duration-200 hover:border-sky-400/60 dark:hover:border-sky-400/40 hover:bg-surface-2/90 hover:-translate-y-0.5 flex min-h-20 items-center gap-3.5 p-4 text-left disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toolIconStyles[index % toolIconStyles.length]}`}
                >
                  <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
                </span>
                <span className="min-w-0 text-sm font-semibold leading-relaxed text-primary break-words">
                  {title}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
