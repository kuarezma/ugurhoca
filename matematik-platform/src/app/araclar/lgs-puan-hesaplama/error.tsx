'use client';

import { RouteErrorFallback } from '@/components/RouteErrorFallback';

export default function LgsPuanHesaplamaError({
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
      scope="lgs-puan-hesaplama"
      title="LGS puan hesaplama aracı yüklenemedi"
      description="LGS puan ve yüzdelik dilim hesaplama aracı yüklenirken bir sorun oluştu. Tekrar deneyebilirsin."
      homeHref="/araclar"
      homeLabel="Araçlara dön"
    />
  );
}
