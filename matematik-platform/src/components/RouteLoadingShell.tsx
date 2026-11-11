export default function RouteLoadingShell() {
  return (
    <main className="relative min-h-screen bg-transparent">
      {/* Üst kenar ince kristal prizma yükleme çizgisi */}
      <div
        className="fixed top-0 left-0 right-0 z-[60] h-[2px] overflow-hidden bg-transparent"
        aria-hidden="true"
      >
        <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 opacity-85" />
      </div>

      {/* Yüzen kristal kapsül üst menü yer tutucusu (CLS ve parlama önleyici birebir geometri) */}
      <div
        className="pointer-events-none fixed left-0 right-0 top-0 z-50 px-3 sm:px-5 pt-[max(0.6rem,env(safe-area-inset-top))]"
        aria-hidden="true"
      >
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between rounded-2xl lg:rounded-full border border-sky-200/70 dark:border-sky-400/20 bg-surface-1/80 backdrop-blur-2xl px-3.5 sm:px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_12px_32px_-8px_rgba(14,165,233,0.12)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_16px_38px_-10px_rgba(2,6,23,0.60)]">
          <div className="h-9 w-36 rounded-full bg-surface-2/70" />
          <div className="h-8 w-24 rounded-full bg-surface-2/70" />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-[calc(5.25rem+env(safe-area-inset-top))] sm:pt-24">
        <div className="mb-8 space-y-3">
          <div className="h-6 w-52 rounded-full bg-surface-1/65 border border-subtle" />
          <div className="h-10 max-w-md rounded-2xl bg-surface-1/65 border border-subtle" />
          <div className="h-5 max-w-lg rounded-xl bg-surface-1/50" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 rounded-3xl border border-sky-200/60 dark:border-sky-400/15 bg-surface-1/70 backdrop-blur-xl"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
