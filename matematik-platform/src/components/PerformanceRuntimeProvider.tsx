'use client';

import { useEffect } from 'react';
import { initPerformanceRuntime } from '@/lib/performance-runtime';
import { initRUM } from '@/lib/rum';

export function PerformanceRuntimeProvider() {
  useEffect(() => {
    const cleanupRuntime = initPerformanceRuntime();
    const cleanupRUM = initRUM();

    return () => {
      cleanupRuntime();
      cleanupRUM();
    };
  }, []);

  return null;
}
