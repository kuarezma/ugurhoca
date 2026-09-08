'use client';

import { useEffect } from 'react';
import { initPerformanceRuntime } from '@/lib/performance-runtime';

export function PerformanceRuntimeProvider() {
  useEffect(() => {
    const cleanupRuntime = initPerformanceRuntime();

    return cleanupRuntime;
  }, []);

  return null;
}
