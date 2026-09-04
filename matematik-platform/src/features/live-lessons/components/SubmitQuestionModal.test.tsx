import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SubmitQuestionModal } from './SubmitQuestionModal';
import { TeacherQuestionPoolModal } from './TeacherQuestionPoolModal';
import { submitStudentQuestion } from '../lib/studentQuestionsStorage';

describe('Live Lesson Question Pool Components', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('submits a question via SubmitQuestionModal', () => {
    const onClose = vi.fn();

    render(
      <SubmitQuestionModal
        isOpen={true}
        onClose={onClose}
        isLight={false}
      />
    );

    expect(screen.getByText('Canlı Derse Soru Gönder')).toBeInTheDocument();

    const topicInput = screen.getByPlaceholderText(/Örn: Fonksiyon Grafiği/i);
    const textarea = screen.getByPlaceholderText(/Sorunun tamamını veya takıldığın yeri/i);

    fireEvent.change(topicInput, { target: { value: 'Trigonometri' } });
    fireEvent.change(textarea, { target: { value: 'sin^2(x) + cos^2(x) = 1 ispatı nedir?' } });

    const submitBtn = screen.getByRole('button', { name: /Soruyu Derse Gönder/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Sorun Canlı Ders Havuzuna Eklendi!')).toBeInTheDocument();
  });

  it('renders and manages questions via TeacherQuestionPoolModal', () => {
    submitStudentQuestion({
      student_name: 'Zeynep B.',
      topic: 'Parabol',
      difficulty: 'Zor',
      question_text: 'f(x) = x^2 - 4x + 3 tepe noktası nedir?',
    });

    const onClose = vi.fn();
    const onProject = vi.fn();

    render(
      <TeacherQuestionPoolModal
        isOpen={true}
        onClose={onClose}
        onProjectQuestion={onProject}
      />
    );

    expect(screen.getByText('Öğrenci Soru Havuzu Masası')).toBeInTheDocument();
    expect(screen.getByText(/Zeynep B\./i)).toBeInTheDocument();
    expect(screen.getByText(/f\(x\) = x\^2 - 4x \+ 3/i)).toBeInTheDocument();

    // Project button
    const projectBtn = screen.getByRole('button', { name: /Tahtaya Yansıt/i });
    fireEvent.click(projectBtn);
    expect(onProject).toHaveBeenCalled();

    // Resolve button
    const resolveBtn = screen.getByRole('button', { name: /Çözüldü/i });
    fireEvent.click(resolveBtn);

    // Filter
    const resolvedFilterBtn = screen.getByRole('button', { name: 'Çözülenler' });
    fireEvent.click(resolvedFilterBtn);
  });
});
