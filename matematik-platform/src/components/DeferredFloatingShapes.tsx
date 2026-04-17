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
  count = 6,
  delayMs = 180,
}: DeferredFloatingShapesProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      startTransition(() => {
        setShouldRender(true);
      });
    }, delayMs);

    return () => window.clearTimeout(timeoutId);
  }, [delayMs]);

  if (!shouldRender) {
    return null;
  }

  return <FloatingShapes count={count} />;
}
