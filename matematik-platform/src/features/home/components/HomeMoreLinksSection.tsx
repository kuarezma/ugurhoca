import { ArrowRight, Flame, MonitorPlay } from 'lucide-react';
import { SafeLink } from '@/components/SafeLink';

export function HomeMoreLinksSection() {
  return (
    <section className="defer-section px-4 pb-12">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display mb-4 text-2xl font-black text-primary">
          Daha Fazlası
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <SafeLink
            href="/canli-ders"
            aria-label="Canlı Dersler"
            className="flex items-center gap-4 rounded-2xl border border-border-default bg-surface-1 p-5 transition-colors hover:bg-surface-2"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-tone-danger-bg text-tone-danger-fg">
              <MonitorPlay className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-lg font-black text-primary">
                Canlı Ders
              </h3>
              <p className="mt-1 text-sm text-secondary">
                Öğretmenle birebir etkileşimli yayınlar, anlık soru masası ve
                ders kayıtları.
              </p>
            </div>
            <ArrowRight
              className="h-5 w-5 shrink-0 text-secondary"
              aria-hidden="true"
            />
          </SafeLink>
          <SafeLink
            href="/meydan-okuma"
            aria-label="Meydan Okuma"
            className="flex items-center gap-4 rounded-2xl border border-border-default bg-surface-1 p-5 transition-colors hover:bg-surface-2"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-tone-warn-bg text-tone-warn-fg">
              <Flame className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-lg font-black text-primary">
                Meydan Okuma
              </h3>
              <p className="mt-1 text-sm text-secondary">
                Günün sorusu, soru hedefi, LGS taktikleri ve başarı yol
                haritası.
              </p>
            </div>
            <ArrowRight
              className="h-5 w-5 shrink-0 text-secondary"
              aria-hidden="true"
            />
          </SafeLink>
        </div>
      </div>
    </section>
  );
}
