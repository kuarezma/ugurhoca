import 'server-only';

import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { isAdminEmail } from '@/lib/admin';
import { getServerAccessToken, getServerAuthSnapshot } from '@/lib/auth-snapshot.server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { generateRoomId, signTeacherProof } from '@/features/live-lessons/lib/lesson-auth';
import type {
  LiveLesson,
  LiveLessonChatMessage,
  LiveLessonDashboardData,
  LiveLessonEvent,
  LiveLessonParticipant,
} from '@/features/live-lessons/types';
import type { AppUser } from '@/types';

const NOTIFICATION_TYPE = 'live-lesson';
const REMINDER_TYPE = 'thirty_minutes';

type RouteAuth =
  | { ok: true; user: NonNullable<Awaited<ReturnType<typeof getServerAuthSnapshot>>>; accessToken: string | null }
  | { ok: false; response: NextResponse };

export async function requireLiveLessonUser(): Promise<RouteAuth> {
  const [user, accessToken] = await Promise.all([
    getServerAuthSnapshot(),
    getServerAccessToken(),
  ]);

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 }),
    };
  }

  return { accessToken, ok: true, user };
}

export function isLiveLessonAdmin(user: { email?: string | null; isAdmin?: boolean }) {
  return Boolean(user.isAdmin || isAdminEmail(user.email));
}

export async function loadLiveLessonsForCurrentUser(): Promise<LiveLesson[]> {
  const snapshot = await getServerAuthSnapshot();

  if (!snapshot) {
    return [];
  }

  const supabase = createServiceRoleClient();
  const query = supabase
    .from('live_lessons')
    .select('*')
    .in('status', ['scheduled', 'active'])
    .order('starts_at', { ascending: true });

  const { data } = isLiveLessonAdmin(snapshot)
    ? await query
    : await query.or(
        `target_grade.eq.${snapshot.grade},target_grade.eq.all,target_student_ids.cs.{${snapshot.id}}`,
      );

  return (data || []) as LiveLesson[];
}

export async function loadLiveLessonStudentOptions(): Promise<AppUser[]> {
  const snapshot = await getServerAuthSnapshot();

  if (!snapshot || !isLiveLessonAdmin(snapshot)) {
    return [];
  }

  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from('profiles')
    .select('id, name, email, grade, is_favorite, created_at')
    .order('name', { ascending: true });

  return ((data || []) as AppUser[]).filter((user) => !isLiveLessonAdmin(user));
}

