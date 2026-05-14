"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AuthSnapshot } from "@/lib/auth-snapshot";
import type { LiveLesson } from "@/features/live-lessons/types";

type Props = {
  initialLessons: LiveLesson[];
  user: AuthSnapshot;
};

const gradeOptions = [
  { label: "5. sınıf", value: "5" },
  { label: "6. sınıf", value: "6" },
  { label: "7. sınıf", value: "7" },
  { label: "8. sınıf", value: "8" },
  { label: "Mezun", value: "Mezun" },
  { label: "Herkese açık", value: "all" },
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

export function LiveLessonsPage({ initialLessons, user }: Props) {
  const [lessons, setLessons] = useState(initialLessons);
  const [title, setTitle] = useState("Canlı matematik dersi");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState(() =>
    toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000)),
  );
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [targetGrade, setTargetGrade] = useState(String(user.grade || "5"));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visibleLessons = useMemo(
    () =>
      lessons
        .filter((lesson) => lesson.status !== "ended" && lesson.status !== "cancelled")
        .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()),
    [lessons],
  );

  const createLesson = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/live-lessons", {
        body: JSON.stringify({
          description,
          durationMinutes,
          startsAt: new Date(startsAt).toISOString(),
          targetGrade,
          title,
        }),
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        lesson?: LiveLesson;
      } | null;
      if (!response.ok || !payload?.lesson) {
        setError(payload?.error || "Ders planlanamadı.");
        return;
      }
      setLessons((current) => [payload.lesson!, ...current]);
    } finally {
      setSaving(false);
    }
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
                <span className="text-sm text-slate-300">Sınıf</span>
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
              disabled={saving}
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
                      {lesson.target_grade === "all"
                        ? "Herkese açık"
                        : `${lesson.target_grade}. sınıf`}
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
