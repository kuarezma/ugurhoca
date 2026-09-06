import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MobileBottomNav } from './MobileBottomNav';

let currentPath = '/';

vi.mock('next/navigation', () => ({
  usePathname: () => currentPath,
}));

describe('MobileBottomNav', () => {
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
    const { container } = render(<MobileBottomNav />);
    expect(container.firstChild).toBeNull();
  });
});
