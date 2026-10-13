import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VisualMathProofsModal } from './VisualMathProofsModal';

describe('VisualMathProofsModal (re-export)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('açık olduğunda başlığı ve ilk ispat sekmesini gösterir', () => {
    render(<VisualMathProofsModal isOpen={true} onClose={vi.fn()} />);

    expect(
      screen.getByRole('dialog', { name: 'Görsel Matematik İspatları' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('İnteraktif Görsel Formül İspatları'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Pisagor Özdeşliği Doğrulaması/i),
    ).toBeInTheDocument();
  });

  it('ispat sekmeleri arasında gezinir', () => {
    render(<VisualMathProofsModal isOpen={true} onClose={vi.fn()} />);

    const diffTab = screen.getByRole('button', { name: /İki Kare Farkı/i });
    fireEvent.click(diffTab);

    expect(screen.getByText(/İki Kare Farkı Formülü:/i)).toBeInTheDocument();
  });

  it('kapalıyken hiçbir şey render etmez', () => {
    const { container } = render(
      <VisualMathProofsModal isOpen={false} onClose={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

