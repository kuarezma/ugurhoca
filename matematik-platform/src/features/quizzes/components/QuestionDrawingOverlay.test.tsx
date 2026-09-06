import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { createRef } from 'react';
import { QuestionDrawingOverlay } from './QuestionDrawingOverlay';

describe('QuestionDrawingOverlay', () => {
  beforeEach(() => {
    // Mock HTMLCanvasElement getContext
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      clearRect: vi.fn(),
      scale: vi.fn(),
      drawImage: vi.fn(),
      getImageData: vi.fn().mockReturnValue({ data: [] }),
      putImageData: vi.fn(),
    }) as unknown as typeof HTMLCanvasElement.prototype.getContext;

    HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue('data:image/png;base64,mock');
    HTMLCanvasElement.prototype.setPointerCapture = vi.fn();
    HTMLCanvasElement.prototype.releasePointerCapture = vi.fn();
  });

  it('renders nothing when isActive is false', () => {
    const containerRef = createRef<HTMLDivElement>();
    const { container } = render(
      <QuestionDrawingOverlay
        isActive={false}
        onClose={vi.fn()}
        questionIndex={0}
        containerRef={containerRef}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders canvas and controls when isActive is true', () => {
    const containerRef = {
      current: document.createElement('div'),
    };
    const onClose = vi.fn();

    render(
      <QuestionDrawingOverlay
        isActive={true}
        onClose={onClose}
        questionIndex={0}
        containerRef={containerRef}
      />
    );

    expect(screen.getByTestId('question-drawing-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('drawing-canvas')).toBeInTheDocument();
    expect(screen.getByLabelText('Tükenmez Kalem')).toBeInTheDocument();
    expect(screen.getByLabelText('Fosforlu Kalem')).toBeInTheDocument();
    expect(screen.getByLabelText('Silgi')).toBeInTheDocument();
  });

  it('allows switching between pen, highlighter, and eraser tools', () => {
    const containerRef = {
      current: document.createElement('div'),
    };

    render(
      <QuestionDrawingOverlay
        isActive={true}
        onClose={vi.fn()}
        questionIndex={0}
        containerRef={containerRef}
      />
    );

    const highlighterBtn = screen.getByLabelText('Fosforlu Kalem');
    fireEvent.click(highlighterBtn);
    expect(highlighterBtn).toHaveClass('bg-yellow-400');

    const eraserBtn = screen.getByLabelText('Silgi');
    fireEvent.click(eraserBtn);
    expect(eraserBtn).toHaveClass('bg-rose-500');

    const penBtn = screen.getByLabelText('Tükenmez Kalem');
    fireEvent.click(penBtn);
    expect(penBtn).toHaveClass('bg-amber-500');
  });

  it('toggles passthrough mode for answering questions underneath', () => {
    const containerRef = {
      current: document.createElement('div'),
    };

    render(
      <QuestionDrawingOverlay
        isActive={true}
        onClose={vi.fn()}
        questionIndex={0}
        containerRef={containerRef}
      />
    );

    const toggleBtn = screen.getByLabelText('Şık İşaretle');
    fireEvent.click(toggleBtn);

    expect(screen.getByText(/Şık seçebilirsiniz; çizimleriniz korunuyor/i)).toBeInTheDocument();
    expect(screen.getByTestId('drawing-canvas')).toHaveClass('pointer-events-none');

    // Click back to drawing mode
    const backBtn = screen.getByLabelText('Çizime Dön');
    fireEvent.click(backBtn);
    expect(screen.getByTestId('drawing-canvas')).toHaveClass('pointer-events-auto');
  });

  it('calls onClose when close button is clicked', () => {
    const containerRef = {
      current: document.createElement('div'),
    };
    const onClose = vi.fn();

    render(
      <QuestionDrawingOverlay
        isActive={true}
        onClose={onClose}
        questionIndex={1}
        containerRef={containerRef}
      />
    );

    const closeBtn = screen.getByLabelText('Çizim Modundan Çık');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
