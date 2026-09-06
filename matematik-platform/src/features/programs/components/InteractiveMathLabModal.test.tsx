import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InteractiveMathLabModal } from './InteractiveMathLabModal';

describe('InteractiveMathLabModal', () => {
  const onCloseMock = vi.fn();

  it('kapalıyken render edilmez', () => {
    const { container } = render(<InteractiveMathLabModal isOpen={false} onClose={onCloseMock} />);
    expect(container.firstChild).toBeNull();
  });

  it('açıldığında başlığı, kanvası ve 1. Aşama tahmin kartını gösterir', () => {
    render(<InteractiveMathLabModal isOpen={true} onClose={onCloseMock} />);

    expect(screen.getByText(/Matematiği Dokunarak Keşfet/i)).toBeInTheDocument();
    expect(screen.getByText(/1. Aşama: Hipotez Kur/i)).toBeInTheDocument();
    expect(screen.getByText('Üçgen Açıları')).toBeInTheDocument();
    expect(screen.getByText('Doğrunun Eğimi')).toBeInTheDocument();
  });

  it('mod değiştirdiğinde eğim moduna geçer', () => {
    render(<InteractiveMathLabModal isOpen={true} onClose={onCloseMock} />);

    const slopeBtn = screen.getByText('Doğrunun Eğimi');
    fireEvent.click(slopeBtn);

    expect(screen.getByText(/Dikey Değişim/i)).toBeInTheDocument();
  });

  it('tahmin yapılıp 2. Aşamaya geçilebilir', () => {
    render(<InteractiveMathLabModal isOpen={true} onClose={onCloseMock} />);

    const optionBtn = screen.getByText(/Açıların toplamı 180° kalmaya devam eder/i);
    fireEvent.click(optionBtn);

    const exploreBtn = screen.getByRole('button', { name: /Tahmini Test Etmek İçin Sürükle/i });
    fireEvent.click(exploreBtn);

    expect(screen.getByText(/2. Aşama: Serbest Deney/i)).toBeInTheDocument();
  });
});
