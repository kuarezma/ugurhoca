'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Quote, Sparkles } from 'lucide-react';

type HomeDailyQuoteProps = {
  isLight: boolean;
};

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

function HomeDailyQuoteInner({ isLight }: HomeDailyQuoteProps) {
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
        className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 ${
          isLight
            ? 'border-slate-200 bg-white shadow-sm'
            : 'border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-900/80 backdrop-blur'
        }`}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-amber-400/30 via-pink-500/30 to-violet-500/30 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-gradient-to-br from-cyan-400/25 to-blue-500/25 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-pink-500 text-slate-900 shadow-lg"
            aria-hidden="true"
          >
            <Quote className="h-7 w-7" />
          </div>

          <div className="flex-1">
            <div
              className={`mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] ${
                isLight
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-amber-400/20 text-amber-200'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span id="daily-quote-heading">Günün Sözü</span>
            </div>
            <p
              className={`font-display text-lg font-bold leading-snug sm:text-2xl ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              “{quote.text}”
            </p>
            <p
              className={`mt-3 text-sm font-semibold ${
                isLight ? 'text-slate-500' : 'text-slate-300'
              }`}
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
