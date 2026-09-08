/**
 * Gerçek Kullanıcı Metrikleri (RUM - Real User Monitoring)
 * PerformanceObserver tabanlı ultra hafif (<1KB) vanilla izleme modülü.
 */

export interface RUMMetrics {
  lcp: number;
  cls: number;
  inp: number;
  url: string;
  timestamp?: number;
}

export function initRUM(endpoint: string = '/api/rum'): () => void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return () => {};
  }

  const metrics: RUMMetrics = {
    lcp: 0,
    cls: 0,
    inp: 0,
    url: typeof location !== 'undefined' ? location.pathname : '',
  };

  const observers: PerformanceObserver[] = [];

  // 1. LCP (Largest Contentful Paint)
  try {
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        const lastEntry = entries[entries.length - 1];
        metrics.lcp = Math.round(lastEntry.startTime);
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    observers.push(lcpObserver);
  } catch {
    // Tarayıcı LCP observer desteklemiyor olabilir
  }

  // 2. CLS (Cumulative Layout Shift)
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries() as (PerformanceEntry & { hadRecentInput?: boolean; value?: number })[]) {
        if (!entry.hadRecentInput && typeof entry.value === 'number') {
          clsValue += entry.value;
          metrics.cls = Number(clsValue.toFixed(4));
        }
      }
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
    observers.push(clsObserver);
  } catch {
    // Tarayıcı layout-shift desteklemiyor olabilir
  }

  // 3. INP (Interaction to Next Paint)
  try {
    let maxDuration = 0;
    const inpObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries() as (PerformanceEntry & { interactionId?: number })[]) {
        if (entry.interactionId && entry.duration > maxDuration) {
          maxDuration = entry.duration;
          metrics.inp = Math.round(maxDuration);
        }
      }
    });
    inpObserver.observe({ type: 'event', buffered: true, durationThreshold: 16 } as unknown as PerformanceObserverInit);
    observers.push(inpObserver);
  } catch {
    // Tarayıcı event observer desteklemiyor olabilir
  }

  const sendMetrics = () => {
    if (metrics.lcp === 0 && metrics.cls === 0 && metrics.inp === 0) return;

    if (
      typeof location !== 'undefined' &&
      (location.hostname === 'localhost' || location.search.includes('debug=rum'))
    ) {
      console.warn('⚡ [RUM Metrikleri]', metrics);
    }

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const payload = JSON.stringify({ ...metrics, timestamp: Date.now() });
      navigator.sendBeacon(endpoint, payload);
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      sendMetrics();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Temizleme fonksiyonu
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    for (const observer of observers) {
      try {
        observer.disconnect();
      } catch {
        // noop
      }
    }
  };
}
