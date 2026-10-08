import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HomeHeroSection } from './HomeHeroSection';

describe('HomeHeroSection', () => {
  const defaultProps = {
    user: null,
    onOpenFlashcards: vi.fn(),
    onOpenScratchpad: vi.fn(),
    onOpenCalculator: vi.fn(),
    onOpenPomodoro: vi.fn(),
    onOpenCheatSheet: vi.fn(),
  };

  it('renders Yaprak Testler, Oyunlar Dünyası, Sınıf Kartları ve Pratik Araçlar', () => {
    render(<HomeHeroSection {...defaultProps} />);

    // 1. En üstteki iki süper aksiyon kartı
    expect(screen.getByText('Yaprak Testler & İçerikler')).toBeInTheDocument();
    expect(screen.getByText('Matematik Oyunları Dünyası')).toBeInTheDocument();

    const testLink = screen.getByRole('link', { name: /Yaprak Testler ve Ders İçerikleri/i });
    expect(testLink).toHaveAttribute('href', '/icerikler?type=yaprak-test');

    const gamesLink = screen.getByRole('link', { name: /Matematik Oyunları Dünyası/i });
    expect(gamesLink).toHaveAttribute('href', '/oyunlar');

    // 2. 5, 6, 7 ve 8. Sınıf kartları
    expect(screen.getByText('5. Sınıf Matematik')).toBeInTheDocument();
    expect(screen.getByText('6. Sınıf Matematik')).toBeInTheDocument();
    expect(screen.getByText('7. Sınıf Matematik')).toBeInTheDocument();
    expect(screen.getByText('8. Sınıf (LGS)')).toBeInTheDocument();

    // 3. Popüler Oyunlar
    expect(screen.getByText('Çarpım Yarışı')).toBeInTheDocument();
    expect(screen.getByText('Kesir Pizzacısı')).toBeInTheDocument();
    expect(screen.getByText('Matematik Düellosu')).toBeInTheDocument();
    expect(screen.getByText('Balon Patlatma')).toBeInTheDocument();

    // 4. Pratik Araçlar
    expect(screen.getByText('LGS Puan & Net Hesaplama')).toBeInTheDocument();
    expect(screen.getByText('Odak Pomodoro Sayacı')).toBeInTheDocument();
    expect(screen.getByText('Karalama & İşlem Tahtası')).toBeInTheDocument();
  });

  it('triggers tool modals when tool buttons are clicked', () => {
    render(<HomeHeroSection {...defaultProps} />);

    // LGS Puan Hesaplama
    const lgsBtn = screen.getByText('LGS Puan & Net Hesaplama');
    fireEvent.click(lgsBtn);
    expect(defaultProps.onOpenCalculator).toHaveBeenCalledWith('lgs');

    // Odak Pomodoro Sayacı
    const pomodoroBtn = screen.getByText('Odak Pomodoro Sayacı');
    fireEvent.click(pomodoroBtn);
    expect(defaultProps.onOpenPomodoro).toHaveBeenCalled();

    // Karalama Tahtası
    const scratchpadBtn = screen.getByText('Karalama & İşlem Tahtası');
    fireEvent.click(scratchpadBtn);
    expect(defaultProps.onOpenScratchpad).toHaveBeenCalled();
  });
});
