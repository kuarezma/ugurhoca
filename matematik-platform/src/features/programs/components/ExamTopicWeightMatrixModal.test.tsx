import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExamTopicWeightMatrixModal } from './ExamTopicWeightMatrixModal';

describe('ExamTopicWeightMatrixModal', () => {
  it('renders LGS topic matrix by default', () => {
    const onClose = vi.fn();
    render(<ExamTopicWeightMatrixModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText(/Çıkmış Soru Dağılım Matrisi/i)).toBeInTheDocument();
    expect(screen.getByText('Kareköklü İfadeler')).toBeInTheDocument();
    expect(screen.getByText('LGS (8. Sınıf)')).toBeInTheDocument();
  });

  it('switches to TYT and displays TYT specific topics', () => {
    render(<ExamTopicWeightMatrixModal isOpen={true} onClose={vi.fn()} />);

    const tytTab = screen.getByRole('button', { name: /TYT Matematik/i });
    fireEvent.click(tytTab);

    expect(screen.getByText(/Problemler \(Sayı, Kesir, Yaş, Hız, Yüzde\)/i)).toBeInTheDocument();
  });

  it('filters topics by yield level', () => {
    render(<ExamTopicWeightMatrixModal isOpen={true} onClose={vi.fn()} />);

    // Hızlı Net butonuna tıkla
    const quickWinBtn = screen.getByRole('button', { name: /Hızlı Net Kazandıran/i });
    fireEvent.click(quickWinBtn);

    // Hızlı net olan Veri Analizi görünmeli
    expect(screen.getByText('Veri Analizi')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<ExamTopicWeightMatrixModal isOpen={true} onClose={onClose} />);

    const closeBtn = screen.getByRole('button', { name: 'Kapat' });
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });
});
