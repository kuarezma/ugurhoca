import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuizPacingCoach, formatDuration } from './QuizPacingCoach';
import type { QuizQuestion } from '@/types/quiz';

describe('QuizPacingCoach', () => {
  it('formats duration properly', () => {
    expect(formatDuration(45)).toBe('45 sn');
    expect(formatDuration(120)).toBe('2 dk');
    expect(formatDuration(150)).toBe('2 dk 30 sn');
  });

  it('renders live mode with normal pace', () => {
    render(
      <QuizPacingCoach
        mode="live"
        questionElapsedSeconds={40}
        recommendedSecondsPerQuestion={120}
      />
    );

    expect(screen.getByText('40 sn')).toBeInTheDocument();
    expect(screen.getByText(/Normal Tempo/i)).toBeInTheDocument();
  });

  it('renders live mode with danger pace and offers flag button', () => {
    const onFlag = vi.fn();
    render(
      <QuizPacingCoach
        mode="live"
        questionElapsedSeconds={160}
        recommendedSecondsPerQuestion={120}
        onFlagCurrentQuestion={onFlag}
      />
    );

    expect(screen.getByText(/Turlama Önerisi!/i)).toBeInTheDocument();
    const flagBtn = screen.getByRole('button', { name: /Bayrakla & Geç/i });
    expect(flagBtn).toBeInTheDocument();
    fireEvent.click(flagBtn);
    expect(onFlag).toHaveBeenCalledTimes(1);
  });

  it('renders summary mode with pacing breakdown and advice', () => {
    const mockQuestions: QuizQuestion[] = [
      { id: '1', quiz_id: 'q1', question: 'Q1', options: ['A', 'B'], correct_index: 0, question_order: 1, explanation: null, created_at: '' },
      { id: '2', quiz_id: 'q1', question: 'Q2', options: ['A', 'B'], correct_index: 1, question_order: 2, explanation: null, created_at: '' },
      { id: '3', quiz_id: 'q1', question: 'Q3', options: ['A', 'B'], correct_index: 0, question_order: 3, explanation: null, created_at: '' },
    ];

    render(
      <QuizPacingCoach
        mode="summary"
        questions={mockQuestions}
        questionTimes={{ 0: 45, 1: 150, 2: 70 }}
        answers={{ 0: 0, 1: 0, 2: 0 }}
        totalSecondsSpent={265}
      />
    );

    expect(screen.getByText(/Sınav Tempo Koçu & Soru Süre Analizi/i)).toBeInTheDocument();
    expect(screen.getByText(/Hızlı Çözülen/i)).toBeInTheDocument();
    expect(screen.getByText(/İdeal Dengeli/i)).toBeInTheDocument();
    expect(screen.getByText(/Süresi Uzayan/i)).toBeInTheDocument();
    expect(screen.getByText(/En Çok Vakit Harcanan Sorular:/i)).toBeInTheDocument();
  });
});
