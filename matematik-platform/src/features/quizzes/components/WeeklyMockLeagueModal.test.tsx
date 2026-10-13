import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeeklyMockLeagueModal, type LeagueParticipant } from './WeeklyMockLeagueModal';

describe('WeeklyMockLeagueModal Component', () => {
  it('renders honest empty state when participants list is empty by default', () => {
    const onClose = vi.fn();
    render(<WeeklyMockLeagueModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText('Haftalık LGS Deneme Ligi')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Bu hafta için henüz lig sıralaması oluşmadı. Deneme sınavını tamamlayarak sıralamaya katılabilirsin!',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sınava Başla/i })).toBeInTheDocument();
    expect(screen.queryByText('148 Öğrenci')).toBeNull();
    expect(screen.queryByText('14.22 Net')).toBeNull();
  });

  it('renders participants and calculated stats when participants are provided', () => {
    const sampleParticipants: LeagueParticipant[] = [
      {
        rank: 1,
        alias: 'ArfMatematik 👑',
        avatarBg: 'bg-amber-500',
        correct: 20,
        wrong: 0,
        empty: 0,
        netScore: 20.0,
      },
      {
        rank: 2,
        alias: 'Sen (Öğrenci) 🎯',
        avatarBg: 'bg-emerald-500',
        correct: 16,
        wrong: 3,
        empty: 1,
        netScore: 15.0,
        isSelf: true,
      },
    ];

    render(
      <WeeklyMockLeagueModal
        isOpen={true}
        onClose={vi.fn()}
        participants={sampleParticipants}
      />,
    );

    expect(screen.getByText('2 Öğrenci')).toBeInTheDocument();
    expect(screen.getByText('17.50 Net')).toBeInTheDocument();
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
