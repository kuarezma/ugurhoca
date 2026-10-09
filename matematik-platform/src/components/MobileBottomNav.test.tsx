import { describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
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
  it('renders all 5 navigation items including Testler and Odak', () => {
    currentPath = '/';
    render(<MobileBottomNav />);

    expect(screen.getByText('Ana Sayfa')).toBeInTheDocument();
    expect(screen.getByText('Testler')).toBeInTheDocument();
    expect(screen.getByText('Odak')).toBeInTheDocument();
    expect(screen.getByText('Oyunlar')).toBeInTheDocument();
    expect(screen.getByText('Profil')).toBeInTheDocument();

    const testlerLink = screen.getByRole('link', { name: /Testler/i });
    expect(testlerLink).toHaveAttribute('href', '/testler');

    const odakLink = screen.getByRole('link', { name: /Odak/i });
    expect(odakLink).toHaveAttribute('href', '/odak-pomodoro');
  });

  it('sets active state on /odak-pomodoro', () => {
    currentPath = '/odak-pomodoro';
    render(<MobileBottomNav />);

    const odakLink = screen.getByRole('link', { name: /Odak/i });
    expect(odakLink).toHaveAttribute('aria-current', 'page');
  });

  it('hides in live lesson classroom', () => {
    currentPath = '/canli-ders/d/room-123';
    expect(renderToString(<MobileBottomNav />)).toBe('');
    const { container } = render(<MobileBottomNav />);
    expect(container.firstChild).toBeNull();
  });
});
