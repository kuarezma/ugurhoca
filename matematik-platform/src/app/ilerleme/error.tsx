'use client';

import { RouteErrorFallback } from '@/components/RouteErrorFallback';

export default function IlerlemeError({
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
      scope="ilerleme"
      title="İlerleme raporu yüklenemedi"
      description="Çalışma istatistiklerin ve gelişim grafiklerin yüklenirken bir sorun oluştu."
      homeHref="/ilerleme"
      homeLabel="İlerlemeye dön"
    />
  );
}
