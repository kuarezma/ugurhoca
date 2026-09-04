import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExamScoreCalculatorModal } from './ExamScoreCalculatorModal';

describe('ExamScoreCalculatorModal', () => {
  it('renders LGS tab by default and allows switching to YKS', () => {
    const onClose = vi.fn();
    render(
      <ExamScoreCalculatorModal
        isOpen={true}
        onClose={onClose}
        initialTab="lgs"
      />,
    );

    expect(
      screen.getByText('İnteraktif Sınav Puanı & Net Hesaplayıcı'),
    ).toBeInTheDocument();
    expect(screen.getByText('LGS Puanı')).toBeInTheDocument();
    expect(screen.getByText('Turkce')).toBeInTheDocument();

    // YKS sekmesine geçiş
    const yksTabBtn = screen.getByRole('button', { name: 'YKS (TYT & AYT)' });
    fireEvent.click(yksTabBtn);

    expect(screen.getByText('Yerleştirme Puanı')).toBeInTheDocument();
    expect(screen.getByText('TYT Testleri (120 Soru)')).toBeInTheDocument();

    // Kapat butonu
    const closeBtn = screen.getByRole('button', { name: 'Kapat' });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
