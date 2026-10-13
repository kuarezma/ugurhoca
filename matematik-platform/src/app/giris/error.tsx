'use client';

import { RouteErrorFallback } from '@/components/RouteErrorFallback';

export default function GirisError({
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
      scope="giris"
      title="Giriş sayfası yüklenemedi"
      description="Oturum açma ekranı yüklenirken bir sorun oluştu. Tekrar deneyebilirsin."
      homeHref="/"
      homeLabel="Ana sayfaya dön"
    />
  );
}
