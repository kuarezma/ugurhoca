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
    card: 'border-sky-200/90 bg-sky-50/65 hover:bg-sky-100/70 hover:border-sky-400 dark:border-sky-800/60 dark:bg-sky-950/30 dark:hover:bg-sky-900/40',
    number:
      'bg-sky-600 text-[var(--on-brand)] dark:bg-sky-400 dark:text-slate-950 shadow-xs',
  },
  6: {
    card: 'border-amber-200/90 bg-amber-50/65 hover:bg-amber-100/70 hover:border-amber-400 dark:border-amber-800/60 dark:bg-amber-950/30 dark:hover:bg-amber-900/40',
    number:
      'bg-amber-600 text-[var(--on-brand)] dark:bg-amber-400 dark:text-slate-950 shadow-xs',
  },
  7: {
    card: 'border-violet-200/90 bg-violet-50/65 hover:bg-violet-100/70 hover:border-violet-400 dark:border-violet-800/60 dark:bg-violet-950/30 dark:hover:bg-violet-900/40',
    number:
      'bg-violet-600 text-[var(--on-brand)] dark:bg-violet-400 dark:text-slate-950 shadow-xs',
  },
  8: {
    card: 'border-2 border-emerald-500/80 bg-emerald-50/85 hover:bg-emerald-100/80 dark:border-emerald-500/70 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 shadow-sm',
    number:
      'bg-emerald-700 text-[var(--on-brand)] dark:bg-emerald-400 dark:text-slate-950 shadow-xs',
  },
};

const toolIconStyles = [
  'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
  'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  'bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300',
];

const portals = [
  {
    title: 'Yaprak Testler & İçerikler',
    href: '/icerikler?type=yaprak-test',
    label: 'Yaprak Testler ve Ders İçerikleri',
    icon: FileSignature,
    accent:
      'border-t-4 border-t-sky-600 dark:border-t-sky-400 border-sky-200/90 dark:border-sky-800/60 bg-surface-1',
    iconStyle:
      'bg-sky-600 text-[var(--on-brand)] dark:bg-sky-400 dark:text-slate-950',
    chipStyle:
      'bg-sky-50 text-sky-900 border border-sky-200/80 dark:bg-sky-950/50 dark:text-sky-200 dark:border-sky-800/60',
    actionStyle:
      'bg-sky-700 text-[var(--on-brand)] dark:bg-sky-400 dark:text-slate-950',
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
    accent:
      'border-t-4 border-t-emerald-600 dark:border-t-emerald-400 border-emerald-200/90 dark:border-emerald-800/60 bg-surface-1',
    iconStyle:
      'bg-emerald-700 text-[var(--on-brand)] dark:bg-emerald-400 dark:text-slate-950',
    chipStyle:
      'bg-emerald-50 text-emerald-900 border border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800/60',
    actionStyle:
      'bg-emerald-700 text-[var(--on-brand)] dark:bg-emerald-400 dark:text-slate-950',
    description:
      'Sayılar, kesirler ve zihinden işlemlerle düşünme becerilerini oyun oynayarak geliştir.',
    topics: ['Zihin egzersizleri', 'İşlem becerileri', 'Eğlenerek öğren'],
    action: 'Tüm Oyunları Keşfet',
  },
];

const games = [
  {
    title: 'Çarpım Yarışı',
    borderStyle: 'border-amber-200/90 dark:border-amber-800/60',
    iconStyle:
      'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    href: '/oyunlar/carpim-yarisi',
    icon: Zap,
    description: 'Çarpma becerini geliştir',
  },
  {
    title: 'Kesir Pizzacısı',
    borderStyle: 'border-rose-200/90 dark:border-rose-800/60',
    iconStyle:
      'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
    href: '/oyunlar/kesir-pizzacisi',
    icon: PieChart,
    description: 'Kesirleri keşfet',
  },
  {
    title: 'Sayı Düellosu',
    borderStyle: 'border-sky-200/90 dark:border-sky-800/60',
    iconStyle: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
    href: '/oyunlar/sayi-duellosu',
    icon: Trophy,
    description: 'Sayılarla düşün',
  },
  {
    title: 'Balon Patlatma',
    borderStyle: 'border-emerald-200/90 dark:border-emerald-800/60',
    iconStyle:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    href: '/oyunlar/balon-patlatma',
    icon: Wind,
    description: 'İşlemlerle pratik yap',
  },
];

const cardClassName =
  'rounded-2xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-info focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0';

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
        <div className="grid gap-6 lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="space-y-5 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/90 bg-emerald-50/90 px-3 py-2 text-xs font-semibold text-emerald-900 dark:border-emerald-700/60 dark:bg-emerald-950/50 dark:text-emerald-200">
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
            <p className="inline-flex items-start gap-2 rounded-xl border border-emerald-300/80 bg-emerald-100/70 px-3 py-2 text-sm font-semibold leading-relaxed text-emerald-900 dark:border-emerald-700/60 dark:bg-emerald-950/50 dark:text-emerald-200">
              <Lightbulb
                aria-hidden="true"
                className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300"
              />
              <span>%100 Ücretsiz & Reklamsız · 100+ Yaprak Test & Föy</span>
            </p>
          </div>

          <div
            aria-label="Sınıfını seç"
            className="grid grid-cols-2 gap-3 lg:col-span-5"
          >
            {grades.map((grade) => (
              <SafeLink
                key={grade}
                href={`/icerikler?grade=${grade}`}
                className={`${cardClassName} flex min-h-36 flex-col items-start gap-3 p-4 ${gradeStyles[grade].card}`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-12 w-12 items-center justify-center rounded-xl font-display text-3xl font-extrabold ${gradeStyles[grade].number}`}
                >
                  {grade}
                </span>
                <span className="flex w-full items-center justify-between gap-2 text-sm font-semibold text-primary">
                  {grade === 8 ? '8. Sınıf (LGS)' : `${grade}. Sınıf Matematik`}
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-tertiary"
                  />
                </span>
              </SafeLink>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {portals.map(
            ({
              title,
              href,
              label,
              icon: Icon,
              accent,
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
                className={`${cardClassName} ${accent} flex flex-col gap-5 p-5 sm:p-7`}
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ${iconStyle}`}
                >
                  <Icon aria-hidden="true" className="h-6 w-6" />
                </span>
                <div className="space-y-2">
                  <h2 className="font-display text-2xl font-extrabold text-primary sm:text-3xl">
                    {title}
                  </h2>
                  <p className="text-sm leading-relaxed text-secondary sm:text-base">
                    {description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => (
                    <span
                      key={topic}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium ${chipStyle}`}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
                <div
                  className={`mt-auto flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-sm font-bold ${actionStyle}`}
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                  className={`${cardClassName} ${borderStyle} bg-surface-1 hover:bg-surface-2 flex items-start gap-3 p-4`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
                  >
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <div>
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map(({ title, icon: Icon, onOpen }, index) => (
              <button
                key={title}
                type="button"
                onClick={onOpen}
                disabled={!onOpen}
                className={`${cardClassName} border-subtle bg-surface-1 hover:border-default hover:bg-surface-2 flex min-h-20 items-center gap-3 p-4 text-left disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toolIconStyles[index % toolIconStyles.length]}`}
                >
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold leading-relaxed text-primary">
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
