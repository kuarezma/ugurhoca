import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';
import { loadActiveLiveLessonForCurrentUser } from '@/features/live-lessons/server/liveLessons';

vi.mock('@/features/live-lessons/server/liveLessons', () => ({
  loadActiveLiveLessonForCurrentUser: vi.fn(),
}));

describe('GET /api/live-lessons/active', () => {
  beforeEach(() => vi.clearAllMocks());

  it('yetkili yükleyiciyi kullanır ve yalnızca rozet verisini döndürür', async () => {
    vi.mocked(loadActiveLiveLessonForCurrentUser).mockResolvedValue({
      room_id: 'room-1',
      title: 'Ders',
      teacher_proof: 'private',
      target_student_ids: ['private'],
    } as never);
    const response = await GET();
    expect(loadActiveLiveLessonForCurrentUser).toHaveBeenCalledOnce();
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.json()).toEqual({
      lesson: { room_id: 'room-1', title: 'Ders' },
    });
  });

  it('oturum veya uygun ders yoksa boş sonuç döndürür', async () => {
    vi.mocked(loadActiveLiveLessonForCurrentUser).mockResolvedValue(null);
    expect(await (await GET()).json()).toEqual({ lesson: null });
  });
});
