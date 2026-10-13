'use client';

import { RouteErrorFallback } from '@/components/RouteErrorFallback';

export default function SifremiUnuttumError({
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
      scope="sifremi-unuttum"
      title="Şifremi unuttum sayfası yüklenemedi"
      description="Şifre sıfırlama bağlantısı ekranı yüklenirken bir sorun oluştu. Tekrar deneyebilirsin."
      homeHref="/giris"
      homeLabel="Giriş sayfasına dön"
    />
  );
}
