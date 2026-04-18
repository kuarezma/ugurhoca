'use client';

import './globals.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-slate-900 text-slate-100 antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
          <div className="max-w-md space-y-3">
            <h1 className="text-2xl font-bold text-white">
              Kritik bir hata oluştu
            </h1>
            <p className="text-sm text-slate-400">
              Uygulama yüklenemedi. Sayfayı yenileyin veya daha sonra tekrar
              deneyin.
            </p>
            {process.env.NODE_ENV === 'development' && error.message ? (
              <pre className="mt-4 max-h-32 overflow-auto rounded-lg bg-slate-800 p-3 text-left text-xs text-slate-300">
                {error.message}
              </pre>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-indigo-600 hover:to-purple-600"
          >
            Tekrar dene
          </button>
        </div>
      </body>
    </html>
  );
}
