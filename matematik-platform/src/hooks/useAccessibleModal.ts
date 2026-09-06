'use client';

import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

const getFocusableElements = (container: HTMLElement | null) => {
  if (!container) {
    return [];
  }

  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => !element.hasAttribute('aria-hidden'));
};

// Ref-counted body scroll lock.
// Birden fazla modal aynı anda açılıp kapandığında `body.style.overflow`
// inline değerinin geride kalmaması için modülün paylaştığı bir sayaç
// kullanıyoruz. Sayaç 0'a düştüğünde original değerler geri yüklenir.
type ScrollLockState = {
  count: number;
  previousOverflow: string;
  previousPaddingRight: string;
};

const scrollLockState: ScrollLockState = {
  count: 0,
  previousOverflow: '',
  previousPaddingRight: '',
};

const acquireBodyScrollLock = () => {
  if (typeof document === 'undefined') {
    return;
  }
  const { body } = document;
  if (scrollLockState.count === 0) {
    scrollLockState.previousOverflow = body.style.overflow;
    scrollLockState.previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
  scrollLockState.count += 1;
};

const releaseBodyScrollLock = () => {
  if (typeof document === 'undefined') {
    return;
  }
  if (scrollLockState.count === 0) {
    return;
  }
  scrollLockState.count -= 1;
  if (scrollLockState.count === 0) {
    const { body } = document;
    body.style.overflow = scrollLockState.previousOverflow;
    body.style.paddingRight = scrollLockState.previousPaddingRight;
  }
};

export type AccessibleModalOptions = {
  /**
   * Mobil cihazlarda veya tarayıcıda geri tuşuna basıldığında modalı kapatmak için
   * history.pushState / popstate dinleyicisi ekler. Varsayılan: true.
   */
  enableHistoryBack?: boolean;
};

export const useAccessibleModal = <T extends HTMLElement>(
  isOpen: boolean,
  onClose: () => void,
  options: AccessibleModalOptions = {},
) => {
  const { enableHistoryBack = true } = options;
  const containerRef = useRef<T | null>(null);
  const onCloseRef = useRef(onClose);
  const isPushedRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousActiveElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const container = containerRef.current;
    const focusableElements = getFocusableElements(container);
    const firstTarget = focusableElements[0] ?? container;

    firstTarget?.focus();

    acquireBodyScrollLock();

    // Mobil geri tuşu ve tarayıcı back senkronizasyonu
    const handlePopState = () => {
      isPushedRef.current = false;
      onCloseRef.current();
    };

    if (enableHistoryBack && typeof window !== 'undefined') {
      const stateId = `modal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      try {
        window.history.pushState({ modalState: stateId }, '', window.location.href);
        isPushedRef.current = true;
        window.addEventListener('popstate', handlePopState);
      } catch {
        // İlgili ortamda history manipülasyonu kısıtlıysa graceful fallback
        isPushedRef.current = false;
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const currentContainer = containerRef.current;
      if (!currentContainer) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const currentFocusableElements = getFocusableElements(currentContainer);

      if (currentFocusableElements.length === 0) {
        event.preventDefault();
        currentContainer.focus();
        return;
      }

      const firstElement = currentFocusableElements[0];
      const lastElement =
        currentFocusableElements[currentFocusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        if (activeElement === firstElement || !currentContainer.contains(activeElement)) {
          event.preventDefault();
          lastElement.focus();
        }

        return;
      }

      if (activeElement === lastElement || !currentContainer.contains(activeElement)) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      if (enableHistoryBack && typeof window !== 'undefined') {
        window.removeEventListener('popstate', handlePopState);
        // Eğer kullanıcı geri tuşuyla değil, buton/Escape/backdrop ile kapattıysa
        // tarayıcı geçmişinde fazladan duran kaydı geri al
        if (isPushedRef.current) {
          isPushedRef.current = false;
          try {
            window.history.back();
          } catch {
            // ignore
          }
        }
      }

      releaseBodyScrollLock();
      previousActiveElement?.focus();
    };
  }, [isOpen, enableHistoryBack]);

  return containerRef;
};
