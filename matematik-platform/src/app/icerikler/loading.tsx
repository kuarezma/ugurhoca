import Image from 'next/image';
import { Filter, Grid, Search } from 'lucide-react';

const SKELETON_CARDS = Array.from({ length: 6 });

export default function Loading() {
  return (
    <main className="page-surface icerikler-page min-h-screen pb-20">
      {/* Üst kenar akıcı rota yükleme göstergesi */}
      <div
        className="fixed top-0 left-0 right-0 z-50 h-1 overflow-hidden bg-surface-2"
        aria-hidden="true"
      >
        <div className="h-full w-2/5 rounded-full bg-brand-primary animate-pulse" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-1/95 backdrop-blur-md border-b-2 border-default py-3 sm:py-4 px-4 sm:px-6 xl:px-8 pt-[max(0.75rem,env(safe-area-inset-top))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        <div className="max-w-[1760px] mx-auto flex justify-between items-center gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-2xl border-2 border-brand-primary bg-brand-secondary p-0.5 shadow-sm">
              <Image
                src="/ugur.jpeg"
                alt="Uğur Hoca"
                width={44}
                height={44}
                className="h-full w-full rounded-xl object-cover"
              />
            </div>
            <span className="font-display text-base sm:text-xl font-bold text-primary truncate">
              Uğur Hoca Matematik
            </span>
          </div>
          <div className="h-5 w-24 animate-pulse rounded-lg bg-surface-2" />
        </div>
      </nav>

      <div className="px-4 pt-24 sm:px-6 xl:px-8">
        <div className="mx-auto max-w-[1760px]">
          <div className="mb-8 space-y-3">
            <div className="h-10 w-64 animate-pulse rounded-xl bg-surface-2" />
            <div className="h-5 w-full max-w-xl animate-pulse rounded-xl bg-surface-2/60" />
          </div>

          <div className="bg-surface-1 mb-8 rounded-2xl p-4 sm:p-6 border border-border-default">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-tertiary" />
                <div className="h-12 w-full animate-pulse rounded-xl bg-surface-2" />
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="h-12 w-36 animate-pulse rounded-xl bg-surface-2" />
                <div className="h-12 w-36 animate-pulse rounded-xl bg-surface-2" />
                <div className="bg-surface-1 flex rounded-xl overflow-hidden border border-border-default">
                  <div className="flex h-12 w-12 items-center justify-center border-r border-border-default text-tertiary">
                    <Grid className="h-5 w-5" />
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center text-tertiary">
                    <Filter className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 flex items-center gap-2 text-secondary">
            <Filter className="h-5 w-5" />
            <span>İçerikler hazırlanıyor...</span>
          </div>

          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
            {SKELETON_CARDS.map((_, index) => (
              <div
                key={index}
                className="bg-surface-1 overflow-hidden rounded-3xl border border-border-default"
              >
                <div className="h-2 animate-pulse bg-surface-2" />
                <div className="space-y-4 p-4 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 animate-pulse rounded-xl bg-surface-2 sm:h-14 sm:w-14" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-surface-2" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-surface-2" />
                    </div>
                  </div>
                  <div className="h-4 w-full animate-pulse rounded bg-surface-2" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-surface-2" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-11 animate-pulse rounded-2xl bg-surface-2" />
                    <div className="h-11 animate-pulse rounded-2xl bg-surface-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
