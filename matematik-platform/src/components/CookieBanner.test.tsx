import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CookieBanner from './CookieBanner';

const storageKey = 'ugurhoca:cookie-consent';

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('CookieBanner', () => {
  it.each([
    ['Tümünü kabul et', 'accepted'],
    ['Sadece zorunlu', 'rejected'],
    ['Çerez bildirimini kapat', 'rejected'],
  ])(
    'persists %s and keeps the banner until its exit animation finishes',
    (button, consent) => {
      render(<CookieBanner />);
      act(() => {
        vi.advanceTimersByTime(1199);
      });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(1);
      });
      const dialog = screen.getByRole('dialog');
      fireEvent.click(screen.getByRole('button', { name: button }));
      expect(localStorage.getItem(storageKey)).toBe(consent);
      expect(dialog).toBeInTheDocument();
      fireEvent.animationEnd(dialog.querySelector('button')!);
      expect(dialog).toBeInTheDocument();
      fireEvent.animationEnd(dialog);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    },
  );

  it.each(['accepted', 'rejected'])(
    'does not show for stored %s consent',
    (consent) => {
      localStorage.setItem(storageKey, consent);
      render(<CookieBanner />);
      act(() => {
        vi.advanceTimersByTime(1200);
      });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    },
  );

  it('still closes when storage is disabled', () => {
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('disabled');
    });
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('disabled');
    });
    render(<CookieBanner />);
    const dialog = screen.getByRole('dialog');
    fireEvent.click(screen.getByRole('button', { name: 'Sadece zorunlu' }));
    fireEvent.animationEnd(dialog);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('cancels its delayed entry on unmount', () => {
    const { unmount } = render(<CookieBanner />);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
