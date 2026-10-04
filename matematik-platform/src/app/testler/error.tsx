'use client';

import { RouteErrorFallback } from '@/components/RouteErrorFallback';

export default function TestlerError({
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
      scope="testler"
      title="Testler yüklenemedi"
      description="Sınavlar ve testler yüklenirken beklenmeyen bir sorun oluştu. Tekrar deneyebilirsin."
      homeHref="/testler"
      homeLabel="Testlere dön"
    />
  );
}
