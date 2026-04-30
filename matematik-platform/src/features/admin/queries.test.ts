import {
  addStudentAdminNote,
  createAdminWeeklyPlan,
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
    expect(supabase.from).toHaveBeenNthCalledWith(2, 'student_weekly_plan_items');
    expect(deleteEq).toHaveBeenCalledWith('plan_id', 'plan-1');
    expect(supabase.from).toHaveBeenNthCalledWith(3, 'student_weekly_plan_items');
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
});
