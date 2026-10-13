'use client';

import { RouteErrorFallback } from '@/components/RouteErrorFallback';

export default function ProgramlarLgsError({
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
      scope="programlar-lgs"
      title="LGS çalışma programı yüklenemedi"
      description="LGS hazırlık programı yüklenirken bir sorun oluştu. Tekrar deneyebilirsin."
      homeHref="/programlar"
      homeLabel="Programlara dön"
    />
  );
}
