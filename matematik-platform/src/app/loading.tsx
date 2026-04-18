export default function Loading() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-30">
        <div className="absolute left-[10%] top-[15%] h-20 w-20 rounded-full bg-indigo-500/20" />
        <div className="absolute right-[12%] top-[40%] h-16 w-16 rounded-full bg-fuchsia-500/15" />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-[calc(3.5rem+env(safe-area-inset-top))] md:pt-14">
        <div className="mb-10 flex h-12 items-center justify-between">
          <div className="h-9 w-40 animate-pulse rounded-lg bg-white/10" />
          <div className="h-9 w-24 animate-pulse rounded-lg bg-white/10" />
        </div>
        <div className="mb-12 space-y-4">
          <div className="mx-auto h-12 max-w-2xl animate-pulse rounded-xl bg-white/10" />
          <div className="mx-auto h-6 max-w-lg animate-pulse rounded-lg bg-white/5" />
          <div className="mx-auto h-12 w-48 animate-pulse rounded-xl bg-gradient-to-r from-indigo-500/40 to-purple-500/40" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl border border-white/10 bg-white/5"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
