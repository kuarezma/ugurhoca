import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MathGraphVisualizerModal } from './MathGraphVisualizerModal';

describe('MathGraphVisualizerModal', () => {
  it('renders modal when open and allows tab switching and resets', () => {
    const onClose = vi.fn();

    render(<MathGraphVisualizerModal isOpen={true} onClose={onClose} isLight={false} />);

    expect(screen.getByText('İnteraktif Fonksiyon & Grafik Laboratuvarı')).toBeInTheDocument();
    expect(screen.getByText(/Doğrusal Fonksiyon/i)).toBeInTheDocument();
    expect(screen.getByText(/Parabol/i)).toBeInTheDocument();
    expect(screen.getByText(/Birim Çember/i)).toBeInTheDocument();

    // Switch to Parabola
    const quadTab = screen.getByRole('button', { name: /Parabol/i });
    fireEvent.click(quadTab);
    expect(screen.getByText(/Tepe Noktası/i)).toBeInTheDocument();
    expect(screen.getByText(/Diskriminant/i)).toBeInTheDocument();

    // Switch to Trig
    const trigTab = screen.getByRole('button', { name: /Birim Çember/i });
    fireEvent.click(trigTab);
    expect(screen.getAllByText(/Bölge/i).length).toBeGreaterThan(0);

    // Close button
    const closeBtn = screen.getByRole('button', { name: /Anladım, Kapat/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('does not render when closed', () => {
    const { container } = render(<MathGraphVisualizerModal isOpen={false} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
