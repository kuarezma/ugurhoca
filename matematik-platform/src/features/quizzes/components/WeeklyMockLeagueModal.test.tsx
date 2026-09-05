import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeeklyMockLeagueModal } from './WeeklyMockLeagueModal';

describe('WeeklyMockLeagueModal Component', () => {
  it('renders modal with title, participants, and stats', () => {
    const onClose = vi.fn();
    render(<WeeklyMockLeagueModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText('Haftalık LGS Deneme Ligi')).toBeInTheDocument();
    expect(screen.getByText('148 Öğrenci')).toBeInTheDocument();
    expect(screen.getByText('ArfMatematik 👑')).toBeInTheDocument();
    expect(screen.getByText('Sen (Öğrenci) 🎯')).toBeInTheDocument();
  });

  it('switches to question and difficulty analysis tab', () => {
    render(<WeeklyMockLeagueModal isOpen={true} onClose={vi.fn()} />);

    const analysisTab = screen.getByRole('button', { name: /Soru & Zorluk Analizi/i });
    fireEvent.click(analysisTab);

    expect(screen.getByText('Deneme Zorluk Dağılımı')).toBeInTheDocument();
    expect(screen.getByText(/Kolay Sorular/i)).toBeInTheDocument();
    expect(screen.getByText(/Seçici \/ Zor Sorular/i)).toBeInTheDocument();
  });

  it('calls onStartExam when Denemeye Başla button is clicked', () => {
    const onStart = vi.fn();
    const onClose = vi.fn();
    render(
      <WeeklyMockLeagueModal
        isOpen={true}
        onClose={onClose}
        onStartExam={onStart}
      />,
    );

    const startBtn = screen.getByRole('button', { name: /Denemeye Başla/i });
    fireEvent.click(startBtn);

    expect(onStart).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
