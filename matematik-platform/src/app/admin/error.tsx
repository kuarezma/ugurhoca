'use client';

import { RouteErrorFallback } from '@/components/RouteErrorFallback';

export default function AdminError({
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
      scope="admin"
      title="Yönetim paneli yüklenemedi"
      description="Beklenmeyen bir sorun oluştu. Tekrar deneyebilir veya panele geri dönebilirsin — giriş oturumun korunur."
      homeHref="/admin"
      homeLabel="Panele dön"
    />
  );
}
