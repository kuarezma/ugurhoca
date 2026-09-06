import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMistakeKey, mergeMistakes, syncMistakesWithCloud } from './mistakeSync';
import type { SavedMistakeQuestion } from './mistakeStorage';
import type { QuizQuestion } from '@/types/quiz';
import { supabase } from '@/lib/supabase/client';

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe('mistakeSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const mockQuestion = (id: string, text: string): QuizQuestion => ({
    id,
    quiz_id: 'quiz-1',
    question: text,
    options: ['A', 'B', 'C', 'D'],
    correct_index: 0,
    question_order: 1,
    created_at: '2026-09-01T10:00:00Z',
    explanation: 'Çözüm',
  });

  it('generates consistent mistake keys using question ID or question text', () => {
    const withId: SavedMistakeQuestion = {
      id: 'm1',
      question: mockQuestion('q123', 'Pisagor teoremi nedir?'),
      savedAt: '2026-09-01T10:00:00Z',
      mastered: false,
    };
    expect(getMistakeKey(withId)).toBe('q123');

    const withoutId: SavedMistakeQuestion = {
      id: '',
      question: {
        ...mockQuestion('', 'Hangi sayı asaldır?'),
        id: '' as unknown as string,
      },
      savedAt: '2026-09-01T10:00:00Z',
      mastered: false,
    };
    expect(getMistakeKey(withoutId)).toBe('hangi sayı asaldır?');
  });

  it('merges non-overlapping local and remote mistakes', () => {
    const local: SavedMistakeQuestion[] = [
      {
        id: 'l1',
        question: mockQuestion('q1', 'Soru 1'),
        savedAt: '2026-09-01T10:00:00Z',
        mastered: false,
      },
    ];
    const remote: SavedMistakeQuestion[] = [
      {
        id: 'r1',
        question: mockQuestion('q2', 'Soru 2'),
        savedAt: '2026-09-02T10:00:00Z',
        mastered: false,
      },
    ];

    const merged = mergeMistakes(local, remote);
    expect(merged).toHaveLength(2);
    expect(merged.map((m) => getMistakeKey(m))).toContain('q1');
    expect(merged.map((m) => getMistakeKey(m))).toContain('q2');
  });

  it('resolves conflict by keeping mastered status and newer review info', () => {
    const local: SavedMistakeQuestion[] = [
      {
        id: 'm1',
        question: mockQuestion('q1', 'Soru 1'),
        savedAt: '2026-09-01T10:00:00Z',
        mastered: false,
        reviewStage: 1,
        lastReviewedAt: '2026-09-02T10:00:00Z',
      },
    ];

    const remote: SavedMistakeQuestion[] = [
      {
        id: 'm1_remote',
        question: mockQuestion('q1', 'Soru 1'),
        savedAt: '2026-09-01T10:00:00Z',
        mastered: true, // Başka cihazda çözülüp öğrenilmiş!
        reviewStage: 3,
        lastReviewedAt: '2026-09-03T10:00:00Z',
      },
    ];

    const merged = mergeMistakes(local, remote);
    expect(merged).toHaveLength(1);
    expect(merged[0].mastered).toBe(true);
    expect(merged[0].reviewStage).toBe(3);
  });

  it('returns local mistakes when user is not authenticated', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: null,
    } as unknown as Awaited<ReturnType<typeof supabase.auth.getUser>>);

    const result = await syncMistakesWithCloud();
    expect(result.success).toBe(true);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('fetches remote mistakes, merges with local, and upserts when user is authenticated', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'user_test_123' } as unknown as { id: string } },
      error: null,
    } as unknown as Awaited<ReturnType<typeof supabase.auth.getUser>>);

    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'cloud_1',
            question_id: 'q_cloud',
            question_data: mockQuestion('q_cloud', 'Buluttan gelen soru'),
            saved_at: '2026-09-05T10:00:00Z',
            mastered: false,
            review_stage: 2,
            review_count: 1,
          },
        ],
        error: null,
      }),
    });

    const mockUpsert = vi.fn().mockResolvedValue({ error: null });

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'user_mistakes') {
        return {
          select: mockSelect,
          upsert: mockUpsert,
        } as unknown as ReturnType<typeof supabase.from>;
      }
      return {} as unknown as ReturnType<typeof supabase.from>;
    });

    const result = await syncMistakesWithCloud('user_test_123');

    expect(result.success).toBe(true);
    expect(result.count).toBe(1);
    expect(result.mistakes[0].question.question).toBe('Buluttan gelen soru');
    expect(mockUpsert).toHaveBeenCalled();
  });
});
