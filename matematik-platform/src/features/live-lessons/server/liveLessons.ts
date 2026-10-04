import 'server-only';

import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { getVerifiedServerUser, type VerifiedServerUser } from '@/lib/auth-verify.server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import {
  canUserAccessLiveLesson,
  isLiveLessonAdmin,
  liveLessonAudienceFilter,
  toClientLiveLesson,
} from '@/features/live-lessons/lib/lesson-access';
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
const MAX_RECURRING_LESSONS = 16;
const VALID_TARGET_GRADES = ['5', '6', '7', '8', 'Mezun', 'all', 'selected'];

export class LiveLessonInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LiveLessonInputError';
  }
}

type RouteAuth =
  | { ok: true; user: VerifiedServerUser }
  | { ok: false; response: NextResponse };

export async function requireLiveLessonUser(): Promise<RouteAuth> {
  const user = await getVerifiedServerUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 }),
    };
  }

  return { ok: true, user };
}

export {
  canUserAccessLiveLesson,
  isLiveLessonAdmin,
  toClientLiveLesson,
} from '@/features/live-lessons/lib/lesson-access';

// service_role RLS'i atlar; öğrenciye dönen her satır sorgu filtresinden
// bağımsız olarak tek kaynak kuraldan (canUserAccessLiveLesson) geçer.
function toAccessibleClientLessons(rows: unknown[] | null, user: VerifiedServerUser) {
  return ((rows || []) as LiveLesson[])
    .filter((lesson) => canUserAccessLiveLesson(lesson, user))
    .map(toClientLiveLesson);
}

// target_student_ids kolonu olmayan eski şemada kullanılan, diziye bakmayan filtre.
function gradeOnlyAudienceFilter(user: VerifiedServerUser) {
  return user.accessGrade === null
    ? 'target_grade.eq.all'
    : `target_grade.eq.all,target_grade.eq.${user.accessGrade}`;
}

export async function loadLiveLessonsForCurrentUser(): Promise<LiveLesson[]> {
  const user = await getVerifiedServerUser();

  if (!user) {
    return [];
  }

  const supabase = createServiceRoleClient();
  const buildQuery = () =>
    supabase
      .from('live_lessons')
      .select('*')
      .in('status', ['scheduled', 'active', 'ended'])
      .order('starts_at', { ascending: false });

  if (isLiveLessonAdmin(user)) {
    const { data } = await buildQuery();
    return ((data || []) as LiveLesson[]).map(toClientLiveLesson);
  }

  const { data, error } = await buildQuery().or(liveLessonAudienceFilter(user));

  if (error) {
    const { data: gradeData } = await buildQuery().or(gradeOnlyAudienceFilter(user));
    return toAccessibleClientLessons(gradeData, user);
  }

  return toAccessibleClientLessons(data, user);
}

/**
 * Ana sayfadaki "şu an ders var" rozeti için yalnızca aktif dersi getirir.
 *
 * `loadLiveLessonsForCurrentUser` scheduled + active + ended durumundaki TÜM dersleri
 * limitsiz `select('*')` ile çekiyor; ana sayfa bunlardan sadece `status === 'active'`
 * olanı kullanıyordu. Tablo her biten dersle büyüdüğü için bu sorgu zamanla ana sayfanın
 * TTFB'sini sürekli artırıyordu. Burada tek satır ve yalnızca gereken kolonlar okunur.
 */
export async function loadActiveLiveLessonForCurrentUser(): Promise<LiveLesson | null> {
  const user = await getVerifiedServerUser();

  if (!user) {
    return null;
  }

  const supabase = createServiceRoleClient();
  const buildQuery = () =>
    supabase
      .from('live_lessons')
      .select('*')
      .eq('status', 'active')
      .order('starts_at', { ascending: false })
      .limit(1);

  if (isLiveLessonAdmin(user)) {
    const { data } = await buildQuery();
    const lesson = (data || [])[0] as LiveLesson | undefined;
    return lesson ? toClientLiveLesson(lesson) : null;
  }

  // limit(1) süzmeden önce uygulandığı için sorgu filtresi kuralla birebir
  // olmalı; aksi hâlde erişilemeyen ilk satır erişilebilen dersi gizlerdi.
  const { data, error } = await buildQuery().or(liveLessonAudienceFilter(user));

  // `target_student_ids` kolonu yoksa (eski şema) sınıf bazlı filtreye düş.
  if (error) {
    const { data: gradeData } = await buildQuery().or(gradeOnlyAudienceFilter(user));
    return toAccessibleClientLessons(gradeData, user)[0] ?? null;
  }

  return toAccessibleClientLessons(data, user)[0] ?? null;
}

