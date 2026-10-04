'use client';

import { RouteErrorFallback } from '@/components/RouteErrorFallback';

export default function AraclarError({
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
      scope="araclar"
      title="Hesaplama araçları yüklenemedi"
      description="Matematik ve sınav hesaplama araçları yüklenirken bir sorun oluştu."
      homeHref="/araclar"
      homeLabel="Araçlara dön"
    />
  );
}
