'use client';

import { useEffect, useState } from 'react';
import { loadYksProgramTargets } from '@/features/programs/queries';
import type { YksProgramTarget } from '@/features/programs/types';

export function useYksProgramTargets(preferredYear = 2026) {
  const [dataYear, setDataYear] = useState(preferredYear);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<YksProgramTarget[]>([]);

  useEffect(() => {
    let active = true;

    const loadPrograms = async () => {
      setLoading(true);
      setError('');

      const result = await loadYksProgramTargets(preferredYear);

      if (!active) {
        return;
      }

      setPrograms(result.rows);
      setDataYear(result.dataYear);
      setError(result.error);
      setLoading(false);
    };

    void loadPrograms();

    return () => {
      active = false;
    };
  }, [preferredYear]);

  return {
    dataYear,
    error,
    loading,
    programs,
  };
}
