import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import TestsPage from './TestsPage';
import { saveQuizDraft } from '@/features/quizzes/lib/quizDraftStorage';
import { getDailyGoal } from '@/lib/dailyGoalStorage';
import { getSavedMistakes } from '@/features/quizzes/lib/mistakeStorage';
import type { Quiz, QuizQuestion } from '@/types/quiz';

const mocks = vi.hoisted(() => ({
  insert: vi.fn(),
  showToast: vi.fn(),
  questions: [] as QuizQuestion[],
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ showToast: mocks.showToast }),
}));
vi.mock('@/features/quizzes/lib/mistakeSync', () => ({
  syncMistakesWithCloud: vi
    .fn()
    .mockResolvedValue({ success: true, count: 0, mistakes: [] }),
}));
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      getSession: vi
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null }),
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          order: () =>
            Promise.resolve({
              data: table === 'quiz_questions' ? mocks.questions : [],
              error: null,
            }),
        }),
      }),
      insert: mocks.insert,
    }),
  },
}));

const quiz: Quiz = {
  id: 'quiz-1',
  title: 'Test',
  description: null,
  grade: 8,
  time_limit: 10,
  difficulty: 'Orta',
  is_active: true,
  created_at: '',
  updated_at: '',
};
const user = {
  id: 'user-a',
  name: 'Öğrenci',
  email: 'student@example.com',
  grade: 8,
  isAdmin: false,
};
const mountResumedQuiz = async (timeLeft = 600) => {
  saveQuizDraft({
    quizId: quiz.id,
    quizTitle: quiz.title,
    currentQuestion: 1,
    answers: { 0: 0 },
    flaggedQuestions: [],
    questionTimes: {},
    startTime: Date.now() - 10000,
    timeLeft,
  });
  render(<TestsPage initialQuizzes={[quiz]} initialUser={user} isHydrated />);
  await act(async () => {
    fireEvent.click(
      screen.getByRole('button', { name: 'Kaldığım Yerden Devam Et' }),
    );
  });
  await screen.findByText('İkinci soru', {}, { timeout: 10000 });
};
const finishTwice = () =>
  act(() => {
    // Aynı React turunda iki bitirme olayı: ör. çift tuş/teslim ile süre sonunun çakışması.
    fireEvent.keyDown(window, { key: 'Enter' });
    fireEvent.keyDown(window, { key: 'Enter' });
  });

describe('quiz completion and offline ownership', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mocks.insert.mockResolvedValue({ error: null });
    mocks.questions = [
      {
        id: 'q1',
        quiz_id: quiz.id,
        question: 'İlk soru',
        options: ['1', '2'],
        correct_index: 1,
        question_order: 1,
        explanation: null,
        created_at: '',
      },
      {
        id: 'q2',
        quiz_id: quiz.id,
        question: 'İkinci soru',
        options: ['1', '2'],
        correct_index: 1,
        question_order: 2,
        explanation: null,
        created_at: '',
      },
    ];
  });

  it('Mezun öğrenciye integer 0 hedefli testi gösterir', async () => {
    render(<TestsPage initialUser={{ ...user, grade: 'Mezun' }} initialQuizzes={[{ ...quiz, grade: 0, title: 'Mezun denemesi' }]} isHydrated />);
    expect(await screen.findByText('Mezun denemesi')).toBeInTheDocument();
  });

  it('counts a completed quiz only once when two finish events arrive together', async () => {
    await mountResumedQuiz();
    finishTwice();
    await waitFor(() => expect(mocks.insert).toHaveBeenCalledTimes(1));
    expect(getDailyGoal(user.id).solved).toBe(2);
  });

  it('adds only answered mistakes to the notebook', async () => {
    await mountResumedQuiz();
    finishTwice();
    await waitFor(() => expect(mocks.insert).toHaveBeenCalled());
    expect(getSavedMistakes(user.id).map((m) => m.question.id)).toEqual(['q1']);
  });

  it('keeps the lock after a failed remote save queues the result locally', async () => {
    mocks.insert.mockResolvedValue({ error: new Error('offline') });
    await mountResumedQuiz();
    finishTwice();
    await waitFor(() =>
      expect(mocks.showToast).toHaveBeenCalledWith(
        'info',
        expect.stringContaining('yerel hafızaya'),
      ),
    );
    expect(mocks.insert).toHaveBeenCalledTimes(1);
    expect(getDailyGoal(user.id).solved).toBe(2);
    expect(
      JSON.parse(
        localStorage.getItem('ugurhoca_pending_quiz_results:user-a') || '[]',
      ),
    ).toHaveLength(1);
    expect(localStorage.getItem('ugurhoca_pending_quiz_results')).toBeNull();
  });

  it('does not flush another user’s queued results on reconnect', async () => {
    localStorage.setItem('ugurhoca_user_storage_migrated_v1', 'true');
    localStorage.setItem(
      'ugurhoca_pending_quiz_results:user-a',
      '[{"user_id":"user-a"}]',
    );
    render(
      <TestsPage
        initialQuizzes={[quiz]}
        initialUser={{ ...user, id: 'user-b' }}
        isHydrated
      />,
    );
    await act(async () => {
      fireEvent(window, new Event('online'));
    });
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(
      localStorage.getItem('ugurhoca_pending_quiz_results:user-a'),
    ).not.toBeNull();
  });

  it('flushes only the current user’s results even in a mixed legacy queue', async () => {
    localStorage.setItem(
      'ugurhoca_pending_quiz_results',
      '[{"user_id":"user-a"},{"user_id":"user-b"}]',
    );
    render(<TestsPage initialQuizzes={[quiz]} initialUser={user} isHydrated />);
    await act(async () => {
      fireEvent(window, new Event('online'));
    });
    expect(mocks.insert).toHaveBeenCalledWith([{ user_id: 'user-a' }]);
  });
  it('clears the draft on timeout even if the remote result save fails', async () => {
    mocks.insert.mockResolvedValue({ error: new Error('offline') });
    await mountResumedQuiz(1);
    await screen.findByText('Test Tamamlandı!', {}, { timeout: 3000 });
    await waitFor(() =>
      expect(mocks.showToast).toHaveBeenCalledWith(
        'info',
        expect.stringContaining('yerel hafızaya'),
      ),
    );
    expect(
      localStorage.getItem('ugurhoca_quiz_draft_quiz-1:user-a'),
    ).toBeNull();
    expect(
      localStorage.getItem('ugurhoca_active_draft_quiz_id:user-a'),
    ).toBeNull();
    expect(mocks.insert).toHaveBeenCalledTimes(1);
  });

  it('preserves results added while reconnect is uploading and prevents overlapping flushes', async () => {
    localStorage.setItem('ugurhoca_user_storage_migrated_v1', 'true');
    const key = 'ugurhoca_pending_quiz_results:user-a';
    const first = { user_id: 'user-a', quiz_id: 'old' };
    const added = { user_id: 'user-a', quiz_id: 'new' };
    localStorage.setItem(key, JSON.stringify([first]));
    let resolveInsert!: (value: { error: null }) => void;
    mocks.insert.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveInsert = resolve;
        }),
    );
    render(<TestsPage initialQuizzes={[quiz]} initialUser={user} isHydrated />);
    act(() => {
      fireEvent(window, new Event('online'));
      fireEvent(window, new Event('online'));
    });
    expect(mocks.insert).toHaveBeenCalledTimes(1);
    localStorage.setItem(key, JSON.stringify([first, added]));
    await act(async () => {
      resolveInsert({ error: null });
    });
    expect(JSON.parse(localStorage.getItem(key) || '[]')).toEqual([added]);
  });
});
