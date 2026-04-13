import { Calculator, Filter, Grid, Search } from 'lucide-react';

const SKELETON_CARDS = Array.from({ length: 6 });

export default function Loading() {
  return (
    <main className="icerikler-page min-h-screen gradient-bg pb-20">
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#0b1220]/95 px-4 py-4 backdrop-blur-md sm:px-6 xl:px-8">
        <div className="mx-auto flex max-w-[1760px] items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Uğur Hoca Matematik
            </span>
          </div>
          <div className="h-5 w-24 animate-pulse rounded bg-white/10" />
        </div>
      </nav>

      <div className="px-4 pt-24 sm:px-6 xl:px-8">
        <div className="mx-auto max-w-[1760px]">
          <div className="mb-8 space-y-3">
            <div className="h-10 w-64 animate-pulse rounded-xl bg-white/10" />
            <div className="h-5 w-full max-w-xl animate-pulse rounded-xl bg-white/5" />
          </div>

          <div className="glass mb-8 rounded-2xl p-4 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <div className="h-12 w-full animate-pulse rounded-xl bg-slate-800/50" />
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="h-12 w-36 animate-pulse rounded-xl bg-slate-800/50" />
                <div className="h-12 w-36 animate-pulse rounded-xl bg-slate-800/50" />
                <div className="glass flex rounded-xl overflow-hidden">
                  <div className="flex h-12 w-12 items-center justify-center border-r border-white/10 text-slate-500">
                    <Grid className="h-5 w-5" />
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center text-slate-500">
                    <Filter className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 flex items-center gap-2 text-slate-400">
            <Filter className="h-5 w-5" />
            <span>İçerikler hazırlanıyor...</span>
          </div>

          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
            {SKELETON_CARDS.map((_, index) => (
              <div
                key={index}
                className="glass overflow-hidden rounded-3xl border border-white/10"
              >
                <div className="h-2 animate-pulse bg-slate-700" />
                <div className="space-y-4 p-4 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-700 sm:h-14 sm:w-14" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-700" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-slate-700" />
                    </div>
                  </div>
                  <div className="h-4 w-full animate-pulse rounded bg-slate-800/80" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-800/60" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-11 animate-pulse rounded-2xl bg-slate-800/70" />
                    <div className="h-11 animate-pulse rounded-2xl bg-slate-800/70" />
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
