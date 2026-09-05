import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExamCountdown } from './ExamCountdown';
import type { FeaturedExam } from '@/lib/examDates';

describe('ExamCountdown', () => {
  const mockExam: FeaturedExam = {
    id: 'lgs-2026',
    title: "LGS'ye Kalan Süre",
    provider: 'MEB',
    targetDate: '2026-06-13T09:30:00+03:00',
    dateLabel: '13 Haziran 2026',
    accent: 'from-cyan-500 to-indigo-500',
    featured: true,
    category: 'central',
    toolHref: '/programlar/lgs',
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('renders countdown details and highlights target grade exam', () => {
    render(
      <ExamCountdown
        exam={mockExam}
        isLight={false}
        userGrade={8}
      />,
    );

    expect(screen.getByText("LGS'ye Kalan Süre")).toBeInTheDocument();
    expect(screen.getByText('MEB')).toBeInTheDocument();
    expect(screen.getByText('🎯 Hedef Kademem')).toBeInTheDocument();
  });

  it('allows opening target net editor and selecting a target', () => {
    render(
      <ExamCountdown
        exam={mockExam}
        isLight={false}
        userGrade={8}
      />,
    );

    expect(screen.getByText('Belirlenmedi')).toBeInTheDocument();

    const setTargetBtn = screen.getByRole('button', { name: /Hedef Belirle/i });
    fireEvent.click(setTargetBtn);

    const option18 = screen.getByRole('button', { name: '18' });
    fireEvent.click(option18);

    expect(screen.getByText('18 / 20 Net')).toBeInTheDocument();
    expect(localStorage.getItem('ugurhoca_exam_target_lgs-2026')).toBe('18');
  });

  it('triggers onOpenCalculator callback when button is clicked', () => {
    const onOpenCalculator = vi.fn();
    render(
      <ExamCountdown
        exam={mockExam}
        isLight={true}
        onOpenCalculator={onOpenCalculator}
      />,
    );

    const calcBtn = screen.getByRole('button', { name: /Net & Puan Hesapla/i });
    fireEvent.click(calcBtn);

    expect(onOpenCalculator).toHaveBeenCalledWith('lgs');
  });
});
