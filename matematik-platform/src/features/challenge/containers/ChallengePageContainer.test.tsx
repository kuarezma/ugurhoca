import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChallengePageContainer } from './ChallengePageContainer';

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: ComponentPropsWithoutRef<'div'>) => (
      <div {...props}>{children}</div>
    ),
    button: ({ children, ...props }: ComponentPropsWithoutRef<'button'>) => (
      <button {...props}>{children}</button>
    ),
  },
}));

vi.mock('@/components/Mascot', () => ({
  Mascot: () => <div data-testid="mascot">Pi</div>,
}));

vi.mock('@/components/ThemeProvider', () => ({
  useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/meydan-okuma',
}));

vi.mock('@/lib/auth-client', () => ({
  getCurrentUserProfile: vi.fn().mockResolvedValue(null),
  signOutClient: vi.fn().mockResolvedValue(undefined),
}));

describe('ChallengePageContainer', () => {
  it('renders Meydan Okuma page with all 4 challenge sections', () => {
    render(<ChallengePageContainer />);

    // Başlık ve geri dön bağlantısı
    expect(screen.getByText('Meydan Okuma Alanı')).toBeInTheDocument();
    expect(screen.getByText('Ana Sayfaya Dön')).toBeInTheDocument();

    // Hızlı çapa linkleri
    expect(screen.getByText('⚡ Günün Sorusu')).toBeInTheDocument();
    expect(screen.getByText('🎯 Soru Hedefim')).toBeInTheDocument();
    expect(screen.getByText('💡 LGS Taktikleri')).toBeInTheDocument();
    expect(screen.getByText('🗺️ Yol Haritası')).toBeInTheDocument();

    // 4 Ana Bölüm
    expect(screen.getByText('Günün Matematik Meydan Okuması')).toBeInTheDocument();
    expect(screen.getByText('LGS Matematik Taktik Köşesi')).toBeInTheDocument();
    expect(screen.getByText('Yeni nesil sorularda hız ve net kazandıran stratejiler')).toBeInTheDocument();
    expect(screen.getByText(/Başarı Yol Haritası/i)).toBeInTheDocument();
  });

  it('renders anchor links with correct href attributes', () => {
    render(<ChallengePageContainer />);

    expect(screen.getByRole('link', { name: /⚡ Günün Sorusu/i })).toHaveAttribute('href', '#gunun-sorusu');
    expect(screen.getByRole('link', { name: /🎯 Soru Hedefim/i })).toHaveAttribute('href', '#soru-hedefi');
    expect(screen.getByRole('link', { name: /💡 LGS Taktikleri/i })).toHaveAttribute('href', '#lgs-taktikleri');
    expect(screen.getByRole('link', { name: /🗺️ Yol Haritası/i })).toHaveAttribute('href', '#yol-haritasi');
  });
});
