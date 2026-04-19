'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  BookOpen,
  Command,
  Flame,
  Rocket,
  Sparkles,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';

type WelcomeTourProps = {
  userId?: string | null;
  userName?: string | null;
};

type Slide = {
  icon: LucideIcon;
  title: string;
  description: string;
  badge: string;
  tone: string;
};

const SLIDES: Slide[] = [
  {
    icon: Rocket,
    title: 'Hoş geldin!',
    description:
      'Burada çalışma kağıtların, testlerin, ödevlerin ve ilerleme panelin bir arada. Her gün bir adım daha yaklaş.',
    badge: '1. Adım',
    tone: 'from-fuchsia-500/20 to-violet-500/20',
  },
  {
    icon: BookOpen,
    title: 'İçeriklere kolay eriş',
    description:
      'Ders notları, yaprak testler ve videolar "İçerikler" sekmesinde. Filtreleri kullan, beğen, yorum yaz.',
    badge: '2. Adım',
    tone: 'from-cyan-500/20 to-sky-500/20',
  },
  {
    icon: Flame,
    title: 'Serini kaybetme',
    description:
      'Her gün kısa bile olsa çalışırsan "Seri" rozetlerini açarsın. Motivasyon kartında hedefini takip edebilirsin.',
    badge: '3. Adım',
    tone: 'from-amber-500/20 to-orange-500/20',
  },
  {
    icon: Trophy,
    title: 'Test çöz, ustalaş',
    description:
      'Testler bölümünde her konudan pratik yap. Yanlışlarını aç, açıklamasını oku, bir daha dene.',
    badge: '4. Adım',
    tone: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    icon: Command,
    title: 'Hızlı geçiş ipucu',
    description:
      'İstediğin sayfaya anında atlamak için ⌘K / Ctrl+K tuşlarını kullan. Tuş takımı olmadan da alttaki menüden gezinebilirsin.',
    badge: 'Bonus',
    tone: 'from-pink-500/20 to-rose-500/20',
  },
];

const STORAGE_KEY = 'uh.welcomeTour.dismissed';

const readDismissedIds = () => {
  if (typeof window === 'undefined') return [] as string[];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [] as string[];
  }
};

const writeDismissedId = (id: string) => {
  if (typeof window === 'undefined') return;
  try {
    const ids = readDismissedIds();
    if (!ids.includes(id)) {
      ids.push(id);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    }
  } catch {
    // storage hatası sessizce geçilir
  }
};

export default function WelcomeTour({ userId, userName }: WelcomeTourProps) {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const headingId = useId();
  const persistedRef = useRef(false);

  const persistSeen = useCallback(async (id: string) => {
    if (persistedRef.current) return;
    persistedRef.current = true;
    writeDismissedId(id);

    try {
      await supabase
        .from('profiles')
        .update({ welcome_tour_seen_at: new Date().toISOString() })
        .eq('id', id)
        .is('welcome_tour_seen_at', null);
    } catch {
      // DB'ye yazılamazsa localStorage fallback yeterli
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const decide = async () => {
      const dismissedIds = readDismissedIds();
      if (dismissedIds.includes(userId)) {
        return;
      }

      try {
        const { data } = await supabase
          .from('profiles')
          .select('welcome_tour_seen_at')
          .eq('id', userId)
          .maybeSingle();

        if (cancelled) return;

        if (data?.welcome_tour_seen_at) {
          writeDismissedId(userId);
          return;
        }
      } catch {
        // yoksay — localStorage yeterli
      }

      if (cancelled) return;
      setOpen(true);
      void persistSeen(userId);
    };

    void decide();

    return () => {
      cancelled = true;
    };
  }, [userId, persistSeen]);

  const dismiss = () => {
    setOpen(false);
    if (!userId) return;
    void persistSeen(userId);
  };

  if (!open) {
    return null;
  }

  const slide = SLIDES[stepIndex];
  const Icon = slide.icon;
  const isLast = stepIndex === SLIDES.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        key="welcome-tour"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
      >
        <button
          type="button"
          aria-label="Turu kapat"
          onClick={dismiss}
          className="absolute inset-0 h-full w-full cursor-default bg-transparent"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
        >
          <div
            className={`relative bg-gradient-to-br ${slide.tone} px-6 pb-5 pt-7`}
          >
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {slide.badge}
            </div>
            <div className="mt-3 flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2
                  id={headingId}
                  className="font-display text-xl font-bold text-white"
                >
                  {slide.title}
                </h2>
                {userName && stepIndex === 0 ? (
                  <p className="mt-1 text-sm text-slate-200">
                    Selam <strong className="text-white">{userName}</strong>,
                    seni aramızda görmek güzel.
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            <p className="text-sm leading-relaxed text-slate-300">
              {slide.description}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-white/10 px-6 py-4">
            <div
              role="tablist"
              aria-label="Tur ilerlemesi"
              className="flex gap-1.5"
            >
              {SLIDES.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={index === stepIndex}
                  aria-label={`Adım ${index + 1}`}
                  onClick={() => setStepIndex(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === stepIndex
                      ? 'w-6 bg-white'
                      : 'w-1.5 bg-white/25 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={dismiss}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Atla
              </button>
              {isLast ? (
                <button
                  type="button"
                  onClick={dismiss}
                  className="rounded-full bg-gradient-to-r from-brand-primary to-brand-pink px-4 py-1.5 text-sm font-bold text-white shadow hover:brightness-110"
                >
                  Hadi başlayalım
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStepIndex((idx) => idx + 1)}
                  className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/20"
                >
                  Sonraki
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
