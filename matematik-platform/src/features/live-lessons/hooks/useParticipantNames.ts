'use client';

import { useEffect, useState } from 'react';

export function useParticipantNames(lessonId: string, enabled: boolean) {
  const [names, setNames] = useState<{
    lessonId: string;
    values: Record<string, string>;
  } | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    let timer: number | undefined;
    const refresh = async () => {
      try {
        const response = await fetch(
          `/api/live-lessons/${encodeURIComponent(lessonId)}/participants`,
          {
            cache: 'no-store',
            credentials: 'same-origin',
            signal: controller.signal,
          },
        );
        if (!response.ok) return;
        const payload = await response.json();
        if (!controller.signal.aborted)
          setNames({ lessonId, values: payload.participantNames });
      } catch {
        // Bağlantı kesilirse mevcut adları koru; sonraki yenileme yeniden dener.
      } finally {
        if (!controller.signal.aborted)
          timer = window.setTimeout(() => {
            void refresh();
          }, 5000);
      }
    };
    void refresh();
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [enabled, lessonId]);
  return enabled && names?.lessonId === lessonId ? names.values : {};
}
