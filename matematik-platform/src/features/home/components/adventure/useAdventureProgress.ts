'use client';

import { useEffect, useState } from 'react';
import { loadAdventureProgress } from './adventure-queries';
import type { AdventureProgressData } from './adventure-progress';

export function useAdventureProgress(userId?: string) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{
    userId: string;
    data: AdventureProgressData | null;
    error: string | null;
    loading: boolean;
  } | null>(null);

  useEffect(() => {
    if (!userId) return;
    let disposed = false;
    setState({ userId, data: null, error: null, loading: true });
    void loadAdventureProgress(userId).then(
      (data) => {
        if (!disposed) setState({ userId, data, error: null, loading: false });
      },
      () => {
        if (!disposed)
          setState({
            userId,
            data: null,
            error: 'İlerlemen yüklenemedi. Yeniden deneyebilirsin.',
            loading: false,
          });
      },
    );
    return () => {
      disposed = true;
    };
  }, [userId, attempt]);

  // Oturum değiştiği ilk render'da önceki öğrencinin sayılarını gösterme.
  const current = userId && state?.userId === userId ? state : null;
  return {
    data: current?.data ?? null,
    error: current?.error ?? null,
    loading: Boolean(userId) && (current?.loading ?? true),
    retry: () => setAttempt((value) => value + 1),
  };
}
