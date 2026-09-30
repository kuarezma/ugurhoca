'use client';

import { useEffect, useState } from 'react';
import { SafeLink } from '@/components/SafeLink';

type ActiveLesson = { room_id: string; title: string };

// Kişisel veri HTML önbelleğinden ayrı yüklenir; fixed rozet yer kaplamaz.
export function ActiveLiveLessonBadge({ userId }: { userId?: string }) {
  const [result, setResult] = useState<{
    userId: string;
    lesson: ActiveLesson | null;
  } | null>(null);

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();

    const loadLesson = async () => {
      try {
        const response = await fetch('/api/live-lessons/active', {
          cache: 'no-store',
          credentials: 'same-origin',
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = (await response.json()) as { lesson: ActiveLesson | null };
        if (!controller.signal.aborted) {
          setResult({ userId, lesson: data.lesson });
        }
      } catch {
        // Rozetin yüklenememesi ana sayfanın kullanımını engellemez.
      }
    };

    void loadLesson();
    return () => controller.abort();
  }, [userId]);

  const activeLiveLesson = result?.userId === userId ? result?.lesson : null;

  if (!activeLiveLesson) {
    return null;
  }

  return (
    <SafeLink
      href={`/canli-ders/d/${activeLiveLesson.room_id}`}
      className="fixed right-4 top-[calc(4.75rem+env(safe-area-inset-top))] z-40 inline-flex max-w-[calc(100vw-2rem)] animate-pulse items-center gap-2 rounded-full bg-red-600 px-4 py-3 text-sm font-bold text-white dark:text-white shadow-[0_0_0_8px_rgba(220,38,38,0.16),0_18px_35px_-18px_rgba(220,38,38,0.9)] ring-1 ring-white/30 transition hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 sm:right-6"
      aria-label={`${activeLiveLesson.title} canlı dersine katıl`}
    >
      <span className="relative flex h-3 w-3 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
      </span>
      <span className="truncate">Şu an ders var</span>
    </SafeLink>
  );
}
