'use client';

import { RouteErrorFallback } from '@/components/RouteErrorFallback';

export default function CanliDersOdasiError({
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
      scope="canli-ders-odasi"
      title="Canlı ders odası açılamadı"
      description="Ders odası bağlantısı kurulurken bir sorun oluştu. Tekrar dene veya ders listesine dönüp derse yeniden katıl."
      homeHref="/canli-ders"
      homeLabel="Derslere dön"
    />
  );
}
