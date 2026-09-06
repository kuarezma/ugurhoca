import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VisualMathProofsModal } from './VisualMathProofsModal';

describe('VisualMathProofsModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('açık olduğunda başlığı ve ilk ispatı gösterir', () => {
    render(<VisualMathProofsModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/Neden Doğru\?.*Matematiksel İspat Koleksiyonu/i)).toBeInTheDocument();
    expect(screen.getByText(/Pisagor Bağıntısı İspatı/i)).toBeInTheDocument();
  });

  it('adımlar arasında gezinir', () => {
    render(<VisualMathProofsModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/Adım 1 \//i)).toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /Sonraki Adım/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Adım 2 \//i)).toBeInTheDocument();
  });

  it('kapalıyken hiçbir şey render etmez', () => {
    const { container } = render(<VisualMathProofsModal isOpen={false} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
