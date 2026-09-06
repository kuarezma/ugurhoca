import { describe, it, expect } from 'vitest';
import { calculateItemAnalysis, type StudentQuizSubmission } from './itemAnalysis';

describe('itemAnalysis', () => {
  const mockQuestions = [
    { id: 'q1', question: 'Üslü sayılar sorusu 1', correct_index: 0 },
    { id: 'q2', question: 'Köklü sayılar sorusu 2', correct_index: 1 },
    { id: 'q3', question: 'Ters / hatalı soru 3', correct_index: 2 },
  ];

  it('handles empty submissions gracefully', () => {
    const report = calculateItemAnalysis(mockQuestions, []);
    expect(report.totalSubmissions).toBe(0);
    expect(report.items).toHaveLength(0);
  });

  it('accurately computes p-value difficulty and discrimination index D', () => {
    // 10 öğrenci simülasyonu
    // Öğrenci 1-3: Yüksek puanlı öğrenciler (Q1 doğru, Q2 doğru, Q3 yanlış)
    // Öğrenci 4-7: Orta puanlı öğrenciler
    // Öğrenci 8-10: Düşük puanlı öğrenciler (Q1 yanlış, Q2 yanlış, Q3 doğru - ters ayırt edicilik)
    const submissions: StudentQuizSubmission[] = [
      { studentId: 's1', totalScore: 100, answers: { q1: 0, q2: 1, q3: 0 } },
      { studentId: 's2', totalScore: 90, answers: { q1: 0, q2: 1, q3: 1 } },
      { studentId: 's3', totalScore: 85, answers: { q1: 0, q2: 1, q3: 1 } },
      { studentId: 's4', totalScore: 60, answers: { q1: 0, q2: 0, q3: 3 } },
      { studentId: 's5', totalScore: 55, answers: { q1: 0, q2: 2, q3: 0 } },
      { studentId: 's6', totalScore: 50, answers: { q1: 1, q2: 1, q3: 2 } },
      { studentId: 's7', totalScore: 45, answers: { q1: 2, q2: 3, q3: 2 } },
      { studentId: 's8', totalScore: 30, answers: { q1: 3, q2: 0, q3: 2 } },
      { studentId: 's9', totalScore: 20, answers: { q1: 2, q2: 0, q3: 2 } },
      { studentId: 's10', totalScore: 10, answers: { q1: 1, q2: 0, q3: 2 } },
    ];

    const report = calculateItemAnalysis(mockQuestions, submissions, 'quiz-lgs-1');

    expect(report.totalSubmissions).toBe(10);
    expect(report.items).toHaveLength(3);

    // Q1: Çoğunluk doğru yapmış (5/10 = 0.50), üst grup full doğru -> Yüksek ayırt edicilik
    const q1 = report.items[0];
    expect(q1.difficultyIndex).toBe(0.5);
    expect(q1.discriminationIndex).toBeGreaterThan(0.3);
    expect(q1.isProblematic).toBe(false);

    // Q3: Başarılı öğrencilerin hiçbiri doğru yapmamış (0/3), en zayıf öğrenciler doğru yapmış (3/3)
    // Bu soru negatif/ters ayırt ediciliğe sahip olmalıdır!
    const q3 = report.items[2];
    expect(q3.discriminationIndex).toBeLessThan(0);
    expect(q3.discriminationLabel).toBe('Kötü / Hatalı Soru');
    expect(q3.isProblematic).toBe(true);
    expect(q3.recommendation).toContain('TERS AYIRT EDİCİLİK');
  });
});
