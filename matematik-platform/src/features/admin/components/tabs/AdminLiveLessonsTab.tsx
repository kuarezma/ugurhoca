'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import type {
  LiveLesson,
  LiveLessonDashboardData,
} from '@/features/live-lessons/types';
import type { AdminUser } from '@/features/admin/types';
import {
  attendanceForLesson,
  buildEditForm,
  countForLesson,
  exportAllAttendanceCsv,
  normalizeSearchText,
  type EditFormState,
} from './AdminLiveLessonsTab/helpers';
import { LiveLessonCard } from './AdminLiveLessonsTab/LiveLessonCard';
import { LiveLessonEditForm } from './AdminLiveLessonsTab/LiveLessonEditForm';

type Props = {
  data: LiveLessonDashboardData;
  onRefresh: () => Promise<void> | void;
  students: AdminUser[];
};

export default function AdminLiveLessonsTab({
  data,
  onRefresh,
  students,
}: Props) {
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [editStudentSearchQuery, setEditStudentSearchQuery] = useState('');
  const [savingLessonId, setSavingLessonId] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const filteredEditStudents = useMemo(() => {
    const query = normalizeSearchText(editStudentSearchQuery);
    if (!query) return students;

    return students.filter((student) =>
      normalizeSearchText(
        `${student.name || ''} ${student.email || ''}`,
      ).includes(query),
    );
  }, [editStudentSearchQuery, students]);

  const openEditForm = (lesson: LiveLesson) => {
    setEditingLessonId(lesson.id);
    setEditForm(buildEditForm(lesson));
    setEditStudentSearchQuery('');
    setEditError(null);
  };

  const updateStatus = async (
    lesson: LiveLesson,
    status: 'ended' | 'cancelled',
  ) => {
    await fetch(`/api/live-lessons/${lesson.id}/end`, {
      body: JSON.stringify({ status }),
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    await onRefresh();
  };

  const toggleEditStudent = (studentId: string) => {
    setEditForm((current) => {
      if (!current) return current;
      return {
        ...current,
        targetStudentIds: current.targetStudentIds.includes(studentId)
          ? current.targetStudentIds.filter((id) => id !== studentId)
          : [...current.targetStudentIds, studentId],
      };
    });
  };

  const saveEdit = async (lesson: LiveLesson) => {
    if (!editForm) return;
    if (
      editForm.targetGrade === 'selected' &&
      editForm.targetStudentIds.length === 0
    ) {
      setEditError('En az bir öğrenci seçin.');
      return;
    }

    setSavingLessonId(lesson.id);
    setEditError(null);
    try {
      const response = await fetch(`/api/live-lessons/${lesson.id}`, {
        body: JSON.stringify({
          description: editForm.description,
          durationMinutes: editForm.durationMinutes,
          materialsUrl: editForm.materialsUrl.trim() || null,
          recordingUrl: editForm.recordingUrl.trim() || null,
          startsAt: new Date(editForm.startsAt).toISOString(),
          targetGrade: editForm.targetGrade,
          targetStudentIds:
            editForm.targetGrade === 'selected'
              ? editForm.targetStudentIds
              : [],
          title: editForm.title,
        }),
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok) {
        setEditError(payload?.error || 'Ders güncellenemedi.');
        return;
      }
      setEditingLessonId(null);
      setEditForm(null);
      await onRefresh();
    } finally {
      setSavingLessonId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Canlı Dersler
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Planlama, aktif dersler, yoklama ve soru cevap kayıtları.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {data.participants.length > 0 && (
              <button
                type="button"
                onClick={() => exportAllAttendanceCsv(data)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 px-4 text-sm font-semibold text-slate-700 dark:text-white transition-colors"
                title="Tüm canlı derslerin yoklama verisini Excel / CSV olarak indir"
              >
                <Download className="w-4 h-4 text-accent-success-ink dark:text-emerald-400" />
                <span>Tüm Katılım Özeti (CSV)</span>
              </button>
            )}
            <Link
              href="/canli-ders"
              className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
            >
              Ders planla
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {data.lessons.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 p-6 text-slate-600 dark:text-slate-300 shadow-sm">
            Henüz canlı ders planlanmadı.
          </div>
        ) : (
          data.lessons.map((lesson) => {
            const participants = countForLesson(data.participants, lesson.id);
            const answers = data.events.filter(
              (event) =>
                event.lesson_id === lesson.id && event.event_type === 'answer',
            ).length;
            const chats = countForLesson(data.chatMessages, lesson.id);
            const attendanceRows = attendanceForLesson(
              data.participants,
              lesson.id,
            );
            const isEditing = editingLessonId === lesson.id && editForm;

            return (
              <LiveLessonCard
                key={lesson.id}
                lesson={lesson}
                students={students}
                participants={participants}
                answers={answers}
                chats={chats}
                attendanceRows={attendanceRows}
                isEditing={Boolean(isEditing)}
                onOpenEdit={() => openEditForm(lesson)}
                onUpdateStatus={(status) => void updateStatus(lesson, status)}
                editFormChild={
                  editForm ? (
                    <LiveLessonEditForm
                      editForm={editForm}
                      setEditForm={setEditForm}
                      editStudentSearchQuery={editStudentSearchQuery}
                      setEditStudentSearchQuery={setEditStudentSearchQuery}
                      students={students}
                      filteredEditStudents={filteredEditStudents}
                      toggleEditStudent={toggleEditStudent}
                      onSave={() => void saveEdit(lesson)}
                      isSaving={savingLessonId === lesson.id}
                      editError={editError}
                      onCancel={() => {
                        setEditingLessonId(null);
                        setEditForm(null);
                        setEditError(null);
                      }}
                    />
                  ) : null
                }
              />
            );
          })
        )}
      </div>
    </div>
  );
}
