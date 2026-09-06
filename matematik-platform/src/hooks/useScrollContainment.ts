'use client';

import { useEffect, type RefObject } from 'react';
import { acquireBodyScrollLock, releaseBodyScrollLock } from './useAccessibleModal';

export type ScrollContainmentOptions = {
  /** Modalin veya pencerenin aktif/açık olup olmadığı (Varsayılan: true) */
  enabled?: boolean;
  /** Mobil cihazlarda (<640px) body scroll kilidi uygulansın mı (Varsayılan: true) */
  lockBodyOnMobile?: boolean;
};

/**
 * Belirtilen öğenin veya üst öğelerinin belirtilen eksende kaydırılabilir olup olmadığını bulur.
 */
function findScrollableParent(
  target: HTMLElement | null,
  boundary: HTMLElement,
  axis: 'x' | 'y',
): HTMLElement | null {
  let curr = target;
  while (curr && curr !== boundary.parentElement) {
    const style = window.getComputedStyle(curr);
    const overflow = axis === 'y' ? style.overflowY : style.overflowX;
    const isScrollable =
      (overflow === 'auto' || overflow === 'scroll') &&
      (axis === 'y'
        ? curr.scrollHeight > curr.clientHeight
        : curr.scrollWidth > curr.clientWidth);

    if (isScrollable) {
      return curr;
    }

    if (curr === boundary) {
      break;
    }
    curr = curr.parentElement;
  }
  return null;
}

/**
 * useScrollContainment
 * Sohbet penceresi veya açılır kutular kaydırılırken arkadaki sayfanın kaymasını (scroll bleed / scroll chaining)
 * hem masaüstünde (mouse wheel, macOS trackpad) hem de mobilde (touch swipe) kesin olarak engeller.
 */
export function useScrollContainment<T extends HTMLElement = HTMLDivElement>(
  targetRef: RefObject<T | null>,
  options: ScrollContainmentOptions = {},
) {
  const { enabled = true, lockBodyOnMobile = true } = options;

  // 1. Mobil Ekranlar İçin Body Scroll Lock
  useEffect(() => {
    if (!enabled) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    if (lockBodyOnMobile && isMobile) {
      acquireBodyScrollLock();
      return () => {
        releaseBodyScrollLock();
      };
    }
  }, [enabled, lockBodyOnMobile]);

  // 2. Mouse Wheel, macOS Trackpad ve Dokunmatik Olay Yalıtımı
  useEffect(() => {
    if (!enabled) return;

    const container = targetRef.current;
    if (!container) return;

    // Wheel (Fare tekerleği & Trackpad iki parmak kaydırma)
    const handleWheel = (e: WheelEvent) => {
      const isVertical = Math.abs(e.deltaY) >= Math.abs(e.deltaX);

      if (isVertical) {
        const scrollable = findScrollableParent(e.target as HTMLElement, container, 'y');

        // Hedef alan kaydırılabilir bir liste/alan değilse (başlık, boşluk, butonlar vb.)
        if (!scrollable) {
          e.preventDefault();
          return;
        }

        const { scrollTop, scrollHeight, clientHeight } = scrollable;
        const deltaY = e.deltaY;

        // Zaten en üstte ve yukarı kaydırmaya çalışıyor
        if (deltaY < 0 && scrollTop <= 0.5) {
          e.preventDefault();
          return;
        }

        // Zaten en altta ve aşağı kaydırmaya çalışıyor
        if (deltaY > 0 && scrollTop + clientHeight >= scrollHeight - 0.5) {
          e.preventDefault();
          return;
        }

        // Kapsayıcı içinde geçerli kaydırma, dışarıya sızmasını durdur
        e.stopPropagation();
      } else {
        const scrollable = findScrollableParent(e.target as HTMLElement, container, 'x');

        if (!scrollable) {
          if (Math.abs(e.deltaX) > 0.5) {
            e.preventDefault();
          }
          return;
        }

        const { scrollLeft, scrollWidth, clientWidth } = scrollable;
        const deltaX = e.deltaX;

        // En başta ve sola kaydırıyor
        if (deltaX < 0 && scrollLeft <= 0.5) {
          e.preventDefault();
          return;
        }

        // En sonda ve sağa kaydırıyor
        if (deltaX > 0 && scrollLeft + clientWidth >= scrollWidth - 0.5) {
          e.preventDefault();
          return;
        }

        e.stopPropagation();
      }
    };

    // Touch (Mobil ve tablet dokunmatik kaydırmaları)
    let touchStartY = 0;
    let touchStartX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;

      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const deltaY = touchStartY - currentY; // pozitif = aşağı kaydırma
      const deltaX = touchStartX - currentX; // pozitif = sağa kaydırma

      const isVertical = Math.abs(deltaY) >= Math.abs(deltaX);

      if (isVertical) {
        const scrollable = findScrollableParent(e.target as HTMLElement, container, 'y');

        if (!scrollable) {
          if (e.cancelable) e.preventDefault();
          return;
        }

        const { scrollTop, scrollHeight, clientHeight } = scrollable;

        // En üstte ve aşağı çekmeye çalışıyor
        if (deltaY < 0 && scrollTop <= 0.5) {
          if (e.cancelable) e.preventDefault();
          return;
        }

        // En altta ve yukarı çekmeye çalışıyor
        if (deltaY > 0 && scrollTop + clientHeight >= scrollHeight - 0.5) {
          if (e.cancelable) e.preventDefault();
          return;
        }

        e.stopPropagation();
      } else {
        const scrollable = findScrollableParent(e.target as HTMLElement, container, 'x');

        if (!scrollable) {
          if (e.cancelable) e.preventDefault();
          return;
        }

        const { scrollLeft, scrollWidth, clientWidth } = scrollable;

        if (deltaX < 0 && scrollLeft <= 0.5) {
          if (e.cancelable) e.preventDefault();
          return;
        }

        if (deltaX > 0 && scrollLeft + clientWidth >= scrollWidth - 0.5) {
          if (e.cancelable) e.preventDefault();
          return;
        }

        e.stopPropagation();
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [enabled, targetRef]);
}
