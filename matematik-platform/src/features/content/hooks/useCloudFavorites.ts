'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { trackStudentActivityEvent } from '@/features/analytics/trackActivity';
import { userScopedStorage } from '@/lib/userScopedStorage';
import type { ContentDocument } from '@/types';

const FAVORITES_STORAGE_KEY = 'favorites';

export const useCloudFavorites = (userId?: string | null) => {
  const [savedFavorites, setFavorites] = useState<Set<string>>(new Set());
  const [loadedUserId, setLoadedUserId] = useState<string | null | undefined>(undefined);
  const scopeId = userId ?? null;
  const isCurrentUser = loadedUserId === scopeId;
  // Hesap değişiminin ilk renderında bile önceki hesabın verisini gösterme.
  const favorites = useMemo(() => isCurrentUser ? savedFavorites : new Set<string>(), [isCurrentUser, savedFavorites]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setFavorites(new Set());
    setIsLoaded(false);
    try {
      const saved = userScopedStorage(userId ?? null).getItem(FAVORITES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setFavorites(new Set(parsed));
        }
      }
    } catch {
      // ignore
    } finally {
      setLoadedUserId(userId ?? null);
      setIsLoaded(true);
    }
  }, [userId]);

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
        const next = new Set(isCurrentUser ? current : []);
        if (nextFav) {
          next.add(docId);
        } else {
          next.delete(docId);
        }
        try {
          userScopedStorage(userId ?? null).setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...next]));
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
    [favorites, isCurrentUser, userId],
  );

  return {
    favorites,
    isFavorite,
    isLoaded: isLoaded && isCurrentUser,
    setFavorites,
    toggleFavorite,
  };
};
