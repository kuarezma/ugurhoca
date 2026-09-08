/**
 * Harici ve ağır üçüncü taraf scriptleri (Google Analytics, vb.)
 * tarayıcının boşta kaldığı anda (requestIdleCallback) veya ilk kullanıcı etkileşiminde yükler.
 */
export function loadDeferredScript(
  src: string,
  attributes: Record<string, string> = {}
): () => void {
  if (typeof window === 'undefined') return () => {};

  let injected = false;

  const inject = () => {
    if (injected) return;
    injected = true;

    // Halihazırda eklenmişse tekrar ekleme
    if (document.querySelector(`script[src="${src}"]`)) return;

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    for (const [key, val] of Object.entries(attributes)) {
      script.setAttribute(key, val);
    }
    document.head.appendChild(script);
  };

  const triggerEarly = () => {
    inject();
    cleanupListeners();
  };

  const cleanupListeners = () => {
    window.removeEventListener('scroll', triggerEarly);
    window.removeEventListener('touchstart', triggerEarly);
    window.removeEventListener('click', triggerEarly);
    window.removeEventListener('keydown', triggerEarly);
  };

  window.addEventListener('scroll', triggerEarly, { passive: true, once: true });
  window.addEventListener('touchstart', triggerEarly, { passive: true, once: true });
  window.addEventListener('click', triggerEarly, { passive: true, once: true });
  window.addEventListener('keydown', triggerEarly, { passive: true, once: true });

  let idleHandle: number | ReturnType<typeof setTimeout> | null = null;

  if ('requestIdleCallback' in window) {
    idleHandle = (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(
      () => {
        inject();
        cleanupListeners();
      },
      { timeout: 3500 }
    );
  } else {
    idleHandle = setTimeout(() => {
      inject();
      cleanupListeners();
    }, 2500);
  }

  return () => {
    cleanupListeners();
    if (idleHandle !== null) {
      if ('cancelIdleCallback' in window && typeof idleHandle === 'number') {
        (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleHandle);
      } else {
        clearTimeout(idleHandle as ReturnType<typeof setTimeout>);
      }
    }
  };
}
