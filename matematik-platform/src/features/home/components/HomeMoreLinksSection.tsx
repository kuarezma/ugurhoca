import { ArrowRight, Flame, MonitorPlay } from 'lucide-react';
import { SafeLink } from '@/components/SafeLink';

export function HomeMoreLinksSection() {
  return (
    <section className="defer-section px-4 pb-12">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display mb-4 text-2xl font-black text-primary">
          Daha Fazlası
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-5">
          <SafeLink
            href="/canli-ders"
            aria-label="Canlı Dersler"
            className="group relative flex items-center gap-4 overflow-hidden rounded-3xl border border-sky-200/75 dark:border-sky-400/20 bg-surface-1/75 p-5 sm:p-6 backdrop-blur-2xl shadow-[0_14px_34px_-16px_rgba(14,116,144,0.14),inset_0_1px_0_rgba(255,255,255,0.85)] dark:shadow-[0_18px_40px_-16px_rgba(2,6,23,0.65),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/50 dark:hover:border-sky-400/35"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500 opacity-85"
            />
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-rose-500/25 bg-tone-danger-bg text-tone-danger-fg shadow-xs transition-transform duration-300 group-hover:scale-105">
              <MonitorPlay className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-lg font-black text-primary transition-colors group-hover:text-accent-fg">
                Canlı Ders
              </h3>
              <p className="mt-1 text-sm text-secondary">
                Öğretmenle birebir etkileşimli yayınlar, anlık soru masası ve
                ders kayıtları.
              </p>
            </div>
            <ArrowRight
              className="h-5 w-5 shrink-0 text-secondary transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent-fg"
              aria-hidden="true"
            />
          </SafeLink>
          <SafeLink
            href="/meydan-okuma"
            aria-label="Meydan Okuma"
            className="group relative flex items-center gap-4 overflow-hidden rounded-3xl border border-sky-200/75 dark:border-sky-400/20 bg-surface-1/75 p-5 sm:p-6 backdrop-blur-2xl shadow-[0_14px_34px_-16px_rgba(14,116,144,0.14),inset_0_1px_0_rgba(255,255,255,0.85)] dark:shadow-[0_18px_40px_-16px_rgba(2,6,23,0.65),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/50 dark:hover:border-sky-400/35"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-amber-500 via-orange-500 to-sky-500 opacity-85"
            />
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/25 bg-tone-warn-bg text-tone-warn-fg shadow-xs transition-transform duration-300 group-hover:scale-105">
              <Flame className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-lg font-black text-primary transition-colors group-hover:text-accent-fg">
                Meydan Okuma
              </h3>
              <p className="mt-1 text-sm text-secondary">
                Günün sorusu, soru hedefi, LGS taktikleri ve başarı yol
                haritası.
              </p>
            </div>
            <ArrowRight
              className="h-5 w-5 shrink-0 text-secondary transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent-fg"
              aria-hidden="true"
            />
          </SafeLink>
        </div>
      </div>
    </section>
  );
}
