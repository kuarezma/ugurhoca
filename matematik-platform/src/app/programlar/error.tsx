'use client';

import { RouteErrorFallback } from '@/components/RouteErrorFallback';

export default function ProgramlarError({
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
      scope="programlar"
      title="Çalışma programları yüklenemedi"
      description="LGS ve YKS hedef programları yüklenirken bir sorun oluştu. Tekrar deneyebilirsin."
      homeHref="/programlar"
      homeLabel="Programlara dön"
    />
  );
}
