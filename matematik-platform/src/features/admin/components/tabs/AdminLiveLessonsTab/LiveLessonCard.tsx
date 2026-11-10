import Link from 'next/link';
import type { ReactNode } from 'react';
import { PlayCircle, Download, FileText } from 'lucide-react';
import type { LiveLesson } from '@/features/live-lessons/types';
import type { AdminUser } from '@/features/admin/types';
import {
  attendanceForLesson,
  exportAttendanceCsv,
  formatAudience,
  formatDate,
  formatDuration,
  formatTime,
} from './helpers';

type Props = {
  answers: number;
  attendanceRows: ReturnType<typeof attendanceForLesson>;
  chats: number;
  editFormChild?: ReactNode;
  isEditing: boolean;
  lesson: LiveLesson;
  onOpenEdit: () => void;
  onUpdateStatus: (status: 'ended' | 'cancelled') => void;
  participants: number;
  students: AdminUser[];
};

export function LiveLessonCard({
  answers,
  attendanceRows,
  chats,
  editFormChild,
  isEditing,
  lesson,
  onOpenEdit,
  onUpdateStatus,
  participants,
  students,
}: Props) {
  return (
    <article className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-5 text-slate-900 dark:text-white shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {lesson.title}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {formatDate(lesson.starts_at)} · {formatAudience(lesson, students)}{' '}
            · {lesson.duration_minutes} dk
          </p>
          {lesson.description ? (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {lesson.description}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {lesson.recording_url ? (
            <a
              href={lesson.recording_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-purple-500/40 bg-purple-500/15 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-500/25 transition"
              title="Ders kaydını aç"
            >
              <PlayCircle className="h-3 w-3" />
              <span>Kayıt İzle</span>
            </a>
          ) : lesson.status === 'ended' ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 px-2.5 py-0.5 text-xs text-slate-600 dark:text-slate-400">
              Kayıt Yok
            </span>
          ) : null}

          {lesson.materials_url ? (
            <a
              href={lesson.materials_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-blue-500/40 bg-blue-500/15 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-500/25 transition"
              title="Ders notlarını aç"
            >
              <FileText className="h-3 w-3" />
              <span>Notlar</span>
            </a>
          ) : null}

          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              lesson.status === 'active'
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 animate-pulse'
                : lesson.status === 'scheduled'
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                  : lesson.status === 'cancelled'
                    ? 'bg-red-500/20 text-red-700 dark:text-red-300'
                    : 'bg-slate-500/20 text-slate-700 dark:text-slate-300'
            }`}
          >
            {lesson.status === 'active'
              ? 'Canlı'
              : lesson.status === 'scheduled'
                ? 'Planlandı'
                : lesson.status === 'cancelled'
                  ? 'İptal'
                  : 'Bitti'}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:max-w-md">
        <div className="rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-transparent p-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Katılımcı
          </p>
          <p className="text-xl font-bold">{participants}</p>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-transparent p-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">Cevap</p>
          <p className="text-xl font-bold">{answers}</p>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-transparent p-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">Sohbet</p>
          <p className="text-xl font-bold">{chats}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/50 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Yoklama raporu</p>
          {attendanceRows.length > 0 && (
            <button
              type="button"
              onClick={() => exportAttendanceCsv(lesson, attendanceRows)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-300/60 dark:border-transparent bg-slate-200/80 hover:bg-slate-300/80 dark:bg-white/10 dark:hover:bg-white/20 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
              title="Bu dersin yoklamasını CSV olarak indir"
            >
              <Download className="w-3.5 h-3.5 text-accent-success-ink dark:text-emerald-400" />
              Yoklama İndir (CSV)
            </button>
          )}
        </div>
        {attendanceRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Bu derse henüz öğrenci katılmadı.
          </p>
        ) : (
          <div className="mt-3 grid gap-2">
            {attendanceRows.map((row) => (
              <div
                key={row.id}
                className="grid gap-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200/60 dark:border-transparent p-3 text-sm sm:grid-cols-4 shadow-xs"
              >
                <span className="font-semibold">{row.name}</span>
                <span className="text-slate-600 dark:text-slate-300">
                  Giriş: {formatTime(row.joinedAt)}
                </span>
                <span className="text-slate-600 dark:text-slate-300">
                  Çıkış: {formatTime(row.leftAt)}
                </span>
                <span className="text-slate-600 dark:text-slate-300">
                  Süre: {formatDuration(row.joinedAt, row.leftAt)}
                  {row.sessions > 1 ? ` · ${row.sessions} oturum` : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {isEditing ? editFormChild : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/canli-ders/d/${lesson.room_id}`}
          className="rounded-xl px-4 py-2 text-sm font-semibold bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
        >
          Odaya gir
        </Link>
        {lesson.status !== 'cancelled' ? (
          <>
            <button
              type="button"
              onClick={onOpenEdit}
              className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Düzenle
            </button>
            {lesson.status !== 'ended' ? (
              <>
                <button
                  type="button"
                  onClick={() => onUpdateStatus('ended')}
                  className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Dersi bitir
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateStatus('cancelled')}
                  className="rounded-xl border border-red-400/40 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-200 hover:bg-red-500/10"
                >
                  İptal et
                </button>
              </>
            ) : null}
          </>
        ) : null}
      </div>
    </article>
  );
}
