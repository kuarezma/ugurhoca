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
    expect(screen.getAllByText('LGS Puanı')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Turkce')[0]).toBeInTheDocument();

    // YKS sekmesine geçiş
    const yksTabBtn = screen.getByRole('button', { name: 'YKS (TYT & AYT)' });
    fireEvent.click(yksTabBtn);

    expect(screen.getAllByText('Yerleştirme Puanı')[0]).toBeInTheDocument();
    expect(screen.getByText('TYT Testleri (120 Soru)')).toBeInTheDocument();

    // Kapat butonu
    const closeBtn = screen.getByRole('button', { name: 'Kapat' });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('renders A4 printable diagnostic report card layout and allows printing', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<ExamScoreCalculatorModal isOpen={true} onClose={vi.fn()} initialTab="lgs" />);

    expect(
      screen.getByText(/Uğur Hoca Matematik — Deneme Sınavı Sonuç Karnesi & Stratejik Eylem Planı/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Ders Bazlı Doğru, Yanlış ve Net Tablosu/i)).toBeInTheDocument();
    expect(screen.getByText(/Bu Denemede Hata Yaptığım veya Zorlandığım Konular/i)).toBeInTheDocument();
    expect(screen.getByText(/Gelecek Hafta Çözeceğim Telafi Soruları ve Odak Planım/i)).toBeInTheDocument();

    const printBtns = screen.getAllByRole('button', { name: /A4 Karne Yazdır|Karnemi Yazdır \(A4\)/i });
    expect(printBtns.length).toBeGreaterThan(0);
    fireEvent.click(printBtns[0]);

    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });

  it('saves current trial and renders trial progression in history timeline', () => {
    localStorage.clear();
    render(<ExamScoreCalculatorModal isOpen={true} onClose={vi.fn()} initialTab="lgs" />);

    // Bu Denemeyi Kaydet
    const saveBtn = screen.getByRole('button', { name: /Bu Denemeyi Kaydet/i });
    fireEvent.click(saveBtn);

    expect(screen.getByText('Deneme Kaydedildi!')).toBeInTheDocument();

    // Çizelgeyi aç
    const historyBtn = screen.getByRole('button', { name: /Deneme Gelişim Çizelgesi/i });
    fireEvent.click(historyBtn);

    expect(screen.getByText('LGS Deneme #1')).toBeInTheDocument();
  });

  it('renders target school simulator and calculates reverse net recipe', () => {
    render(<ExamScoreCalculatorModal isOpen={true} onClose={vi.fn()} initialTab="lgs" />);

    expect(screen.getByText('Hedef Lise & Tersine Net Simülatörü')).toBeInTheDocument();
    expect(screen.getByText(/Aksiyon Reçetesi/i)).toBeInTheDocument();
    expect(screen.getByText(/Matematikten \+/i)).toBeInTheDocument();
  });
});