export async function loadLiveLessonDashboardData(): Promise<LiveLessonDashboardData> {
  const supabase = createServiceRoleClient();
  const [lessonsRes, participantsRes, eventsRes, chatRes] = await Promise.all([
    supabase
      .from('live_lessons')
      .select('*')
      .order('starts_at', { ascending: false })
      .limit(100),
    supabase
      .from('live_lesson_participants')
      .select('*')
      .order('joined_at', { ascending: false })
      .limit(1000),
    supabase
      .from('live_lesson_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000),
    supabase
      .from('live_lesson_chat_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000),
  ]);

  return {
    chatMessages: (chatRes.data || []) as LiveLessonChatMessage[],
    events: (eventsRes.data || []) as LiveLessonEvent[],
    lessons: (lessonsRes.data || []) as LiveLesson[],
    participants: (participantsRes.data || []) as LiveLessonParticipant[],
  };
}

async function notifyGrade({
  grade,
  lesson,
  message,
  title,
}: {
  grade: string;
  lesson: LiveLesson;
  message: string;
  title: string;
}) {
  const supabase = createServiceRoleClient();
  const studentsQuery = supabase.from('profiles').select('id');
  const { data: students } =
    grade === 'all'
      ? await studentsQuery
      : await studentsQuery.eq('grade', Number.isFinite(Number(grade)) ? Number(grade) : grade);

  const rows = (students || [])
    .filter((student: { id?: string | null }) => student.id)
    .map((student: { id: string }) => ({
      message,
      metadata: {
        href: `/canli-ders`,
        lesson_id: lesson.id,
        room_id: lesson.room_id,
        starts_at: lesson.starts_at,
      },
      title,
      type: NOTIFICATION_TYPE,
      user_id: student.id,
    }));

  if (rows.length > 0) {
    await supabase.from('notifications').insert(rows);
  }
}

async function notifyStudents({
  lesson,
  message,
  studentIds,
  title,
}: {
  lesson: LiveLesson;
  message: string;
  studentIds: string[];
  title: string;
}) {
  const supabase = createServiceRoleClient();
  const uniqueStudentIds = [...new Set(studentIds)].filter(Boolean);

  if (uniqueStudentIds.length === 0) return;

  const rows = uniqueStudentIds.map((studentId) => ({
    message,
    metadata: {
      href: `/canli-ders`,
      lesson_id: lesson.id,
      room_id: lesson.room_id,
      starts_at: lesson.starts_at,
    },
    title,
    type: NOTIFICATION_TYPE,
    user_id: studentId,
  }));

  await supabase.from('notifications').insert(rows);
}

function isStudentTargeted(lesson: LiveLesson, userId: string) {
  return Array.isArray(lesson.target_student_ids) && lesson.target_student_ids.includes(userId);
}

export function canUserAccessLiveLesson(
  lesson: LiveLesson,
  user: { grade?: string | number | null; id: string },
) {
  if (lesson.target_grade === 'selected') {
    return isStudentTargeted(lesson, user.id);
  }
  return lesson.target_grade === 'all' || String(user.grade) === String(lesson.target_grade);
}

export async function createLiveLesson(input: {
  description?: string | null;
  durationMinutes: number;
  startsAt: string;
  targetGrade: string;
  targetStudentIds?: string[];
  title: string;
  userId: string;
}) {
  const supabase = createServiceRoleClient();
  const roomId = generateRoomId();
  const teacherProof = signTeacherProof(roomId);
  const startsAt = new Date(input.startsAt);

  if (!input.title.trim()) {
    throw new Error('Ders başlığı gerekli.');
  }
  if (!Number.isFinite(startsAt.getTime())) {
    throw new Error('Geçerli bir tarih ve saat seçin.');
  }
  const targetStudentIds = [...new Set(input.targetStudentIds || [])].filter(Boolean);

  if (!['5', '6', '7', '8', 'Mezun', 'all', 'selected'].includes(input.targetGrade)) {
    throw new Error('Geçerli bir sınıf seçin.');
  }
  if (input.targetGrade === 'selected' && targetStudentIds.length === 0) {
    throw new Error('En az bir öğrenci seçin.');
  }

  const { data, error } = await supabase
    .from('live_lessons')
    .insert({
      created_by: input.userId,
      description: input.description || null,
      duration_minutes: Math.max(15, Math.min(240, input.durationMinutes || 60)),
      room_id: roomId,
      starts_at: startsAt.toISOString(),
      status: startsAt.getTime() <= Date.now() + 5 * 60 * 1000 ? 'active' : 'scheduled',
      target_grade: input.targetGrade,
      target_student_ids: input.targetGrade === 'selected' ? targetStudentIds : null,
      teacher_proof: teacherProof,
      title: input.title.trim(),
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  const lesson = data as LiveLesson;
  await supabase.from('live_lesson_reminders').insert({
    lesson_id: lesson.id,
    reminder_type: REMINDER_TYPE,
  });
  const message = `${lesson.title} dersi ${formatLessonDate(lesson.starts_at)} tarihinde yapılacak.`;
  if (lesson.target_grade === 'selected') {
    await notifyStudents({
      lesson,
      message,
      studentIds: lesson.target_student_ids || [],
      title: 'Canlı ders planlandı',
    });
  } else {
    await notifyGrade({
      grade: lesson.target_grade,
      lesson,
      message,
      title: 'Canlı ders planlandı',
    });
  }

  revalidatePath('/canli-ders');
  return lesson;
}

export async function updateLiveLessonStatus({
  lessonId,
  status,
}: {
  lessonId: string;
  status: 'active' | 'ended' | 'cancelled';
}) {
  const supabase = createServiceRoleClient();
  const patch =
    status === 'active'
      ? { started_at: new Date().toISOString(), status }
      : status === 'ended'
        ? { ended_at: new Date().toISOString(), status }
        : { ended_at: new Date().toISOString(), status };

  const { data, error } = await supabase
    .from('live_lessons')
    .update(patch)
    .eq('id', lessonId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  const lesson = data as LiveLesson;
  if (status === 'cancelled') {
    const message = `${lesson.title} canlı dersi iptal edildi.`;
    if (lesson.target_grade === 'selected') {
      await notifyStudents({
        lesson,
        message,
        studentIds: lesson.target_student_ids || [],
        title: 'Canlı ders iptal edildi',
      });
    } else {
      await notifyGrade({
        grade: lesson.target_grade,
        lesson,
        message,
        title: 'Canlı ders iptal edildi',
      });
    }
  }

  revalidatePath('/canli-ders');
  return lesson;
}

export async function recordLiveLessonEvent(input: {
  eventType: string;
  lessonId: string;
  payload?: Record<string, unknown>;
  userId?: string | null;
  userName?: string | null;
}) {
  const supabase = createServiceRoleClient();
  await supabase.from('live_lesson_events').insert({
    event_type: input.eventType,
    lesson_id: input.lessonId,
    payload: input.payload || {},
    user_id: input.userId || null,
    user_name: input.userName || null,
  });
}

export async function sendDueLiveLessonReminders() {
  const supabase = createServiceRoleClient();
  const now = new Date();
  const windowEnd = new Date(now.getTime() + 30 * 60 * 1000).toISOString();

  const { data: reminders } = await supabase
    .from('live_lesson_reminders')
    .select('id, lesson_id, live_lessons(*)')
    .is('sent_at', null);

  type ReminderRow = { id: string; live_lessons: unknown };
  const due = ((reminders || []) as ReminderRow[]).filter((row) => {
    const lesson = normalizeReminderLesson(row.live_lessons);
    return (
      lesson &&
      lesson.status === 'scheduled' &&
      lesson.starts_at <= windowEnd &&
      lesson.starts_at >= new Date(now.getTime() - 5 * 60 * 1000).toISOString()
    );
  });

  for (const row of due) {
    const lesson = normalizeReminderLesson(row.live_lessons);
    if (!lesson) continue;
    const message = `${lesson.title} canlı dersi 30 dakika içinde başlayacak.`;
    if (lesson.target_grade === 'selected') {
      await notifyStudents({
        lesson,
        message,
        studentIds: lesson.target_student_ids || [],
        title: 'Canlı ders yaklaşıyor',
      });
    } else {
      await notifyGrade({
        grade: lesson.target_grade,
        lesson,
        message,
        title: 'Canlı ders yaklaşıyor',
      });
    }
    await supabase
      .from('live_lesson_reminders')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', row.id);
  }

  return { sent: due.length };
}

function normalizeReminderLesson(value: unknown): LiveLesson | null {
  if (Array.isArray(value)) {
    return (value[0] as LiveLesson | undefined) ?? null;
  }
  return (value as LiveLesson | null) ?? null;
}

function formatLessonDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(value));
}
