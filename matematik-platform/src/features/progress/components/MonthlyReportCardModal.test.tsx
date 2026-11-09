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

  it('renders report card view with student stats and topic breakdown when provided', () => {
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
        topicGrades={[
          { topic: 'Çarpanlara Ayırma & Özdeşlikler', score: 88, status: 'Pekiyi' },
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

  it('displays honest empty state when there is no topic data', () => {
    render(
      <MonthlyReportCardModal
        isOpen={true}
        onClose={vi.fn()}
        studentName="Can Yılmaz"
        grade={8}
        streak={0}
        sessions={[]}
      />
    );

    expect(screen.getByText('Henüz bu ay için konu bazlı test verisi oluşmadı')).toBeInTheDocument();
    expect(screen.getByText('0 Soru')).toBeInTheDocument();
    expect(screen.queryByText('184 Soru')).not.toBeInTheDocument();
  });

  it('does not generate fake %80 score or fake questions solved when only video session exists', () => {
    render(
      <MonthlyReportCardModal
        isOpen={true}
        onClose={vi.fn()}
        studentName="Ayşe Demir"
        grade={8}
        streak={3}
        sessions={[
          {
            id: 'v1',
            activity_type: 'video',
            duration: 20,
            topics: ['Yalnız video izlendi'],
            date: new Date().toISOString(),
          },
        ]}
      />
    );

    // Sahte puan üretilmemeli, gerçek test verisi olmadığı dürüstçe belirtilmeli
    expect(screen.queryByText(/%80/)).not.toBeInTheDocument();
    expect(screen.queryByText(/%75/)).not.toBeInTheDocument();
    expect(screen.getByText('0 Soru')).toBeInTheDocument();
    expect(screen.getByText('Henüz bu ay için konu bazlı test verisi oluşmadı')).toBeInTheDocument();
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
