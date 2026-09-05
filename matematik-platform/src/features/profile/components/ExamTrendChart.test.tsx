import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExamTrendChart from './ExamTrendChart';
import type { SavedExamTrial } from '@/lib/examHistoryStorage';

describe('ExamTrendChart', () => {
  const mockTrials: SavedExamTrial[] = [
    {
      id: 'trial-1',
      examType: 'yks',
      title: 'Deneme 1',
      date: '2026-02-10',
      score: 350.5,
      mathNet: 22.5,
      totalNet: 65.0,
    },
    {
      id: 'trial-2',
      examType: 'yks',
      title: 'Deneme 2',
      date: '2026-02-24',
      score: 382.0,
      mathNet: 27.0,
      totalNet: 72.5,
    },
    {
      id: 'trial-3',
      examType: 'yks',
      title: 'Deneme 3',
      date: '2026-03-05',
      score: 410.0,
      mathNet: 31.5,
      totalNet: 80.0,
    },
  ];

  it('renders empty/insufficient state when fewer than 2 trials exist', () => {
    render(<ExamTrendChart trials={[]} isLight={false} />);
    expect(screen.getByText('Henüz Kayıtlı Deneme Sınavı Yok')).toBeInTheDocument();

    render(<ExamTrendChart trials={[mockTrials[0]]} isLight={false} />);
    expect(screen.getByText('Net Eğrisi İçin En Az 2 Deneme Gerekiyor')).toBeInTheDocument();
  });

  it('renders SVG polylines, stats and legend when 2+ trials exist', () => {
    render(
      <ExamTrendChart
        trials={mockTrials}
        targetNet={35}
        isLight={false}
      />
    );

    expect(screen.getByText('Deneme Sınavı Net Gelişim Çizelgesi')).toBeInTheDocument();
    expect(screen.getByText('3 Deneme')).toBeInTheDocument();

    // Stats
    expect(screen.getByText('Son Mat Neti')).toBeInTheDocument();
    expect(screen.getAllByText('31.5')[0]).toBeInTheDocument();
    expect(screen.getByText('Zirve Mat Neti')).toBeInTheDocument();
    expect(screen.getByText('Son Toplam Net')).toBeInTheDocument();
    expect(screen.getAllByText('80')[0]).toBeInTheDocument();

    // View filter buttons
    expect(screen.getByRole('button', { name: 'Tümü' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Matematik' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Toplam Net' })).toBeInTheDocument();

    // Target label in SVG
    expect(screen.getByText('Hedef: 35 Net')).toBeInTheDocument();
  });

  it('toggles view mode between all, math, and total', () => {
    render(<ExamTrendChart trials={mockTrials} isLight={false} />);

    const mathBtn = screen.getByRole('button', { name: 'Matematik' });
    fireEvent.click(mathBtn);
    expect(mathBtn).toHaveClass('bg-emerald-600');

    const totalBtn = screen.getByRole('button', { name: 'Toplam Net' });
    fireEvent.click(totalBtn);
    expect(totalBtn).toHaveClass('bg-purple-600');
  });

  it('updates selected trial on point interaction', () => {
    render(<ExamTrendChart trials={mockTrials} isLight={false} />);

    // Last trial active by default
    expect(screen.getByText('Deneme 3')).toBeInTheDocument();
  });
});
