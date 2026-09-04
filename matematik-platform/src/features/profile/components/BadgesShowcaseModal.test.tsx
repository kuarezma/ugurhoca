import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BadgesShowcaseModal } from './BadgesShowcaseModal';

describe('BadgesShowcaseModal', () => {
  it('renders all badges and calculates unlocked counts correctly', () => {
    const onClose = vi.fn();

    render(
      <BadgesShowcaseModal
        isOpen={true}
        onClose={onClose}
        currentStreak={5}
        totalQuestionsSolved={120}
        isLight={false}
      />,
    );

    expect(screen.getByText('Matematik Başarı Rozetleri 🏆')).toBeInTheDocument();
    expect(screen.getByText('İlk Adım')).toBeInTheDocument();
    expect(screen.getByText('Alev Serisi')).toBeInTheDocument();
    expect(screen.getByText('Yüzler Kulübü')).toBeInTheDocument();

    // Close button
    const closeBtn = screen.getByRole('button', { name: /Tamam/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('does not render when closed', () => {
    const { container } = render(
      <BadgesShowcaseModal isOpen={false} onClose={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
