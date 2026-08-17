import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuizQuestionPalette } from './QuizQuestionPalette';

describe('QuizQuestionPalette', () => {
  it('renders all question numbers correctly', () => {
    const onSelectQuestion = vi.fn();
    const onToggleFlag = vi.fn();

    render(
      <QuizQuestionPalette
        totalQuestions={5}
        currentIndex={0}
        answers={{ 0: 1, 2: 3 }}
        flaggedQuestions={new Set([1])}
        onSelectQuestion={onSelectQuestion}
        onToggleFlag={onToggleFlag}
      />,
    );

    expect(screen.getByText('Soru Haritası')).toBeInTheDocument();
    expect(screen.getByText('2/5 Çözüldü')).toBeInTheDocument();
    expect(screen.getByText('1 Şüpheli')).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    // 5 question buttons + 1 flag toggle button
    expect(buttons.length).toBe(6);

    fireEvent.click(screen.getByRole('button', { name: /Soru 3/i }));
    expect(onSelectQuestion).toHaveBeenCalledWith(2);
  });

  it('triggers flag toggle button', () => {
    const onToggleFlag = vi.fn();

    render(
      <QuizQuestionPalette
        totalQuestions={3}
        currentIndex={1}
        answers={{}}
        flaggedQuestions={new Set()}
        onSelectQuestion={vi.fn()}
        onToggleFlag={onToggleFlag}
      />,
    );

    const toggleBtn = screen.getByText('Bu soruyu şüpheli işaretle');
    fireEvent.click(toggleBtn);
    expect(onToggleFlag).toHaveBeenCalledWith(1);
  });
});
