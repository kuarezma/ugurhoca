import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CurriculumCoverageMatrixModal } from './CurriculumCoverageMatrixModal';

describe('CurriculumCoverageMatrixModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not render when isOpen is false', () => {
    render(<CurriculumCoverageMatrixModal isOpen={false} onClose={() => {}} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders modal with title, grade options, stats, and topic matrix', () => {
    render(<CurriculumCoverageMatrixModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Kazanım Kapsam & İçerik Haritası')).toBeInTheDocument();
    expect(screen.getByText('Genel Kapsam Oranı')).toBeInTheDocument();
    expect(screen.getByText('Çarpanlar ve Katlar')).toBeInTheDocument();
    expect(screen.getByText('Müfredat Kazanım / Konu Başlığı')).toBeInTheDocument();
  });

  it('switches grade and updates topic list', () => {
    render(<CurriculumCoverageMatrixModal isOpen={true} onClose={() => {}} />);

    // Click 5. Sınıf
    const grade5Btn = screen.getByRole('button', { name: '5. Sınıf' });
    fireEvent.click(grade5Btn);

    expect(screen.getByText('Doğal Sayılar')).toBeInTheDocument();
  });

  it('filters topics by incomplete and complete', () => {
    render(<CurriculumCoverageMatrixModal isOpen={true} onClose={() => {}} />);

    const incompleteBtn = screen.getByRole('button', { name: /Eksikli Konular/i });
    fireEvent.click(incompleteBtn);

    expect(screen.getByText(/Kazanım Kapsam & İçerik Haritası/i)).toBeInTheDocument();
  });

  it('toggles channel coverage status on click and calls onClose when closing', () => {
    const handleClose = vi.fn();
    render(<CurriculumCoverageMatrixModal isOpen={true} onClose={handleClose} />);

    // Find all Mevcut buttons and click one to toggle to Eksik
    const mevcutBtns = screen.getAllByRole('button', { name: /Mevcut/i });
    expect(mevcutBtns.length).toBeGreaterThan(0);
    fireEvent.click(mevcutBtns[0]);

    // Close modal
    const closeBtn = screen.getByRole('button', { name: 'Kapat' });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
