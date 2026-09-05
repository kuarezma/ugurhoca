import { describe, it, expect, beforeEach } from 'vitest';
import {
  getStudentQuestions,
  submitStudentQuestion,
  updateStudentQuestionStatus,
  deleteStudentQuestion,
} from './studentQuestionsStorage';

describe('studentQuestionsStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('submits a student question and retrieves it', () => {
    const q = submitStudentQuestion({
      student_name: 'Ahmet Y.',
      topic: 'Üçgenler',
      difficulty: 'Orta',
      question_text: 'ABC üçgeninde hipotenüs kaç cm?',
    });

    expect(q.id).toBeDefined();
    expect(q.status).toBe('pending');

    const all = getStudentQuestions();
    expect(all).toHaveLength(1);
    expect(all[0].question_text).toBe('ABC üçgeninde hipotenüs kaç cm?');
  });

  it('updates question status', () => {
    const q = submitStudentQuestion({
      student_name: 'Zeynep K.',
      topic: 'Fonksiyonlar',
      difficulty: 'Zor',
      question_text: 'f(x) = 2x+1 grafiği orijinden geçer mi?',
    });

    const updated = updateStudentQuestionStatus(q.id, 'resolved');
    expect(updated).toBe(true);

    const all = getStudentQuestions();
    expect(all[0].status).toBe('resolved');
  });

  it('deletes a student question', () => {
    const q = submitStudentQuestion({
      student_name: 'Mehmet B.',
      topic: 'Olasılık',
      difficulty: 'Kolay',
      question_text: 'Zar atıldığında tek sayı gelme olasılığı?',
    });

    expect(getStudentQuestions()).toHaveLength(1);
    deleteStudentQuestion(q.id);
    expect(getStudentQuestions()).toHaveLength(0);
  });

  it('self-heals when storage contains non-array or invalid JSON', () => {
    localStorage.setItem('ugur_hoca_live_questions_pool_v1', '{"invalid": true}');
    expect(getStudentQuestions()).toEqual([]);
    expect(localStorage.getItem('ugur_hoca_live_questions_pool_v1')).toBeNull();

    localStorage.setItem('ugur_hoca_live_questions_pool_v1', 'broken json {{{{');
    expect(getStudentQuestions()).toEqual([]);
  });
});
