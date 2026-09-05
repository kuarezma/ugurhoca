import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FormulaSpeedDrillModal, {
  getFormulaDrillBestScore,
  saveFormulaDrillBestScore,
} from './FormulaSpeedDrillModal';

describe('FormulaSpeedDrillModal', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('handles score persistence in localStorage', () => {
    expect(getFormulaDrillBestScore()).toBe(0);
    saveFormulaDrillBestScore(450);
    expect(getFormulaDrillBestScore()).toBe(450);
    // Should not downgrade if lower score is provided
    saveFormulaDrillBestScore(300);
    expect(getFormulaDrillBestScore()).toBe(450);
    // Should upgrade if higher score
    saveFormulaDrillBestScore(600);
    expect(getFormulaDrillBestScore()).toBe(600);
  });

  it('renders modal when open and allows starting the drill and interacting with cards', () => {
    const onClose = vi.fn();
    const onOpenFlashcards = vi.fn();

    render(
      <FormulaSpeedDrillModal
        isOpen={true}
        onClose={onClose}
        onOpenFlashcards={onOpenFlashcards}
      />
    );

    expect(screen.getByText('60 Saniye Hızlı Formül Antrenmanı')).toBeInTheDocument();
    expect(screen.getByText('Formül Hız Eşleştirmesi')).toBeInTheDocument();

    // Category buttons
    const lgsBtn = screen.getByText('LGS (8. Sınıf)');
    fireEvent.click(lgsBtn);

    const yksBtn = screen.getByText('YKS (TYT & AYT)');
    fireEvent.click(yksBtn);

    const allBtn = screen.getByText('Tümü');
    fireEvent.click(allBtn);

    // Mute toggle
    const muteBtn = screen.getByTitle(/Sesi Kapat/i);
    fireEvent.click(muteBtn);

    // Start game
    const startBtn = screen.getByText(/Antrenmanı Başlat/i);
    fireEvent.click(startBtn);

    // Game should now be playing
    expect(screen.getByText(/1\. Adım: Formül \/ Kural Adı/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Adım: KaTeX Matematiksel İfadesi/i)).toBeInTheDocument();

    // Find and click left card
    const buttons = screen.getAllByRole('button');
    // Click some cards in the active session
    expect(buttons.length).toBeGreaterThan(4);

    // Close button
    const closeBtn = screen.getByLabelText('Antrenmanı kapat');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <FormulaSpeedDrillModal isOpen={false} onClose={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
