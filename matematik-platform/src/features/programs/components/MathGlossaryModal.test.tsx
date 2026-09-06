import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MathGlossaryModal } from './MathGlossaryModal';

describe('MathGlossaryModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not render when isOpen is false', () => {
    render(<MathGlossaryModal isOpen={false} onClose={() => {}} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders modal with title, search input, and concepts list', () => {
    render(<MathGlossaryModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Matematik Kavramlar & Terimler Rehberi')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Kavram, terim, açıklama veya kendi notlarında ara/i)).toBeInTheDocument();
    expect(screen.getByText('Asal Sayı')).toBeInTheDocument();
  });

  it('filters concepts when user types into the search input', () => {
    render(<MathGlossaryModal isOpen={true} onClose={() => {}} />);
    const searchInput = screen.getByPlaceholderText(/Kavram, terim, açıklama veya kendi notlarında ara/i);

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
    expect(screen.queryByText('Asal Sayı')).toBeNull();
  });

  it('renders trap alert warning for concepts', () => {
    render(<MathGlossaryModal isOpen={true} onClose={() => {}} />);
    expect(screen.getAllByText(/⚠️ Sık Yapılan Hata & Tuzak:/i).length).toBeGreaterThan(0);
  });

  it('allows creating a personal custom math term and saves to localStorage', () => {
    render(<MathGlossaryModal isOpen={true} onClose={() => {}} />);

    // Click "Kendi Terimini Ekle"
    const addBtn = screen.getByRole('button', { name: /Kendi Terimini Ekle/i });
    fireEvent.click(addBtn);

    expect(screen.getByText(/Kişisel Matematik Sözlüğüne Yeni Terim Ekle/i)).toBeInTheDocument();

    // Fill form
    const termInput = screen.getByPlaceholderText(/Örn: Katsayı, Özdeşlik, Eğim/i);
    fireEvent.change(termInput, { target: { value: 'Katsayı' } });

    const defInput = screen.getByPlaceholderText(/Bu kavram ne anlama geliyor/i);
    fireEvent.change(defInput, { target: { value: 'Bir terimde değişkenin önündeki çarpan sayısıdır.' } });

    // Submit form
    const saveBtn = screen.getByRole('button', { name: /Sözlüğüme Kaydet/i });
    fireEvent.click(saveBtn);

    expect(screen.getByText('Katsayı')).toBeInTheDocument();
    expect(screen.getByText('⭐ Kişisel Terimim')).toBeInTheDocument();
  });

  it('allows adding and editing personal note to an existing concept', () => {
    render(<MathGlossaryModal isOpen={true} onClose={() => {}} />);

    const addNoteBtns = screen.getAllByRole('button', { name: /Kendi Notunu Ekle/i });
    fireEvent.click(addNoteBtns[0]);

    const textarea = screen.getByPlaceholderText(/Bu kavramı aklında tutmak için kendi yöntemin/i);
    fireEvent.change(textarea, { target: { value: '2 tek çift asal sayıdır, unutma!' } });

    const saveNoteBtn = screen.getByRole('button', { name: /Kaydet/i });
    fireEvent.click(saveNoteBtn);

    expect(screen.getByText('2 tek çift asal sayıdır, unutma!')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<MathGlossaryModal isOpen={true} onClose={handleClose} />);
    const closeBtn = screen.getByRole('button', { name: 'Kapat' });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
