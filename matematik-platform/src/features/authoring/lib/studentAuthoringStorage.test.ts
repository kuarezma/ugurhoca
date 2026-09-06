import { describe, it, expect, beforeEach } from 'vitest';
import {
  getStudentAuthoredQuestions,
  saveStudentAuthoredQuestion,
  updateAuthoredQuestionStatus,
  StudentAuthoredQuestion,
} from './studentAuthoringStorage';

describe('studentAuthoringStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('varsayılan soruları döndürür', () => {
    const questions = getStudentAuthoredQuestions();
    expect(questions.length).toBeGreaterThan(0);
    expect(questions[0].studentName).toBeDefined();
  });

  it('yeni bir öğrenci sorusu kaydeder', () => {
    const newQuestion: StudentAuthoredQuestion = {
      id: 'test-q-100',
      studentId: 'user-1',
      studentName: 'Ayşe Yıldız',
      grade: '8',
      topic: 'Üslü İfadeler',
      questionText: '2^10 un yarısı kaçtır?',
      options: ['2^5', '2^9', '1^10', '2^8'],
      correctIndex: 1,
      distractorExplanations: {
        0: 'Üssü ikiye böldün, oysa tabanlar eşitken üsler çıkarılır!',
        2: 'Tabanı ikiye böldün.',
        3: 'Yanlış işlem yaptın.',
      },
      solutionExplanation: '2^10 / 2^1 = 2^(10-1) = 2^9 dur.',
      difficulty: 'Kolay',
      status: 'pending',
      createdAt: '2026-09-06T10:00:00.000Z',
    };

    const saved = saveStudentAuthoredQuestion(newQuestion);
    expect(saved).toBe(true);

    const all = getStudentAuthoredQuestions();
    expect(all[0].id).toBe('test-q-100');
    expect(all[0].topic).toBe('Üslü İfadeler');
  });

  it('soru durumunu onaylandı olarak günceller ve geri bildirim ekler', () => {
    const questions = getStudentAuthoredQuestions();
    const targetId = questions[0].id;

    const updated = updateAuthoredQuestionStatus(targetId, 'approved', 'Tebrikler, soru havuza alındı!');
    expect(updated).toBe(true);

    const updatedList = getStudentAuthoredQuestions();
    const found = updatedList.find((q) => q.id === targetId);
    expect(found?.status).toBe('approved');
    expect(found?.teacherFeedback).toBe('Tebrikler, soru havuza alındı!');
  });
});
