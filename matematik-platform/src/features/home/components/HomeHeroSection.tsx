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

const portals = [
  {
    title: 'Yaprak Testler & İçerikler',
    href: '/icerikler?type=yaprak-test',
    label: 'Yaprak Testler ve Ders İçerikleri',
    icon: FileSignature,
    accent: 'border-t-accent-info',
    ink: 'text-accent-info-ink',
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
    accent: 'border-t-accent-brand',
    ink: 'text-accent-brand-ink',
    description:
      'Sayılar, kesirler ve zihinden işlemlerle düşünme becerilerini oyun oynayarak geliştir.',
    topics: ['Zihin egzersizleri', 'İşlem becerileri', 'Eğlenerek öğren'],
    action: 'Tüm Oyunları Keşfet',
  },
];

const games = [
  {
    title: 'Çarpım Yarışı',
    href: '/oyunlar/carpim-yarisi',
    icon: Zap,
    description: 'Çarpma becerini geliştir',
  },
  {
    title: 'Kesir Pizzacısı',
    href: '/oyunlar/kesir-pizzacisi',
    icon: PieChart,
    description: 'Kesirleri keşfet',
  },
  {
    title: 'Sayı Düellosu',
    href: '/oyunlar/sayi-duellosu',
    icon: Trophy,
    description: 'Sayılarla düşün',
  },
  {
    title: 'Balon Patlatma',
    href: '/oyunlar/balon-patlatma',
    icon: Wind,
    description: 'İşlemlerle pratik yap',
  },
];

const cardClassName =
  'rounded-2xl border border-subtle bg-surface-1 transition-colors hover:border-default hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-info focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0';

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
            <div className="inline-flex items-center gap-2 rounded-full border border-subtle bg-surface-2 px-3 py-2 text-xs font-semibold text-secondary">
              <GraduationCap
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-accent-brand-ink"
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
            <p className="flex items-start gap-2 text-sm font-medium leading-relaxed text-tertiary">
              <Lightbulb
                aria-hidden="true"
                className="mt-0.5 h-4 w-4 shrink-0 text-accent-brand-ink"
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
                className={`${cardClassName} flex min-h-36 flex-col items-start gap-3 p-4 ${grade === 8 ? 'border-accent-brand' : ''}`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-12 w-12 items-center justify-center rounded-xl font-display text-3xl font-extrabold ${grade === 8 ? 'bg-accent-brand-tint text-accent-brand-ink' : 'bg-surface-2 text-primary'}`}
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
              ink,
              description,
              topics,
              action,
            }) => (
              <SafeLink
                key={href}
                href={href}
                aria-label={label}
                className={`${cardClassName} ${accent} flex flex-col gap-5 border-t-4 p-5 sm:p-7`}
              >
                <Icon aria-hidden="true" className={`h-8 w-8 ${ink}`} />
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
                      className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-medium text-secondary"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
                <div
                  className={`mt-auto flex items-center justify-between gap-3 border-t border-subtle pt-4 text-sm font-semibold ${ink}`}
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
            {games.map(({ title, href, icon: Icon, description }) => (
              <SafeLink
                key={href}
                href={href}
                className={`${cardClassName} flex items-start gap-3 p-4`}
              >
                <Icon
                  aria-hidden="true"
                  className="mt-1 h-5 w-5 shrink-0 text-accent-brand-ink"
                />
                <div>
                  <h3 className="font-semibold text-primary">{title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-tertiary">
                    {description}
                  </p>
                </div>
              </SafeLink>
            ))}
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
            {tools.map(({ title, icon: Icon, onOpen }) => (
              <button
                key={title}
                type="button"
                onClick={onOpen}
                disabled={!onOpen}
                className={`${cardClassName} flex min-h-20 items-center gap-3 p-4 text-left disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-accent-brand-ink">
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
