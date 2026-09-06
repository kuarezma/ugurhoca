import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminLatexHelperModal } from './AdminLatexHelperModal';

describe('AdminLatexHelperModal', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <AdminLatexHelperModal isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with KaTeX preview and basic symbols by default', () => {
    render(<AdminLatexHelperModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByTestId('admin-latex-helper-modal')).toBeInTheDocument();
    expect(screen.getByText(/Akıllı LaTeX & Matematik Formül Asistanı/i)).toBeInTheDocument();
    expect(screen.getByText('Kesir')).toBeInTheDocument();
    expect(screen.getByText('Karekök')).toBeInTheDocument();
  });

  it('switches to Geometry category and displays geometric symbols', () => {
    render(<AdminLatexHelperModal isOpen={true} onClose={vi.fn()} />);

    const geomTab = screen.getByText('Geometri & Açı');
    fireEvent.click(geomTab);

    expect(screen.getByText('Alfa Açısı')).toBeInTheDocument();
    expect(screen.getByText('Pi Sayısı')).toBeInTheDocument();
  });

  it('calls onInsertFormula and closes when a symbol is clicked', () => {
    const onInsert = vi.fn();
    const onClose = vi.fn();

    render(
      <AdminLatexHelperModal
        isOpen={true}
        onClose={onClose}
        onInsertFormula={onInsert}
      />
    );

    const fractionBtn = screen.getByText('Kesir');
    fireEvent.click(fractionBtn);

    expect(onInsert).toHaveBeenCalledWith('$\\frac{a}{b}$');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<AdminLatexHelperModal isOpen={true} onClose={onClose} />);

    const closeBtn = screen.getByLabelText('Kapat');
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
