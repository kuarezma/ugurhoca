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
  const conn = (navigator as unknown as { connection?: NetworkInformation }).connection;
  if (!conn) return false;
  if (conn.saveData === true) return true;
  if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') return true;
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
  const sched = (window as unknown as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
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

const activePrefetchUrls = new Set<string>();

/**
 * BFCache (Back/Forward Cache) Yaşam Döngüsü ve Dokunma İyileştiricisi
 */
export function initPerformanceRuntime(): () => void {
  if (typeof window === 'undefined') return () => {};

  const pendingTimeouts = new Set<ReturnType<typeof setTimeout>>();

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

  // 2. Mobilde 300ms Dokunma Gecikmesini ve Gecikmeli Gezinmeyi Önleyen Mekanizma
  let touchStartX = 0;
  let touchStartY = 0;
  let isScrolling = false;

  const handleTouchStart = (e: TouchEvent) => {
    if (isDataSaverOrSlowConnection()) return;
    if (e.touches.length !== 1) return;

    isScrolling = false;
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;

    const target = (e.target as HTMLElement | null)?.closest?.('a');
    if (!target) return;

    const href = target.getAttribute('href');
    if (
      href &&
      href.startsWith('/') &&
      !href.startsWith('//') &&
      !target.hasAttribute('target') &&
      !target.hasAttribute('download') &&
      !target.hasAttribute('data-no-prefetch') &&
      !activePrefetchUrls.has(href)
    ) {
      activePrefetchUrls.add(href);

      try {
        const prefetchLink = document.createElement('link');
        prefetchLink.rel = 'prefetch';
        prefetchLink.href = href;
        prefetchLink.as = 'document';
        prefetchLink.setAttribute('data-runtime-prefetch', 'true');
        document.head.appendChild(prefetchLink);

        const timeoutId = setTimeout(() => {
          pendingTimeouts.delete(timeoutId);
          activePrefetchUrls.delete(href);
          if (prefetchLink.parentNode) {
            prefetchLink.parentNode.removeChild(prefetchLink);
          }
        }, 15000);
        pendingTimeouts.add(timeoutId);
      } catch {
        // Prefetch DOM ekleme hatası gezinmeyi engellememelidir
      }
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isScrolling || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const diffX = Math.abs(touch.clientX - touchStartX);
    const diffY = Math.abs(touch.clientY - touchStartY);

    if (diffX > 10 || diffY > 10) {
      isScrolling = true;
    }
  };

  document.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });
  document.addEventListener('touchmove', handleTouchMove, { passive: true, capture: true });

  // Temizleme fonksiyonu
  return () => {
    window.removeEventListener('pageshow', handlePageShow);
    window.removeEventListener('pagehide', handlePageHide);
    document.removeEventListener('touchstart', handleTouchStart, { capture: true });
    document.removeEventListener('touchmove', handleTouchMove, { capture: true });
    for (const tid of pendingTimeouts) {
      clearTimeout(tid);
    }
    pendingTimeouts.clear();
    activePrefetchUrls.clear();
  };
}
