'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { trackStudentActivityEvent } from '@/features/analytics/trackActivity';
import { userScopedStorage } from '@/lib/userScopedStorage';
import type { ContentDocument } from '@/types';

const COMPLETED_DOCS_KEY = 'matematiklab_completed_docs';

export const useContentCompletion = (userId?: string | null) => {
  const [savedCompletedDocIds, setCompletedDocIds] = useState<Set<string>>(
    new Set(),
  );
  const [loadedUserId, setLoadedUserId] = useState<string | null | undefined>(
    undefined,
  );
  const scopeId = userId ?? null;
  const isCurrentUser = loadedUserId === scopeId;
  // Hesap değişiminin ilk renderında bile önceki hesabın verisini gösterme.
  const completedDocIds = useMemo(
    () => (isCurrentUser ? savedCompletedDocIds : new Set<string>()),
    [isCurrentUser, savedCompletedDocIds],
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    setCompletedDocIds(new Set());
    setIsLoaded(false);

    let initialSet = new Set<string>();
    try {
      const saved = userScopedStorage(userId ?? null).getItem(
        COMPLETED_DOCS_KEY,
      );
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          initialSet = new Set(parsed);
          setCompletedDocIds(initialSet);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoadedUserId(userId ?? null);
      setIsLoaded(true);
    }

    // Kullanıcı giriş yapmışsa buluttaki tamamlanan içerikleri çekip birleştir
    if (
      userId &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      void (async () => {
        try {
          const { supabase } = await import('@/lib/supabase/client');
          const { data, error } = await supabase
            .from('student_activity_events')
            .select('entity_id')
            .eq('user_id', userId)
            .in('event_type', ['content_complete', 'content_completed']);

          if (!isCancelled && !error && Array.isArray(data)) {
            const cloudIds = data
              .map((row) => (row as { entity_id?: string | null }).entity_id)
              .filter(
                (id): id is string => typeof id === 'string' && id.length > 0,
              );

            if (cloudIds.length > 0) {
              setCompletedDocIds((current) => {
                const merged = new Set([...current, ...cloudIds]);
                try {
                  userScopedStorage(userId).setItem(
                    COMPLETED_DOCS_KEY,
                    JSON.stringify([...merged]),
                  );
                } catch {
                  // ignore
                }
                return merged;
              });
            }
          }
        } catch {
          // Bulut senkronizasyonu hatasında sessizce yerel veriyle devam et
        }
      })();
    }

    return () => {
      isCancelled = true;
    };
  }, [userId]);

  const isCompleted = useCallback(
    (docId: string) => completedDocIds.has(docId),
    [completedDocIds],
  );

  const toggleCompleted = useCallback(
    async (content: ContentDocument) => {
      const wasCompleted = completedDocIds.has(content.id);
      const nextCompleted = !wasCompleted;

      setCompletedDocIds((current) => {
        const next = new Set(isCurrentUser ? current : []);
        if (nextCompleted) {
          next.add(content.id);
        } else {
          next.delete(content.id);
        }
        try {
          userScopedStorage(userId ?? null).setItem(
            COMPLETED_DOCS_KEY,
            JSON.stringify([...next]),
          );
        } catch {
          // ignore
        }
        return next;
      });

      void trackStudentActivityEvent({
        entityId: content.id,
        entityType: 'document',
        eventType: nextCompleted ? 'content_completed' : 'content_uncompleted',
        metadata: {
          grade: content.grade,
          title: content.title,
          type: content.type,
        },
        userId,
      });
    },
    [completedDocIds, isCurrentUser, userId],
  );

  return {
    completedDocIds,
    isCompleted,
    isLoaded: isLoaded && isCurrentUser,
    toggleCompleted,
  };
};
