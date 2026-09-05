import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LearningOutcomeAnalysisModal } from './LearningOutcomeAnalysisModal';
import type { QuizQuestion } from '@/types/quiz';

describe('LearningOutcomeAnalysisModal', () => {
  const mockQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      quiz_id: 'test-1',
      question: '2^3 ifadesinin değeri kaçtır? (Üslü İfadeler)',
      options: ['6', '8', '9', '12'],
      correct_index: 1,
      explanation: 'Üslü ifadeler konusu',
      question_order: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: 'q2',
      quiz_id: 'test-1',
      question: 'sqrt(16) değeri nedir? (Kareköklü İfadeler)',
      options: ['2', '4', '8', '16'],
      correct_index: 1,
      explanation: 'Kareköklü ifadeler konusu',
      question_order: 2,
      created_at: new Date().toISOString(),
    },
  ];

  it('renders correctly and shows outcome analysis and remediation link', () => {
    const onClose = vi.fn();

    // User answered q1 correctly (index 1), and q2 wrongly (index 0 instead of 1)
    const answers = { 0: 1, 1: 0 };

    render(
      <LearningOutcomeAnalysisModal
        isOpen={true}
        onClose={onClose}
        questions={mockQuestions}
        answers={answers}
        quizTitle="8. Sınıf Matematik Denemesi"
        grade={8}
      />
    );

    expect(screen.getByText('Kazanım & Eksik Analizi')).toBeInTheDocument();
    expect(screen.getByText('%50')).toBeInTheDocument();
    expect(screen.getByText('1 Doğru')).toBeInTheDocument();
    expect(screen.getByText('1 Yanlış')).toBeInTheDocument();

    // Remediation button should exist
    const remediationBtns = screen.getAllByText(/Telafi Yaprak Testini Aç/i);
    expect(remediationBtns.length).toBeGreaterThan(0);

    // Close button
    const closeBtn = screen.getByRole('button', { name: /Tamam/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
