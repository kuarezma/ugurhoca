import { POST } from '@/app/api/import-questions/route';
import { insertQuizWithQuestions } from '@/features/quizzes/server/importQuiz';
import { createServiceRoleClient } from '@/lib/supabase/server';

vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: vi.fn(),
}));

vi.mock('@/features/quizzes/server/importQuiz', () => ({
  insertQuizWithQuestions: vi.fn(),
}));

describe('POST /api/import-questions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 for an invalid quiz payload', async () => {
    const response = await POST(
      new Request('http://localhost/api/import-questions', {
        body: JSON.stringify({ meta: {}, questions: [] }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'invalid_quiz_payload',
        message: 'Invalid option: expected one of "Kolay"|"Orta"|"Zor"',
      },
    });
  });

  it('imports questions through the quiz service', async () => {
    const supabaseClient = { kind: 'service' };
    const payload = {
      meta: {
        difficulty: 'Kolay',
        grade: 8,
        time_limit: 20,
        title: 'Denklem Testi',
      },
      questions: [
        {
          correct_index: 2,
          options: ['1', '2', '3', '4'],
          question: '1 + 2 = ?',
        },
      ],
    };
    const result = {
      inserted: 1,
      quiz_id: 'quiz-1',
      quiz_title: 'Denklem Testi',
      success: true,
    };

    vi.mocked(createServiceRoleClient).mockReturnValue(
      supabaseClient as never,
    );
    vi.mocked(insertQuizWithQuestions).mockResolvedValue(result);

    const response = await POST(
      new Request('http://localhost/api/import-questions', {
        body: JSON.stringify(payload),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      }),
    );

    expect(response.status).toBe(200);
    expect(insertQuizWithQuestions).toHaveBeenCalledWith(
      supabaseClient,
      {
        ...payload,
        meta: {
          ...payload.meta,
          description: '',
        },
        questions: payload.questions.map((question) => ({
          ...question,
          explanation: '',
        })),
      },
    );
    await expect(response.json()).resolves.toEqual({ data: result });
  });
});