export async function loadLiveLessonStudentOptions(): Promise<AppUser[]> {
  const user = await getVerifiedServerUser();

  if (!user || !isLiveLessonAdmin(user)) {
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
    lessons: ((lessonsRes.data || []) as LiveLesson[]).map(toClientLiveLesson),
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

async function notifyLessonAudience({
  lesson,
  message,
  title,
}: {
  lesson: LiveLesson;
  message: string;
  title: string;
}) {
  if (lesson.target_grade === 'selected') {
    await notifyStudents({
      lesson,
      message,
      studentIds: lesson.target_student_ids || [],
      title,
    });
    return;
  }

  await notifyGrade({
    grade: lesson.target_grade,
    lesson,
    message,
    title,
  });
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
  const lessons = await createLiveLessons({ ...input, repeatWeeklyUntil: null });
  return lessons[0];
}

export async function createLiveLessons(input: {
  description?: string | null;
  durationMinutes: number;
  repeatWeeklyUntil?: string | null;
  startsAt: string;
  targetGrade: string;
  targetStudentIds?: string[];
  title: string;
  userId: string;
}) {
  const supabase = createServiceRoleClient();
  const startsAt = new Date(input.startsAt);

  if (!input.title.trim()) {
    throw new LiveLessonInputError('Ders başlığı gerekli.');
  }
  if (!Number.isFinite(startsAt.getTime())) {
    throw new LiveLessonInputError('Geçerli bir tarih ve saat seçin.');
  }
  const targetStudentIds = [...new Set(input.targetStudentIds || [])].filter(Boolean);

  if (!VALID_TARGET_GRADES.includes(input.targetGrade)) {
    throw new LiveLessonInputError('Geçerli bir sınıf seçin.');
  }
  if (input.targetGrade === 'selected' && targetStudentIds.length === 0) {
    throw new LiveLessonInputError('En az bir öğrenci seçin.');
  }

  const startsAtValues = buildRecurringStartsAtValues(startsAt, input.repeatWeeklyUntil);
  const rows = startsAtValues.map((date) => {
    const roomId = generateRoomId();
    const lessonRow: Record<string, unknown> = {
      created_by: input.userId,
      description: input.description || null,
      duration_minutes: Math.max(15, Math.min(240, input.durationMinutes || 60)),
      room_id: roomId,
      starts_at: date.toISOString(),
      status: date.getTime() <= Date.now() + 5 * 60 * 1000 ? 'active' : 'scheduled',
      target_grade: input.targetGrade,
      teacher_proof: signTeacherProof(roomId),
      title: input.title.trim(),
    };

    if (input.targetGrade === 'selected') {
      lessonRow.target_student_ids = targetStudentIds;
    }

    return lessonRow;
  });

  const { data, error } = await supabase
    .from('live_lessons')
    .insert(rows)
    .select('*');

  if (error) {
    throw error;
  }

  const lessons = (data || []) as LiveLesson[];
  await supabase.from('live_lesson_reminders').insert(lessons.map((lesson) => ({
    lesson_id: lesson.id,
    reminder_type: REMINDER_TYPE,
  })));
  for (const lesson of lessons) {
    await notifyLessonAudience({
      lesson,
      message: `${lesson.title} dersi ${formatLessonDate(lesson.starts_at)} tarihinde yapılacak.`,
      title: 'Canlı ders planlandı',
    });
  }

  revalidatePath('/canli-ders');
  return lessons.map(toClientLiveLesson);
}

export async function updateLiveLesson(input: {
  description?: string | null;
  durationMinutes: number;
  lessonId: string;
  startsAt: string;
  targetGrade: string;
  targetStudentIds?: string[];
  title: string;
  recordingUrl?: string | null;
  materialsUrl?: string | null;
}) {
  const supabase = createServiceRoleClient();
  const startsAt = new Date(input.startsAt);

  if (!input.title.trim()) {
    throw new LiveLessonInputError('Ders başlığı gerekli.');
  }
  if (!Number.isFinite(startsAt.getTime())) {
    throw new LiveLessonInputError('Geçerli bir tarih ve saat seçin.');
  }
  if (!VALID_TARGET_GRADES.includes(input.targetGrade)) {
    throw new LiveLessonInputError('Geçerli bir ders hedefi seçin.');
  }

  const targetStudentIds = [...new Set(input.targetStudentIds || [])].filter(Boolean);
  if (input.targetGrade === 'selected' && targetStudentIds.length === 0) {
    throw new LiveLessonInputError('En az bir öğrenci seçin.');
  }

  const { data: current, error: currentError } = await supabase
    .from('live_lessons')
    .select('*')
    .eq('id', input.lessonId)
    .single();

  if (currentError || !current) {
    throw new LiveLessonInputError('Ders bulunamadı.');
  }

  const currentLesson = current as LiveLesson;
  if (currentLesson.status === 'cancelled') {
    throw new LiveLessonInputError('İptal edilmiş ders düzenlenemez.');
  }

  const nextTargetStudentIds = input.targetGrade === 'selected' ? targetStudentIds : null;
  const startsAtChanged = currentLesson.starts_at !== startsAt.toISOString();
  const audienceChanged =
    currentLesson.target_grade !== input.targetGrade ||
    JSON.stringify([...(currentLesson.target_student_ids || [])].sort()) !==
      JSON.stringify([...(nextTargetStudentIds || [])].sort());

  const updatePayload: Record<string, unknown> = {
    description: input.description || null,
    duration_minutes: Math.max(15, Math.min(240, input.durationMinutes || 60)),
    starts_at: startsAt.toISOString(),
    target_grade: input.targetGrade,
    title: input.title.trim(),
    updated_at: new Date().toISOString(),
  };

  if (input.recordingUrl !== undefined) {
    updatePayload.recording_url = input.recordingUrl?.trim() || null;
  }
  if (input.materialsUrl !== undefined) {
    updatePayload.materials_url = input.materialsUrl?.trim() || null;
  }

  // Her zaman yazılır: hedef 'selected' dışına çevrilince eski dizi null'a
  // çekilir, aksi hâlde bayat liste sınıf dersinde de taşınırdı.
  updatePayload.target_student_ids = nextTargetStudentIds;

  let lesson: LiveLesson;
  const { data, error } = await supabase
    .from('live_lessons')
    .update(updatePayload)
    .eq('id', input.lessonId)
    .select('*')
    .single();

  if (error) {
    if (error.message?.includes('column') || error.code === '42703') {
      delete updatePayload.recording_url;
      delete updatePayload.materials_url;
      const retry = await supabase
        .from('live_lessons')
        .update(updatePayload)
        .eq('id', input.lessonId)
        .select('*')
        .single();
      if (retry.error) throw retry.error;
      lesson = retry.data as LiveLesson;
    } else {
      throw error;
    }
  } else {
    lesson = data as LiveLesson;
  }
  if (startsAtChanged || audienceChanged) {
    await notifyLessonAudience({
      lesson,
      message: `${lesson.title} canlı dersi güncellendi. Yeni zaman: ${formatLessonDate(
        lesson.starts_at,
      )}.`,
      title: 'Canlı ders güncellendi',
    });
  }

  revalidatePath('/canli-ders');
  revalidatePath('/admin');
  return toClientLiveLesson(lesson);
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
    await notifyLessonAudience({
      lesson,
      message: `${lesson.title} canlı dersi iptal edildi.`,
      title: 'Canlı ders iptal edildi',
    });
  }

  revalidatePath('/canli-ders');
  return toClientLiveLesson(lesson);
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
    await notifyLessonAudience({
      lesson,
      message: `${lesson.title} canlı dersi 30 dakika içinde başlayacak.`,
      title: 'Canlı ders yaklaşıyor',
    });
    await supabase
      .from('live_lesson_reminders')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', row.id);
  }

  return { sent: due.length };
}

