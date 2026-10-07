'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  calculateCurriculumCoverage,
  type CurriculumDocument,
} from '../curriculum-coverage';
import { loadCurriculumCoverageDocuments } from '../curriculum-queries';

export function useCurriculumCoverage(enabled = true) {
  const [documents, setDocuments] = useState<CurriculumDocument[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let disposed = false;
    setLoading(true);
    setError(null);
    void loadCurriculumCoverageDocuments().then(
      (data) => {
        if (!disposed) {
          setDocuments(data);
          setLoading(false);
        }
      },
      () => {
        if (!disposed) {
          setError('İçerik kapsamı yüklenemedi. Yeniden deneyin.');
          setLoading(false);
        }
      },
    );
    return () => {
      disposed = true;
    };
  }, [enabled, attempt]);

  const rows = useMemo(
    () => (documents ? calculateCurriculumCoverage(documents) : []),
    [documents],
  );
  return {
    rows,
    loading,
    error,
    retry: () => setAttempt((value) => value + 1),
  };
}
