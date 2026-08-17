import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuizMistakeReviewModal } from './QuizMistakeReviewModal';
import type { QuizQuestion } from '@/types/quiz';

const mockQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    quiz_id: 'quiz1',
    question: '2 + 2 = ?',
    options: ['3', '4', '5', '6'],
    correct_index: 1,
    question_order: 1,
    explanation: '2 ile 2 toplanınca 4 eder.',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'q2',
    quiz_id: 'quiz1',
    question: '3 * 3 = ?',
    options: ['6', '7', '8', '9'],
    correct_index: 3,
    question_order: 2,
    explanation: '3 kere 3 dokuzdur.',
    created_at: '2026-01-01T00:00:00Z',
  },
];

describe('QuizMistakeReviewModal', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <QuizMistakeReviewModal
        isOpen={false}
        onClose={vi.fn()}
        questions={mockQuestions}
        answers={{ 0: 1, 1: 3 }}
        onStartRetakeMistakes={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders mistake review when questions are answered incorrectly', () => {
    const onStartRetakeMistakes = vi.fn();
    const onClose = vi.fn();

    render(
      <QuizMistakeReviewModal
        isOpen={true}
        onClose={onClose}
        questions={mockQuestions}
        answers={{ 0: 1, 1: 0 }} // Question 1 correct, Question 2 incorrect (0 instead of 3)
        onStartRetakeMistakes={onStartRetakeMistakes}
      />,
    );

    expect(screen.getByText('Hata Defteri & Tekrar Havuzu')).toBeInTheDocument();
    expect(screen.getByText('3 * 3 = ?')).toBeInTheDocument();

    const retakeBtn = screen.getByRole('button', {
      name: /Sadece Bu 1 Yanlışı Tekrar Çöz/i,
    });
    fireEvent.click(retakeBtn);
    expect(onStartRetakeMistakes).toHaveBeenCalledWith([mockQuestions[1]]);
    expect(onClose).toHaveBeenCalled();
  });
});
