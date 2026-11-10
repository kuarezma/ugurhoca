import { supabase } from '@/lib/supabase/client';
import type {
  AdminStudySessionRow,
  StudentActivityEvent,
  StudentAdminNote,
  StudentAdminStatus,
  StudentWeeklyPlan,
} from '@/features/admin/types';
import { loadAllAdminRows } from './shared';

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

export const createAdminWeeklyPlan = async ({
  authorId,
  itemTitles,
  studentId,
  targetMinutes = 600,
  title,
}: {
  authorId: string;
  itemTitles: string[];
  studentId: string;
  targetMinutes?: number;
  title: string;
}) => {
  const weekStart = getCurrentWeekStartISODate();
  const { data: plan, error: planError } = await supabase
    .from('student_weekly_plans')
    .upsert(
      {
        author_id: authorId,
        status: 'active',
        student_id: studentId,
        target_minutes: targetMinutes,
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

  const cleanedItems = itemTitles
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);

  if (cleanedItems.length > 0) {
    const { error: itemsError } = await supabase
      .from('student_weekly_plan_items')
      .insert(
        cleanedItems.map((itemTitle, index) => ({
          kind: 'custom',
          plan_id: plan.id,
          sort_order: index,
          title: itemTitle,
        })),
      );

    if (itemsError) {
      throw itemsError;
    }
  }

  return plan as StudentWeeklyPlan;
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
