'use client';

import { useEffect } from 'react';
import './globals.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sentry dinamik import ediliyor: statik import edildiginde SDK cekirdegi
    // global-error uzerinden her sayfa paketine giriyordu. Bu bilesen yalnizca
    // kritik bir hatada render edildigi icin SDK'yi o anda yuklemek yeterli.
    void import('@sentry/nextjs')
      .then((Sentry) => {
        Sentry.captureException(error, {
          extra: { digest: error.digest },
        });
      })
      .catch(() => {
        // Raporlama basarisiz olsa bile hata ekrani gosterilmeye devam etmeli.
      });
  }, [error]);
  return (
    <html lang="tr">
      <body className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
          <div className="max-w-md space-y-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Kritik bir hata oluştu
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Uygulama yüklenemedi. Sayfayı yenileyin veya daha sonra tekrar
              deneyin.
            </p>
            {process.env.NODE_ENV === 'development' && error.message ? (
              <pre className="mt-4 max-h-32 overflow-auto rounded-lg bg-slate-100 dark:bg-slate-800 p-3 text-left text-xs text-slate-700 dark:text-slate-300">
                {error.message}
              </pre>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl px-6 py-3 text-sm font-semibold transition bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
          >
            Tekrar dene
          </button>
        </div>
      </body>
    </html>
  );
}
