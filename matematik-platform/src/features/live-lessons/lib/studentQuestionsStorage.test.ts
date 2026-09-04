import { describe, expect, it, beforeEach } from 'vitest';
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

  it('submits, retrieves, updates and deletes questions', () => {
    expect(getStudentQuestions()).toHaveLength(0);

    const question = submitStudentQuestion({
      student_name: 'Ahmet Y.',
      lesson_id: 'lesson_123',
      topic: 'Trigonometri',
      difficulty: 'Orta',
      question_text: 'sin(x) + cos(x) = 1 ise tan(x) kaçtır?',
    });

    expect(question.id).toBeDefined();
    expect(question.status).toBe('pending');
    expect(getStudentQuestions()).toHaveLength(1);
    expect(getStudentQuestions('lesson_123')).toHaveLength(1);
    expect(getStudentQuestions('other_lesson')).toHaveLength(0);

    // Update status
    updateStudentQuestionStatus(question.id, 'projected');
    const updatedList = getStudentQuestions();
    expect(updatedList[0].status).toBe('projected');

    // Delete
    deleteStudentQuestion(question.id);
    expect(getStudentQuestions()).toHaveLength(0);
  });
});
