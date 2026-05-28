import { POST } from '@/app/api/live-lessons/[lessonId]/join/route';
import { createServiceRoleClient } from '@/lib/supabase/server';
import {
  canUserAccessLiveLesson,
  isLiveLessonAdmin,
  requireLiveLessonUser,
} from '@/features/live-lessons/server/liveLessons';

vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: vi.fn(),
}));

vi.mock('@/features/live-lessons/server/liveLessons', () => ({
  canUserAccessLiveLesson: vi.fn(),
  isLiveLessonAdmin: vi.fn(),
  requireLiveLessonUser: vi.fn(),
}));

const studentUser = {
  email: 'ogrenci@example.com',
  grade: 7,
  id: 'a9862dcf-93c8-4927-8e0a-9c48c7dc3d49',
  isAdmin: false,
  name: 'Öğrenci',
};

type PreviousParticipantRow = {
  mic_permission: 'allowed' | 'requested' | 'blocked' | null;
  microphone_allowed: boolean | null;
  muted_by_teacher: boolean | null;
} | null;

function mockSupabaseForJoin({
  lessonStatus = 'active',
  previous,
}: {
  lessonStatus?: 'active' | 'scheduled' | 'ended' | 'cancelled';
  previous: PreviousParticipantRow;
}) {
  const lessonSingle = vi.fn().mockResolvedValue({
    data: {
      id: 'lesson-1',
      room_id: 'room1234',
      status: lessonStatus,
      target_grade: '7',
    },
    error: null,
  });
  const lessonEq = vi.fn().mockReturnValue({ single: lessonSingle });
  const lessonSelect = vi.fn().mockReturnValue({ eq: lessonEq });

  const participantMaybeSingle = vi.fn().mockResolvedValue({ data: previous });
  const participantLimit = vi.fn().mockReturnValue({ maybeSingle: participantMaybeSingle });
  const participantOrder = vi.fn().mockReturnValue({ limit: participantLimit });
  const participantEqIdentity = vi.fn().mockReturnValue({ order: participantOrder });
  const participantEqLesson = vi.fn().mockReturnValue({ eq: participantEqIdentity });
  const participantSelect = vi.fn().mockReturnValue({ eq: participantEqLesson });
  const participantInsert = vi.fn().mockResolvedValue({ data: null, error: null });

  const lessonUpdate = vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ data: null, error: null }),
  });

  vi.mocked(createServiceRoleClient).mockReturnValue({
    from: vi.fn((table: string) => {
      if (table === 'live_lessons') {
        return { select: lessonSelect, update: lessonUpdate };
      }
      if (table === 'live_lesson_participants') {
        return { select: participantSelect, insert: participantInsert };
      }
      return {};
    }),
  } as never);

  return { participantInsert };
}

function postJoin() {
  return POST(new Request('http://localhost/api/live-lessons/lesson-1/join', { method: 'POST' }), {
    params: Promise.resolve({ lessonId: 'lesson-1' }),
  });
}

describe('POST /api/live-lessons/[lessonId]/join', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(canUserAccessLiveLesson).mockReturnValue(true);
    vi.mocked(isLiveLessonAdmin).mockReturnValue(false);
    vi.mocked(requireLiveLessonUser).mockResolvedValue({
      accessToken: 'token',
      ok: true,
      user: studentUser,
    });
  });

  it('inserts a new participant row as blocked when no prior session exists', async () => {
    const { participantInsert } = mockSupabaseForJoin({ previous: null });

    const response = await postJoin();
    expect(response.status).toBe(200);
    expect(participantInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        mic_permission: 'blocked',
        microphone_allowed: false,
        muted_by_teacher: true,
        role: 'student',
      }),
    );
  });

  it('preserves an allowed microphone permission across reconnects', async () => {
    const { participantInsert } = mockSupabaseForJoin({
      previous: {
        mic_permission: 'allowed',
        microphone_allowed: true,
        muted_by_teacher: false,
      },
    });

    const response = await postJoin();
    expect(response.status).toBe(200);
    expect(participantInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        mic_permission: 'allowed',
        microphone_allowed: true,
        muted_by_teacher: false,
      }),
    );
  });

  it('does not auto-restore microphone when the teacher had muted the student', async () => {
    const { participantInsert } = mockSupabaseForJoin({
      previous: {
        mic_permission: 'allowed',
        microphone_allowed: true,
        muted_by_teacher: true,
      },
    });

    const response = await postJoin();
    expect(response.status).toBe(200);
    expect(participantInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        mic_permission: 'blocked',
        microphone_allowed: false,
        muted_by_teacher: true,
      }),
    );
  });
});
