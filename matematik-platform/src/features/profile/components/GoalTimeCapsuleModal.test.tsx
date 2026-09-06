import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GoalTimeCapsuleModal } from './GoalTimeCapsuleModal';

describe('GoalTimeCapsuleModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('açık olduğunda başlığı ve mektup kartını gösterir', () => {
    render(<GoalTimeCapsuleModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('Hedef Zaman Kapsülü')).toBeInTheDocument();
    expect(screen.getByText(/Gelecekteki Kendine Yazdığın Mektup/i)).toBeInTheDocument();
  });

  it('kapsülü açma düğmesine basıldığında kilit durumunu açar', () => {
    render(<GoalTimeCapsuleModal isOpen={true} onClose={vi.fn()} />);

    const unlockBtn = screen.getByRole('button', { name: /Kapsülü Şimdi Aç/i });
    fireEvent.click(unlockBtn);

    expect(screen.getByText(/Zaman Kapsülü Kilidi Açıldı!/i)).toBeInTheDocument();
  });

  it('kapalıyken hiçbir şey render etmez', () => {
    const { container } = render(<GoalTimeCapsuleModal isOpen={false} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
