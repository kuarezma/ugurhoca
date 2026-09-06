import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StudentPortfolioModal from './StudentPortfolioModal';

describe('StudentPortfolioModal Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders correctly when open and displays default portfolio items', () => {
    const onClose = vi.fn();
    render(<StudentPortfolioModal isOpen={true} onClose={onClose} studentName="Ali" grade="8" />);

    expect(screen.getByText('Matematik Gelişim Portfolyosu')).toBeInTheDocument();
    expect(screen.getAllByText(/Ali • 8\. Sınıf/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Çarpanlara Ayırma Model Tasarımı')).toBeInTheDocument();
  });

  it('allows adding a new portfolio item and renders it', () => {
    const onClose = vi.fn();
    render(<StudentPortfolioModal isOpen={true} onClose={onClose} />);

    // Click toggle
    const addToggle = screen.getByRole('button', { name: /Yeni Çalışma Ekle/i });
    fireEvent.click(addToggle);

    // Form inputs
    const titleInput = screen.getByPlaceholderText(/Çalışma Başlığı/i);
    const reflectionInput = screen.getByPlaceholderText(/Öz-Yansıma Notun/i);

    fireEvent.change(titleInput, { target: { value: 'Özdeşlik Kartı' } });
    fireEvent.change(reflectionInput, { target: { value: 'Formülleri kartlara çizerek çalıştım.' } });

    const saveBtn = screen.getByRole('button', { name: /Portfolyoma Kaydet/i });
    fireEvent.click(saveBtn);

    expect(screen.getByText('Özdeşlik Kartı')).toBeInTheDocument();
  });

  it('calls window.print when print button is clicked', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    const onClose = vi.fn();

    render(<StudentPortfolioModal isOpen={true} onClose={onClose} />);

    const printBtn = screen.getByRole('button', { name: /Yazdır \/ PDF/i });
    fireEvent.click(printBtn);

    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });
});
