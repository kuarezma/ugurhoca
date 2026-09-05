import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuizOpticalSheetModal } from './QuizOpticalSheetModal';

describe('QuizOpticalSheetModal', () => {
  it('renders question rows with optical bubbles and handles selection', () => {
    const onSelectQuestion = vi.fn();
    const onSelectAnswer = vi.fn();
    const onClearAnswer = vi.fn();
    const onClose = vi.fn();

    render(
      <QuizOpticalSheetModal
        isOpen={true}
        onClose={onClose}
        totalQuestions={5}
        currentIndex={0}
        answers={{ 0: 1 }} // Question 1 answered B
        flaggedQuestions={new Set([2])}
        onSelectQuestion={onSelectQuestion}
        onSelectAnswer={onSelectAnswer}
        onClearAnswer={onClearAnswer}
        quizTitle="8. Sınıf LGS Deneme Sınavı"
        studentName="Ali Yılmaz"
      />
    );

    expect(screen.getByText('OPTİK FORM')).toBeInTheDocument();
    expect(screen.getByText(/1\/5 İşaretlendi/i)).toBeInTheDocument();

    // Click bubble C on question 2 (index 1)
    const bubbleC = screen.getByTitle('2. Soru için C şıkkını işaretle');
    fireEvent.click(bubbleC);
    expect(onSelectAnswer).toHaveBeenCalledWith(1, 2);

    // Jump to question 1
    const jumpBtn = screen.getAllByTitle('Bu soruya git')[0];
    if (jumpBtn) fireEvent.click(jumpBtn);
    expect(onSelectQuestion).toHaveBeenCalledWith(0);
    expect(onClose).toHaveBeenCalled();
  });
});
