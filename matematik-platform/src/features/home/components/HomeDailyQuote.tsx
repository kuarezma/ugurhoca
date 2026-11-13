'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Quote, Sparkles } from 'lucide-react';
import { useHydrated } from '@/hooks/useClientPathname';

type MathQuote = {
  text: string;
  author: string;
};

const QUOTES: MathQuote[] = [
  {
    text: 'Matematik dilinde düşünmeyi bilen herkes evrenin şifresini okuyabilir.',
    author: 'Galileo Galilei',
  },
  {
    text: 'Bir problem ne kadar zor görünürse görünsün, daima bir çözümü vardır.',
    author: 'Paul Halmos',
  },
  {
    text: 'Matematik hayatı kolaylaştıran en sevimli zihinsel oyundur.',
    author: 'Cahit Arf',
  },
  {
    text: 'Sayılar, evrenin kelimeleridir.',
    author: 'Pisagor',
  },
  {
    text: 'Matematik öğrenmenin tek yolu, matematik yapmaktır.',
    author: 'Paul Halmos',
  },
  {
    text: 'Hata yapmaktan korkma; hata, öğrenmenin yan ürünüdür.',
    author: 'John Dewey',
  },
  {
    text: 'Bir şeyi gerçekten öğrenmek, onu birine anlatabilmektir.',
    author: 'Richard Feynman',
  },
  {
    text: 'Soruyu doğru sorabilirsen, cevabın yarısını çözmüşsün demektir.',
    author: 'John Dewey',
  },
  {
    text: 'Zekâ, değişebilme yeteneğinin bir ölçüsüdür.',
    author: 'Albert Einstein',
  },
  {
    text: 'Matematik, korkanların değil, merak edenlerin bilimidir.',
    author: 'Cahit Arf',
  },
];

function getDailyQuote(now: Date = new Date()): MathQuote {
  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  const diff = now.getTime() - start;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return QUOTES[dayOfYear % QUOTES.length];
}

function HomeDailyQuoteInner() {
  const hydrated = useHydrated();
  // ISR sınırı UTC gece yarısını (TSİ 03:00) keserse hidrasyon uyuşmazlığı
  // oluşmasın diye ilk HTML sabit bir sözle eşleşir.
  const quote = useMemo(
    () => (hydrated ? getDailyQuote() : QUOTES[0]),
    [hydrated],
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px 0px' }}
      transition={{ duration: 0.45 }}
      aria-labelledby="daily-quote-heading"
      className="mx-auto mt-8 w-full max-w-6xl px-4 sm:mt-10"
    >
      <div className="relative overflow-hidden rounded-3xl border border-sky-200/75 dark:border-sky-400/20 bg-surface-1/80 backdrop-blur-2xl p-6 sm:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_45px_-15px_rgba(14,165,233,0.12)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_20px_50px_-15px_rgba(2,6,23,0.65)] font-sans">
        {/* Üst Prizmatik Işık Kırılım Çizgisi */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-400/10 via-sky-400/10 to-transparent blur-2xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-[var(--on-brand)] dark:from-sky-400 dark:to-indigo-500 dark:text-slate-950 shadow-md shadow-sky-500/25"
            aria-hidden="true"
          >
            <Quote className="h-7 w-7" />
          </div>

          <div className="flex-1">
            <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-sky-300/40 dark:border-sky-400/20 px-3.5 py-1 text-xs font-black uppercase tracking-[0.2em] bg-accent-bg text-accent-fg backdrop-blur-md shadow-xs">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span id="daily-quote-heading">Günün Sözü</span>
            </div>
            <p className="font-display text-lg font-bold leading-snug sm:text-2xl text-primary">
              “{quote.text}”
            </p>
            <p className="mt-3 text-sm font-semibold text-secondary">
              — {quote.author}
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export const HomeDailyQuote = memo(HomeDailyQuoteInner);
HomeDailyQuote.displayName = 'HomeDailyQuote';
