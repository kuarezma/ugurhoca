import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormulaFlashcardsModal } from './FormulaFlashcardsModal';

describe('FormulaFlashcardsModal', () => {
  it('does not render when closed', () => {
    const { container } = render(
      <FormulaFlashcardsModal isOpen={false} onClose={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders flashcard front and flips on click', () => {
    const onClose = vi.fn();
    render(<FormulaFlashcardsModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText('Formül & Bilgi Kartları')).toBeInTheDocument();
    expect(screen.getByText('Tam Kare Özdeşlikleri')).toBeInTheDocument();

    const card = screen.getByRole('button', { name: /Tam Kare Özdeşlikleri/i });
    fireEvent.click(card);

    // After flip, tip text should appear
    expect(screen.getByText(/Birincinin karesi/i)).toBeInTheDocument();
  });

  it('switches categories and navigates next card', () => {
    render(<FormulaFlashcardsModal isOpen={true} onClose={vi.fn()} />);

    const yksFilterBtn = screen.getByRole('button', { name: /YKS \(TYT \/ AYT\)/i });
    fireEvent.click(yksFilterBtn);

    expect(screen.getByText('Temel Trigonometrik Özdeşlik')).toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /Sonraki Kart/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText('Yarım Açı Formülleri')).toBeInTheDocument();
  });
});
