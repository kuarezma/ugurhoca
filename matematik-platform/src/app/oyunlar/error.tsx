'use client';

import { RouteErrorFallback } from '@/components/RouteErrorFallback';

export default function OyunlarError({
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
      scope="oyunlar"
      title="Oyunlar yüklenemedi"
      description="Eğitici matematik oyunları yüklenirken bir sorun oluştu. Tekrar deneyebilirsin."
      homeHref="/oyunlar"
      homeLabel="Oyunlara dön"
    />
  );
}
