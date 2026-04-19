'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';
import DeferredFloatingShapes from '@/components/DeferredFloatingShapes';
import { Mascot } from '@/components/Mascot';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <>
      <DeferredFloatingShapes count={6} />
      <main className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="max-w-xl text-center">
          <div className="mx-auto mb-6 inline-flex animate-float-y">
            <Mascot pose="confused" size={160} ariaLabel="Kafası karışmış maskot Pi" />
          </div>
          <p className="font-display text-[8rem] leading-none font-black bg-gradient-to-r from-brand-primary via-brand-pink to-brand-orange bg-clip-text text-transparent sm:text-[10rem]">
            404
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
            Bu sayfayı çözemedik
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base text-slate-300">
            Aradığın sayfa sınavdan çıkmış olabilir. Aşağıdaki butonlarla
            güvenli bir yere dönebilirsin.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary via-brand-pink to-brand-orange px-6 text-sm font-semibold text-white shadow-brand-glow transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
            >
              <Home className="h-5 w-5" aria-hidden="true" />
              Ana sayfaya dön
            </Link>
            <Link
              href="/icerikler"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
              İçeriklere göz at
            </Link>
            <Button
              variant="ghost"
              leadingIcon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}
              onClick={() => window.history.back()}
              className="text-white"
            >
              Geri dön
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
