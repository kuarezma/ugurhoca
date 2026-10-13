'use client';

import { RouteErrorFallback } from '@/components/RouteErrorFallback';

export default function ProgramlarYksError({
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
      scope="programlar-yks"
      title="YKS çalışma programı yüklenemedi"
      description="TYT ve AYT hazırlık programı yüklenirken bir sorun oluştu. Tekrar deneyebilirsin."
      homeHref="/programlar"
      homeLabel="Programlara dön"
    />
  );
}
