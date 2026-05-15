"use client";

import Link from "next/link";
import { useState } from "react";
import type {
  LiveLesson,
  LiveLessonDashboardData,
  LiveLessonParticipant,
} from "@/features/live-lessons/types";
import type { AdminUser } from "@/features/admin/types";

type Props = {
  data: LiveLessonDashboardData;
  onRefresh: () => Promise<void> | void;
  students: AdminUser[];
};

type EditFormState = {
  description: string;
  durationMinutes: number;
  startsAt: string;
  targetGrade: string;
  targetStudentIds: string[];
  title: string;
};

const gradeOptions = [
  { label: "5. sınıf", value: "5" },
  { label: "6. sınıf", value: "6" },
  { label: "7. sınıf", value: "7" },
  { label: "8. sınıf", value: "8" },
  { label: "Mezun", value: "Mezun" },
  { label: "Herkese açık", value: "all" },
  { label: "Seçili öğrenciler", value: "selected" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

function formatTime(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

function toLocalInputValue(value: string) {
  const date = new Date(value);
  const pad = (number: number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function formatDuration(joinedAt: string, leftAt?: string | null) {
  const end = leftAt ? new Date(leftAt).getTime() : Date.now();
  const minutes = Math.max(0, Math.round((end - new Date(joinedAt).getTime()) / 60000));
  return minutes < 60 ? `${minutes} dk` : `${Math.floor(minutes / 60)} sa ${minutes % 60} dk`;
}

function formatGrade(value: AdminUser["grade"]) {
  return value === "Mezun" ? "Mezun" : `${value}. sınıf`;
}

function countForLesson<T extends { lesson_id: string }>(items: T[], lessonId: string) {
  return items.filter((item) => item.lesson_id === lessonId).length;
}

function formatAudience(lesson: LiveLesson, students: AdminUser[]) {
  if (lesson.target_grade === "all") return "Herkese açık";
  if (lesson.target_grade === "Mezun") return "Mezun";
  if (lesson.target_grade !== "selected") return `${lesson.target_grade}. sınıf`;

  const selectedCount = lesson.target_student_ids?.length || 0;
  if (selectedCount === 0) return "Seçili öğrenci yok";

  const firstStudent = students.find((student) => student.id === lesson.target_student_ids?.[0]);
  const firstName = firstStudent?.name || firstStudent?.email || "Seçili öğrenci";
  return selectedCount === 1 ? firstName : `${firstName} + ${selectedCount - 1} öğrenci`;
}

function buildEditForm(lesson: LiveLesson): EditFormState {
  return {
    description: lesson.description || "",
    durationMinutes: lesson.duration_minutes,
    startsAt: toLocalInputValue(lesson.starts_at),
    targetGrade: lesson.target_grade,
    targetStudentIds: lesson.target_student_ids || [],
    title: lesson.title,
  };
}

function attendanceForLesson(participants: LiveLessonParticipant[], lessonId: string) {
  const rows = participants.filter(
    (participant) => participant.lesson_id === lessonId && participant.role === "student",
  );
  const byStudent = new Map<string, LiveLessonParticipant[]>();

  for (const row of rows) {
    const key = row.user_id || row.user_name;
    byStudent.set(key, [...(byStudent.get(key) || []), row]);
  }

  return [...byStudent.values()].map((studentRows) => {
    const sortedRows = studentRows.sort(
      (left, right) => new Date(left.joined_at).getTime() - new Date(right.joined_at).getTime(),
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

export default function AdminLiveLessonsTab({ data, onRefresh, students }: Props) {
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [savingLessonId, setSavingLessonId] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const openEditForm = (lesson: LiveLesson) => {
    setEditingLessonId(lesson.id);
    setEditForm(buildEditForm(lesson));
    setEditError(null);
  };

  const updateStatus = async (lesson: LiveLesson, status: "ended" | "cancelled") => {
    await fetch(`/api/live-lessons/${lesson.id}/end`, {
      body: JSON.stringify({ status }),
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      method: "POST",
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
    if (editForm.targetGrade === "selected" && editForm.targetStudentIds.length === 0) {
      setEditError("En az bir öğrenci seçin.");
      return;
    }

    setSavingLessonId(lesson.id);
    setEditError(null);
    try {
      const response = await fetch(`/api/live-lessons/${lesson.id}`, {
        body: JSON.stringify({
          description: editForm.description,
          durationMinutes: editForm.durationMinutes,
          startsAt: new Date(editForm.startsAt).toISOString(),
          targetGrade: editForm.targetGrade,
          targetStudentIds: editForm.targetGrade === "selected" ? editForm.targetStudentIds : [],
          title: editForm.title,
        }),
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setEditError(payload?.error || "Ders güncellenemedi.");
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
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Canlı Dersler</h2>
            <p className="text-sm text-slate-400">
              Planlama, aktif dersler, yoklama ve soru cevap kayıtları.
            </p>
          </div>
          <Link
            href="/canli-ders"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-primary px-4 text-sm font-semibold text-white hover:bg-brand-primary-deep"
          >
            Ders planla
          </Link>
        </div>
      </div>

      <div className="grid gap-4">
        {data.lessons.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 text-slate-300">
            Henüz canlı ders planlanmadı.
          </div>
        ) : (
          data.lessons.map((lesson) => {
            const participants = countForLesson(data.participants, lesson.id);
            const answers = data.events.filter(
              (event) => event.lesson_id === lesson.id && event.event_type === "answer",
            ).length;
            const chats = countForLesson(data.chatMessages, lesson.id);
            const attendanceRows = attendanceForLesson(data.participants, lesson.id);
            const isEditing = editingLessonId === lesson.id && editForm;

            return (
              <article
                key={lesson.id}
                className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 text-white"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{lesson.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {formatDate(lesson.starts_at)} · {formatAudience(lesson, students)} ·{" "}
                      {lesson.duration_minutes} dk
                    </p>
                    {lesson.description ? (
                      <p className="mt-2 text-sm text-slate-300">{lesson.description}</p>
                    ) : null}
                  </div>
                  <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                    {lesson.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-xs text-slate-400">Yoklama</p>
                    <p className="text-xl font-bold">{participants}</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-xs text-slate-400">Cevap</p>
                    <p className="text-xl font-bold">{answers}</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-xs text-slate-400">Sohbet</p>
                    <p className="text-xl font-bold">{chats}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/50 p-4">
                  <p className="text-sm font-semibold">Yoklama raporu</p>
                  {attendanceRows.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-400">Bu derse henüz öğrenci katılmadı.</p>
                  ) : (
                    <div className="mt-3 grid gap-2">
                      {attendanceRows.map((row) => (
                        <div
                          key={row.id}
                          className="grid gap-2 rounded-lg bg-white/5 p-3 text-sm sm:grid-cols-4"
                        >
                          <span className="font-semibold">{row.name}</span>
                          <span className="text-slate-300">Giriş: {formatTime(row.joinedAt)}</span>
                          <span className="text-slate-300">Çıkış: {formatTime(row.leftAt)}</span>
                          <span className="text-slate-300">
                            Süre: {formatDuration(row.joinedAt, row.leftAt)}
                            {row.sessions > 1 ? ` · ${row.sessions} oturum` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="mt-4 rounded-xl border border-brand-primary/40 bg-slate-950 p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="space-y-1">
                        <span className="text-sm text-slate-300">Başlık</span>
                        <input
                          value={editForm.title}
                          onChange={(event) =>
                            setEditForm({ ...editForm, title: event.target.value })
                          }
                          className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-900 px-3 outline-none focus:ring-2 focus:ring-brand-primary"
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="text-sm text-slate-300">Ders hedefi</span>
                        <select
                          value={editForm.targetGrade}
                          onChange={(event) =>
                            setEditForm({ ...editForm, targetGrade: event.target.value })
                          }
                          className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-900 px-3 outline-none focus:ring-2 focus:ring-brand-primary"
                        >
                          {gradeOptions.map((grade) => (
                            <option key={grade.value} value={grade.value}>
                              {grade.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      {editForm.targetGrade === "selected" ? (
                        <div className="space-y-2 md:col-span-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm text-slate-300">Öğrenci seç</span>
                            <span className="text-xs text-slate-400">
                              {editForm.targetStudentIds.length} öğrenci seçildi
                            </span>
                          </div>
                          <div className="max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-slate-900 p-2">
                            <div className="grid gap-2 sm:grid-cols-2">
                              {students.map((student) => (
                                <label
                                  key={student.id}
                                  className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5"
                                >
                                  <input
                                    type="checkbox"
                                    aria-label={`${student.name || student.email} öğrencisini seç`}
                                    checked={editForm.targetStudentIds.includes(student.id)}
                                    onChange={() => toggleEditStudent(student.id)}
                                    className="h-4 w-4 accent-brand-primary"
                                  />
                                  <span className="min-w-0">
                                    <span className="block truncate font-semibold">
                                      {student.name || student.email}
                                    </span>
                                    <span className="block truncate text-xs text-slate-400">
                                      {formatGrade(student.grade)}
                                    </span>
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : null}
                      <label className="space-y-1">
                        <span className="text-sm text-slate-300">Tarih ve saat</span>
                        <input
                          type="datetime-local"
                          value={editForm.startsAt}
                          onChange={(event) =>
                            setEditForm({ ...editForm, startsAt: event.target.value })
                          }
                          className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-900 px-3 outline-none focus:ring-2 focus:ring-brand-primary"
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="text-sm text-slate-300">Süre</span>
                        <input
                          type="number"
                          min={15}
                          max={240}
                          value={editForm.durationMinutes}
                          onChange={(event) =>
                            setEditForm({
                              ...editForm,
                              durationMinutes: Number(event.target.value),
                            })
                          }
                          className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-900 px-3 outline-none focus:ring-2 focus:ring-brand-primary"
                        />
                      </label>
                      <label className="space-y-1 md:col-span-2">
                        <span className="text-sm text-slate-300">Açıklama</span>
                        <textarea
                          value={editForm.description}
                          onChange={(event) =>
                            setEditForm({ ...editForm, description: event.target.value })
                          }
                          className="min-h-20 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary"
                        />
                      </label>
                    </div>
                    {editError ? <p className="mt-3 text-sm text-red-300">{editError}</p> : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void saveEdit(lesson)}
                        disabled={savingLessonId === lesson.id}
                        className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold hover:bg-brand-primary-deep disabled:opacity-50"
                      >
                        {savingLessonId === lesson.id ? "Kaydediliyor..." : "Kaydet"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingLessonId(null);
                          setEditForm(null);
                          setEditError(null);
                        }}
                        className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/5"
                      >
                        Vazgeç
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/canli-ders/d/${lesson.room_id}`}
                    className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold hover:bg-brand-primary-deep"
                  >
                    Odaya gir
                  </Link>
                  {lesson.status !== "ended" && lesson.status !== "cancelled" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => openEditForm(lesson)}
                        className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/5"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => void updateStatus(lesson, "ended")}
                        className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/5"
                      >
                        Dersi bitir
                      </button>
                      <button
                        type="button"
                        onClick={() => void updateStatus(lesson, "cancelled")}
                        className="rounded-xl border border-red-400/40 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/10"
                      >
                        İptal et
                      </button>
                    </>
                  ) : null}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
