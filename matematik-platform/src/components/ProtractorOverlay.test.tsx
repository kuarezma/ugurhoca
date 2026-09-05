import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProtractorOverlay from './ProtractorOverlay';

describe('ProtractorOverlay', () => {
  it('renders protractor overlay with controls and handles rotation', () => {
    const onClose = vi.fn();

    render(<ProtractorOverlay isOpen={true} onClose={onClose} />);

    expect(screen.getByText('Açıölçer:')).toBeInTheDocument();
    expect(screen.getAllByText('0°').length).toBeGreaterThan(0);

    // Rotate +15°
    const rotateCwBtn = screen.getByTitle('Saat yönünde 15° döndür');
    fireEvent.click(rotateCwBtn);
    expect(screen.getByText('15°')).toBeInTheDocument();

    // Rotate -15° twice -> 345°
    const rotateCcwBtn = screen.getByTitle('Saat yönü tersine 15° döndür');
    fireEvent.click(rotateCcwBtn);
    fireEvent.click(rotateCcwBtn);
    expect(screen.getByText('345°')).toBeInTheDocument();

    // Preset angles
    const btn90 = screen.getByRole('button', { name: '90°' });
    fireEvent.click(btn90);
    expect(screen.getAllByText('90°').length).toBeGreaterThan(0);

    const btn45 = screen.getByRole('button', { name: '45°' });
    fireEvent.click(btn45);
    expect(screen.getAllByText('45°').length).toBeGreaterThan(0);

    // Close button
    const closeBtn = screen.getByLabelText('Açıölçeri Kapat');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ProtractorOverlay isOpen={false} onClose={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
