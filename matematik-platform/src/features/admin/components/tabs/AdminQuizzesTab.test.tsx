import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { supabase } from '@/lib/supabase/client';
import AdminQuizzesTab from './AdminQuizzesTab';
import type { AdminQuiz } from '@/features/admin/types';

vi.mock('@/lib/supabase/client', () => ({ supabase: { from: vi.fn() } }));

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

  it('renders quizzes list and triggers print worksheet when clicked', async () => {
    const onPrintWorksheet = vi.fn();
    const query = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({ data: [mockQuiz], count: 1, error: null }),
    };
    vi.mocked(supabase.from).mockReturnValue(query as never);

    render(
      <AdminQuizzesTab
        onAddQuestion={vi.fn()}
        onDeleteQuiz={vi.fn()}
        onEditQuiz={vi.fn()}
        onPrintWorksheet={onPrintWorksheet}
        quizzes={[mockQuiz]}
      />,
    );

    expect(await screen.findByText('8. Sınıf Üslü Sayılar')).toBeInTheDocument();

    const printBtn = screen.getByTitle('A4 Yaprak Test Yazdır / İndir');
    fireEvent.click(printBtn);
    expect(onPrintWorksheet).toHaveBeenCalledWith(mockQuiz);
  });
});
