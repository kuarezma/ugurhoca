'use client';

import { RouteErrorFallback } from '@/components/RouteErrorFallback';

export default function KayitError({
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
      scope="kayit"
      title="Kayıt sayfası yüklenemedi"
      description="Kayıt ekranı yüklenirken bir sorun oluştu. Tekrar deneyebilirsin."
      homeHref="/"
      homeLabel="Ana sayfaya dön"
    />
  );
}
