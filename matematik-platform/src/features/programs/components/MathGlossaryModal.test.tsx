import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MathGlossaryModal } from './MathGlossaryModal';

describe('MathGlossaryModal', () => {
  it('does not render when isOpen is false', () => {
    render(<MathGlossaryModal isOpen={false} onClose={() => {}} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders modal with title, search input, and concepts list', () => {
    render(<MathGlossaryModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Matematik Kavramlar & Terimler Rehberi')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Kavram veya terim ara/i)).toBeInTheDocument();
    expect(screen.getByText('Asal Sayı')).toBeInTheDocument();
  });

  it('filters concepts when user types into the search input', () => {
    render(<MathGlossaryModal isOpen={true} onClose={() => {}} />);
    const searchInput = screen.getByPlaceholderText(/Kavram veya terim ara/i);

    fireEvent.change(searchInput, { target: { value: 'Pisagor' } });

    expect(screen.getByText('Pisagor Bağıntısı')).toBeInTheDocument();
    expect(screen.queryByText('Logaritma Kuralları & Taban Değişimi')).toBeNull();
  });

  it('filters concepts by category pill', () => {
    render(<MathGlossaryModal isOpen={true} onClose={() => {}} />);

    // Click Geometri category filter
    const geoBtn = screen.getByRole('button', { name: 'Geometri' });
    fireEvent.click(geoBtn);

    expect(screen.getByText('Pisagor Bağıntısı')).toBeInTheDocument();
    // Asal Sayı is in Sayılar category, so it should not be visible
    expect(screen.queryByText('Asal Sayı')).toBeNull();
  });

  it('renders trap alert warning for concepts', () => {
    render(<MathGlossaryModal isOpen={true} onClose={() => {}} />);
    expect(screen.getAllByText(/⚠️ Sık Yapılan Hata & Tuzak:/i).length).toBeGreaterThan(0);
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<MathGlossaryModal isOpen={true} onClose={handleClose} />);
    const closeBtn = screen.getByRole('button', { name: 'Kapat' });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