function buildRecurringStartsAtValues(startsAt: Date, repeatWeeklyUntil?: string | null) {
  if (!repeatWeeklyUntil) {
    return [startsAt];
  }

  const repeatUntil = new Date(repeatWeeklyUntil);
  if (!Number.isFinite(repeatUntil.getTime())) {
    throw new LiveLessonInputError('Geçerli bir tekrar bitiş tarihi seçin.');
  }
  if (repeatUntil.getTime() < startsAt.getTime()) {
    throw new LiveLessonInputError('Tekrar bitiş tarihi ders başlangıcından önce olamaz.');
  }

  const values: Date[] = [];
  for (
    let next = new Date(startsAt);
    next.getTime() <= repeatUntil.getTime() && values.length < MAX_RECURRING_LESSONS;
    next = new Date(next.getTime() + 7 * 24 * 60 * 60 * 1000)
  ) {
    values.push(next);
  }

  if (values.length === MAX_RECURRING_LESSONS) {
    const nextAfterLimit = new Date(startsAt.getTime() + MAX_RECURRING_LESSONS * 7 * 24 * 60 * 60 * 1000);
    if (nextAfterLimit.getTime() <= repeatUntil.getTime()) {
      throw new LiveLessonInputError('Tekrar eden dersler en fazla 16 hafta planlanabilir.');
    }
  }

  return values;
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
