import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QuickFormulaCheatSheetModal } from './QuickFormulaCheatSheetModal';

// Mock MathText to keep tests lightweight
vi.mock('@/components/MathText', () => ({
  default: ({ children }: { children: React.ReactNode }) => <span data-testid="math-text">{children}</span>,
}));

describe('QuickFormulaCheatSheetModal', () => {
  it('does not render when isOpen is false', () => {
    render(<QuickFormulaCheatSheetModal isOpen={false} onClose={() => {}} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders modal with default LGS formulas when isOpen is true', () => {
    render(<QuickFormulaCheatSheetModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByRole('dialog', { name: 'Hızlı Formül Cep Notu' })).toBeInTheDocument();
    expect(screen.getByText('Hızlı Formül Cep Notu')).toBeInTheDocument();
    expect(screen.getByText('EBOB - EKOK Çarpım Kuralı')).toBeInTheDocument();
    expect(screen.getByText('İki Kare Farkı Özdeşliği')).toBeInTheDocument();
  });

  it('switches to YKS tab and shows YKS formulas', () => {
    render(<QuickFormulaCheatSheetModal isOpen={true} onClose={() => {}} />);
    const yksTab = screen.getByRole('button', { name: /YKS \(TYT & AYT\)/i });
    fireEvent.click(yksTab);

    expect(screen.getByText('Diskriminant ve Kök Formülleri')).toBeInTheDocument();
    expect(screen.getByText('Parabol Tepe Noktası T(r, k)')).toBeInTheDocument();
  });

  it('filters formulas based on search input', () => {
    render(<QuickFormulaCheatSheetModal isOpen={true} onClose={() => {}} />);
    const searchInput = screen.getByPlaceholderText('Formül veya konu ara...');
    fireEvent.change(searchInput, { target: { value: 'Pisagor' } });

    expect(screen.getByText('Pisagor Bağıntısı ve Özel Üçgenler')).toBeInTheDocument();
    expect(screen.queryByText('EBOB - EKOK Çarpım Kuralı')).toBeNull();
  });

  it('calls window.print when print button is clicked', () => {
    const originalPrint = window.print;
    window.print = vi.fn();

    render(<QuickFormulaCheatSheetModal isOpen={true} onClose={() => {}} />);
    const printBtn = screen.getByRole('button', { name: 'Formül notunu yazdır' });
    fireEvent.click(printBtn);

    expect(window.print).toHaveBeenCalledTimes(1);
    window.print = originalPrint;
  });

  it('calls onClose when close icon button is clicked', () => {
    const handleClose = vi.fn();
    render(<QuickFormulaCheatSheetModal isOpen={true} onClose={handleClose} />);
    const closeBtn = screen.getByRole('button', { name: 'Pencereyi kapat' });
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
