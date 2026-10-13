'use client';

import { RouteErrorFallback } from '@/components/RouteErrorFallback';

export default function YksPuanHesaplamaError({
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
      scope="yks-puan-hesaplama"
      title="YKS puan hesaplama aracı yüklenemedi"
      description="TYT ve AYT puan hesaplama aracı yüklenirken bir sorun oluştu. Tekrar deneyebilirsin."
      homeHref="/araclar"
      homeLabel="Araçlara dön"
    />
  );
}
