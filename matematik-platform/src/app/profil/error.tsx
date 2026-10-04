'use client';

import { RouteErrorFallback } from '@/components/RouteErrorFallback';

export default function ProfilError({
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
      scope="profil"
      title="Profil yüklenemedi"
      description="Profil bilgilerin ve çalışma özeti yüklenirken bir sorun oluştu. Tekrar deneyebilirsin."
      homeHref="/profil"
      homeLabel="Profile dön"
    />
  );
}
