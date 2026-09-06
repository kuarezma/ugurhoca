import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StudyPrescriptionCard } from './StudyPrescriptionCard';
import * as studyPrescriptionModule from '@/features/quizzes/lib/studyPrescription';

describe('StudyPrescriptionCard', () => {
  it('renders clean state when no prescription is available', () => {
    vi.spyOn(studyPrescriptionModule, 'generateStudyPrescription').mockReturnValue(null);

    render(<StudyPrescriptionCard isLight={false} />);
    expect(screen.getByText(/Haftalık Reçete: Eksik Konun Yok!/i)).toBeInTheDocument();
  });

  it('renders active prescription and triggers onStartQuiz', () => {
    vi.spyOn(studyPrescriptionModule, 'generateStudyPrescription').mockReturnValue({
      id: 'rx-1',
      generatedAt: new Date().toISOString(),
      totalPendingMistakes: 1,
      focusTopic: 'Çarpanlar ve Katlar',
      weaknessType: 'İşlem/Kavram Hatası',
      weaknessEmoji: '🎯',
      actionTip: 'EBOB-EKOK problemlerinde asal çarpan tablosunu dikkatle kontrol et.',
      recommendedQuestions: [
        {
          id: 'q1',
          quiz_id: 'quiz-1',
          question: 'Örnek soru',
          options: ['A', 'B', 'C', 'D'],
          correct_index: 0,
          question_order: 1,
          explanation: null,
          created_at: new Date().toISOString(),
        },
      ],
      estimatedMinutes: 5,
    });

    const handleStartQuiz = vi.fn();
    render(<StudyPrescriptionCard isLight={false} onStartQuiz={handleStartQuiz} />);

    expect(screen.getByText('Çarpanlar ve Katlar')).toBeInTheDocument();
    expect(screen.getByText(/Kişisel Çalışma Reçetesi/i)).toBeInTheDocument();
    expect(screen.getByText(/1 Kritik Soru/i)).toBeInTheDocument();

    const startBtn = screen.getByRole('button', { name: /Reçeteyi Çöz/i });
    fireEvent.click(startBtn);

    expect(handleStartQuiz).toHaveBeenCalledTimes(1);
    expect(handleStartQuiz).toHaveBeenCalledWith(
      expect.any(Array),
      'Çarpanlar ve Katlar'
    );
  });
});
