'use client';

import { RouteErrorFallback } from '@/components/RouteErrorFallback';

export default function SifreSifirlaError({
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
      scope="sifre-sifirla"
      title="Şifre sıfırlama sayfası yüklenemedi"
      description="Şifre yenileme ekranı yüklenirken bir sorun oluştu. Tekrar deneyebilirsin."
      homeHref="/giris"
      homeLabel="Giriş sayfasına dön"
    />
  );
}
