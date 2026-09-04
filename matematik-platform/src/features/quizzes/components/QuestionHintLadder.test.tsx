import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionHintLadder } from './QuestionHintLadder';
import type { QuizQuestion } from '@/types/quiz';

describe('QuestionHintLadder', () => {
  const mockQuestion: QuizQuestion = {
    id: 'q1',
    quiz_id: 'test-quiz',
    question: 'Bir üçgenin taban alanı ve yüksekliği verilmiştir. Üçgenin alanı nedir?',
    options: ['12', '24', '36', '48'],
    correct_index: 1,
    question_order: 1,
    explanation: 'Üçgen alanı taban ile yüksekliğin çarpımının yarısıdır.',
    created_at: new Date().toISOString(),
  };

  it('initially shows the collapsed button and expands levels sequentially', () => {
    render(<QuestionHintLadder question={mockQuestion} questionIndex={0} />);

    const button = screen.getByRole('button', { name: /Kademeli İpucu Sistemi/i });
    expect(button).toBeInTheDocument();

    // Expand
    fireEvent.click(button);
    expect(screen.getByText(/1. Kademe: Temel Kural & Formül/i)).toBeInTheDocument();

    // Unlock Level 2
    const level2Btn = screen.getByRole('button', { name: /2. Kademe İpucunu Aç/i });
    fireEvent.click(level2Btn);
    expect(screen.getByText(/2. Kademe: İlk İşlem Hamlesi/i)).toBeInTheDocument();

    // Unlock Level 3
    const level3Btn = screen.getByRole('button', { name: /3. Kademe İpucunu Aç/i });
    fireEvent.click(level3Btn);
    expect(screen.getByText(/3. Kademe: Çözüm Stratejisi/i)).toBeInTheDocument();
  });
});
