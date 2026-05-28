import { GET, POST } from '@/app/api/live-lessons/[lessonId]/microphone/route';
import { createServiceRoleClient } from '@/lib/supabase/server';
import {
  canUserAccessLiveLesson,
  isLiveLessonAdmin,
  requireLiveLessonUser,
} from '@/features/live-lessons/server/liveLessons';
import { buildLiveLessonIdentity } from '@/features/live-lessons/lib/participant-identity';
import {
  sendLiveLessonRoomMessage,
  setStudentMicrophonePublishPermission,
} from '@/features/live-lessons/server/livekit-permissions';

vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: vi.fn(),
}));

vi.mock('@/features/live-lessons/server/liveLessons', () => ({
  canUserAccessLiveLesson: vi.fn(),
  isLiveLessonAdmin: vi.fn(),
  requireLiveLessonUser: vi.fn(),
}));

vi.mock('@/features/live-lessons/server/livekit-permissions', () => ({
  muteParticipantMicrophoneTracks: vi.fn(),
  sendLiveLessonRoomMessage: vi.fn().mockResolvedValue(undefined),
  setStudentMicrophonePublishPermission: vi.fn().mockResolvedValue(undefined),
}));

const lesson = {
  id: 'lesson-1',
  room_id: 'room1234',
  status: 'active',
  target_grade: '7',
};

const teacherUser = {
  email: 'ugur@example.com',
  grade: 7,
  id: '11111111-1111-4111-8111-111111111111',
  isAdmin: true,
  name: 'Uğur Hoca',
};

const studentUser = {
  email: 'ogrenci@example.com',
  grade: 7,
  id: 'a9862dcf-93c8-4927-8e0a-9c48c7dc3d49',
  isAdmin: false,
  name: 'Öğrenci',
};

function createUpdateChain() {
  const is = vi.fn().mockResolvedValue({ data: null, error: null });
  const secondEq = vi.fn().mockReturnValue({ is });
  const firstEq = vi.fn().mockReturnValue({ eq: secondEq });
  const update = vi.fn().mockReturnValue({ eq: firstEq });

  return { firstEq, is, secondEq, update };
}

function mockSupabase() {
  const lessonSingle = vi.fn().mockResolvedValue({ data: lesson, error: null });
  const lessonEq = vi.fn().mockReturnValue({ single: lessonSingle });
  const lessonSelect = vi.fn().mockReturnValue({ eq: lessonEq });
  const participantUpdate = createUpdateChain();
  const eventInsert = vi.fn().mockResolvedValue({ data: null, error: null });
  const from = vi.fn((table: string) => {
    if (table === 'live_lessons') return { select: lessonSelect };
    if (table === 'live_lesson_participants') {
      return { update: participantUpdate.update };
    }
    if (table === 'live_lesson_events') return { insert: eventInsert };
    return {};
  });

  vi.mocked(createServiceRoleClient).mockReturnValue({ from } as never);

  return { eventInsert, from, participantUpdate };
}

function postMicrophone(body: unknown) {
  return POST(
    new Request('http://localhost/api/live-lessons/lesson-1/microphone', {
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    }),
    { params: Promise.resolve({ lessonId: 'lesson-1' }) },
  );
}

type ParticipantStateRow = {
  mic_permission: 'allowed' | 'requested' | 'blocked' | null;
  microphone_allowed: boolean | null;
  muted_by_teacher: boolean | null;
};

function mockParticipantStateLookup(row: ParticipantStateRow | null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: row, error: null });
  const limit = vi.fn().mockReturnValue({ maybeSingle });
  const order = vi.fn().mockReturnValue({ limit });
  const is = vi.fn().mockReturnValue({ order });
  const secondEq = vi.fn().mockReturnValue({ is });
  const firstEq = vi.fn().mockReturnValue({ eq: secondEq });
  const select = vi.fn().mockReturnValue({ eq: firstEq });

  vi.mocked(createServiceRoleClient).mockReturnValue({
    from: vi.fn((table: string) => {
      if (table === 'live_lesson_participants') return { select };
      return {};
    }),
  } as never);
}

