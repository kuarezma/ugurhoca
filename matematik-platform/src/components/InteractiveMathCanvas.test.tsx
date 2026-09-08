import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { InteractiveMathCanvas } from './InteractiveMathCanvas';

describe('InteractiveMathCanvas', () => {
  let mockWorker: {
    postMessage: ReturnType<typeof vi.fn>;
    terminate: ReturnType<typeof vi.fn>;
    onmessage: ((e: MessageEvent) => void) | null;
  };

  beforeEach(() => {
    mockWorker = {
      postMessage: vi.fn(),
      terminate: vi.fn(),
      onmessage: null,
    };

    function MockWorkerConstructor(this: unknown) {
      return mockWorker;
    }

    vi.stubGlobal('Worker', MockWorkerConstructor);

    // Mock transferControlToOffscreen on prototype
    Object.defineProperty(HTMLCanvasElement.prototype, 'transferControlToOffscreen', {
      value: vi.fn().mockReturnValue({} as OffscreenCanvas),
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders canvas element and title properly', () => {
    render(<InteractiveMathCanvas />);

    expect(
      screen.getByText('Harmonik Eğri & Web Worker İzolasyonu')
    ).toBeInTheDocument();
    expect(screen.getByText('OffscreenCanvas Aktif')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Animasyonu Durdur' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '100k Asal Sayı Bul' })).toBeInTheDocument();
  });

  it('initializes worker and transfers offscreen canvas on mount', () => {
    render(<InteractiveMathCanvas width={500} height={400} autoStart={true} />);

    expect(HTMLCanvasElement.prototype.transferControlToOffscreen).toHaveBeenCalled();

    expect(mockWorker.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'INIT_CANVAS',
        width: 500,
        height: 400,
      }),
      expect.any(Array)
    );

    expect(mockWorker.postMessage).toHaveBeenCalledWith({
      type: 'START_ANIMATION',
      speed: 1,
    });
  });

  it('toggles animation when button is clicked', () => {
    render(<InteractiveMathCanvas autoStart={true} />);

    const animButton = screen.getByRole('button', { name: 'Animasyonu Durdur' });
    fireEvent.click(animButton);

    expect(mockWorker.postMessage).toHaveBeenCalledWith({ type: 'STOP_ANIMATION' });
    expect(screen.getByRole('button', { name: 'Animasyonu Başlat' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Animasyonu Başlat' }));
    expect(mockWorker.postMessage).toHaveBeenCalledWith({ type: 'START_ANIMATION', speed: 1 });
  });

  it('posts CALCULATE_PRIMES and receives results from worker', () => {
    render(<InteractiveMathCanvas />);

    const calcButton = screen.getByRole('button', { name: '100k Asal Sayı Bul' });
    fireEvent.click(calcButton);

    expect(mockWorker.postMessage).toHaveBeenCalledWith({
      type: 'CALCULATE_PRIMES',
      max: 100000,
    });

    // Simulate worker response
    act(() => {
      if (mockWorker.onmessage) {
        mockWorker.onmessage(
          new MessageEvent('message', {
            data: { type: 'PRIMES_RESULT', count: 9592, primes: [] },
          })
        );
      }
    });

    expect(screen.getByText(/9\.592/)).toBeInTheDocument();
  });

  it('terminates worker cleanly on unmount', () => {
    const { unmount } = render(<InteractiveMathCanvas />);
    unmount();

    expect(mockWorker.postMessage).toHaveBeenCalledWith({ type: 'STOP_ANIMATION' });
    expect(mockWorker.terminate).toHaveBeenCalled();
  });
});
