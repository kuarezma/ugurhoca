import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MonthlyReportCardModal } from './MonthlyReportCardModal';

describe('MonthlyReportCardModal', () => {
  it('does not render when closed', () => {
    const { container } = render(
      <MonthlyReportCardModal
        isOpen={false}
        onClose={vi.fn()}
        studentName="Ali Yılmaz"
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders report card view with student stats and topic breakdown', () => {
    render(
      <MonthlyReportCardModal
        isOpen={true}
        onClose={vi.fn()}
        studentName="Zeynep Kaya"
        grade={8}
        streak={14}
        sessions={[
          {
            id: '1',
            activity_type: 'test',
            duration: 120,
            topics: ['Çarpanlara Ayırma'],
            date: new Date().toISOString(),
          },
        ]}
      />
    );

    expect(
      screen.getByText(/Aylık Matematik Gelişim Raporu & Başarı Belgesi/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Zeynep Kaya — 8. Sınıf Matematik Karne & Onur Belgesi')).toBeInTheDocument();
    expect(screen.getByText('14 Gün')).toBeInTheDocument();
    expect(screen.getByText('Çarpanlara Ayırma & Özdeşlikler')).toBeInTheDocument();
  });

  it('switches to official certificate tab and triggers print', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(
      <MonthlyReportCardModal
        isOpen={true}
        onClose={vi.fn()}
        studentName="Ahmet Demir"
        grade={8}
      />
    );

    const certTabBtn = screen.getByRole('button', { name: /Başarı Belgesi/i });
    fireEvent.click(certTabBtn);

    expect(
      screen.getByText(/MATEMATİK ÜSTÜN GELİŞİM & BAŞARI BELGESİ/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Ahmet Demir')).toBeInTheDocument();

    const printBtn = screen.getByRole('button', { name: /Karneni Yazdır/i });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });
});
