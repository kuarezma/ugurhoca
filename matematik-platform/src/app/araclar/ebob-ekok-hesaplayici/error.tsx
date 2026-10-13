'use client';

import { RouteErrorFallback } from '@/components/RouteErrorFallback';

export default function EbobEkokHesaplayiciError({
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
      scope="ebob-ekok-hesaplayici"
      title="EBOB-EKOK hesaplayıcı yüklenemedi"
      description="EBOB ve EKOK hesaplama aracı yüklenirken bir sorun oluştu. Tekrar deneyebilirsin."
      homeHref="/araclar"
      homeLabel="Araçlara dön"
    />
  );
}
