'use client';

import { RouteErrorFallback } from '@/components/RouteErrorFallback';

export default function KvkkError({
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
      scope="kvkk"
      title="KVKK aydınlatma metni yüklenemedi"
      description="KVKK aydınlatma metni sayfası yüklenirken bir sorun oluştu. Tekrar deneyebilirsin."
      homeHref="/"
      homeLabel="Ana sayfaya dön"
    />
  );
}
