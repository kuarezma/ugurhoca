import { supabase } from '@/lib/supabase/client';
import type {
  AdminStudySessionRow,
  AdminWeeklyPlanItemDraft,
  StudentActivityEvent,
  StudentAdminNote,
  StudentAdminStatus,
  StudentWeeklyPlan,
} from '@/features/admin/types';
import { loadAllAdminRows } from './shared';

export type { AdminWeeklyPlanItemDraft };

export const loadAdminLearningActivity = async () => {
  const [sessions, events] = await Promise.all([
    loadAllAdminRows((from, to) =>
      supabase
        .from('study_sessions')
        .select('*')
        .order('date', { ascending: false })
        .order('id', { ascending: false })
        .range(from, to),
    ),
    loadAllAdminRows((from, to) =>
      supabase
        .from('student_activity_events')
        .select('*')
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .range(from, to),
    ),
  ]);

  if (sessions.error || events.error) {
    throw new Error('Öğrenci etkinlikleri yüklenemedi.');
  }

  return {
    activityEvents: (events.data || []) as StudentActivityEvent[],
    studySessions: (sessions.data || []) as AdminStudySessionRow[],
  };
};

export const loadAdminLiveLessonActivity = async () => {
  const [participants, events, chatMessages] = await Promise.all([
    loadAllAdminRows((from, to) =>
      supabase
        .from('live_lesson_participants')
        .select('*')
        .order('joined_at', { ascending: false })
        .order('id', { ascending: false })
        .range(from, to),
    ),
    loadAllAdminRows((from, to) =>
      supabase
        .from('live_lesson_events')
        .select('*')
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .range(from, to),
    ),
    loadAllAdminRows((from, to) =>
      supabase
        .from('live_lesson_chat_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .range(from, to),
    ),
  ]);

  if (participants.error || events.error || chatMessages.error) {
    throw new Error('Canlı ders ayrıntıları yüklenemedi.');
  }

  return {
    chatMessages: chatMessages.data || [],
    events: events.data || [],
    participants: participants.data || [],
  };
};

const getCurrentWeekStartISODate = () => {
  const today = new Date();
  const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const start = new Date(today);
  start.setDate(today.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);
  const year = start.getFullYear();
  const month = String(start.getMonth() + 1).padStart(2, '0');
  const day = String(start.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ALLOWED_WEEKLY_PLAN_KINDS = new Set([
  'assignment',
  'quiz',
  'content',
  'custom',
]);

const sanitizeWeeklyPlanHref = (href?: string | null): string | null => {
  if (typeof href !== 'string') return null;
  const trimmed = href.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return null;
  }
  return trimmed;
};

const clampWeeklyTargetMinutes = (targetMinutes?: number): number => {
  if (typeof targetMinutes !== 'number' || !Number.isFinite(targetMinutes)) {
    return 600;
  }
  return Math.min(4200, Math.max(30, Math.round(targetMinutes)));
};

export const createAdminWeeklyPlan = async ({
  authorId,
  items,
  itemTitles,
  studentId,
  targetMinutes = 600,
  title,
}: {
  authorId: string;
  items?: AdminWeeklyPlanItemDraft[];
  itemTitles?: string[];
  studentId: string;
  targetMinutes?: number;
  title: string;
}) => {
  const weekStart = getCurrentWeekStartISODate();
  const safeTargetMinutes = clampWeeklyTargetMinutes(targetMinutes);
  const { data: plan, error: planError } = await supabase
    .from('student_weekly_plans')
    .upsert(
      {
        author_id: authorId,
        status: 'active',
        student_id: studentId,
        target_minutes: safeTargetMinutes,
        title,
        week_start: weekStart,
      },
      { onConflict: 'student_id,week_start' },
    )
    .select('*')
    .single();

  if (planError) {
    throw planError;
  }

  await supabase
    .from('student_weekly_plan_items')
    .delete()
    .eq('plan_id', plan.id);

  const rawDrafts: AdminWeeklyPlanItemDraft[] = Array.isArray(items)
    ? items
    : (itemTitles || []).map((itemTitle) => ({ title: itemTitle }));

  const cleanedItems = rawDrafts
    .map((draft) => {
      const cleanedTitle = String(draft.title || '').trim();
      if (!cleanedTitle) return null;
      const kind =
        draft.kind && ALLOWED_WEEKLY_PLAN_KINDS.has(draft.kind)
          ? draft.kind
          : 'custom';
      const href = sanitizeWeeklyPlanHref(draft.href);
      const linkedId =
        typeof draft.linked_id === 'string' && draft.linked_id.trim()
          ? draft.linked_id.trim()
          : null;
      const dueAt =
        typeof draft.due_at === 'string' && draft.due_at.trim()
          ? draft.due_at.trim()
          : null;

      return {
        kind,
        title: cleanedTitle,
        ...(linkedId ? { linked_id: linkedId } : {}),
        ...(href ? { href } : {}),
        ...(dueAt ? { due_at: dueAt } : {}),
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .slice(0, 12);

  if (cleanedItems.length > 0) {
    const { error: itemsError } = await supabase
      .from('student_weekly_plan_items')
      .insert(
        cleanedItems.map((item, index) => ({
          ...item,
          plan_id: plan.id,
          sort_order: index,
        })),
      );

    if (itemsError) {
      throw itemsError;
    }
  }

  return plan as StudentWeeklyPlan;
};

export const createAdminWeeklyPlansBulk = async ({
  authorId,
  items,
  studentIds,
  targetMinutes = 600,
  title,
}: {
  authorId: string;
  items: AdminWeeklyPlanItemDraft[];
  studentIds: string[];
  targetMinutes?: number;
  title: string;
}): Promise<{
  succeeded: string[];
  failed: Array<{ studentId: string; message: string }>;
}> => {
  const uniqueIds = Array.from(
    new Set(studentIds.map((id) => id.trim()).filter(Boolean)),
  );
  const succeeded: string[] = [];
  const failed: Array<{ studentId: string; message: string }> = [];

  for (let index = 0; index < uniqueIds.length; index += 5) {
    const chunk = uniqueIds.slice(index, index + 5);
    const settled = await Promise.allSettled(
      chunk.map((studentId) =>
        createAdminWeeklyPlan({
          authorId,
          items,
          studentId,
          targetMinutes,
          title,
        }),
      ),
    );
    settled.forEach((result, offset) => {
      const studentId = chunk[offset];
      if (result.status === 'fulfilled') {
        succeeded.push(studentId);
      } else {
        failed.push({
          studentId,
          message:
            result.reason instanceof Error
              ? result.reason.message
              : 'Plan kaydedilemedi.',
        });
      }
    });
  }

  return { succeeded, failed };
};

export const upsertStudentAdminStatus = async ({
  adminId,
  followUpAt,
  labels,
  status,
  studentId,
}: {
  adminId: string;
  followUpAt?: string | null;
  labels?: string[];
  status: StudentAdminStatus['status'];
  studentId: string;
}) => {
  const { data, error } = await supabase
    .from('student_admin_statuses')
    .upsert(
      {
        follow_up_at: followUpAt ?? null,
        labels: labels ?? [],
        status,
        student_id: studentId,
        updated_by: adminId,
      },
      { onConflict: 'student_id' },
    )
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as StudentAdminStatus;
};

export const addStudentAdminNote = async ({
  authorId,
  body,
  studentId,
}: {
  authorId: string;
  body: string;
  studentId: string;
}) => {
  const { data, error } = await supabase
    .from('student_admin_notes')
    .insert({
      author_id: authorId,
      body,
      student_id: studentId,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as StudentAdminNote;
};
