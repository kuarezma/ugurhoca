import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAccessibleModal } from './useAccessibleModal';

describe('useAccessibleModal hook', () => {
  let onCloseMock: () => void;

  beforeEach(() => {
    onCloseMock = vi.fn();
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('açıldığında body scroll lock uygular ve kapandığında kaldırır', () => {
    const { unmount } = renderHook(() => useAccessibleModal(true, onCloseMock, { enableHistoryBack: false }));

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('');
  });

  it('Escape tuşuna basıldığında onClose fonksiyonunu çağırır', () => {
    const { result } = renderHook(() => useAccessibleModal<HTMLDivElement>(true, onCloseMock, { enableHistoryBack: false }));

    const container = document.createElement('div');
    document.body.appendChild(container);
    Object.defineProperty(result.current, 'current', {
      value: container,
      writable: true,
      configurable: true,
    });

    act(() => {
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);
    });

    expect(onCloseMock).toHaveBeenCalledTimes(1);
    document.body.removeChild(container);
  });

  it('enableHistoryBack aktifken history.pushState yapar ve popstate tetiklendiğinde onClose çağırır', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');

    renderHook(() =>
      useAccessibleModal<HTMLDivElement>(true, onCloseMock, { enableHistoryBack: true }),
    );

    expect(pushStateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ modalState: expect.stringContaining('modal_') }),
      '',
      window.location.href,
    );

    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('kullanıcı popstate olmadan kapattığında history.back() ile state temizlenir', () => {
    vi.useFakeTimers();
    const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {});

    const { unmount } = renderHook(() =>
      useAccessibleModal<HTMLDivElement>(true, onCloseMock, { enableHistoryBack: true }),
    );

    unmount();

    expect(backSpy).toHaveBeenCalledTimes(1);
    act(() => vi.runAllTimers());
    vi.useRealTimers();
  });
  it('önceki modalın programatik geri dönüşü yeni modalı kapatmaz', () => {
    vi.spyOn(window.history, 'back').mockImplementation(() => {});
    const first = renderHook(() => useAccessibleModal(true, vi.fn()));
    first.unmount();
    const nextClose = vi.fn();
    const next = renderHook(() => useAccessibleModal(true, nextClose));

    act(() => window.dispatchEvent(new PopStateEvent('popstate')));
    expect(nextClose).not.toHaveBeenCalled();
    act(() => window.dispatchEvent(new PopStateEvent('popstate')));
    expect(nextClose).toHaveBeenCalledTimes(1);
    next.unmount();
  });

});
