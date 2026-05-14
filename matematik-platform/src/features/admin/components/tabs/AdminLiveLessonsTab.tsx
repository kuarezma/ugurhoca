"use client";

import Link from "next/link";
import type { LiveLessonDashboardData, LiveLesson } from "@/features/live-lessons/types";

type Props = {
  data: LiveLessonDashboardData;
  onRefresh: () => Promise<void> | void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

function countForLesson<T extends { lesson_id: string }>(items: T[], lessonId: string) {
  return items.filter((item) => item.lesson_id === lessonId).length;
}

export default function AdminLiveLessonsTab({ data, onRefresh }: Props) {
  const updateStatus = async (lesson: LiveLesson, status: "ended" | "cancelled") => {
    await fetch(`/api/live-lessons/${lesson.id}/end`, {
      body: JSON.stringify({ status }),
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    await onRefresh();
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

            return (
              <article
                key={lesson.id}
                className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 text-white"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{lesson.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {formatDate(lesson.starts_at)} · {lesson.target_grade}. sınıf ·{" "}
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
