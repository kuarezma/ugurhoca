'use client';

import { RouteErrorFallback } from '@/components/RouteErrorFallback';

export default function OdakPomodoroError({
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
      scope="odak-pomodoro"
      title="Odak & Pomodoro aracı yüklenemedi"
      description="Çalışma sayacı ve odak alanı yüklenirken bir sorun oluştu. Tekrar deneyebilirsin."
      homeHref="/"
      homeLabel="Ana sayfaya dön"
    />
  );
}
