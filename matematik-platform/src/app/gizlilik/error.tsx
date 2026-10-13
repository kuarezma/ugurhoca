'use client';

import { RouteErrorFallback } from '@/components/RouteErrorFallback';

export default function GizlilikError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorFallback
      error={error}
      reset={reset}
      scope="gizlilik"
      title="Gizlilik politikası yüklenemedi"
      description="Gizlilik politikası sayfası yüklenirken bir sorun oluştu. Tekrar deneyebilirsin."
      homeHref="/"
      homeLabel="Ana sayfaya dön"
    />
  );
}
