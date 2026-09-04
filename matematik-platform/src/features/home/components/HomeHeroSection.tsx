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
          className={`relative overflow-hidden rounded-3xl border px-4 py-7 sm:px-10 sm:py-12 transition-all duration-300 ${
            isLight
              ? 'border-slate-200/90 bg-gradient-to-br from-white via-slate-50/60 to-indigo-50/40 shadow-bento'
              : 'border-white/10 bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950 shadow-2xl backdrop-blur-xl'
          }`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-12 -left-12 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-12 top-6 text-5xl font-black text-indigo-500/10 sm:text-7xl select-none"
          >
            π
          </div>

          <div className="relative grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center min-w-0 w-full">
            <div className="space-y-5 min-w-0 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className={`inline-flex max-w-full items-center gap-1.5 sm:gap-2 rounded-full px-3 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider ${
                    isLight
                      ? 'bg-amber-50 text-amber-800 border border-amber-200/80 shadow-sm'
                      : 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-500 animate-pulse" aria-hidden="true" />
                  <span className="truncate">🎉 2026-2027 Yeni Eğitim Öğretim Yılı</span>
                </div>

                <div
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] sm:text-xs font-semibold ${
                    isLight
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                  }`}
                >
                  {user ? 'Hedefe Tam Odaklan!' : 'Ücretsiz & Tam Kapsamlı'}
                </div>
              </div>

              <h1
                className={`font-display text-2xl xs:text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-[3.25rem] ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                  {greeting}
                </span>{' '}
                <span className={isLight ? 'text-slate-800' : 'text-slate-100'}>
                  Bu Yıl Matematikte Zirveye!
                </span>
              </h1>

              <p
                className={`w-full max-w-lg text-sm sm:text-lg leading-relaxed ${
                  isLight ? 'text-slate-600' : 'text-slate-300'
                }`}
              >
                LGS ve YKS için müfredatla birebir ders notları, yaprak testler, formül kartları,
                karalama tahtası ve canlı dersler seni bekliyor.
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <Link
                  href="/icerikler"
                  prefetch={false}
                  onMouseEnter={() => prefetchHref('/icerikler')}
                  onFocus={() => prefetchHref('/icerikler')}
                  className="group inline-flex h-11 sm:h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-5 sm:px-6 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  <Zap className="h-4 w-4" aria-hidden="true" />
                  Çalışmaya başla
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
                <Link
                  href="/oyunlar"
                  prefetch={false}
                  onMouseEnter={() => prefetchHref('/oyunlar')}
                  onFocus={() => prefetchHref('/oyunlar')}
                  className={`inline-flex h-11 sm:h-12 items-center justify-center gap-2 rounded-2xl border px-5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                    isLight
                      ? 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50 shadow-sm'
                      : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  Oyunla öğren
                </Link>
              </div>

              {/* Hızlı Sınıf Başlangıç Çipleri */}
              <div className="pt-2 w-full min-w-0">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Sınıfını Seç ve Hemen Başla:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full [scrollbar-width:none]">
                  {[
                    { label: '5. Sınıf', href: '/icerikler?grade=5' },
                    { label: '6. Sınıf', href: '/icerikler?grade=6' },
                    { label: '7. Sınıf', href: '/icerikler?grade=7' },
                    { label: '8. Sınıf (LGS)', href: '/icerikler?grade=8', highlight: true },
                    { label: '9. Sınıf', href: '/icerikler?grade=9' },
                    { label: '10. Sınıf', href: '/icerikler?grade=10' },
                    { label: '11. Sınıf', href: '/icerikler?grade=11' },
                    { label: '12. Sınıf (YKS)', href: '/icerikler?grade=12', highlight: true },
                    { label: 'Mezun', href: '/icerikler?grade=Mezun' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      prefetch={false}
                      className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                        item.highlight
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm hover:scale-105'
                          : isLight
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200/80'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
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
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {HOME_CATEGORIES.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
              >
                <Link
                  href={category.href}
                  prefetch={false}
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
                  className={`group relative block overflow-hidden rounded-2xl sm:rounded-3xl border p-3.5 sm:p-5 text-center transition-all duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                    isLight
                      ? 'border-slate-200/90 bg-white/90 shadow-bento hover:shadow-bento-hover hover:border-indigo-200'
                      : `${category.bgColor} ${category.borderColor} hover:border-white/20 hover:shadow-2xl`
                  }`}
                >
                  <div
                    aria-hidden="true"
                    className={`mx-auto mb-2.5 sm:mb-3 flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br ${category.color} shadow-md transition-transform duration-300 group-hover:scale-110`}
                  >
                    <category.icon className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <h3
                    className={`font-display text-xs font-bold sm:text-base truncate ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {category.title}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 -bottom-px h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
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
