import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MistakeNotebookModal } from './MistakeNotebookModal';
import { saveMistakesToBank } from '@/features/quizzes/lib/mistakeStorage';

describe('MistakeNotebookModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders empty state when no mistakes exist', () => {
    const onClose = vi.fn();
    render(<MistakeNotebookModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText(/Akıllı Hata Defterim/i)).toBeInTheDocument();
    expect(screen.getByText(/Tekrar bekleyen hiç yanlış soru yok/i)).toBeInTheDocument();
  });

  it('renders saved mistakes and calls retake quiz callback', () => {
    saveMistakesToBank(
      [
        {
          id: 'q-2',
          quiz_id: 'quiz-1',
          question_order: 1,
          question: '3x = 12 ise x kaçtır?',
          options: ['2', '3', '4', '5'],
          correct_index: 2,
          explanation: 'x = 4',
          created_at: '2026-01-01T00:00:00Z',
        },
      ],
      'Denklem Testi',
    );

    const onClose = vi.fn();
    const onStartRetakeQuiz = vi.fn();

    render(
      <MistakeNotebookModal
        isOpen={true}
        onClose={onClose}
        onStartRetakeQuiz={onStartRetakeQuiz}
      />,
    );

    expect(screen.getByText(/3x = 12/i)).toBeInTheDocument();

    const retakeBtn = screen.getByRole('button', { name: /Hatalarımdan Test Çöz/i });
    fireEvent.click(retakeBtn);

    expect(onStartRetakeQuiz).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
