import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { MobileBottomNav } from './MobileBottomNav';

let currentPath = '/';

vi.mock('next/navigation', () => ({
  usePathname: () => currentPath,
}));

describe('MobileBottomNav', () => {
  it('kaynak ve tarayıcı yolları farklı olsa da ilk HTML eşleşir', async () => {
    currentPath = '/index';
    const serverHtml = renderToString(<MobileBottomNav />);
    currentPath = '/';
    expect(renderToString(<MobileBottomNav />)).toBe(serverHtml);
    const container = document.createElement('div');
    container.innerHTML = serverHtml;
    const recoverableError = vi.fn();
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(container, <MobileBottomNav />, {
          onRecoverableError: recoverableError,
        });
      });
      expect(recoverableError).not.toHaveBeenCalled();
      expect(container.querySelector('a[href="/"]')).toHaveAttribute(
        'aria-current',
        'page',
      );
    } finally {
      await act(async () => root?.unmount());
    }
  });
  it('renders all 5 navigation items including İçerikler and Testler', () => {
    currentPath = '/';
    render(<MobileBottomNav />);

    expect(screen.getByText('Ana Sayfa')).toBeInTheDocument();
    expect(screen.getByText('İçerikler')).toBeInTheDocument();
    expect(screen.getByText('Testler')).toBeInTheDocument();
    expect(screen.getByText('Oyunlar')).toBeInTheDocument();
    expect(screen.getByText('Profil')).toBeInTheDocument();

    const iceriklerLink = screen.getByRole('link', { name: /İçerikler/i });
    expect(iceriklerLink).toHaveAttribute('href', '/icerikler');

    const testlerLink = screen.getByRole('link', { name: /Testler/i });
    expect(testlerLink).toHaveAttribute('href', '/testler');
  });

  it('sets active state on /icerikler', () => {
    currentPath = '/icerikler';
    render(<MobileBottomNav />);

    const iceriklerLink = screen.getByRole('link', { name: /İçerikler/i });
    expect(iceriklerLink).toHaveAttribute('aria-current', 'page');
  });

  it('opens support from the navigation without covering the page with a floating trigger', () => {
    currentPath = '/araclar/lgs-puan-hesaplama';
    const listener = vi.fn();
    window.addEventListener('open-chat-bubble', listener);
    try {
      render(<MobileBottomNav />);
      fireEvent.click(screen.getByRole('button', { name: "Uğur Hoca'ya yaz" }));
      expect(listener).toHaveBeenCalledOnce();
      act(() => {
        window.dispatchEvent(
          new CustomEvent('ugurhoca:chat-state', {
            detail: { unreadCount: 3, open: true },
          }),
        );
      });
      expect(
        screen.getByRole('button', {
          name: "Uğur Hoca'ya yaz, 3 okunmamış mesaj",
        }),
      ).toBeInTheDocument();
    } finally {
      window.removeEventListener('open-chat-bubble', listener);
    }
  });

  it.each(['/canli-ders/d/room-123', '/admin', '/giris', '/kayit'])(
    'hides on %s',
    (hiddenPath) => {
      currentPath = hiddenPath;
      expect(renderToString(<MobileBottomNav />)).toBe('');
      const { container } = render(<MobileBottomNav />);
      expect(container.firstChild).toBeNull();
    },
  );
});
