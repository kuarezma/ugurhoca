import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FocusPomodoroModal } from './FocusPomodoroModal';

describe('FocusPomodoroModal', () => {
  it('renders 25 min focus mode by default and switches modes', () => {
    const onClose = vi.fn();
    render(<FocusPomodoroModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText('Matematik Odak Sayacı ⏱️')).toBeInTheDocument();
    expect(screen.getByText('25:00')).toBeInTheDocument();

    // 50 Dk moduna geçiş
    const focus50Btn = screen.getByRole('button', { name: /50 Dk Derin Odak/i });
    fireEvent.click(focus50Btn);
    expect(screen.getByText('50:00')).toBeInTheDocument();

    // Mola moduna geçiş
    const break5Btn = screen.getByRole('button', { name: /5 Dk Kısa Mola/i });
    fireEvent.click(break5Btn);
    expect(screen.getByText('Mola Zamanı ☕')).toBeInTheDocument();
    expect(screen.getByText('05:00')).toBeInTheDocument();

    // Kapat butonu
    const closeBtn = screen.getByRole('button', { name: 'Kapat' });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('updates document.title when timer starts and restores it on pause', () => {
    document.title = 'Uğur Hoca Matematik';
    render(<FocusPomodoroModal isOpen={true} onClose={vi.fn()} />);

    const startBtn = screen.getByRole('button', { name: /Başlat/i });
    fireEvent.click(startBtn);

    expect(document.title).toContain('🍅 25:00 - Odak | Uğur Hoca');

    const pauseBtn = screen.getByRole('button', { name: /Duraklat/i });
    fireEvent.click(pauseBtn);

    expect(document.title).toBe('Uğur Hoca Matematik');
  });

  it('toggles global sound mute when sound button is clicked', () => {
    localStorage.clear();
    render(<FocusPomodoroModal isOpen={true} onClose={vi.fn()} />);

    const soundBtn = screen.getByRole('button', { name: /Sesi Kapat/i });
    fireEvent.click(soundBtn);

    expect(localStorage.getItem('ugurhoca:sound_muted')).toBe('true');
  });

  it('renders ambient focus noise options and allows selecting noise modes', () => {
    render(<FocusPomodoroModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('Arka Plan Ambiyans Sesi')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kahverengi Gürültü/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pembe Gürültü/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /432 Hz Zihin Akordu/i })).toBeInTheDocument();

    // Kahverengi gürültü seç
    const brownBtn = screen.getByRole('button', { name: /Kahverengi Gürültü/i });
    fireEvent.click(brownBtn);

    expect(screen.getByText('Sayaç başladığında çalar')).toBeInTheDocument();
  });
});
