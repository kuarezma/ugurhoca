'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Zap, ArrowRight } from 'lucide-react';
import { Mascot } from '@/components/Mascot';
import { prefetchContentDocuments } from '@/features/content/queries';
import { HOME_CATEGORIES } from '@/features/home/constants';
import type { AppUser } from '@/types';

type HomeHeroSectionProps = {
  isLight: boolean;
  user?: AppUser | null;
};

export function HomeHeroSection({ isLight, user }: HomeHeroSectionProps) {
  const router = useRouter();

  const prefetchHref = useCallback(
    (href: string) => {
      router.prefetch(href);
    },
    [router],
  );

  const prefetchCategory = useCallback(
    (href: string, contentType?: string) => {
      prefetchHref(href);
      if (contentType) {
        void prefetchContentDocuments(contentType).catch(() => undefined);
      }
    },
    [prefetchHref],
  );

  const firstName = user?.name?.split(' ')[0];
  const greeting = firstName ? `Merhaba ${firstName}!` : 'Matematiğe hoş geldin!';

  return (
    <section className="relative px-4 pb-12 pt-6 sm:pt-10">
      <div className="relative mx-auto max-w-6xl">
        <div
          className={`relative overflow-hidden rounded-3xl border px-6 py-8 sm:px-10 sm:py-12 ${
            isLight
              ? 'border-slate-200 bg-gradient-to-br from-white via-violet-50/60 to-rose-50/60 shadow-[0_20px_60px_-30px_rgba(124,58,237,0.45)]'
              : 'border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950 shadow-brand-glow'
          }`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 h-60 w-60 rounded-full bg-brand-primary/25 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-12 -left-12 h-72 w-72 rounded-full bg-brand-pink/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-12 top-6 text-5xl font-black text-brand-primary/20 sm:text-7xl"
          >
            π
          </div>

          <div className="relative grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div className="space-y-5">
              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                  isLight
                    ? 'bg-brand-primary/15 text-brand-primary'
                    : 'bg-brand-primary/20 text-brand-primary-soft'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                {user ? 'Bugün hangi konuyu parçalıyoruz?' : 'Uğur Hoca Matematik Platformu'}
              </div>

              <h1
                className={`font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-[3.25rem] ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                <span className="bg-gradient-to-r from-brand-primary via-brand-pink to-brand-orange bg-clip-text text-transparent">
                  {greeting}
                </span>
                <br />
                <span className={isLight ? 'text-slate-800' : 'text-slate-100'}>
                  Ne çalışmak istiyorsun?
                </span>
              </h1>

              <p
                className={`max-w-lg text-base sm:text-lg ${
                  isLight ? 'text-slate-600' : 'text-slate-300'
                }`}
              >
                LGS ve YKS için içerikler, oyunlaştırılmış testler, ödev takibi ve
                performans grafikleri. Tek yerde, senin hızında.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/icerikler"
                  onMouseEnter={() => prefetchHref('/icerikler')}
                  onFocus={() => prefetchHref('/icerikler')}
                  className="group inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-primary via-brand-pink to-brand-orange px-6 text-sm font-bold text-white shadow-brand-glow transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                >
                  <Zap className="h-4 w-4" aria-hidden="true" />
                  Çalışmaya başla
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
                <Link
                  href="/oyunlar"
                  onMouseEnter={() => prefetchHref('/oyunlar')}
                  onFocus={() => prefetchHref('/oyunlar')}
                  className={`inline-flex h-12 items-center gap-2 rounded-2xl border px-5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 ${
                    isLight
                      ? 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                      : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  Oyunla öğren
                </Link>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative hidden justify-center lg:flex"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-primary/30 via-brand-pink/20 to-brand-orange/20 blur-3xl"
              />
              <Mascot
                pose={user ? 'celebrate' : 'waving'}
                size={220}
                className="relative animate-float-y"
                ariaLabel={user ? 'Seni tebrik eden maskot Pi' : 'Selamlayan maskot Pi'}
              />
            </motion.div>
          </div>
        </div>

        <div className="mt-10">
          <h2
            className={`mb-4 flex items-center gap-2 font-display text-xl font-bold ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-primary/15 text-brand-primary">
              ⚡
            </span>
            Hızlı erişim
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
            {HOME_CATEGORIES.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
              >
                <Link
                  href={category.href}
                  onMouseEnter={() =>
                    prefetchCategory(category.href, category.contentType)
                  }
                  onFocus={() =>
                    prefetchCategory(category.href, category.contentType)
                  }
                  onTouchStart={() =>
                    prefetchCategory(category.href, category.contentType)
                  }
                  aria-label={`${category.title} kategorisi`}
                  className={`tilt-on-hover group relative block overflow-hidden rounded-2xl border p-5 text-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 ${
                    isLight
                      ? 'border-slate-200 bg-white shadow-soft-card hover:shadow-pop-card'
                      : `${category.bgColor} ${category.borderColor} hover:border-white/20 hover:shadow-pop-card`
                  }`}
                >
                  <div
                    aria-hidden="true"
                    className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${category.color} shadow-lg transition-transform group-hover:scale-110`}
                  >
                    <category.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3
                    className={`font-display text-sm font-bold sm:text-base ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {category.title}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-brand-primary via-brand-pink to-brand-orange opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
