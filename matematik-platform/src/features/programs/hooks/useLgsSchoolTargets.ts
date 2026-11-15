'use client';

import { useEffect, useState } from 'react';
import type { LgsSchoolPageData } from '@/features/programs/types';

export function useLgsSchoolTargets(preferredYear = 2026) {
  const [attempt, setAttempt] = useState(0);
  const [dataYear, setDataYear] = useState(preferredYear);
  const [error, setError] = useState('');
  const [historyYears, setHistoryYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<LgsSchoolPageData['schools']>([]);

  useEffect(() => {
    const controller = new AbortController();
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 30000);

    const loadSchools = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('/api/lgs-targets', {
          signal: controller.signal,
        });

        const payload = (await response.json().catch(() => null)) as {
          data?: LgsSchoolPageData;
          error?: { message?: string };
        } | null;

        const result = payload?.data;

        if (timedOut) throw new Error('timeout');
        if (controller.signal.aborted) return;

        if (!response.ok || !result) {
          setSchools([]);
          setDataYear(preferredYear);
          setError(
            payload?.error?.message ||
              'LGS okul verileri yüklenemedi. Lütfen tekrar deneyin.',
          );
          setHistoryYears([]);
          return;
        }

        setSchools(result.schools);
        setDataYear(result.dataYear);
        setError(result.error);
        setHistoryYears(result.historyYears || []);
      } catch (fetchError) {
        if (timedOut) {
          setSchools([]);
          setHistoryYears([]);
          setError('Okul verileri zamanında yüklenemedi. Lütfen tekrar dene.');
          return;
        }
        if (
          controller.signal.aborted ||
          (fetchError instanceof DOMException &&
            fetchError.name === 'AbortError')
        ) {
          return;
        }
        setSchools([]);
        setDataYear(preferredYear);
        setHistoryYears([]);
        setError(
          'LGS okul verileri yüklenemedi. İnternet bağlantını kontrol edip tekrar dene.',
        );
      } finally {
        clearTimeout(timeout);
        if (!controller.signal.aborted || timedOut) {
          setLoading(false);
        }
      }
    };

    void loadSchools();

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [preferredYear, attempt]);

  return {
    dataYear,
    error,
    historyYears,
    loading,
    schools,
    retry: () => setAttempt((value) => value + 1),
  };
}
