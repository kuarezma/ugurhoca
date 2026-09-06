import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SafeLink } from './SafeLink';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('SafeLink', () => {
  it('renders standard anchor element with correct href', () => {
    render(<SafeLink href="/icerikler?grade=5">5. Sınıf</SafeLink>);
    const link = screen.getByRole('link', { name: '5. Sınıf' });
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('/icerikler?grade=5');
    expect(link.tagName).toBe('A');
  });

  it('navigates via router.push on standard left click', () => {
    mockPush.mockClear();
    render(<SafeLink href="/icerikler?grade=8">8. Sınıf</SafeLink>);
    const link = screen.getByRole('link', { name: '8. Sınıf' });
    fireEvent.click(link);
    expect(mockPush).toHaveBeenCalledWith('/icerikler?grade=8');
  });

  it('gezinmeyi startViewTransition ile sarmalamaz', () => {
    // Regresyon: `startViewTransition(() => router.push(href))` çağrısı, router.push
    // asenkron olduğu için DOM değişmeden döner. Tarayıcı bu yüzden aynı görüntünün
    // iki anlık kopyası arasında geçiş yapar; her sekme geçişinde iki tam sayfa
    // rasterleştirme ve geçiş boyunca donan bir arayüz maliyeti doğar.
    mockPush.mockClear();
    const startViewTransition = vi.fn((callback: () => void) => callback());
    (
      document as unknown as { startViewTransition?: (cb: () => void) => void }
    ).startViewTransition = startViewTransition;

    try {
      render(<SafeLink href="/testler">Testler</SafeLink>);
      fireEvent.click(screen.getByRole('link', { name: 'Testler' }));

      expect(startViewTransition).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/testler');
    } finally {
      delete (
        document as unknown as { startViewTransition?: (cb: () => void) => void }
      ).startViewTransition;
    }
  });

  it('does not prevent default on meta key (cmd+click)', () => {
    mockPush.mockClear();
    render(<SafeLink href="/icerikler">İçerikler</SafeLink>);
    const link = screen.getByRole('link', { name: 'İçerikler' });
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, metaKey: true });
    link.dispatchEvent(event);
    expect(mockPush).not.toHaveBeenCalled();
  });
});
