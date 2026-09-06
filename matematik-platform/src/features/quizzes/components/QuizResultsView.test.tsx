import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuizResultsView } from './QuizResultsView';
import type { Quiz, QuizQuestion } from '@/types/quiz';

describe('QuizResultsView', () => {
  const mockQuiz: Quiz = {
    id: 'quiz-1',
    title: 'Üslü İfadeler Tarama Testi',
    grade: 8,
    time_limit: 15,
    difficulty: 'Orta',
    description: null,
    is_active: true,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  };

  const mockQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      quiz_id: 'quiz-1',
      question: '2^3 kaçtır?',
      options: ['6', '8', '9', '4'],
      correct_index: 1,
      question_order: 1,
      explanation: '2 x 2 x 2 = 8',
      created_at: '2026-01-01',
    },
    {
      id: 'q2',
      quiz_id: 'quiz-1',
      question: '-3^2 kaçtır?',
      options: ['-9', '9', '6', '-6'],
      correct_index: 0,
      question_order: 2,
      explanation: 'Parantez yoksa eksi kalır.',
      distractor_explanations: {
        1: '⚠️ Çift üssün her zaman pozitif yapacağını varsaydın; parantez yoksa eksi korunur!',
      },
      created_at: '2026-01-01',
    },
  ];

  it('renders score percentage, correct/wrong counts and handles actions', () => {
    const onRetake = vi.fn();
    const onBack = vi.fn();

    render(
      <QuizResultsView
        score={50}
        quiz={mockQuiz}
        quizQuestions={mockQuestions}
        answers={{ 0: 1, 1: 1 }} // Soru 1 doğru (1), Soru 2 yanlış (1 seçildi, doğru 0)
        questionTimes={{ 0: 25, 1: 40 }}
        startTime={Date.now() - 65000}
        onRetake={onRetake}
        onBackToLobby={onBack}
        onOpenOutcomeAnalysis={vi.fn()}
        onOpenMistakeModal={vi.fn()}
        onDownloadPDF={vi.fn()}
        onDownloadWord={vi.fn()}
      />,
    );

    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(2); // 1 doğru, 1 yanlış
    expect(screen.getByText(/Üslü İfadeler Tarama Testi/i)).toBeInTheDocument();

    // Çeldirici kavram yanılgısı kartı görüntülenmeli
    expect(screen.getByText(/Kavram Yanılgısı Teşhisi/i)).toBeInTheDocument();
    expect(screen.getByText(/Çift üssün her zaman pozitif yapacağını varsaydın/i)).toBeInTheDocument();

    // Buton tıklamaları
    fireEvent.click(screen.getByRole('button', { name: /Tekrar Dene/i }));
    expect(onRetake).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Testlere Dön/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('confidenceRatings verildiğinde metakognitif analiz kartını gösterir', () => {
    render(
      <QuizResultsView
        score={50}
        quiz={mockQuiz}
        quizQuestions={mockQuestions}
        answers={{ 0: 1, 1: 1 }}
        questionTimes={{ 0: 25, 1: 40 }}
        confidenceRatings={{ 0: 'guess', 1: 'sure' }}
        startTime={Date.now() - 65000}
        onRetake={vi.fn()}
        onBackToLobby={vi.fn()}
        onOpenOutcomeAnalysis={vi.fn()}
        onOpenMistakeModal={vi.fn()}
        onDownloadPDF={vi.fn()}
      />,
    );

    expect(screen.getByText(/Metakognitif Analiz/i)).toBeInTheDocument();
    expect(screen.getByText(/Emin Olup Yanlış Yapılan: 1 Soru/i)).toBeInTheDocument();
    expect(screen.getByText(/Tahmin Edip Doğru Çıkan: 1 Soru/i)).toBeInTheDocument();
  });
});
