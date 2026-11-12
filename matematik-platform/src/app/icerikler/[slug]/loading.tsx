export default function ContentDetailLoading() {
  return (
    <div className="min-h-screen bg-canvas text-primary">
      <div className="border-b border-subtle bg-surface-1/80">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 sm:py-6 space-y-3">
          <div className="h-4 w-56 rounded-full bg-surface-2" />
          <div className="h-4 w-36 rounded-full bg-surface-2/80" />
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-full bg-surface-2" />
            <div className="h-6 w-24 rounded-full bg-surface-2" />
          </div>
          <div className="h-9 max-w-xl rounded-2xl bg-surface-2" />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-[55vh] rounded-3xl border border-subtle bg-surface-1" />
          <div className="h-64 rounded-3xl border border-subtle bg-surface-1" />
        </div>
      </div>
    </div>
  );
}
