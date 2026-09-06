import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SpotTheMistakeModal } from './SpotTheMistakeModal';
import { FLAWED_SOLUTIONS_DATA } from '../data/flawedSolutionsData';

describe('SpotTheMistakeModal', () => {
  const onCloseMock = vi.fn();

  it('kapalıyken null render eder', () => {
    const { container } = render(<SpotTheMistakeModal isOpen={false} onClose={onCloseMock} />);
    expect(container.firstChild).toBeNull();
  });

  it('ilk soruyu ve adımlarını başarıyla gösterir', () => {
    render(<SpotTheMistakeModal isOpen={true} onClose={onCloseMock} />);

    expect(screen.getByText(/“Hatayı Bul”/i)).toBeInTheDocument();
    expect(screen.getByText(FLAWED_SOLUTIONS_DATA[0].problemStatement)).toBeInTheDocument();
    expect(screen.getAllByRole('button').length).toBeGreaterThan(3);
  });

  it('hatalı adıma tıklandığında doğru bildirim gösterir', () => {
    render(<SpotTheMistakeModal isOpen={true} onClose={onCloseMock} />);

    const firstItem = FLAWED_SOLUTIONS_DATA[0];
    const flawedStepNum = firstItem.flawedStepNumber;

    // Adım butonları
    const buttons = screen.getAllByRole('button');
    // Adım 1 butonunu tıkla
    const stepBtn = buttons.find((btn) => btn.textContent?.includes(firstItem.steps[flawedStepNum - 1].content));
    if (stepBtn) {
      fireEvent.click(stepBtn);
      expect(screen.getByText(/Harika Teşhis/i)).toBeInTheDocument();
      expect(screen.getByText(/Neden Hatalı/i)).toBeInTheDocument();
    }
  });
});
