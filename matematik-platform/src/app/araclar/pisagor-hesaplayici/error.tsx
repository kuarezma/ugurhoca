'use client';

import { RouteErrorFallback } from '@/components/RouteErrorFallback';

export default function PisagorHesaplayiciError({
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
      scope="pisagor-hesaplayici"
      title="Pisagor hesaplayıcı yüklenemedi"
      description="Pisagor ve dik üçgen hesaplama aracı yüklenirken bir sorun oluştu. Tekrar deneyebilirsin."
      homeHref="/araclar"
      homeLabel="Araçlara dön"
    />
  );
}
