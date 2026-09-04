import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminQuizzesTab from './AdminQuizzesTab';
import type { AdminQuiz } from '@/features/admin/types';

describe('AdminQuizzesTab', () => {
  const mockQuiz: AdminQuiz = {
    id: 'quiz-1',
    title: '8. Sınıf Üslü Sayılar',
    description: 'Yeni nesil LGS denemesi',
    difficulty: 'orta',
    grade: 8,
    time_limit: 30,
    is_active: true,
    created_at: new Date().toISOString(),
  };

  it('renders quizzes list and triggers print worksheet when clicked', () => {
    const onPrintWorksheet = vi.fn();

    render(
      <AdminQuizzesTab
        onAddQuestion={vi.fn()}
        onDeleteQuiz={vi.fn()}
        onEditQuiz={vi.fn()}
        onPrintWorksheet={onPrintWorksheet}
        quizzes={[mockQuiz]}
      />,
    );

    expect(screen.getByText('8. Sınıf Üslü Sayılar')).toBeInTheDocument();

    const printBtn = screen.getByTitle('A4 Yaprak Test Yazdır / İndir');
    fireEvent.click(printBtn);
    expect(onPrintWorksheet).toHaveBeenCalledWith(mockQuiz);
  });
});
