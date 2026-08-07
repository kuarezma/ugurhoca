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

function isStudentTargeted(lesson: LiveLesson, userId: string) {
  return (
    Array.isArray(lesson.target_student_ids) &&
    lesson.target_student_ids.includes(userId)
  );
}

export function canUserAccessLiveLesson(
  lesson: LiveLesson,
  user: { grade?: string | number | null; id: string },
) {
  if (lesson.target_grade === 'selected') {
    return isStudentTargeted(lesson, user.id);
  }
  return (
    lesson.target_grade === 'all' ||
    String(user.grade) === String(lesson.target_grade)
  );
}
