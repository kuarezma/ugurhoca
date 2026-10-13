'use client';

import { RouteErrorFallback } from '@/components/RouteErrorFallback';

export default function CikisBiletiError({
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
      scope="cikis-bileti"
      title="Çıkış bileti yüklenemedi"
      description="Günün çıkış bileti soruları yüklenirken bir sorun oluştu. Tekrar deneyebilirsin."
      homeHref="/"
      homeLabel="Ana sayfaya dön"
    />
  );
}
