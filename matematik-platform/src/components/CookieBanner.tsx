'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Cookie, X } from 'lucide-react';

const STORAGE_KEY = 'ugurhoca:cookie-consent';

type ConsentValue = 'accepted' | 'rejected';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored !== 'accepted' && stored !== 'rejected') {
        const t = window.setTimeout(() => setVisible(true), 1200);
        return () => window.clearTimeout(t);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const persist = (value: ConsentValue) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // storage may be disabled
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          role="dialog"
          aria-live="polite"
          aria-label="Çerez tercihleri"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed inset-x-3 bottom-3 z-[1000] sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-md"
        >
          <div className="relative overflow-hidden rounded-3xl border border-default bg-surface-1/95 p-5 shadow-2xl backdrop-blur">
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-amber-400/30 to-pink-500/30 blur-3xl"
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => persist('rejected')}
              aria-label="Çerez bildirimini kapat"
              className="absolute right-3 top-3 rounded-full p-1.5 text-secondary transition hover:bg-surface-2 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-fg"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative flex items-start gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-pink-500 text-slate-900 shadow-lg"
                aria-hidden="true"
              >
                <Cookie className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-primary">
                  Çerezlerle deneyimini iyileştiriyoruz
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-secondary">
                  Platformun sorunsuz çalışması için zorunlu çerezleri
                  kullanıyoruz. Tercihlerini{' '}
                  <Link
                    href="/gizlilik"
                    className="text-accent-fg underline decoration-dotted underline-offset-2 hover:text-primary"
                  >
                    Gizlilik Politikası
                  </Link>
                  'nda bulabilirsin.
                </p>
              </div>
            </div>

            <div className="relative mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => persist('rejected')}
                className="flex-1 rounded-2xl border border-default dark:border-slate-500 bg-surface-2 px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-surface-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-fg"
              >
                Sadece zorunlu
              </button>
              <button
                type="button"
                onClick={() => persist('accepted')}
                className="flex-1 rounded-2xl border border-purple-400/80 dark:border-purple-300/80 bg-gradient-to-r from-fuchsia-700 via-purple-700 to-cyan-800 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-fg"
              >
                Tümünü kabul et
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
