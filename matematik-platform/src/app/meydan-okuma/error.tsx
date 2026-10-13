'use client';

import { RouteErrorFallback } from '@/components/RouteErrorFallback';

export default function MeydanOkumaError({
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
      scope="meydan-okuma"
      title="Meydan okuma sayfası yüklenemedi"
      description="Matematik meydan okuma ekranı yüklenirken bir sorun oluştu. Tekrar deneyebilirsin."
      homeHref="/oyunlar"
      homeLabel="Oyunlara dön"
    />
  );
}
