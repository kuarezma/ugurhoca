import type {
  LiveLesson,
  LiveLessonDashboardData,
  LiveLessonParticipant,
} from '@/features/live-lessons/types';
import type { AdminUser } from '@/features/admin/types';
import { formatIstanbulDate } from '@/lib/date-format';

export type EditFormState = {
  description: string;
  durationMinutes: number;
  materialsUrl: string;
  recordingUrl: string;
  startsAt: string;
  targetGrade: string;
  targetStudentIds: string[];
  title: string;
};

export const gradeOptions = [
  { label: '5. sınıf', value: '5' },
  { label: '6. sınıf', value: '6' },
  { label: '7. sınıf', value: '7' },
  { label: '8. sınıf', value: '8' },
  { label: 'Mezun', value: 'Mezun' },
  { label: 'Herkese açık', value: 'all' },
  { label: 'Seçili öğrenciler', value: 'selected' },
];

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(value));
}

export function formatTime(value?: string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(value));
}

export function toLocalInputValue(value: string) {
  const date = new Date(value);
  const pad = (number: number) => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function formatDuration(joinedAt: string, leftAt?: string | null) {
  const end = leftAt ? new Date(leftAt).getTime() : Date.now();
  const minutes = Math.max(
    0,
    Math.round((end - new Date(joinedAt).getTime()) / 60000),
  );
  return minutes < 60
    ? `${minutes} dk`
    : `${Math.floor(minutes / 60)} sa ${minutes % 60} dk`;
}

export function formatGrade(value: AdminUser['grade']) {
  return value === 'Mezun' ? 'Mezun' : `${value}. sınıf`;
}

export function countForLesson<T extends { lesson_id: string }>(
  items: T[],
  lessonId: string,
) {
  return items.filter((item) => item.lesson_id === lessonId).length;
}

export function formatAudience(lesson: LiveLesson, students: AdminUser[]) {
  if (lesson.target_grade === 'all') return 'Herkese açık';
  if (lesson.target_grade === 'Mezun') return 'Mezun';
  if (lesson.target_grade !== 'selected')
    return `${lesson.target_grade}. sınıf`;

  const selectedCount = lesson.target_student_ids?.length || 0;
  if (selectedCount === 0) return 'Seçili öğrenci yok';

  const firstStudent = students.find(
    (student) => student.id === lesson.target_student_ids?.[0],
  );
  const firstName =
    firstStudent?.name || firstStudent?.email || 'Seçili öğrenci';
  return selectedCount === 1
    ? firstName
    : `${firstName} + ${selectedCount - 1} öğrenci`;
}

export function normalizeSearchText(value: string) {
  return value.toLocaleLowerCase('tr-TR').trim();
}

export function buildEditForm(lesson: LiveLesson): EditFormState {
  return {
    description: lesson.description || '',
    durationMinutes: lesson.duration_minutes,
    materialsUrl: lesson.materials_url || '',
    recordingUrl: lesson.recording_url || '',
    startsAt: toLocalInputValue(lesson.starts_at),
    targetGrade: lesson.target_grade,
    targetStudentIds: lesson.target_student_ids || [],
    title: lesson.title,
  };
}

export function attendanceForLesson(
  participants: LiveLessonParticipant[],
  lessonId: string,
) {
  const rows = participants.filter(
    (participant) =>
      participant.lesson_id === lessonId && participant.role === 'student',
  );
  const byStudent = new Map<string, LiveLessonParticipant[]>();

  for (const row of rows) {
    const key = row.user_id || row.user_name;
    byStudent.set(key, [...(byStudent.get(key) || []), row]);
  }

  return [...byStudent.values()].map((studentRows) => {
    const sortedRows = studentRows.sort(
      (left, right) =>
        new Date(left.joined_at).getTime() -
        new Date(right.joined_at).getTime(),
    );
    const first = sortedRows[0];
    const last = sortedRows[sortedRows.length - 1];
    return {
      id: first.user_id || first.user_name,
      joinedAt: first.joined_at,
      leftAt: last.left_at,
      name: first.user_name,
      sessions: sortedRows.length,
    };
  });
}

export function exportAttendanceCsv(
  lesson: LiveLesson,
  rows: ReturnType<typeof attendanceForLesson>,
) {
  const headers = [
    'Öğrenci Adı',
    'Ders Başlığı',
    'Ders Tarihi',
    'İlk Giriş Saati',
    'Son Çıkış Saati',
    'Katılım Süresi',
    'Oturum Sayısı',
  ];

  const csvRows = rows.map((r) => {
    const escape = (val: unknown) =>
      `"${String(val ?? '').replace(/"/g, '""')}"`;
    return [
      escape(r.name),
      escape(lesson.title),
      escape(formatIstanbulDate(lesson.starts_at)),
      escape(formatTime(r.joinedAt)),
      escape(formatTime(r.leftAt)),
      escape(formatDuration(r.joinedAt, r.leftAt)),
      escape(r.sessions),
    ];
  });

  const csvContent =
    '\uFEFF' +
    [headers.join(','), ...csvRows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute(
    'download',
    `yoklama-${lesson.id.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAllAttendanceCsv(data: LiveLessonDashboardData) {
  const headers = [
    'Ders Başlığı',
    'Ders Tarihi',
    'Öğrenci Adı',
    'Giriş Saati',
    'Çıkış Saati',
    'Katılım Süresi',
  ];

  const lessonMap = new Map(data.lessons.map((l) => [l.id, l]));

  const rows = data.participants
    .filter((p) => p.role === 'student')
    .map((p) => {
      const lesson = lessonMap.get(p.lesson_id);
      const escape = (val: unknown) =>
        `"${String(val ?? '').replace(/"/g, '""')}"`;
      return [
        escape(lesson?.title || 'Bilinmeyen Ders'),
        escape(lesson ? formatIstanbulDate(lesson.starts_at) : '-'),
        escape(p.user_name),
        escape(formatTime(p.joined_at)),
        escape(formatTime(p.left_at)),
        escape(formatDuration(p.joined_at, p.left_at)),
      ];
    });

  const csvContent =
    '\uFEFF' +
    [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute(
    'download',
    `tum-canli-ders-yoklama-${new Date().toISOString().slice(0, 10)}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
