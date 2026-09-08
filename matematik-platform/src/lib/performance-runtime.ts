/**
 * Ultra-hafif Performans ve BFCache Yaşam Döngüsü Yöneticisi
 * Harici bağımlılık içermez (Zero-dependency).
 */

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
};

/**
 * Kullanıcının veri tasarrufu modunda veya yavaş bağlantıda olup olmadığını kontrol eder.
 */
export function isDataSaverOrSlowConnection(): boolean {
  if (typeof navigator === 'undefined') return false;
  const conn = (navigator as unknown as { connection?: NetworkInformation })
    .connection;
  if (!conn) return false;
  if (conn.saveData === true) return true;
  if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g')
    return true;
  return false;
}

/**
 * INP (Interaction to Next Paint) optimizasyonu:
 * Uzun süren JavaScript görevlerini bölerek ana iş parçacığını (main thread) serbest bırakır.
 * Modern Chromium (129+) için scheduler.yield(), Safari ve Firefox için MessageChannel macro-task kullanır.
 */
export async function yieldToMain(): Promise<void> {
  if (typeof window === 'undefined') return;

  // Standart Scheduler API kontrolü
  const sched = (
    window as unknown as { scheduler?: { yield?: () => Promise<void> } }
  ).scheduler;
  if (sched && typeof sched.yield === 'function') {
    return sched.yield();
  }

  // MessageChannel macro-task fallback
  if (typeof MessageChannel !== 'undefined') {
    return new Promise((resolve) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = () => {
        try {
          channel.port1.close();
          channel.port2.close();
        } catch {
          // noop
        }
        resolve();
      };
      channel.port2.postMessage(null);
    });
  }

  // En eski tarayıcılar için fallback
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

/**
 * BFCache (Back/Forward Cache) yaşam döngüsü yöneticisi.
 */
export function initPerformanceRuntime(): () => void {
  if (typeof window === 'undefined') return () => {};

  // 1. BFCache Uyumluluğu:
  // 'unload' olayı BFCache'i devre dışı bırakır. Bu nedenle yalnızca 'pageshow' ve 'pagehide' dinlenir.
  const handlePageShow = (event: PageTransitionEvent) => {
    if (event.persisted) {
      document.documentElement.removeAttribute('data-page-frozen');
      window.dispatchEvent(new CustomEvent('app:bfcache-restore'));
    }
  };

  const handlePageHide = (event: PageTransitionEvent) => {
    if (event.persisted) {
      document.documentElement.setAttribute('data-page-frozen', 'true');
    }
  };

  window.addEventListener('pageshow', handlePageShow, { passive: true });
  window.addEventListener('pagehide', handlePageHide, { passive: true });

  // Temizleme fonksiyonu
  return () => {
    window.removeEventListener('pageshow', handlePageShow);
    window.removeEventListener('pagehide', handlePageHide);
  };
}
