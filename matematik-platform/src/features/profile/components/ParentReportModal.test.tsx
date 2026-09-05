import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ParentReportModal from './ParentReportModal';

vi.mock('@/lib/pdf-export', () => ({
  generatePDF: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

describe('ParentReportModal', () => {
  it('renders student info, metrics, and action buttons', () => {
    const onClose = vi.fn();

    render(
      <ParentReportModal
        isOpen={true}
        onClose={onClose}
        studentName="Ali Veli"
        studentGrade="7"
        streakCount={5}
        progressPercent={85}
        totalQuizzesSolved={12}
        averageScore={90}
        strongTopic="Rasyonel Sayılar"
        focusTopic="Cebirsel İfadeler"
      />
    );

    expect(screen.getByText('Ali Veli')).toBeInTheDocument();
    expect(screen.getByText('7. Sınıf Öğrencisi')).toBeInTheDocument();
    expect(screen.getByText('%85')).toBeInTheDocument();
    expect(screen.getByText('5 Gün')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('%90')).toBeInTheDocument();
    expect(screen.getByText('Rasyonel Sayılar')).toBeInTheDocument();
    expect(screen.getByText('Cebirsel İfadeler')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /WhatsApp ile İlet/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Metni Kopyala/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /A4 PDF İndir/i })).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: 'Kapat' });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ParentReportModal
        isOpen={false}
        onClose={vi.fn()}
        studentName="Ali Veli"
        studentGrade="7"
        streakCount={5}
        progressPercent={85}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
