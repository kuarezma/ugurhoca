import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SmartTopicDiagnostic } from './SmartTopicDiagnostic';

describe('SmartTopicDiagnostic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders clean state when there are no unmastered mistakes', () => {
    render(<SmartTopicDiagnostic isLight={false} />);

    expect(screen.getByText('Kişiselleştirilmiş Eksik Reçetesi')).toBeInTheDocument();
    expect(screen.getByText(/Harika! Şu Anda Bekleyen Bir Eksik Teşhisi Yok/i)).toBeInTheDocument();
  });

  it('renders active prescription and triggers recovery quiz callback', () => {
    const onStartRecoveryQuiz = vi.fn();
    const mockMistakes = [
      {
        id: 'm1',
        question: {
          id: 'q1',
          quiz_id: 'quiz1',
          question: '2x + 1 = 5 ise x nedir?',
          options: ['1', '2', '3', '4'],
          correct_index: 1,
          question_order: 1,
          explanation: null,
          created_at: new Date().toISOString(),
        },
        quizTitle: 'Denklemler',
        savedAt: new Date().toISOString(),
        mastered: false,
        reason: 'careless' as const,
      },
    ];

    localStorage.setItem('ugur_hoca_mistakes_bank_v1', JSON.stringify(mockMistakes));

    render(
      <SmartTopicDiagnostic
        isLight={true}
        onStartRecoveryQuiz={onStartRecoveryQuiz}
      />
    );

    expect(screen.getByText(/Öncelikli Gelişim Alanı: Denklemler/i)).toBeInTheDocument();
    expect(screen.getByText(/İşlem Disiplini & Adım Takibi/i)).toBeInTheDocument();

    const recoveryBtn = screen.getByRole('button', { name: /Telafi Testini Çöz/i });
    fireEvent.click(recoveryBtn);
    expect(onStartRecoveryQuiz).toHaveBeenCalled();
  });

  it('handles reading and time mistake reasons', () => {
    const mockMistakes = [
      {
        id: 'm2',
        question: {
          id: 'q2',
          quiz_id: 'quiz2',
          question: 'Hangisi asal sayı değildir?',
          options: ['2', '3', '4', '5'],
          correct_index: 2,
          question_order: 1,
          explanation: null,
          created_at: new Date().toISOString(),
        },
        quizTitle: 'Sayılar',
        savedAt: new Date().toISOString(),
        mastered: false,
        reason: 'reading' as const,
      },
    ];

    localStorage.setItem('ugur_hoca_mistakes_bank_v1', JSON.stringify(mockMistakes));

    const { rerender } = render(<SmartTopicDiagnostic isLight={false} />);
    expect(screen.getByText(/Soru Kökü Odaklanması/i)).toBeInTheDocument();

    // Time reason
    (mockMistakes[0] as { reason: string }).reason = 'time';
    localStorage.setItem('ugur_hoca_mistakes_bank_v1', JSON.stringify(mockMistakes));
    rerender(<SmartTopicDiagnostic isLight={false} />);
  });
});
