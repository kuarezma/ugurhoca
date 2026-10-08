import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { HomeHeroSection } from './HomeHeroSection';

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  LazyMotion: ({ children }: { children: ReactNode }) => <>{children}</>,
  m: {
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

  it('renders Yaprak Test and Oyunlar cards, expandable Ders and Araçlar hubs', () => {
    render(<HomeHeroSection {...defaultProps} />);

    // Hero içinde iki ana kart; diğer bağlantılar aşağıdaki ayrı bölümde.
    expect(
      within(screen.getByRole('link', { name: 'Yaprak Testler' })).getByRole('heading', {
        name: 'Yaprak Test',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Oyunlar')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Yaprak Testler' }),
    ).toHaveAttribute('href', '/icerikler?type=yaprak-test');
    expect(
      screen.getByRole('link', { name: 'Matematik Oyunları' }),
    ).toHaveAttribute('href', '/oyunlar');
    expect(
      screen.queryByRole('link', { name: 'Canlı Dersler' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Meydan Okuma' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('mascot')).not.toBeInTheDocument();
    expect(screen.queryByText(/Macerayı Gör/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\(LGS\)/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\(YKS\)/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '8. Sınıf' })).toHaveAttribute(
      'href',
      '/icerikler?grade=8',
    );
    expect(screen.getByText('Matematiğe hoş geldin!')).toBeInTheDocument();

    // Ders kategori kartı ve içindeki 6 ders materyali
    expect(screen.getByText('Ders')).toBeInTheDocument();
    expect(screen.getByText('6 KATEGORİ')).toBeInTheDocument();
    expect(screen.getByText('Kitaplar')).toBeInTheDocument();
    expect(screen.getByText('Kazanımlara göre yaprak testler')).toBeInTheDocument();
    expect(screen.getByText('Ders Videoları')).toBeInTheDocument();
    expect(screen.getByText('Deneme-Sınav')).toBeInTheDocument();
    expect(screen.getByText('Çıkış Bileti')).toBeInTheDocument();
    expect(screen.getByText('Programlar')).toBeInTheDocument();

    // Araçlar kategori kartı
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

    // Araçlar başlığına tıklandığında kapanabilmeli
    const toolsButton = screen.getByRole('button', {
      name: /Araçlar 12 ARAÇ/i,
    });
    fireEvent.click(toolsButton);
    expect(
      screen.queryByText('LGS Puan & Net Hesaplama'),
    ).not.toBeInTheDocument();

    // Ders başlığına tıklandığında kapanabilmeli
    const lessonsButton = screen.getByRole('button', {
      name: /Ders 6 KATEGORİ/i,
    });
    fireEvent.click(lessonsButton);
    expect(screen.queryByText('Kitaplar')).not.toBeInTheDocument();
  });
});
