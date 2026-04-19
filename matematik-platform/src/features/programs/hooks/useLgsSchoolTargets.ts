'use client';

import { useEffect, useState } from 'react';
import type { LgsSchoolPageData } from '@/features/programs/types';

export function useLgsSchoolTargets(preferredYear = 2026) {
  const [dataYear, setDataYear] = useState(preferredYear);
  const [error, setError] = useState('');
  const [historyYears, setHistoryYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<LgsSchoolPageData['schools']>([]);

  useEffect(() => {
    let active = true;

    const loadSchools = async () => {
      setLoading(true);
      setError('');

      const response = await fetch('/api/lgs-targets', {
        cache: 'no-store',
      });

      const payload = (await response.json().catch(() => null)) as
        | { data?: LgsSchoolPageData; error?: { message?: string } }
        | null;

      const result = payload?.data;

      if (!active) {
        return;
      }

      if (!response.ok || !result) {
        setSchools([]);
        setDataYear(preferredYear);
        setError(
          payload?.error?.message ||
            'LGS okul verileri yüklenemedi. Lütfen tekrar deneyin.',
        );
        setHistoryYears([]);
        setLoading(false);
        return;
      }

      setSchools(result.schools);
      setDataYear(result.dataYear);
      setError(result.error);
      setHistoryYears(result.historyYears || []);
      setLoading(false);
    };

    void loadSchools();

    return () => {
      active = false;
    };
  }, [preferredYear]);

  return {
    dataYear,
    error,
    historyYears,
    loading,
    schools,
  };
}
