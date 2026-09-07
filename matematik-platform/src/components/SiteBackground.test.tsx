import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeProvider } from './ThemeProvider';
import SiteBackground from './SiteBackground';

describe('SiteBackground Component', () => {
  beforeEach(() => {
    // Mock HTMLCanvasElement getContext
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      fillText: vi.fn(),
      scale: vi.fn(),
    });
  });

  it('arka plan kapsayıcısı aria-hidden ve testid ile render edilir', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <SiteBackground />
      </ThemeProvider>,
    );

    const bg = getByTestId('site-background');
    expect(bg).toBeInTheDocument();
    expect(bg).toHaveAttribute('aria-hidden', 'true');
    expect(bg).toHaveClass('pointer-events-none');
    expect(bg).toHaveClass('fixed');
  });

  it('aurora kürelerini ve canvas katmanını içerir', () => {
    const { container } = render(
      <ThemeProvider>
        <SiteBackground />
      </ThemeProvider>,
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();

    const orbs = container.querySelectorAll('.aurora-orb');
    expect(orbs.length).toBeGreaterThanOrEqual(3);
  });
});
