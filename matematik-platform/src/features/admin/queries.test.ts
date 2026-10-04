import {
  addStudentAdminNote,
  createAdminAssignment,
  updateAdminUser,
  advanceAdminUserGrades,
  loadAdminDashboardData,
  loadAdminLearningActivity,
  loadAdminLiveLessonActivity,
  createAdminWeeklyPlan,
  updateWorksheetCandidateStatus,
  upsertStudentAdminStatus,
} from '@/features/admin/queries';
import { supabase } from '@/lib/supabase/client';

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const mockSingleSelect = (data: unknown) => {
  const single = vi.fn().mockResolvedValue({ data, error: null });
  const select = vi.fn().mockReturnValue({ single });

  return { select, single };
};

describe('admin tracking queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-30T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates a weekly plan for the current week and replaces plan items', async () => {
    const plan = {
      id: 'plan-1',
      student_id: 'student-1',
      title: 'Bu Haftaki Plan',
      week_start: '2026-04-27',
    };
    const planSelect = mockSingleSelect(plan);
    const planBuilder = {
      upsert: vi.fn().mockReturnValue({ select: planSelect.select }),
    };
    const deleteEq = vi.fn().mockResolvedValue({ error: null });
    const itemsDeleteBuilder = {
      delete: vi.fn().mockReturnValue({ eq: deleteEq }),
    };
    const itemsInsertBuilder = {
      insert: vi.fn().mockResolvedValue({ error: null }),
    };

    vi.mocked(supabase.from)
      .mockReturnValueOnce(planBuilder as never)
      .mockReturnValueOnce(itemsDeleteBuilder as never)
      .mockReturnValueOnce(itemsInsertBuilder as never);

    await expect(
      createAdminWeeklyPlan({
        authorId: 'admin-1',
        itemTitles: ['  Denklem çöz  ', '', 'Problemler', 'Kesirler'],
        studentId: 'student-1',
        targetMinutes: 450,
        title: 'Bu Haftaki Plan',
      }),
    ).resolves.toEqual(plan);

    expect(supabase.from).toHaveBeenNthCalledWith(1, 'student_weekly_plans');
    expect(planBuilder.upsert).toHaveBeenCalledWith(
      {
        author_id: 'admin-1',
        status: 'active',
        student_id: 'student-1',
        target_minutes: 450,
        title: 'Bu Haftaki Plan',
        week_start: '2026-04-27',
      },
      { onConflict: 'student_id,week_start' },
    );
    expect(supabase.from).toHaveBeenNthCalledWith(
      2,
      'student_weekly_plan_items',
    );
    expect(deleteEq).toHaveBeenCalledWith('plan_id', 'plan-1');
    expect(supabase.from).toHaveBeenNthCalledWith(
      3,
      'student_weekly_plan_items',
    );
    expect(itemsInsertBuilder.insert).toHaveBeenCalledWith([
      {
        kind: 'custom',
        plan_id: 'plan-1',
        sort_order: 0,
        title: 'Denklem çöz',
      },
      {
        kind: 'custom',
        plan_id: 'plan-1',
        sort_order: 1,
        title: 'Problemler',
      },
      {
        kind: 'custom',
        plan_id: 'plan-1',
        sort_order: 2,
        title: 'Kesirler',
      },
    ]);
  });

  it('upserts student admin status with labels and follow-up date', async () => {
    const status = {
      follow_up_at: '2026-05-03T09:00:00Z',
      labels: ['risk', 'takipte'],
      status: 'risk',
      student_id: 'student-1',
      updated_by: 'admin-1',
    };
    const statusSelect = mockSingleSelect(status);
    const statusBuilder = {
      upsert: vi.fn().mockReturnValue({ select: statusSelect.select }),
    };
    vi.mocked(supabase.from).mockReturnValueOnce(statusBuilder as never);

    await expect(
      upsertStudentAdminStatus({
        adminId: 'admin-1',
        followUpAt: '2026-05-03T09:00:00Z',
        labels: ['risk', 'takipte'],
        status: 'risk',
        studentId: 'student-1',
      }),
    ).resolves.toEqual(status);

    expect(supabase.from).toHaveBeenCalledWith('student_admin_statuses');
    expect(statusBuilder.upsert).toHaveBeenCalledWith(
      {
        follow_up_at: '2026-05-03T09:00:00Z',
        labels: ['risk', 'takipte'],
        status: 'risk',
        student_id: 'student-1',
        updated_by: 'admin-1',
      },
      { onConflict: 'student_id' },
    );
  });

  it('adds private admin notes for a student', async () => {
    const note = {
      author_id: 'admin-1',
      body: 'Bu hafta problemler tekrar edilecek.',
      id: 'note-1',
      student_id: 'student-1',
    };
    const noteSelect = mockSingleSelect(note);
    const noteBuilder = {
      insert: vi.fn().mockReturnValue({ select: noteSelect.select }),
    };
    vi.mocked(supabase.from).mockReturnValueOnce(noteBuilder as never);

    await expect(
      addStudentAdminNote({
        authorId: 'admin-1',
        body: 'Bu hafta problemler tekrar edilecek.',
        studentId: 'student-1',
      }),
    ).resolves.toEqual(note);

    expect(supabase.from).toHaveBeenCalledWith('student_admin_notes');
    expect(noteBuilder.insert).toHaveBeenCalledWith({
      author_id: 'admin-1',
      body: 'Bu hafta problemler tekrar edilecek.',
      student_id: 'student-1',
    });
  });

  it('rejects a worksheet candidate with reviewer metadata', async () => {
    const candidate = {
      id: 'candidate-1',
      rejection_reason: 'Konu uyumsuz',
      reviewed_by: 'admin-1',
      status: 'rejected',
    };
    const candidateSelect = mockSingleSelect(candidate);
    const eq = vi.fn().mockReturnValue({ select: candidateSelect.select });
    const candidateBuilder = {
      update: vi.fn().mockReturnValue({ eq }),
    };
    vi.mocked(supabase.from).mockReturnValueOnce(candidateBuilder as never);

    await expect(
      updateWorksheetCandidateStatus({
        candidateId: 'candidate-1',
        rejectionReason: '  Konu uyumsuz  ',
        reviewedBy: 'admin-1',
        status: 'rejected',
      }),
    ).resolves.toEqual(candidate);

    expect(supabase.from).toHaveBeenCalledWith('worksheet_candidates');
    expect(candidateBuilder.update).toHaveBeenCalledWith({
      rejection_reason: 'Konu uyumsuz',
      reviewed_at: '2026-04-30T12:00:00.000Z',
      reviewed_by: 'admin-1',
      status: 'rejected',
      updated_at: '2026-04-30T12:00:00.000Z',
    });
    expect(eq).toHaveBeenCalledWith('id', 'candidate-1');
  });
});

