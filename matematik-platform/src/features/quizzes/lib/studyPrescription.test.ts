import { describe, it, expect } from 'vitest';
import { generateStudyPrescription } from './studyPrescription';
import type { SavedMistakeQuestion } from './mistakeStorage';

describe('studyPrescription utility', () => {
  it('hata listesi boşsa null döner', () => {
    expect(generateStudyPrescription([])).toBeNull();
  });

  it('bekleyen hataları analiz edip en çok zorlanılan konudan reçete üretir', () => {
    const dummyMistakes: SavedMistakeQuestion[] = [
      {
        id: 'm-1',
        mastered: false,
        quizTitle: 'Üslü İfadeler Test 1',
        reason: 'concept',
        savedAt: new Date().toISOString(),
        question: {
          id: 'q-1',
          quiz_id: 'quiz-1',
          question: '2^3 kaçtır?',
          options: ['6', '8', '9', '12'],
          correct_index: 1,
          question_order: 1,
          explanation: null,
          created_at: new Date().toISOString(),
        },
      },
      {
        id: 'm-2',
        mastered: false,
        quizTitle: 'Üslü İfadeler Test 1',
        reason: 'concept',
        savedAt: new Date().toISOString(),
        question: {
          id: 'q-2',
          quiz_id: 'quiz-1',
          question: '3^2 kaçtır?',
          options: ['6', '9', '12', '15'],
          correct_index: 1,
          question_order: 2,
          explanation: null,
          created_at: new Date().toISOString(),
        },
      },
      {
        id: 'm-3',
        mastered: false,
        quizTitle: 'Çarpanlar ve Katlar',
        reason: 'careless',
        savedAt: new Date().toISOString(),
        question: {
          id: 'q-3',
          quiz_id: 'quiz-2',
          question: '12 ve 18 in EBOB u kaçtır?',
          options: ['2', '3', '6', '9'],
          correct_index: 2,
          question_order: 1,
          explanation: null,
          created_at: new Date().toISOString(),
        },
      },
    ];

    const rx = generateStudyPrescription(dummyMistakes);
    expect(rx).not.toBeNull();
    expect(rx?.focusTopic).toBe('Üslü İfadeler Test 1');
    expect(rx?.recommendedQuestions.length).toBe(2);
    expect(rx?.weaknessType).toBe('Kural Eksikliği');
    expect(rx?.actionTip).toContain('Üslü sayılarda');
  });
});
