'use client';

import { useEffect } from 'react';
import { initPerformanceRuntime } from '@/lib/performance-runtime';

export function PerformanceRuntimeProvider() {
  useEffect(() => {
    const cleanup = initPerformanceRuntime();
    return cleanup;
  }, []);

  return null;
}