describe('admin dashboard pagination', () => {
  const tables = [
    'study_sessions',
    'student_activity_events',
    'live_lesson_participants',
    'live_lesson_events',
    'live_lesson_chat_messages',
  ];

  it('loads records beyond 1000 without changing dashboard collection shapes', async () => {
    const records = Array.from({ length: 1001 }, (_, index) => ({
      id: `row-${index}`,
    }));
    vi.mocked(supabase.from).mockImplementation((table) => {
      const data = tables.includes(table) ? records : [];
      const builder = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        lt: vi.fn().mockResolvedValue({ error: null }),
        limit: vi
          .fn()
          .mockImplementation((limit: number) =>
            Promise.resolve({ data: data.slice(0, limit), error: null }),
          ),
        range: vi
          .fn()
          .mockImplementation((start: number, end: number) =>
            Promise.resolve({ data: data.slice(start, end + 1), error: null }),
          ),
      };
      return builder as never;
    });
    const [learning, liveLessons] = await Promise.all([
      loadAdminLearningActivity(),
      loadAdminLiveLessonActivity(),
    ]);
    expect(learning.studySessions).toHaveLength(1001);
    expect(learning.activityEvents).toHaveLength(1001);
    expect(liveLessons.participants).toHaveLength(1001);
    expect(liveLessons.events).toHaveLength(1001);
    expect(liveLessons.chatMessages).toHaveLength(1001);
    expect(learning.studySessions.at(-1)).toEqual({ id: 'row-1000' });
  });

  it('does not scan activity tables when loading the initial dashboard', async () => {
    const requestedTables: string[] = [];
    vi.mocked(supabase.from).mockImplementation((table) => {
      requestedTables.push(table);
      return {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      } as never;
    });

    await loadAdminDashboardData();

    expect(requestedTables).not.toContain('study_sessions');
    expect(requestedTables).not.toContain('student_activity_events');
    expect(requestedTables).not.toContain('live_lesson_participants');
    expect(requestedTables).not.toContain('live_lesson_events');
    expect(requestedTables).not.toContain('live_lesson_chat_messages');
  });
});

it('preserves dashboard loading on a page error and warns instead of returning partial activity', async () => {
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const page = Array.from({ length: 500 }, (_, index) => ({
    id: `row-${index}`,
  }));
  vi.mocked(supabase.from).mockImplementation(
    (table) =>
      ({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        lt: vi.fn().mockResolvedValue({ error: null }),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        range: vi
          .fn()
          .mockImplementation((start: number) =>
            Promise.resolve(
              table !== 'study_sessions'
                ? { data: [], error: null }
                : start === 0
                  ? { data: page, error: null }
                  : { data: null, error: { message: 'Page failed' } },
            ),
          ),
      }) as never,
  );
  try {
    await expect(loadAdminLearningActivity()).rejects.toThrow(
      'Öğrenci etkinlikleri yüklenemedi.',
    );
    expect(warning).toHaveBeenCalled();
  } finally {
    warning.mockRestore();
  }
});

describe('Mezun admin yazma sınırı', () => {
  beforeEach(() => vi.clearAllMocks());
  it.each([0, 'Mezun'] as const)(
    'ödev sınıfını 0 saklar: %s',
    async (grade) => {
      const select = mockSingleSelect({ id: 'assignment' });
      const insert = vi.fn().mockReturnValue({ select: select.select });
      vi.mocked(supabase.from).mockReturnValue({ insert } as never);
      await createAdminAssignment({ grade, title: 'Mezun ödevi' });
      expect(insert).toHaveBeenCalledWith([
        expect.objectContaining({ grade: 0 }),
      ]);
    },
  );
  it('profil güncellemesinde Mezun metnini 0 yazar', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq });
    vi.mocked(supabase.from).mockReturnValue({ update } as never);
    await updateAdminUser('graduate', { grade: 'Mezun' });
    expect(update).toHaveBeenCalledWith({ grade: 0 });
  });
  it('Mezunu birinci sınıfa atlatmaz', async () => {
    await expect(
      advanceAdminUserGrades([{ id: 'graduate', grade: 0 } as never]),
    ).resolves.toBe(0);
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
