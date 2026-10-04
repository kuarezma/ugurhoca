'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { trackStudentActivityEvent } from '@/features/analytics/trackActivity';
import { userScopedStorage } from '@/lib/userScopedStorage';
import type { ContentDocument } from '@/types';

const COMPLETED_DOCS_KEY = 'matematiklab_completed_docs';

export const useContentCompletion = (userId?: string | null) => {
  const [savedCompletedDocIds, setCompletedDocIds] = useState<Set<string>>(new Set());
  const [loadedUserId, setLoadedUserId] = useState<string | null | undefined>(undefined);
  const scopeId = userId ?? null;
  const isCurrentUser = loadedUserId === scopeId;
  // Hesap değişiminin ilk renderında bile önceki hesabın verisini gösterme.
  const completedDocIds = useMemo(() => isCurrentUser ? savedCompletedDocIds : new Set<string>(), [isCurrentUser, savedCompletedDocIds]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setCompletedDocIds(new Set());
    setIsLoaded(false);
    try {
      const saved = userScopedStorage(userId ?? null).getItem(COMPLETED_DOCS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCompletedDocIds(new Set(parsed));
        }
      }
    } catch {
      // ignore
    } finally {
      setLoadedUserId(userId ?? null);
      setIsLoaded(true);
    }
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
          userScopedStorage(userId ?? null).setItem(COMPLETED_DOCS_KEY, JSON.stringify([...next]));
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
