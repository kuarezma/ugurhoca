'use client';

import { Component, type ReactNode } from 'react';
import { createLogger } from '@/lib/logger';

const log = createLogger('error-boundary');

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = { hasError: boolean };

// Bileşen düzeyi hata sınırı: dinamik olarak yüklenen ağır bileşenler (ör. canlı
// ders odası) throw ettiğinde tüm route'u düşürmek yerine yerel bir fallback gösterir.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    log.error('Bileşen hata sınırında yakalandı', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-foreground/70">
            Bir şeyler ters gitti. Sayfayı yenileyip tekrar deneyin.
          </div>
        )
      );
    }

    return this.props.children;
  }
}
