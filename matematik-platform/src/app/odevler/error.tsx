'use client';

import { RouteErrorFallback } from '@/components/RouteErrorFallback';

export default function OdevlerError({
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
      scope="odevler"
      title="Ödevler yüklenemedi"
      description="Ödev listen yüklenirken beklenmeyen bir sorun oluştu. Tekrar deneyebilirsin."
      homeHref="/odevler"
      homeLabel="Ödevlere dön"
    />
  );
}
