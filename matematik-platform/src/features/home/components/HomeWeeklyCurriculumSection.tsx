import {
  ArrowRight,
  BookOpen,
  Calendar,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { SafeLink } from '@/components/SafeLink';

export type CurriculumCardInput = {
  grade: 5 | 6 | 7 | 8;
  unit: string;
  topic: string;
  outcomeCode: string;
  outcomeSummary: string;
};

type CurriculumCard = CurriculumCardInput & {
  gradeLabel: string;
  badge: string;
  href: string;
  cardBorder: string;
  prismBar: string;
  gradeBadgeStyle: string;
};

const gradeVisualMeta: Record<
  5 | 6 | 7 | 8,
  Omit<CurriculumCard, keyof CurriculumCardInput>
> = {
  5: {
    gradeLabel: '5. Sınıf',
    badge: 'Maarif Modeli',
    href: '/icerikler?grade=5',
    cardBorder: 'border-sky-200/80 dark:border-sky-400/20',
    prismBar: 'from-sky-400 via-cyan-400 to-blue-500',
    gradeBadgeStyle:
      'bg-sky-100 text-sky-900 dark:bg-sky-950/70 dark:text-sky-200 border-sky-300/80 dark:border-sky-700/60 backdrop-blur-md',
  },
  6: {
    gradeLabel: '6. Sınıf',
    badge: 'Maarif Modeli',
    href: '/icerikler?grade=6',
    cardBorder: 'border-amber-200/80 dark:border-amber-400/20',
    prismBar: 'from-amber-400 via-orange-400 to-yellow-500',
    gradeBadgeStyle:
      'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-200 border-amber-300/80 dark:border-amber-700/60 backdrop-blur-md',
  },
  7: {
    gradeLabel: '7. Sınıf',
    badge: 'Maarif Modeli',
    href: '/icerikler?grade=7',
    cardBorder: 'border-violet-200/80 dark:border-violet-400/20',
    prismBar: 'from-violet-400 via-purple-400 to-indigo-500',
    gradeBadgeStyle:
      'bg-violet-100 text-violet-900 dark:bg-violet-950/70 dark:text-violet-200 border-violet-300/80 dark:border-violet-700/60 backdrop-blur-md',
  },
  8: {
    gradeLabel: '8. Sınıf',
    badge: 'LGS Hazırlık',
    href: '/icerikler?grade=8',
    cardBorder: 'border-emerald-300/90 dark:border-emerald-400/30',
    prismBar: 'from-emerald-400 via-teal-400 to-cyan-500',
    gradeBadgeStyle:
      'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200 border-emerald-300/80 dark:border-emerald-700/60 backdrop-blur-md',
  },
};

const defaultInputs: readonly CurriculumCardInput[] = [
  {
    grade: 5,
    unit: 'Sayılar ve Nicelikler',
    topic: 'Çok Basamaklı Sayıları Okuma ve Yazma',
    outcomeCode: 'MAT.5.1.1',
    outcomeSummary:
      'Altı ve daha çok basamaklı doğal sayıların bölük ve basamak değerlerini kavrama, okuma ve yazma.',
  },
  {
    grade: 6,
    unit: 'Sayılar ve Nicelikler',
    topic: 'Kesirlerle Dört İşlem İçeren Problemler',
    outcomeCode: 'MAT.6.1.7',
    outcomeSummary:
      'Gerçek yaşam durumlarında kesir, ondalık ve yüzde gösterimleri ile dört işlem gerektiren problemleri çözme.',
  },
  {
    grade: 7,
    unit: 'Geometrik Nicelikler',
    topic: 'Dikdörtgenler Prizmasının Hacmi ve Yüzey Alanı',
    outcomeCode: 'MAT.7.4.2',
    outcomeSummary:
      'Dikdörtgenler prizmasının yüzey alanını açınım ve birim kareler üzerinden modelleyerek yorumlama.',
  },
  {
    grade: 8,
    unit: 'Sayılar ve İşlemler',
    topic: 'Kareköklü İfadelerde Toplama ve Çıkarma',
    outcomeCode: 'M.8.1.3.5',
    outcomeSummary:
      'Kareköklü ifadelerde katsayıları düzenleyerek toplama ve çıkarma işlemlerini yapabilme ve yeni nesil problemlere uygulama.',
  },
];

export type HomeWeeklyCurriculumSectionProps = {
  items?: readonly CurriculumCardInput[];
  weekLabel?: string | null;
};

export function HomeWeeklyCurriculumSection({
  items,
  weekLabel,
}: HomeWeeklyCurriculumSectionProps = {}) {
  const cards: CurriculumCard[] = (
    items && items.length === 4 ? items : defaultInputs
  ).map((input) => ({
    ...input,
    ...gradeVisualMeta[input.grade],
  }));

  return (
    <section
      aria-labelledby="weekly-curriculum-heading"
      className="px-4 py-8 sm:py-12"
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-subtle bg-surface-2 px-3 py-1 text-xs font-bold text-accent-fg">
              <Calendar aria-hidden="true" className="h-3.5 w-3.5" />
              <span>
                Canlı MEB Müfredat Takvimi · {weekLabel ?? '2026–2027'}
              </span>
            </div>
            <h2
              id="weekly-curriculum-heading"
              className="font-display text-2xl font-black tracking-tight text-primary sm:text-3xl"
            >
              Bu Hafta Sınıfta Ne İşliyoruz?
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-secondary sm:text-base">
              MEB Türkiye Yüzyılı Maarif Modeli ve güncel LGS planına göre bu
              haftanın üniteleri, kazanım özetleri ve föyleri:
            </p>
          </div>

          <SafeLink
            href="/icerikler"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-fg transition-colors hover:text-primary sm:text-sm"
          >
            <span>Tüm Müfredatı İncele</span>
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </SafeLink>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((item) => (
            <SafeLink
              key={item.grade}
              href={item.href}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border ${item.cardBorder} bg-surface-1/80 backdrop-blur-2xl p-5 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_28px_-10px_rgba(14,165,233,0.12)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_36px_-12px_rgba(2,6,23,0.5)] transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/80 hover:bg-surface-2/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-info`}
            >
              {/* Üst Parlayan Kristal Prizma Şeridi */}
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.prismBar}`}
              />

              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-black shadow-xs ${item.gradeBadgeStyle}`}
                  >
                    <GraduationCap aria-hidden="true" className="h-3.5 w-3.5" />
                    <span>{item.gradeLabel}</span>
                  </span>
                  <span className="rounded-lg border border-subtle bg-surface-2/80 px-2.5 py-0.5 text-[11px] font-semibold text-secondary backdrop-blur-md">
                    {item.badge}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-tertiary">
                    {item.unit}
                  </span>
                  <h3 className="mt-1 font-display text-base sm:text-lg font-extrabold text-primary transition-colors group-hover:text-accent-fg">
                    {item.topic}
                  </h3>
                </div>

                <div className="rounded-2xl border border-subtle bg-surface-2/60 p-3.5 text-xs backdrop-blur-md">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-accent-fg">
                    <Sparkles aria-hidden="true" className="h-3 w-3 shrink-0" />
                    <span>{item.outcomeCode}</span>
                  </div>
                  <p className="mt-1.5 line-clamp-3 leading-relaxed text-secondary font-medium">
                    {item.outcomeSummary}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-subtle pt-3.5 text-xs font-bold text-accent-fg">
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen aria-hidden="true" className="h-3.5 w-3.5" />
                  <span>Ders Materyallerini Aç</span>
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
                />
              </div>
            </SafeLink>
          ))}
        </div>
      </div>
    </section>
  );
}
