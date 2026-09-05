import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormulaFlashcardsModal } from './FormulaFlashcardsModal';

describe('FormulaFlashcardsModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

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

  it('supports Leitner spaced repetition review actions', () => {
    render(<FormulaFlashcardsModal isOpen={true} onClose={vi.fn()} />);

    // Check Leitner boxes indicator
    expect(screen.getByText(/Hafıza Kutuları:/i)).toBeInTheDocument();

    // Flip card
    const card = screen.getByRole('button', { name: /Tam Kare Özdeşlikleri/i });
    fireEvent.click(card);

    // Leitner buttons should be visible
    const knownBtn = screen.getByRole('button', { name: /Biliyorum \(\+1\)/i });
    expect(knownBtn).toBeInTheDocument();

    fireEvent.click(knownBtn);
    // After rating, it auto-advances to the next card
    expect(screen.getAllByText('İki Kare Farkı Özdeşliği')[0]).toBeInTheDocument();
  });

  it('filters by Tekrar Vakti (due cards)', () => {
    render(<FormulaFlashcardsModal isOpen={true} onClose={vi.fn()} />);

    const dueFilterBtn = screen.getByRole('button', { name: /Tekrar Vakti/i });
    fireEvent.click(dueFilterBtn);

    expect(screen.getAllByText('Tam Kare Özdeşlikleri')[0]).toBeInTheDocument();
  });

  it('allows starring a formula and filters by Yıldızlılar', () => {
    render(<FormulaFlashcardsModal isOpen={true} onClose={vi.fn()} />);

    // Initial starred count should be 0
    expect(screen.getByRole('button', { name: /Yıldızlılar/i })).toHaveTextContent('0');

    // Click star button on current card
    const starBtn = screen.getByRole('button', { name: /Yıldızla/i });
    fireEvent.click(starBtn);

    // Star count increases to 1
    expect(screen.getByRole('button', { name: /Yıldızlılar/i })).toHaveTextContent('1');

    // Filter by starred
    const starredFilterBtn = screen.getByRole('button', { name: /Yıldızlılar/i });
    fireEvent.click(starredFilterBtn);

    // Currently starred card is present
    expect(screen.getAllByText('Tam Kare Özdeşlikleri')[0]).toBeInTheDocument();
  });

  it('renders audio read-aloud button and toggles speech when supported', () => {
    const mockSpeak = vi.fn();
    const mockCancel = vi.fn();
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speak: mockSpeak,
        cancel: mockCancel,
        speaking: false,
        getVoices: () => [],
      },
      writable: true,
      configurable: true,
    });
    class MockUtterance {
      text: string;
      lang = '';
      rate = 1;
      pitch = 1;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(text: string) {
        this.text = text;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).SpeechSynthesisUtterance = MockUtterance;

    render(<FormulaFlashcardsModal isOpen={true} onClose={vi.fn()} />);

    const speechBtn = screen.getByRole('button', { name: /Formülü sesli dinle/i });
    expect(speechBtn).toBeInTheDocument();

    fireEvent.click(speechBtn);
    expect(mockSpeak).toHaveBeenCalled();
  });
});

