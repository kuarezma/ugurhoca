"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AuthSnapshot } from "@/lib/auth-snapshot";
import type { LiveLesson } from "@/features/live-lessons/types";
import type { AppUser } from "@/types";

type Props = {
  initialLessons: LiveLesson[];
  students: AppUser[];
  user: AuthSnapshot;
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

function toLocalInputValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function formatGrade(value: AppUser["grade"]) {
  return value === "Mezun" ? "Mezun" : `${value}. sınıf`;
}

function formatAudience(lesson: LiveLesson, students: AppUser[]) {
  if (lesson.target_grade === "all") return "Herkese açık";
  if (lesson.target_grade === "Mezun") return "Mezun";
  if (lesson.target_grade !== "selected") return `${lesson.target_grade}. sınıf`;

  const selectedCount = lesson.target_student_ids?.length || 0;
  if (selectedCount === 0) return "Seçili öğrenci yok";

  const firstStudent = students.find((student) => student.id === lesson.target_student_ids?.[0]);
  const firstName = firstStudent?.name || firstStudent?.email || "Seçili öğrenci";
  return selectedCount === 1 ? firstName : `${firstName} + ${selectedCount - 1} öğrenci`;
}

function normalizeSearchText(value: string) {
  return value.toLocaleLowerCase("tr-TR").trim();
}

export function LiveLessonsPage({ initialLessons, students, user }: Props) {
  const [lessons, setLessons] = useState(initialLessons);
  const [title, setTitle] = useState("Canlı matematik dersi");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState(() =>
    toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000)),
  );
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [targetGrade, setTargetGrade] = useState(String(user.grade || "5"));
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [repeatWeeklyUntil, setRepeatWeeklyUntil] = useState(() =>
    toLocalInputValue(new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedStudentCount = selectedStudentIds.length;

  const filteredStudents = useMemo(() => {
    const query = normalizeSearchText(studentSearchQuery);
    if (!query) return students;

    return students.filter((student) =>
      normalizeSearchText(`${student.name || ""} ${student.email || ""}`).includes(query),
    );
  }, [studentSearchQuery, students]);

  const visibleLessons = useMemo(
    () =>
      lessons
        .filter((lesson) => lesson.status !== "ended" && lesson.status !== "cancelled")
        .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()),
    [lessons],
  );

  const createLesson = async () => {
    if (!title.trim()) {
      setError("Ders başlığı gerekli.");
      return;
    }

    const lessonStartDate = new Date(startsAt);
    if (!Number.isFinite(lessonStartDate.getTime())) {
      setError("Geçerli bir ders tarihi ve saati seçin.");
      return;
    }

    const repeatEndDate = repeatWeekly ? new Date(repeatWeeklyUntil) : null;
    if (repeatWeekly && (!repeatEndDate || !Number.isFinite(repeatEndDate.getTime()))) {
      setError("Tekrar bitişi için geçerli bir tarih seçin.");
      return;
    }

    if (targetGrade === "selected" && selectedStudentIds.length === 0) {
      setError("En az bir öğrenci seçin.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/live-lessons", {
        body: JSON.stringify({
          description,
          durationMinutes,
          repeatWeeklyUntil: repeatEndDate ? repeatEndDate.toISOString() : null,
          startsAt: lessonStartDate.toISOString(),
          targetGrade,
          targetStudentIds: targetGrade === "selected" ? selectedStudentIds : [],
          title,
        }),
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        lesson?: LiveLesson;
        lessons?: LiveLesson[];
      } | null;
      if (!response.ok || !payload?.lesson) {
        setError(payload?.error || "Ders planlanamadı. Lütfen sayfayı yenileyip tekrar deneyin.");
        return;
      }
      setLessons((current) => [...(payload.lessons || [payload.lesson!]), ...current]);
      setSelectedStudentIds([]);
    } catch {
      setError("Ders planlanamadı. İnternet bağlantısını kontrol edip tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId],
    );
  };

  const cancelLesson = async (lesson: LiveLesson) => {
    const response = await fetch(`/api/live-lessons/${lesson.id}/end`, {
      body: JSON.stringify({ status: "cancelled" }),
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const payload = (await response.json().catch(() => null)) as {
      lesson?: LiveLesson;
    } | null;
    if (response.ok && payload?.lesson) {
      setLessons((current) =>
        current.map((item) => (item.id === lesson.id ? payload.lesson! : item)),
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="text-sm text-slate-400 hover:text-white">
              Ana sayfa
            </Link>
            <h1 className="mt-2 text-3xl font-bold">Canlı Ders</h1>
            <p className="mt-1 text-sm text-slate-400">
              Planlanan dersleri takip et, aktif derse tek dokunuşla katıl.
            </p>
          </div>
        </header>

        {user.isAdmin ? (
          <section className="rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-xl sm:p-6">
            <h2 className="text-lg font-bold">Ders planla</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm text-slate-300">Başlık</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm text-slate-300">Ders hedefi</span>
                <select
                  value={targetGrade}
                  onChange={(event) => setTargetGrade(event.target.value)}
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  {gradeOptions.map((grade) => (
                    <option key={grade.value} value={grade.value}>
                      {grade.label}
                    </option>
                  ))}
                </select>
              </label>
              {targetGrade === "selected" ? (
                <div className="space-y-2 md:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm text-slate-300">Öğrenci seç</span>
                    <span className="text-xs text-slate-400">
                      {selectedStudentCount} öğrenci seçildi
                    </span>
                  </div>
                  <input
                    type="search"
                    value={studentSearchQuery}
                    onChange={(event) => setStudentSearchQuery(event.target.value)}
                    placeholder="Öğrenci adı veya e-posta ara"
                    className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                  <div className="max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-slate-950 p-2">
                    {students.length === 0 ? (
                      <p className="px-2 py-3 text-sm text-slate-400">
                        Seçilecek öğrenci kaydı bulunamadı.
                      </p>
                    ) : filteredStudents.length === 0 ? (
                      <p className="px-2 py-3 text-sm text-slate-400">
                        Aramaya uygun öğrenci bulunamadı.
                      </p>
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {filteredStudents.map((student) => (
                          <label
                            key={student.id}
                            className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5"
                          >
                            <input
                              type="checkbox"
                              aria-label={`${student.name || student.email} öğrencisini seç`}
                              checked={selectedStudentIds.includes(student.id)}
                              onChange={() => toggleStudent(student.id)}
                              className="h-4 w-4 accent-brand-primary"
                            />
                            <span className="min-w-0">
                              <span className="block truncate font-semibold text-white">
                                {student.name || student.email}
                              </span>
                              <span className="block truncate text-xs text-slate-400">
                                {formatGrade(student.grade)}
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
              <label className="space-y-1">
                <span className="text-sm text-slate-300">Tarih ve saat</span>
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(event) => setStartsAt(event.target.value)}
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm text-slate-300">Süre</span>
                <input
                  type="number"
                  min={15}
                  max={240}
                  value={durationMinutes}
                  onChange={(event) => setDurationMinutes(Number(event.target.value))}
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </label>
              <label className="flex min-h-11 items-center gap-3 rounded-xl border border-white/10 bg-slate-950 px-3 md:col-span-2">
                <input
                  type="checkbox"
                  checked={repeatWeekly}
                  onChange={(event) => setRepeatWeekly(event.target.checked)}
                  className="h-4 w-4 accent-brand-primary"
                />
                <span className="text-sm font-semibold text-slate-200">
                  Haftalık tekrar oluştur
                </span>
              </label>
              {repeatWeekly ? (
                <label className="space-y-1 md:col-span-2">
                  <span className="text-sm text-slate-300">Tekrar bitiş tarihi</span>
                  <input
                    type="datetime-local"
                    value={repeatWeeklyUntil}
                    onChange={(event) => setRepeatWeeklyUntil(event.target.value)}
                    className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                  <span className="text-xs text-slate-500">
                    En fazla 16 haftalık ders planlanır.
                  </span>
                </label>
              ) : null}
              <label className="space-y-1 md:col-span-2">
                <span className="text-sm text-slate-300">Açıklama</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="min-h-20 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </label>
            </div>
            {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
            <button
              type="button"
              onClick={() => void createLesson()}
              disabled={saving || (targetGrade === "selected" && selectedStudentCount === 0)}
              className="mt-4 min-h-11 rounded-xl bg-brand-primary px-5 font-semibold text-white hover:bg-brand-primary-deep disabled:opacity-50"
            >
              {saving ? "Planlanıyor..." : "Dersi planla"}
            </button>
          </section>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2">
          {visibleLessons.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 text-slate-300">
              Şu anda size atanmış canlı ders yok.
            </div>
          ) : (
            visibleLessons.map((lesson) => (
              <article
                key={lesson.id}
                className="rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">{lesson.title}</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {formatDate(lesson.starts_at)} · {lesson.duration_minutes} dk ·{" "}
                      {formatAudience(lesson, students)}
                    </p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                    {lesson.status === "active" ? "Aktif" : "Planlandı"}
                  </span>
                </div>
                {lesson.description ? (
                  <p className="mt-3 text-sm text-slate-300">{lesson.description}</p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/canli-ders/d/${lesson.room_id}`}
                    className="inline-flex min-h-11 items-center rounded-xl bg-brand-primary px-4 text-sm font-semibold text-white hover:bg-brand-primary-deep"
                  >
                    Derse katıl
                  </Link>
                  {user.isAdmin && lesson.status !== "cancelled" && lesson.status !== "ended" ? (
                    <button
                      type="button"
                      onClick={() => void cancelLesson(lesson)}
                      className="min-h-11 rounded-xl border border-red-400/40 px-4 text-sm font-semibold text-red-200 hover:bg-red-500/10"
                    >
                      Dersi iptal et
                    </button>
                  ) : null}
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
