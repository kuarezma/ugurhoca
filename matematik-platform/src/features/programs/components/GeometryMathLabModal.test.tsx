import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GeometryMathLabModal } from './GeometryMathLabModal';

vi.mock('@/components/ThemeProvider', () => ({
  useTheme: () => ({ theme: 'dark', toggleTheme: vi.fn(), setTheme: vi.fn() }),
}));

describe('GeometryMathLabModal', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      closePath: vi.fn(),
      clearRect: vi.fn(),
      scale: vi.fn(),
      fillText: vi.fn(),
      setLineDash: vi.fn(),
    }) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <GeometryMathLabModal isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders Pythagoras tab by default when isOpen is true', () => {
    render(<GeometryMathLabModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByTestId('geometry-math-lab-modal')).toBeInTheDocument();
    expect(screen.getByText(/Etkileşimli Matematik & Geometri Laboratuvarı/i)).toBeInTheDocument();
    expect(screen.getByTestId('pythagoras-canvas')).toBeInTheDocument();
    expect(screen.getByText(/3 - 4 - 5 Özel Dik Üçgeni/i)).toBeInTheDocument();
  });

  it('switches to Circle tab and updates trigonometric values', () => {
    render(<GeometryMathLabModal isOpen={true} onClose={vi.fn()} />);

    const circleTab = screen.getByRole('button', { name: /Birim Çember & Açı/i });
    fireEvent.click(circleTab);

    expect(screen.getByTestId('circle-canvas')).toBeInTheDocument();
    expect(screen.getByText(/1. Bölge/i)).toBeInTheDocument();
  });

  it('switches to Parabola tab and displays vertex information', () => {
    render(<GeometryMathLabModal isOpen={true} onClose={vi.fn()} />);

    const parabolaTab = screen.getByRole('button', { name: /Parabol & Tepe Noktası/i });
    fireEvent.click(parabolaTab);

    expect(screen.getByTestId('parabola-canvas')).toBeInTheDocument();
    expect(screen.getByText(/Tepe Noktası T\(r, k\):/i)).toBeInTheDocument();
  });

  it('switches to Slope tab and displays linear slope calculation', () => {
    render(<GeometryMathLabModal isOpen={true} onClose={vi.fn()} />);

    const slopeTab = screen.getByRole('button', { name: /Eğim & Doğru Denklemi/i });
    fireEvent.click(slopeTab);

    expect(screen.getByTestId('slope-canvas')).toBeInTheDocument();
    expect(screen.getByText(/Eğim Formülü: m = \(y₂ - y₁\) \/ \(x₂ - x₁\)/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<GeometryMathLabModal isOpen={true} onClose={onClose} />);

    const closeBtn = screen.getByRole('button', { name: 'Kapat' });
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
