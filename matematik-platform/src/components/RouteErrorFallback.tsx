'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { Mascot } from '@/components/Mascot';
import { logger } from '@/lib/logger';

type RouteErrorFallbackProps = {
  error: Error & { digest?: string };
  reset: () => void;
  scope: string;
  title: string;
  description: string;
  homeHref: string;
  homeLabel: string;
};

/**
 * Segment bazlı hata arayüzü (nested error.tsx'ler için ortak gövde).
 * Kök error.tsx tüm uygulamayı sıfırlarken bunlar yalnızca ilgili segmenti
 * (admin paneli, canlı ders) sıfırlar — kullanıcı oturumunu/gezinmeyi korur.
 */
export function RouteErrorFallback({
  error,
  reset,
  scope,
  title,
  description,
  homeHref,
  homeLabel,
}: RouteErrorFallbackProps) {
  useEffect(() => {
    logger.error(`Route error boundary triggered (${scope})`, error, {
      digest: error.digest,
    });
  }, [error, scope]);

  return (
    <main className="relative z-10 flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <Mascot
        pose="confused"
        size={120}
        ariaLabel="Hata ile karşılaşan maskot Pi"
      />
      <div className="max-w-md space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-500 dark:text-rose-300">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          Hata
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          {title}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {description}
        </p>
        {error.digest ? (
          <p className="text-xs text-slate-400">Hata kodu: {error.digest}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary via-brand-pink to-brand-orange px-6 text-sm font-semibold text-white shadow-brand-glow transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Tekrar dene
        </button>
        <Link
          href={homeHref}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          {homeLabel}
        </Link>
      </div>
    </main>
  );
}
