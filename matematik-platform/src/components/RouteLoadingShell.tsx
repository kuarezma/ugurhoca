export default function RouteLoadingShell() {
  return (
    <main className="relative min-h-screen bg-[var(--bg)] transition-colors duration-200">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-30">
        <div className="absolute left-[10%] top-[15%] h-20 w-20 rounded-full bg-indigo-500/15 blur-xl" />
        <div className="absolute right-[12%] top-[40%] h-16 w-16 rounded-full bg-purple-500/10 blur-xl" />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-[calc(3.5rem+env(safe-area-inset-top))] md:pt-14">
        <div className="mb-10 flex h-12 items-center justify-between">
          <div className="h-9 w-40 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-white/10" />
          <div className="h-9 w-24 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-white/10" />
        </div>
        <div className="mb-12 space-y-4">
          <div className="mx-auto h-12 max-w-2xl animate-pulse rounded-2xl bg-slate-200/80 dark:bg-white/10" />
          <div className="mx-auto h-6 max-w-lg animate-pulse rounded-xl bg-slate-200/60 dark:bg-white/5" />
          <div className="mx-auto h-12 w-48 animate-pulse rounded-2xl bg-indigo-500/20" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 shadow-sm"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
