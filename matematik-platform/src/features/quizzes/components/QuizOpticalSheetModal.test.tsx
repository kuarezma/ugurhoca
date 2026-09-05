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

  it('renders 5 options (A, B, C, D, E) when optionsCount is 5 and supports docked mode', () => {
    const onToggleDock = vi.fn();
    const onSelectQuestion = vi.fn();
    const onSelectAnswer = vi.fn();

    render(
      <QuizOpticalSheetModal
        isOpen={true}
        onClose={vi.fn()}
        totalQuestions={3}
        currentIndex={1}
        answers={{}}
        flaggedQuestions={new Set()}
        onSelectQuestion={onSelectQuestion}
        onSelectAnswer={onSelectAnswer}
        onClearAnswer={vi.fn()}
        optionsCount={5}
        isDocked={true}
        onToggleDock={onToggleDock}
      />
    );

    // E bubble should be rendered for each question
    expect(screen.getByTitle('1. Soru için E şıkkını işaretle')).toBeInTheDocument();
    expect(screen.getByTitle('2. Soru için E şıkkını işaretle')).toBeInTheDocument();

    // In docked mode, dock toggle button should have title to revert to modal
    const dockBtn = screen.getByLabelText(/Görünümü pop-up modala al/i);
    fireEvent.click(dockBtn);
    expect(onToggleDock).toHaveBeenCalledTimes(1);

    // Clicking E on question 1
    const bubbleE = screen.getByTitle('1. Soru için E şıkkını işaretle');
    fireEvent.click(bubbleE);
    expect(onSelectAnswer).toHaveBeenCalledWith(0, 4);
    // When docked and question is not current (qIdx 0 !== current 1), jumps question
    expect(onSelectQuestion).toHaveBeenCalledWith(0);
  });
});
