'use client';

import { RouteErrorFallback } from '@/components/RouteErrorFallback';

export default function CanliDersError({
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
      scope="canli-ders"
      title="Canlı ders açılamadı"
      description="Ders odası yüklenirken bir sorun oluştu. Tekrar dene; sorun sürerse ders listesine dönüp derse yeniden katıl."
      homeHref="/canli-ders"
      homeLabel="Derslere dön"
    />
  );
}
