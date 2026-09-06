import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HomeHeroSection } from './HomeHeroSection';

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

describe('HomeHeroSection', () => {
  const defaultProps = {
    isLight: false,
    user: null,
    onOpenFlashcards: vi.fn(),
    onOpenScratchpad: vi.fn(),
    onOpenCalculator: vi.fn(),
    onOpenPomodoro: vi.fn(),
    onOpenGraph: vi.fn(),
    onOpenProofs: vi.fn(),
    onOpenCheatSheet: vi.fn(),
    onOpenGlossary: vi.fn(),
    onOpenTopicWeights: vi.fn(),
    onOpenWeeklyPlanner: vi.fn(),
    onOpenSpeedDrill: vi.fn(),
  };

  it('renders quick access categories and the expandable Araçlar category card', () => {
    render(<HomeHeroSection {...defaultProps} />);

    expect(screen.getByText('Hızlı erişim')).toBeInTheDocument();
    expect(screen.getByText('Yaprak Test')).toBeInTheDocument();
    expect(screen.getByText('Araçlar')).toBeInTheDocument();
    expect(screen.getByText('12 ARAÇ')).toBeInTheDocument();
    expect(
      screen.getByText(/Puan\/net hesaplayıcı, Pomodoro, tahta/i),
    ).toBeInTheDocument();
  });

  it('renders 12 tools open by default and triggers tool modal on tool click', () => {
    render(<HomeHeroSection {...defaultProps} />);

    // Kullanıcı isteğiyle araçlar varsayılan olarak hep açık gelir
    expect(screen.getByText('LGS Puan & Net Hesaplama')).toBeInTheDocument();
    expect(
      screen.getByText('YKS (TYT-AYT) Puan Hesaplama'),
    ).toBeInTheDocument();
    expect(screen.getByText('Odak Pomodoro Sayacı')).toBeInTheDocument();
    expect(screen.getByText('Karalama & İşlem Tahtası')).toBeInTheDocument();
    expect(screen.getByText('Formül & Bilgi Kartları')).toBeInTheDocument();
    expect(
      screen.getByText('Pratik Formül & Kural Tablosu'),
    ).toBeInTheDocument();
    expect(screen.getByText('Fonksiyon & Grafik Çizici')).toBeInTheDocument();
    expect(screen.getByText('Görsel Matematik İspatları')).toBeInTheDocument();
    expect(screen.getByText('Matematik Kavramlar Sözlüğü')).toBeInTheDocument();
    expect(screen.getByText('Konu Soru Dağılım Matrisi')).toBeInTheDocument();
    expect(
      screen.getByText('Haftalık Çalışma & Hedef Planı'),
    ).toBeInTheDocument();

    // Bir araca tıkla
    const lgsCalcBtn = screen.getByText('LGS Puan & Net Hesaplama');
    fireEvent.click(lgsCalcBtn);
    expect(defaultProps.onOpenCalculator).toHaveBeenCalledWith('lgs');

    // Başlığa tıklandığında kapanabilmeli
    const toolsButton = screen.getByRole('button', { name: /Araçlar 12 ARAÇ/i });
    fireEvent.click(toolsButton);
    expect(
      screen.queryByText('LGS Puan & Net Hesaplama'),
    ).not.toBeInTheDocument();
  });
});
