import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useScrollContainment } from './useScrollContainment';

describe('useScrollContainment hook', () => {
  let container: HTMLDivElement;
  let targetRef: { current: HTMLDivElement | null };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    targetRef = { current: container };
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  });

  afterEach(() => {
    if (container.parentElement) {
      container.parentElement.removeChild(container);
    }
    vi.restoreAllMocks();
  });

  it('kaydırılamayan bir alanda (başlık vb.) fare tekerleği döndürüldüğünde preventDefault çağırır', () => {
    renderHook(() => useScrollContainment(targetRef, { enabled: true, lockBodyOnMobile: false }));

    const header = document.createElement('header');
    container.appendChild(header);

    const wheelEvent = new WheelEvent('wheel', {
      deltaY: -10,
      cancelable: true,
      bubbles: true,
    });
    const preventDefaultSpy = vi.spyOn(wheelEvent, 'preventDefault');

    header.dispatchEvent(wheelEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('kaydırılabilir bir alanda en tepedeyken yukarı kaydırıldığında sayfanın kaymasını engeller', () => {
    renderHook(() => useScrollContainment(targetRef, { enabled: true, lockBodyOnMobile: false }));

    const scrollList = document.createElement('div');
    scrollList.style.overflowY = 'auto';
    Object.defineProperty(scrollList, 'scrollHeight', { value: 300, configurable: true });
    Object.defineProperty(scrollList, 'clientHeight', { value: 100, configurable: true });
    Object.defineProperty(scrollList, 'scrollTop', { value: 0, configurable: true });
    container.appendChild(scrollList);

    const wheelEvent = new WheelEvent('wheel', {
      deltaY: -15,
      cancelable: true,
      bubbles: true,
    });
    const preventDefaultSpy = vi.spyOn(wheelEvent, 'preventDefault');

    scrollList.dispatchEvent(wheelEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('kaydırılabilir bir alanda en dipteyken aşağı kaydırıldığında sayfanın kaymasını engeller', () => {
    renderHook(() => useScrollContainment(targetRef, { enabled: true, lockBodyOnMobile: false }));

    const scrollList = document.createElement('div');
    scrollList.style.overflowY = 'auto';
    Object.defineProperty(scrollList, 'scrollHeight', { value: 300, configurable: true });
    Object.defineProperty(scrollList, 'clientHeight', { value: 100, configurable: true });
    Object.defineProperty(scrollList, 'scrollTop', { value: 200, configurable: true });
    container.appendChild(scrollList);

    const wheelEvent = new WheelEvent('wheel', {
      deltaY: 20,
      cancelable: true,
      bubbles: true,
    });
    const preventDefaultSpy = vi.spyOn(wheelEvent, 'preventDefault');

    scrollList.dispatchEvent(wheelEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('kaydırılabilir alanın ortasındayken iç kaydırmaya izin verir ve stopPropagation çağırır', () => {
    renderHook(() => useScrollContainment(targetRef, { enabled: true, lockBodyOnMobile: false }));

    const scrollList = document.createElement('div');
    scrollList.style.overflowY = 'auto';
    Object.defineProperty(scrollList, 'scrollHeight', { value: 300, configurable: true });
    Object.defineProperty(scrollList, 'clientHeight', { value: 100, configurable: true });
    Object.defineProperty(scrollList, 'scrollTop', { value: 50, configurable: true });
    container.appendChild(scrollList);

    const wheelEvent = new WheelEvent('wheel', {
      deltaY: 10,
      cancelable: true,
      bubbles: true,
    });
    const preventDefaultSpy = vi.spyOn(wheelEvent, 'preventDefault');
    const stopPropagationSpy = vi.spyOn(wheelEvent, 'stopPropagation');

    scrollList.dispatchEvent(wheelEvent);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('yalnızca yatayda kaydırılabilen alanda (çip satırları) dikey fare tekerleğini yatay kaydırmaya dönüştürür', () => {
    renderHook(() => useScrollContainment(targetRef, { enabled: true, lockBodyOnMobile: false }));

    const horizontalList = document.createElement('div');
    horizontalList.style.overflowX = 'auto';
    horizontalList.style.overflowY = 'hidden';
    Object.defineProperty(horizontalList, 'scrollWidth', { value: 600, configurable: true });
    Object.defineProperty(horizontalList, 'clientWidth', { value: 300, configurable: true });
    Object.defineProperty(horizontalList, 'scrollHeight', { value: 40, configurable: true });
    Object.defineProperty(horizontalList, 'clientHeight', { value: 40, configurable: true });
    horizontalList.scrollLeft = 0;
    container.appendChild(horizontalList);

    const wheelEvent = new WheelEvent('wheel', {
      deltaY: 25,
      cancelable: true,
      bubbles: true,
    });
    const preventDefaultSpy = vi.spyOn(wheelEvent, 'preventDefault');
    const stopPropagationSpy = vi.spyOn(wheelEvent, 'stopPropagation');

    horizontalList.dispatchEvent(wheelEvent);

    expect(horizontalList.scrollLeft).toBe(25);
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('mobil cihazlarda enabled olduğunda body scroll kilidi uygular', () => {
    window.innerWidth = 400;

    const { unmount } = renderHook(() =>
      useScrollContainment(targetRef, { enabled: true, lockBodyOnMobile: true }),
    );

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('');
  });
});
