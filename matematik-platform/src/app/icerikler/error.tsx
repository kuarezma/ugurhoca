'use client';

import { RouteErrorFallback } from '@/components/RouteErrorFallback';

export default function IceriklerError({
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
      scope="icerikler"
      title="İçerikler yüklenemedi"
      description="Ders materyalleri ve çalışma kağıtları yüklenirken bir sorun oluştu."
      homeHref="/icerikler"
      homeLabel="İçeriklere dön"
    />
  );
}
