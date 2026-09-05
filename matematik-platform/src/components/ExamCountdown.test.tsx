import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ExamCountdown } from './ExamCountdown';
import type { FeaturedExam } from '@/lib/examDates';
import { saveExamTrial } from '@/lib/examHistoryStorage';

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

  it('allows selecting a mock exam trials target and saves to localStorage', () => {
    render(
      <ExamCountdown
        exam={mockExam}
        isLight={false}
        userGrade={8}
      />,
    );

    expect(screen.getByText('0 / 15 Deneme')).toBeInTheDocument();

    const setTrialsTargetBtn = screen.getByRole('button', { name: /Deneme Hedefi Seç/i });
    fireEvent.click(setTrialsTargetBtn);

    const option20 = screen.getByRole('button', { name: '20 Deneme' });
    fireEvent.click(option20);

    expect(screen.getByText('0 / 20 Deneme')).toBeInTheDocument();
    expect(localStorage.getItem('ugurhoca_exam_trials_target_lgs')).toBe('20');
  });

  it('reflects saved mock exam trials and responds to trials updated event', () => {
    saveExamTrial({
      examType: 'lgs',
      title: '1. Özdebir Denemesi',
      score: 440,
      mathNet: 17.67,
      totalNet: 82,
    });

    render(
      <ExamCountdown
        exam={mockExam}
        isLight={true}
      />,
    );

    expect(screen.getByText('1 / 15 Deneme')).toBeInTheDocument();

    act(() => {
      saveExamTrial({
        examType: 'lgs',
        title: '2. Töder Denemesi',
        score: 460,
        mathNet: 19,
        totalNet: 86,
      });
    });

    expect(screen.getByText('2 / 15 Deneme')).toBeInTheDocument();
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
