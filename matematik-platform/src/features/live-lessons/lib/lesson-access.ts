import { isAdminEmail } from '@/lib/admin';
import type { LiveLesson } from '@/features/live-lessons/types';

// Saf erişim-kontrol yardımcıları. Sunucu/istemci bağımlılığı taşımaz ki hem
// server modüllerinde kullanılabilsin hem de ağır modül grafiğini yüklemeden
// birim testi yazılabilsin.

// Yetki yalnızca doğrulanmış e-postadan türetilir. İstemcinin taşıdığı `isAdmin`
// alanına asla güvenilmez (imzasız snapshot çerezi forge edilebilir).
export function isLiveLessonAdmin(user: { email?: string | null }) {
  return isAdminEmail(user.email);
}

// live_lessons satırı istemciye geçmeden önce sunucu-gizli teacher_proof sütununu düşür.
export function toClientLiveLesson(lesson: LiveLesson): LiveLesson {
  const sanitized = { ...lesson };
  delete sanitized.teacher_proof;
  return sanitized;
}

// Kullanıcı oturumlu (anon/authenticated) Supabase istemcisiyle live_lessons
// okunurken kullanılacak kolonlar. teacher_proof bu rollere kolon düzeyinde
// kapalıdır (migration 20261004120000); bu rollerle select('*') 42501 döner.
// supabase-js select tiplerini çözebilsin diye tek string literal tutulur.
export const LIVE_LESSON_CLIENT_COLUMNS =
  'id, room_id, title, description, target_grade, target_student_ids, starts_at, duration_minutes, status, created_by, started_at, ended_at, recording_url, materials_url, created_at, updated_at';

/**
 * Erişim kararının girdisi. accessGrade, getVerifiedServerUser().accessGrade
 * (src/lib/access-grade.ts) olmalıdır; görüntüleme amaçlı `grade` değil.
 */
export type LiveLessonViewer = { accessGrade: string | null; id: string };

function isStudentTargeted(lesson: LiveLesson, userId: string) {
  return (
    Array.isArray(lesson.target_student_ids) &&
    lesson.target_student_ids.includes(userId)
  );
}

// Tek kaynak kural. RLS politikası live_lessons_select_scoped (migration
// 20261004120000) bunun SQL karşılığıdır. target_student_ids yalnız
// 'selected' derste anlamlıdır; başka hedefteki bayat diziye bakılmaz.
export function canUserAccessLiveLesson(lesson: LiveLesson, user: LiveLessonViewer) {
  if (lesson.target_grade === 'selected') {
    return isStudentTargeted(lesson, user.id);
  }
  if (lesson.target_grade === 'all') {
    return true;
  }
  return user.accessGrade !== null && user.accessGrade === lesson.target_grade;
}

/**
 * service_role sorgularında canUserAccessLiveLesson'ın PostgREST `or` karşılığı
 * (yalnız ön süzme; sonuç yine canUserAccessLiveLesson'dan geçirilir).
 * accessGrade rakam veya 'Mezun' olabildiği, id doğrulanmış JWT'den geldiği
 * için filtre sözdizimine kaçış gerekmez.
 */
export function liveLessonAudienceFilter(user: LiveLessonViewer) {
  const clauses = [
    'target_grade.eq.all',
    `and(target_grade.eq.selected,target_student_ids.cs.{${user.id}})`,
  ];
  if (user.accessGrade !== null) {
    clauses.push(`target_grade.eq.${user.accessGrade}`);
  }
  return clauses.join(',');
}
