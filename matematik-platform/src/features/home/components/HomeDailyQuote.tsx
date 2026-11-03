'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Quote, Sparkles } from 'lucide-react';

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

function HomeDailyQuoteInner() {
  const quote = useMemo(() => {
    const now = new Date();
    const start = Date.UTC(now.getUTCFullYear(), 0, 0);
    const diff = now.getTime() - start;
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    return QUOTES[dayOfYear % QUOTES.length];
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px 0px' }}
      transition={{ duration: 0.45 }}
      aria-labelledby="daily-quote-heading"
      className="mx-auto mt-8 w-full max-w-6xl px-4 sm:mt-10"
    >
      <div
        className="bg-surface-2 border border-subtle border-l-4 border-l-[var(--accent-brand)] rounded-2xl p-6 font-sans"
      >

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-accent-fg bg-accent-bg"
            aria-hidden="true"
          >
            <Quote className="h-7 w-7" />
          </div>

          <div className="flex-1">
            <div
              className="mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-accent-bg text-accent-fg"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span id="daily-quote-heading">Günün Sözü</span>
            </div>
            <p
              className="font-display text-lg font-bold leading-snug sm:text-2xl text-primary"
            >
              “{quote.text}”
            </p>
            <p
              className="mt-3 text-sm font-semibold text-secondary"
            >
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
