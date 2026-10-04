'use client';

import { RouteErrorFallback } from '@/components/RouteErrorFallback';

export default function Error({
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
      scope="app"
      title="Bir şeyler ters gitti"
      description="Üzgünüz, beklenmeyen bir sorun oluştu. Tekrar denemek genelde işe yarar. Sorun devam ederse ana sayfaya geri dönebilirsin."
      homeHref="/"
      homeLabel="Ana sayfa"
      mascotSize={140}
      minHeight="min-h-[80vh]"
    />
  );
}
