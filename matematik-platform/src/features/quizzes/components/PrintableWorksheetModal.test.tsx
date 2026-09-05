import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PrintableWorksheetModal } from './PrintableWorksheetModal';
import type { Quiz, QuizQuestion } from '@/types/quiz';

describe('PrintableWorksheetModal', () => {
  const mockQuiz: Quiz = {
    id: 'quiz-1',
    title: 'Çarpanlar ve Katlar LGS Denemesi',
    description: 'LGS tarzı yeni nesil sorular',
    difficulty: 'Orta',
    grade: 8,
    time_limit: 40,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      quiz_id: 'quiz-1',
      question: 'A ve B pozitif tam sayıları için EBOB(A, B) = 6 ise EKOK(A, B) en az kaçtır?',
      options: ['12', '18', '24', '36'],
      correct_index: 0,
      question_order: 1,
      explanation: null,
      created_at: new Date().toISOString(),
    },
  ];

  it('renders worksheet header, questions and toggles answer key', () => {
    const onClose = vi.fn();

    render(
      <PrintableWorksheetModal
        isOpen={true}
        onClose={onClose}
        quiz={mockQuiz}
        questions={mockQuestions}
      />,
    );

    expect(screen.getByText('Yazdırılabilir A4 Yaprak Test Önizleme')).toBeInTheDocument();
    expect(screen.getByText(/UĞUR HOCA MATEMATİK PLATFORMU/i)).toBeInTheDocument();
    expect(screen.getByText(/Çarpanlar ve Katlar LGS Denemesi/i)).toBeInTheDocument();
    expect(screen.getByText(/Adı Soyadı:/i)).toBeInTheDocument();

    // Toggle Answer Key
    const toggleKeyBtn = screen.getByRole('button', { name: /Cevap Anahtarını Ekle/i });
    fireEvent.click(toggleKeyBtn);
    expect(screen.getByText('Cevap Anahtarı')).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByRole('button', { name: /Kapat/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('does not render when closed or quiz is null', () => {
    const { container } = render(
      <PrintableWorksheetModal
        isOpen={false}
        onClose={vi.fn()}
        quiz={null}
        questions={[]}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('allows changing calculation workspace mode', () => {
    render(
      <PrintableWorksheetModal
        isOpen={true}
        onClose={vi.fn()}
        quiz={mockQuiz}
        questions={mockQuestions}
      />,
    );

    const select = screen.getByTitle('Soruların altına eklenecek işlem alanı boyutu') as HTMLSelectElement;
    expect(select.value).toBe('standard');

    fireEvent.change(select, { target: { value: 'grid' } });
    expect(select.value).toBe('grid');
    expect(screen.getByText('Kareli İşlem Alanı')).toBeInTheDocument();
  });
});
