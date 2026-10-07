'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Mascot } from '@/components/Mascot';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <main className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="max-w-xl text-center">
          <div className="mx-auto mb-6 inline-flex animate-float-y">
            <Mascot pose="confused" size={160} ariaLabel="Kafası karışmış maskot Pi" />
          </div>
          <p className="font-display text-[8rem] leading-none font-black sm:text-[10rem] text-blue-700 dark:text-blue-300">
            404
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Bu sayfayı çözemedik
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base text-slate-600 dark:text-slate-300">
            Aradığın sayfa sınavdan çıkmış olabilir. Aşağıdaki butonlarla
            güvenli bir yere dönebilirsin.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
            >
              <Home className="h-5 w-5" aria-hidden="true" />
              Ana sayfaya dön
            </Link>
            <Link
              href="/icerikler"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-white/5 px-5 text-sm font-semibold text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
              İçeriklere göz at
            </Link>
            <Button
              variant="ghost"
              leadingIcon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}
              onClick={() => window.history.back()}
              className="text-slate-700 dark:text-white hover:text-slate-900 dark:hover:text-white"
            >
              Geri dön
            </Button>
          </div>
        </div>
      </main>
  );
}
