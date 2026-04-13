'use client';

import { useEffect, useState } from 'react';
import { loadLgsSchoolTargets } from '@/features/programs/queries';
import type { LgsSchoolTarget } from '@/features/programs/types';

export function useLgsSchoolTargets(preferredYear = 2026) {
  const [dataYear, setDataYear] = useState(preferredYear);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<LgsSchoolTarget[]>([]);

  useEffect(() => {
    let active = true;

    const loadSchools = async () => {
      setLoading(true);
      setError('');

      const result = await loadLgsSchoolTargets(preferredYear);

      if (!active) {
        return;
      }

      setSchools(result.rows);
      setDataYear(result.dataYear);
      setError(result.error);
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
    loading,
    schools,
  };
}
