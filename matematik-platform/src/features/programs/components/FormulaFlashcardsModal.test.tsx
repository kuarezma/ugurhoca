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
    expect(screen.getAllByText('Tam Kare Özdeşlikleri')[0]).toBeInTheDocument();

    const card = screen.getByRole('button', { name: /Tam Kare Özdeşlikleri/i });
    fireEvent.click(card);

    // After flip, tip text should appear
    expect(screen.getAllByText(/Birincinin karesi/i)[0]).toBeInTheDocument();
  });

  it('switches categories and navigates next card', () => {
    render(<FormulaFlashcardsModal isOpen={true} onClose={vi.fn()} />);

    const yksFilterBtn = screen.getByRole('button', { name: /YKS \(TYT \/ AYT\)/i });
    fireEvent.click(yksFilterBtn);

    expect(screen.getAllByText('Temel Trigonometrik Özdeşlik')[0]).toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /Sonraki Kart/i });
    fireEvent.click(nextBtn);

    expect(screen.getAllByText('Yarım Açı Formülleri')[0]).toBeInTheDocument();
  });

  it('triggers window.print on A4 print button click', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<FormulaFlashcardsModal isOpen={true} onClose={vi.fn()} />);

    const printBtn = screen.getByRole('button', { name: /A4 Formül Kitapçığı Yazdır/i });
    fireEvent.click(printBtn);

    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });
});
