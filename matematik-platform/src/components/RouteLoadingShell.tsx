export default function RouteLoadingShell() {
  return (
    <main className="relative min-h-screen bg-transparent">
      {/* Üst kenar akıcı rota yükleme göstergesi */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-1 overflow-hidden bg-slate-200/40 dark:bg-white/10" aria-hidden="true">
        <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-[#58cc02] via-[#1cb0f6] to-[#ce82ff] animate-pulse" />
      </div>

      {/* Sabit üst menü iskeleti (CLS önleyici h-16 eşleşmesi) */}
      <div
        className="fixed left-0 right-0 top-0 z-50 border-b border-default bg-surface-1/90 backdrop-blur-md pt-[env(safe-area-inset-top)]"
        aria-hidden="true"
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="h-10 w-40 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-white/10" />
          <div className="h-9 w-28 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-white/10" />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-[calc(4.5rem+env(safe-area-inset-top))] sm:pt-24">
        <div className="mb-8 space-y-3">
          <div className="h-6 w-52 animate-pulse rounded-full bg-slate-200/60 dark:bg-white/10" />
          <div className="h-11 max-w-lg animate-pulse rounded-2xl bg-slate-200/60 dark:bg-white/10" />
          <div className="h-5 max-w-xl animate-pulse rounded-xl bg-slate-200/50 dark:bg-white/5" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-3xl border border-default bg-surface-1/80 shadow-xs"
            />
          ))}
        </div>
      </div>
    </main>
  );
}

