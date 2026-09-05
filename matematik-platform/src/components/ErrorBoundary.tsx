'use client';

import { Component, type ReactNode } from 'react';
import { createLogger } from '@/lib/logger';

const log = createLogger('error-boundary');

type FallbackRenderProps = {
  reset: () => void;
};

type Props = {
  children: ReactNode;
  fallback?: ReactNode | ((props: FallbackRenderProps) => ReactNode);
  onReset?: () => void;
};

type State = { hasError: boolean; error?: unknown };

// Bileşen düzeyi hata sınırı: dinamik olarak yüklenen ağır bileşenler (ör. canlı
// ders odası, karalama tahtası, grafik laboratuvarı) hata verdiğinde tüm route'u
// düşürmek yerine yerel bir fallback gösterir ve kendini sıfırlayabilir.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown) {
    log.error('Bileşen hata sınırında yakalandı', error);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback({ reset: this.reset });
      }

      return (
        this.props.fallback ?? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-sm text-foreground/70 gap-3">
            <span>Bir şeyler ters gitti. Lütfen tekrar deneyin.</span>
            <button
              type="button"
              onClick={this.reset}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition active:scale-95"
            >
              Yeniden Dene
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
