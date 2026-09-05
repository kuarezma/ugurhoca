'use client';

import { useCallback, useEffect, useState } from 'react';
import { trackStudentActivityEvent } from '@/features/analytics/trackActivity';
import type { ContentDocument } from '@/types';

const FAVORITES_STORAGE_KEY = 'favorites';

export const useCloudFavorites = (userId?: string | null) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setFavorites(new Set(parsed));
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const isFavorite = useCallback(
    (docId: string) => favorites.has(docId),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (content: ContentDocument | string) => {
      const docId = typeof content === 'string' ? content : content.id;
      const isFav = favorites.has(docId);
      const nextFav = !isFav;

      setFavorites((current) => {
        const next = new Set(current);
        if (nextFav) {
          next.add(docId);
        } else {
          next.delete(docId);
        }
        try {
          localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...next]));
        } catch {
          // ignore
        }
        return next;
      });

      if (typeof content !== 'string') {
        void trackStudentActivityEvent({
          entityId: content.id,
          entityType: 'document',
          eventType: nextFav ? 'content_favorited' : 'content_unfavorited',
          metadata: {
            grade: content.grade,
            title: content.title,
            type: content.type,
          },
          userId,
        });
      }
    },
    [favorites, userId],
  );

  return {
    favorites,
    isFavorite,
    isLoaded,
    setFavorites,
    toggleFavorite,
  };
};
