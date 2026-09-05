import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VisualMathProofsModal } from './VisualMathProofsModal';

describe('VisualMathProofsModal', () => {
  it('renders modal and switches through all 4 interactive proof tabs', () => {
    const onClose = vi.fn();

    render(
      <VisualMathProofsModal
        isOpen={true}
        onClose={onClose}
        isLight={false}
      />
    );

    expect(screen.getByText('İnteraktif Görsel Formül İspatları')).toBeInTheDocument();
    expect(screen.getByText(/Pisagor Özdeşliği Doğrulaması/i)).toBeInTheDocument();

    // Sliders in Pythagoras
    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[0], { target: { value: '4' } });
    fireEvent.change(sliders[1], { target: { value: '5' } });
    fireEvent.change(sliders[2], { target: { value: '60' } });

    // 1. Switch to Difference of Squares
    const diffTab = screen.getByText(/İki Kare Farkı/i);
    fireEvent.click(diffTab);
    expect(screen.getByText(/İki Kare Farkı Formülü:/i)).toBeInTheDocument();
    const diffSliders = screen.getAllByRole('slider');
    fireEvent.change(diffSliders[0], { target: { value: '7' } });
    fireEvent.change(diffSliders[1], { target: { value: '3' } });
    fireEvent.change(diffSliders[2], { target: { value: '50' } });

    // 2. Switch to Trig Identity
    const trigTab = screen.getByText(/sin²θ \+ cos²θ = 1/i);
    fireEvent.click(trigTab);
    expect(screen.getByText(/Birim Çember Sırrı:/i)).toBeInTheDocument();
    const trigSliders = screen.getAllByRole('slider');
    fireEvent.change(trigSliders[0], { target: { value: '60' } });

    // 3. Switch to Pascal & Binomial
    const pascalTab = screen.getByText(/Pascal & \(a \+ b\)ⁿ/i);
    fireEvent.click(pascalTab);
    expect(screen.getByText(/Cebirsel Açılımı:/i)).toBeInTheDocument();
    expect(screen.getByText(/Kombinasyon Bağlantısı:/i)).toBeInTheDocument();
    const pascalSliders = screen.getAllByRole('slider');
    fireEvent.change(pascalSliders[0], { target: { value: '4' } });
    const n2Btn = screen.getByRole('button', { name: 'n=2' });
    fireEvent.click(n2Btn);

    // 4. Switch to Circle Sector
    const circleTab = screen.getByText(/Daire Dilimi & Yay Uzunluğu/i);
    fireEvent.click(circleTab);
    expect(screen.getAllByText(/Yay Uzunluğu \(L\)/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Dilim Alanı \(A\)/i)).toBeInTheDocument();
    const circleSliders = screen.getAllByRole('slider');
    fireEvent.change(circleSliders[0], { target: { value: '7' } }); // Radius
    fireEvent.change(circleSliders[1], { target: { value: '90' } }); // Angle
    expect(screen.getByText(/O \(Merkez\)/i)).toBeInTheDocument();

    // Close button
    const closeBtn = screen.getByText('Anladım, Kapat');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <VisualMathProofsModal isOpen={false} onClose={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
