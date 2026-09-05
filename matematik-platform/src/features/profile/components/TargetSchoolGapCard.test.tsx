import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TargetSchoolGapCard from './TargetSchoolGapCard';
import type { SavedExamTrial } from '@/lib/examHistoryStorage';

describe('TargetSchoolGapCard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockLgsTrial: SavedExamTrial = {
    id: 'lgs-trial-1',
    examType: 'lgs',
    title: 'Mart Denemesi',
    date: '2026-03-01',
    score: 470.0,
    mathNet: 16.0,
    totalNet: 82.0,
  };

  const mockHighLgsTrial: SavedExamTrial = {
    id: 'lgs-trial-high',
    examType: 'lgs',
    title: 'Şampiyon Deneme',
    date: '2026-03-05',
    score: 500.0,
    mathNet: 20.0,
    totalNet: 90.0,
  };

  it('renders empty state when no exam trials exist', () => {
    render(<TargetSchoolGapCard isLight={false} initialExamType="lgs" />);
    expect(screen.getByText('Hedef Okul Taban Net Açığı Köprüsü')).toBeInTheDocument();
    expect(screen.getByText('Henüz Kayıtlı LGS Denemen Bulunmuyor')).toBeInTheDocument();
  });

  it('switches between LGS and YKS school lists', () => {
    render(<TargetSchoolGapCard isLight={false} initialExamType="lgs" />);

    // LGS schools default
    expect(screen.getByRole('button', { name: /Galatasaray Lisesi/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ankara Fen Lisesi/ })).toBeInTheDocument();

    // Switch to YKS
    const yksBtn = screen.getByRole('button', { name: 'YKS Üniversiteleri' });
    fireEvent.click(yksBtn);

    expect(screen.getByRole('button', { name: /Tıp Fakültesi/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mühendislik/ })).toBeInTheDocument();
  });

  it('renders net comparison and strategic prescription with customTrial', () => {
    render(
      <TargetSchoolGapCard
        isLight={false}
        customTrial={mockLgsTrial}
      />
    );

    // School and trial summary
    expect(screen.getAllByText('Galatasaray Lisesi')[0]).toBeInTheDocument();
    expect(screen.getByText(/470.0 Puan/)).toBeInTheDocument();

    // Subject gap indicators
    expect(screen.getByText('Matematik Neti')).toBeInTheDocument();
    expect(screen.getByText('Toplam Net')).toBeInTheDocument();
    expect(screen.getAllByText(/Net Açık/)[0]).toBeInTheDocument();

    // Strategic gap text
    expect(screen.getByText(/Hedef Kapatma Stratejisi/)).toBeInTheDocument();
  });

  it('displays goal reached badge when score meets or exceeds baseScore', () => {
    render(
      <TargetSchoolGapCard
        isLight={false}
        customTrial={mockHighLgsTrial}
      />
    );

    expect(screen.getByText(/Hedef Taban Bandındasın/)).toBeInTheDocument();
    expect(screen.getAllByText(/Hedef Üstü/).length).toBeGreaterThan(0);
  });

  it('allows selecting another school to recalculate gaps', () => {
    render(
      <TargetSchoolGapCard
        isLight={false}
        customTrial={mockLgsTrial}
      />
    );

    const ankaraFenBtn = screen.getByRole('button', { name: /Ankara Fen Lisesi/ });
    fireEvent.click(ankaraFenBtn);

    expect(screen.getAllByText(/Ankara Fen Lisesi/)[0]).toBeInTheDocument();
  });

  it('renders properly in light theme mode', () => {
    const { container } = render(
      <TargetSchoolGapCard
        isLight={true}
        customTrial={mockLgsTrial}
      />
    );

    expect(container.querySelector('.bg-white\\/95')).toBeInTheDocument();
  });
});
