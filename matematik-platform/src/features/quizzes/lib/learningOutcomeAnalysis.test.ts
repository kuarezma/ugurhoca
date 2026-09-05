import { describe, expect, it } from 'vitest';
import {
  analyzeQuizLearningOutcomes,
  detectTopicFromText,
} from './learningOutcomeAnalysis';
import type { QuizQuestion } from '@/types/quiz';

describe('learningOutcomeAnalysis', () => {
  it('detects correct topic from keywords and title', () => {
    expect(detectTopicFromText('8. Sınıf Üslü İfadeler Denemesi', 8)).toBe('Üslü İfadeler');
    expect(detectTopicFromText('Kareköklü sayılarda toplama', 8)).toBe('Kareköklü İfadeler');
    expect(detectTopicFromText('EBOB ve EKOK problemleri', 8)).toBe('Çarpanlar ve Katlar');
    expect(detectTopicFromText('Rastgele bir soru', 8)).toBe('Çarpanlar ve Katlar');
  });

  it('correctly aggregates outcomes and generates remediation links', () => {
    const questions: QuizQuestion[] = [
      {
        id: 'q1',
        quiz_id: 'test',
        question: 'Üslü soru 1',
        options: ['A', 'B', 'C', 'D'],
        correct_index: 0,
        explanation: 'Üslü ifadeler',
        question_order: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: 'q2',
        quiz_id: 'test',
        question: 'Üslü soru 2',
        options: ['A', 'B', 'C', 'D'],
        correct_index: 1,
        explanation: 'Üslü ifadeler',
        question_order: 2,
        created_at: new Date().toISOString(),
      },
    ];

    // User got q1 wrong (selected 2), q2 correct (selected 1) -> 50% accuracy
    const result = analyzeQuizLearningOutcomes({
      questions,
      answers: { 0: 2, 1: 1 },
      quizTitle: 'Üslü İfadeler Testi',
      grade: 8,
    });

    expect(result.totalQuestions).toBe(2);
    expect(result.correctCount).toBe(1);
    expect(result.wrongCount).toBe(1);
    expect(result.overallAccuracy).toBe(50);
    expect(result.items.length).toBe(1);
    expect(result.items[0]?.topic).toBe('Üslü İfadeler');
    expect(result.items[0]?.status).toBe('developing');
    expect(result.items[0]?.worksheetHref).toContain('/icerikler?type=yaprak-test');
  });
});
