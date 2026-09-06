import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TestsPage from './TestsPage';
import * as draftStorage from '@/features/quizzes/lib/quizDraftStorage';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    }),
  },
}));

vi.mock('@/features/quizzes/lib/mistakeSync', () => ({
  syncMistakesWithCloud: vi.fn().mockResolvedValue({ success: true, count: 0, mistakes: [] }),
}));

describe('TestsPage State Recovery (Kesinti Koruması)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders recovery banner when active draft exists and allows resuming or discarding', () => {
    const mockDraft: draftStorage.QuizDraft = {
      quizId: 'quiz-101',
      quizTitle: 'LGS Matematik Deneme 1',
      currentQuestion: 4,
      answers: { 0: 1, 1: 2, 2: 0, 3: 3 },
      flaggedQuestions: [2],
      questionTimes: { 0: 30, 1: 40 },
      startTime: Date.now() - 120000,
      timeLeft: 1200,
      savedAt: Date.now() - 10000,
    };

    vi.spyOn(draftStorage, 'getActiveQuizDraft').mockReturnValue(mockDraft);
    const clearDraftSpy = vi.spyOn(draftStorage, 'clearQuizDraft');

    render(
      <TestsPage
        initialQuizzes={[
          {
            id: 'quiz-101',
            title: 'LGS Matematik Deneme 1',
            description: 'Açıklama',
            difficulty: 'Orta',
            grade: 8,
            time_limit: 40,
            is_active: true,
            created_at: '2026-09-01',
            updated_at: '2026-09-01',
          },
        ]}
        initialUser={{ id: 'test_user', name: 'Ali', email: 'ali@example.com', grade: 8, isAdmin: false }}
        isHydrated={true}
      />
    );

    // Banner görünür olmalı
    expect(screen.getByText('Yarım Kalan Sınavınız Bulundu')).toBeInTheDocument();
    expect(screen.getByText('Kesinti Koruması Aktif')).toBeInTheDocument();
    expect(screen.getByText(/5\. soruda kalmıştınız/i)).toBeInTheDocument();

    // "Taslağı Sil" tıklandığında taslak temizlenmeli
    const discardBtn = screen.getByRole('button', { name: 'Taslağı Sil' });
    fireEvent.click(discardBtn);

    expect(clearDraftSpy).toHaveBeenCalledWith('quiz-101');
    expect(screen.queryByText('Yarım Kalan Sınavınız Bulundu')).not.toBeInTheDocument();
  });
});
