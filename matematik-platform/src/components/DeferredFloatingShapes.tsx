'use client';

import dynamic from 'next/dynamic';
import { startTransition, useEffect, useState } from 'react';

const FloatingShapes = dynamic(() => import('@/components/FloatingShapes'), {
  ssr: false,
  loading: () => null,
});

type DeferredFloatingShapesProps = {
  count?: number;
  delayMs?: number;
};

export default function DeferredFloatingShapes({
  count = 4,
  delayMs = 900,
}: DeferredFloatingShapesProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const supportsMatchMedia = typeof window.matchMedia === 'function';
    const prefersReducedMotion = supportsMatchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
    const isDesktop = supportsMatchMedia
      ? window.matchMedia('(min-width: 1024px)').matches
      : window.innerWidth >= 1024;
    const shouldSaveData =
      'connection' in navigator &&
      typeof navigator.connection === 'object' &&
      navigator.connection !== null &&
      'saveData' in navigator.connection &&
      navigator.connection.saveData === true;

    if (prefersReducedMotion || shouldSaveData || !isDesktop) {
      return undefined;
    }

    let timeoutId = 0;
    let idleCallbackId = 0;
    const scheduleRender = () => {
      if ('requestIdleCallback' in window) {
        idleCallbackId = window.requestIdleCallback(() => {
          startTransition(() => {
            setShouldRender(true);
          });
        });
        return;
      }

      startTransition(() => {
        setShouldRender(true);
      });
    };

    timeoutId = window.setTimeout(scheduleRender, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
      if ('cancelIdleCallback' in window && idleCallbackId) {
        window.cancelIdleCallback(idleCallbackId);
      }
    };
  }, [delayMs]);

  if (!shouldRender) {
    return null;
  }

  return <FloatingShapes count={count} />;
}
