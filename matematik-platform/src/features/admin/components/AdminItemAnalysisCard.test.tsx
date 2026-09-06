import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminItemAnalysisCard } from './AdminItemAnalysisCard';
import type { QuizPsychometricReport } from '@/features/quizzes/lib/itemAnalysis';

describe('AdminItemAnalysisCard', () => {
  const mockReport: QuizPsychometricReport = {
    quizId: 'quiz-1',
    totalSubmissions: 50,
    averageScore: 72.5,
    problematicItemsCount: 1,
    overallReliabilityEstimate: 0.82,
    items: [
      {
        questionId: 'q1',
        questionText: 'Köklü sayılarda toplama kuralı nedir?',
        totalAttempts: 50,
        correctCount: 40,
        difficultyIndex: 0.8,
        difficultyLabel: 'Kolay',
        discriminationIndex: 0.45,
        discriminationLabel: 'Mükemmel',
        distractorCounts: [5, 40, 3, 2],
        isProblematic: false,
        recommendation: 'Üstün ayırt edicilik.',
      },
      {
        questionId: 'q2',
        questionText: 'Hatalı veya ters köklü soru',
        totalAttempts: 50,
        correctCount: 10,
        difficultyIndex: 0.2,
        difficultyLabel: 'Aşırı Zor',
        discriminationIndex: -0.15,
        discriminationLabel: 'Kötü / Hatalı Soru',
        distractorCounts: [20, 10, 15, 5],
        isProblematic: true,
        recommendation: '⚠️ TERS AYIRT EDİCİLİK: Başarılı öğrenciler yanılmış!',
      },
    ],
  };

  it('renders summary metrics and question list', () => {
    render(<AdminItemAnalysisCard report={mockReport} quizTitle="LGS Deneme 1" />);

    expect(screen.getByText(/LGS Deneme 1 — Soru Kalite & Ayırt Edicilik Paneli/i)).toBeInTheDocument();
    expect(screen.getByText('0.82')).toBeInTheDocument();
    expect(screen.getByText('50 Katılımcı')).toBeInTheDocument();
    expect(screen.getByText(/Köklü sayılarda toplama kuralı nedir/i)).toBeInTheDocument();
  });

  it('filters problematic questions when toggle button is clicked', () => {
    render(<AdminItemAnalysisCard report={mockReport} />);

    const filterBtn = screen.getByRole('button', { name: /Sorunlu Soru/i });
    fireEvent.click(filterBtn);

    // Sorunsuz soru filtrelenmeli, yalnızca problemli soru kalmalı
    expect(screen.queryByText(/Köklü sayılarda toplama kuralı nedir/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Hatalı veya ters köklü soru/i)).toBeInTheDocument();
    expect(screen.getByText(/TERS AYIRT EDİCİLİK/i)).toBeInTheDocument();
  });
});