function getMicrophone(identity: string | null) {
  const url = identity
    ? `http://localhost/api/live-lessons/lesson-1/microphone?identity=${encodeURIComponent(identity)}`
    : 'http://localhost/api/live-lessons/lesson-1/microphone';
  return GET(new Request(url, { method: 'GET' }), {
    params: Promise.resolve({ lessonId: 'lesson-1' }),
  });
}

describe('GET /api/live-lessons/[lessonId]/microphone', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the persisted permission for the calling student', async () => {
    mockParticipantStateLookup({
      mic_permission: 'allowed',
      microphone_allowed: true,
      muted_by_teacher: false,
    });
    vi.mocked(requireLiveLessonUser).mockResolvedValue({
      accessToken: 'token',
      ok: true,
      user: studentUser,
    });
    vi.mocked(isLiveLessonAdmin).mockReturnValue(false);

    const response = await getMicrophone(
      buildLiveLessonIdentity(studentUser.id, 'student'),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      micPermission: 'allowed',
      microphoneAllowed: true,
      mutedByTeacher: false,
    });
  });

  it('forbids a student from reading another student state', async () => {
    mockParticipantStateLookup(null);
    vi.mocked(requireLiveLessonUser).mockResolvedValue({
      accessToken: 'token',
      ok: true,
      user: studentUser,
    });
    vi.mocked(isLiveLessonAdmin).mockReturnValue(false);

    const response = await getMicrophone(
      buildLiveLessonIdentity('00000000-0000-4000-8000-000000000000', 'student'),
    );

    expect(response.status).toBe(403);
  });

  it('returns null permission when no participant row exists yet', async () => {
    mockParticipantStateLookup(null);
    vi.mocked(requireLiveLessonUser).mockResolvedValue({
      accessToken: 'token',
      ok: true,
      user: studentUser,
    });
    vi.mocked(isLiveLessonAdmin).mockReturnValue(false);

    const response = await getMicrophone(
      buildLiveLessonIdentity(studentUser.id, 'student'),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      micPermission: null,
      microphoneAllowed: false,
      mutedByTeacher: false,
    });
  });
});

describe('POST /api/live-lessons/[lessonId]/microphone', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(canUserAccessLiveLesson).mockReturnValue(true);
  });

  it('rejects a student trying to grant microphone permission', async () => {
    mockSupabase();
    vi.mocked(requireLiveLessonUser).mockResolvedValue({
      accessToken: 'token',
      ok: true,
      user: studentUser,
    });
    vi.mocked(isLiveLessonAdmin).mockReturnValue(false);

    const response = await postMicrophone({
      action: 'allow',
      targetIdentity: buildLiveLessonIdentity(studentUser.id, 'student'),
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Bu işlem için öğretmen yetkisi gerekir.',
    });
    expect(setStudentMicrophonePublishPermission).not.toHaveBeenCalled();
  });

  it('lets the teacher grant a student microphone through LiveKit permissions', async () => {
    const supabase = mockSupabase();
    vi.mocked(requireLiveLessonUser).mockResolvedValue({
      accessToken: 'token',
      ok: true,
      user: teacherUser,
    });
    vi.mocked(isLiveLessonAdmin).mockReturnValue(true);

    const targetIdentity = buildLiveLessonIdentity(studentUser.id, 'student');
    const response = await postMicrophone({
      action: 'allow',
      targetIdentity,
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      micPermission: 'allowed',
      ok: true,
    });
    expect(setStudentMicrophonePublishPermission).toHaveBeenCalledWith({
      allowed: true,
      identity: targetIdentity,
      roomName: lesson.room_id,
    });
    expect(supabase.participantUpdate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        mic_permission: 'allowed',
        microphone_allowed: true,
        muted_by_teacher: false,
      }),
    );
    expect(sendLiveLessonRoomMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        destinationIdentities: [targetIdentity],
        message: expect.objectContaining({
          allowed: true,
          kind: 'microphone_permission',
          targetIdentity,
        }),
        roomName: lesson.room_id,
      }),
    );
  });
});
