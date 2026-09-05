'use client';

import { useCallback, useEffect, useState } from 'react';
import { trackStudentActivityEvent } from '@/features/analytics/trackActivity';
import type { ContentDocument } from '@/types';

const COMPLETED_DOCS_KEY = 'matematiklab_completed_docs';

export const useContentCompletion = (userId?: string | null) => {
  const [completedDocIds, setCompletedDocIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COMPLETED_DOCS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCompletedDocIds(new Set(parsed));
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const isCompleted = useCallback(
    (docId: string) => completedDocIds.has(docId),
    [completedDocIds],
  );

  const toggleCompleted = useCallback(
    async (content: ContentDocument) => {
      const wasCompleted = completedDocIds.has(content.id);
      const nextCompleted = !wasCompleted;

      setCompletedDocIds((current) => {
        const next = new Set(current);
        if (nextCompleted) {
          next.add(content.id);
        } else {
          next.delete(content.id);
        }
        try {
          localStorage.setItem(COMPLETED_DOCS_KEY, JSON.stringify([...next]));
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
    [completedDocIds, userId],
  );

  return {
    completedDocIds,
    isCompleted,
    isLoaded,
    toggleCompleted,
  };
};
