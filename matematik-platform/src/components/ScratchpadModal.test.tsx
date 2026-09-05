import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ScratchpadModal from './ScratchpadModal';

describe('ScratchpadModal', () => {
  it('renders modal when open and handles tools and question context', () => {
    const onClose = vi.fn();

    render(
      <ScratchpadModal
        isOpen={true}
        onClose={onClose}
        title="Soru 1 — Karalama Tahtası"
        questionContext={{
          questionText: 'f(x) = 2x + 4 fonksiyonunun kökü nedir?',
          options: ['-2', '0', '2', '4'],
        }}
      />
    );

    expect(screen.getByText('Soru 1 — Karalama Tahtası')).toBeInTheDocument();
    expect(screen.getByText(/f\(x\) = 2x \+ 4/i)).toBeInTheDocument();
    expect(screen.getByText('Kalem')).toBeInTheDocument();
    expect(screen.getByText('Fosforlu')).toBeInTheDocument();
    expect(screen.getByText('Çizgi')).toBeInTheDocument();
    expect(screen.getByText('Silgi')).toBeInTheDocument();

    // Tool switching
    fireEvent.click(screen.getByText('Fosforlu'));
    fireEvent.click(screen.getByText('Çizgi'));
    fireEvent.click(screen.getByText('Silgi'));
    fireEvent.click(screen.getByText('Kalem'));

    // Math Whiteboard Toolkit
    expect(screen.getByText('Koordinat')).toBeInTheDocument();
    expect(screen.getByText('Sayı Doğrusu')).toBeInTheDocument();
    expect(screen.getByText('Şekil')).toBeInTheDocument();

    fireEvent.click(screen.getByTitle(/Kartezyen Koordinat Düzlemi Ekle/i));
    fireEvent.click(screen.getByTitle(/Sayı Doğrusu Ekle/i));
    fireEvent.click(screen.getByText(/Dik Üçgen/i));
    fireEvent.click(screen.getByText(/Çember/i));
    fireEvent.click(screen.getByText(/Dikdörtgen/i));

    // Line thickness controls
    fireEvent.click(screen.getByLabelText('Kalınlığı artır'));
    fireEvent.click(screen.getByLabelText('Kalınlığı azalt'));

    // Color palette
    const yellowBtn = screen.getByTitle('Sarı');
    fireEvent.click(yellowBtn);

    // Background pattern toggle
    const patternBtn = screen.getByTitle(/Zemin Deseni:/i);
    fireEvent.click(patternBtn);

    // Option elimination
    const optionA = screen.getByText('-2');
    fireEvent.click(optionA);

    // Question panel toggle
    const togglePanelBtn = screen.getByTitle('Soru panelini aç/kapat');
    fireEvent.click(togglePanelBtn);
    fireEvent.click(togglePanelBtn);

    // Clear and download buttons
    const clearBtn = screen.getByTitle('Tümünü temizle');
    fireEvent.click(clearBtn);

    const downloadBtn = screen.getByTitle('Çizimi PNG Olarak İndir');
    fireEvent.click(downloadBtn);

    // Close button
    const closeBtn = screen.getByLabelText('Karalama tahtasını kapat');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ScratchpadModal isOpen={false} onClose={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
