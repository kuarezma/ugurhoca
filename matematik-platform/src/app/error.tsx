'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <div className="max-w-md space-y-3">
        <h1 className="text-2xl font-bold text-[var(--text-strong)]">
          Bir şeyler ters gitti
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Sayfa yüklenirken beklenmeyen bir sorun oluştu. Tekrar deneyebilir veya
          ana sayfaya dönebilirsiniz.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-600 hover:to-purple-600"
        >
          Tekrar dene
        </button>
        <Link
          href="/"
          className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-soft)] px-6 py-3 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--bg-muted)]"
        >
          Ana sayfa
        </Link>
      </div>
    </main>
  );
}
