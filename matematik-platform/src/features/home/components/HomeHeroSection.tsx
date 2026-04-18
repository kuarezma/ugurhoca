'use client';

import { useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { prefetchContentDocuments } from '@/features/content/queries';
import {
  HOME_CATEGORIES,
  HOME_CONTENT_PREFETCH_TYPES,
  HOME_ROUTE_PREFETCH_HREFS,
} from '@/features/home/constants';

type HomeHeroSectionProps = {
  isLight: boolean;
};

export function HomeHeroSection({ isLight }: HomeHeroSectionProps) {
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

  useEffect(() => {
    const prefetchTargets = () => {
      HOME_ROUTE_PREFETCH_HREFS.forEach((href) => {
        prefetchHref(href);
      });
      void Promise.allSettled(
        HOME_CONTENT_PREFETCH_TYPES.map((type) =>
          prefetchContentDocuments(type),
        ),
      );
    };

    const requestIdleCallbackFn = window.requestIdleCallback?.bind(window);
    const cancelIdleCallbackFn = window.cancelIdleCallback?.bind(window);

    if (requestIdleCallbackFn) {
      const idleCallbackId = requestIdleCallbackFn(() => {
        prefetchTargets();
      }, {
        timeout: 1200,
      });

      return () => {
        cancelIdleCallbackFn?.(idleCallbackId);
      };
    }

    const timeoutId = globalThis.setTimeout(prefetchTargets, 250);

    return () => {
      globalThis.clearTimeout(timeoutId);
    };
  }, [prefetchHref]);

  return (
    <section className="px-4 pt-4 pb-8 sm:py-12">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-8 ${isLight ? 'light-section p-6 sm:p-8' : ''}`}
        >
          <h1
            className={`text-3xl sm:text-4xl font-bold mb-2 ${
              isLight ? 'light-text-strong' : 'text-white'
            }`}
          >
            Ne Çalışmak İstiyorsun?
          </h1>
          <p className={isLight ? 'light-text-muted' : 'text-slate-400'}>
            Hızlı erişim için kategoriyi seç
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
          {HOME_CATEGORIES.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={category.href}
                onMouseEnter={() =>
                  prefetchCategory(category.href, category.contentType)
                }
                onTouchStart={() =>
                  prefetchCategory(category.href, category.contentType)
                }
                className={`block border rounded-2xl p-5 sm:p-7 lg:p-6 text-center transition-all ${
                  isLight
                    ? 'light-card hover:-translate-y-0.5'
                    : `${category.bgColor} ${category.borderColor} hover:scale-105`
                }`}
              >
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center`}
                >
                  <category.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3
                  className={`font-bold text-sm sm:text-base ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {category.title}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
