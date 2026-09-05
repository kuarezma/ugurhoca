import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MistakeNotebookModal } from './MistakeNotebookModal';
import { saveMistakesToBank } from '@/features/quizzes/lib/mistakeStorage';

describe('MistakeNotebookModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders empty state when no mistakes exist', () => {
    const onClose = vi.fn();
    render(<MistakeNotebookModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText(/Akıllı Hata Defterim/i)).toBeInTheDocument();
    expect(screen.getByText(/Tekrar bekleyen hiç yanlış soru yok/i)).toBeInTheDocument();
  });

  it('renders saved mistakes and calls retake quiz callback', () => {
    saveMistakesToBank(
      [
        {
          id: 'q-2',
          quiz_id: 'quiz-1',
          question_order: 1,
          question: '3x = 12 ise x kaçtır?',
          options: ['2', '3', '4', '5'],
          correct_index: 2,
          explanation: 'x = 4',
          created_at: '2026-01-01T00:00:00Z',
        },
      ],
      'Denklem Testi',
    );

    const onClose = vi.fn();
    const onStartRetakeQuiz = vi.fn();

    render(
      <MistakeNotebookModal
        isOpen={true}
        onClose={onClose}
        onStartRetakeQuiz={onStartRetakeQuiz}
      />,
    );

    expect(screen.getAllByText(/3x = 12/i)[0]).toBeInTheDocument();

    const retakeBtn = screen.getByRole('button', { name: /Hatalarımdan Test Çöz/i });
    fireEvent.click(retakeBtn);

    expect(onStartRetakeQuiz).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('allows tagging a mistake with a reason and filtering by reason', () => {
    saveMistakesToBank(
      [
        {
          id: 'q-3',
          quiz_id: 'quiz-2',
          question_order: 1,
          question: '2x + 4 = 10 ise x kaçtır?',
          options: ['1', '2', '3', '4'],
          correct_index: 2,
          explanation: 'x = 3',
          created_at: '2026-01-01T00:00:00Z',
        },
      ],
      'Cebir Testi',
    );

    render(<MistakeNotebookModal isOpen={true} onClose={vi.fn()} />);

    // Hata nedeni ata: İşlem Hatası (kart üzerindeki buton)
    const islemHatasiBtn = screen.getByRole('button', { name: /^🔴\s*İşlem Hatası$/i });
    fireEvent.click(islemHatasiBtn);

    // Neden filtresinde (1) görünmeli
    expect(screen.getByRole('button', { name: /İşlem Hatası \(1\)/i })).toBeInTheDocument();
  });

  it('opens printable worksheet modal and triggers print', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    saveMistakesToBank(
      [
        {
          id: 'q-print',
          quiz_id: 'quiz-p',
          question_order: 1,
          question: '5x = 20 ise x kaçtır?',
          options: ['2', '3', '4', '5'],
          correct_index: 2,
          explanation: 'x = 4',
          created_at: '2026-01-01T00:00:00Z',
        },
      ],
      'Baskı Testi',
    );

    render(<MistakeNotebookModal isOpen={true} onClose={vi.fn()} />);

    const printBtn = screen.getByRole('button', { name: /A4 Yaprak Test/i });
    expect(printBtn).toBeInTheDocument();
    fireEvent.click(printBtn);

    expect(screen.getByText(/Hata Defteri Özel Çalışma Testi/i)).toBeInTheDocument();
    const worksheetPrintBtn = screen.getByRole('button', { name: /Yazdır \(A4\)/i });
    expect(worksheetPrintBtn).toBeInTheDocument();
    fireEvent.click(worksheetPrintBtn);
    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });

  it('renders root-cause analysis bar and updates prescriptive advice when mistakes are tagged', () => {
    saveMistakesToBank(
      [
        {
          id: 'q-analysis-1',
          quiz_id: 'quiz-a',
          question_order: 1,
          question: 'Kök 50 sayısı hangi iki tam sayı arasındadır?',
          options: ['5-6', '6-7', '7-8', '8-9'],
          correct_index: 2,
          explanation: '49 < 50 < 64 olduğundan 7 ile 8 arasındadır.',
          created_at: '2026-01-01T00:00:00Z',
        },
      ],
      'Kareköklü İfadeler',
    );

    render(<MistakeNotebookModal isOpen={true} onClose={vi.fn()} />);

    // Analiz çubuğu ve varsayılan etiketleme teşviki kontrolü
    expect(screen.getByText(/Kök Neden Analiz Çubuğu/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: /Hata Kök Neden Dağılımı/i })).toBeInTheDocument();
    expect(screen.getByText(/Kişisel Teşhis İçin Hatalarını Etiketle/i)).toBeInTheDocument();

    // Soruya Kural Eksikliği (🟡 Kural Eksikliği) etiketi ata
    const kuralBtn = screen.getByRole('button', { name: /^🟡\s*Kural Eksikliği$/i });
    fireEvent.click(kuralBtn);

    // Reçetenin Konu Kavrama & Formül Pekiştirme'ye dönüştüğünü doğrula
    expect(screen.getByText(/Öncelik: Konu Kavrama & Formül Pekiştirme/i)).toBeInTheDocument();
  });

  it('triggers window.print directly when clicking A4 Hata Analiz Föyü button', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    saveMistakesToBank(
      [
        {
          id: 'q-diag',
          quiz_id: 'quiz-d',
          question_order: 1,
          question: 'x^2 = 16 ise x pozitif değeri nedir?',
          options: ['2', '4', '8', '16'],
          correct_index: 1,
          explanation: 'x = 4',
          created_at: '2026-01-01T00:00:00Z',
        },
      ],
      'Denklem',
    );

    render(<MistakeNotebookModal isOpen={true} onClose={vi.fn()} />);

    const diagPrintBtn = screen.getByRole('button', { name: /A4 Hata Analiz Föyü/i });
    expect(diagPrintBtn).toBeInTheDocument();
    fireEvent.click(diagPrintBtn);

    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });
});
