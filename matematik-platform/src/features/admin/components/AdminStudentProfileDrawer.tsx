"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  Award,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Flame,
  GraduationCap,
  MessageSquarePlus,
  Target,
  Trophy,
  X,
} from "lucide-react";
import type {
  AdminStudentProfileData,
  AdminUser,
} from "@/features/admin/types";
import { buildAdminStudentProfileSummary } from "@/features/admin/utils/student-profile";
import { useAccessibleModal } from "@/hooks/useAccessibleModal";

type AdminStudentProfileDrawerProps = {
  data: AdminStudentProfileData | null;
  error: string | null;
  formatDate: (dateString?: string | null) => string;
  isLoading: boolean;
  onAddAdminNote?: (student: AdminUser) => Promise<void> | void;
  onClose: () => void;
  onCreateWeeklyPlan?: (student: AdminUser) => Promise<void> | void;
  onUpdateStatus?: (
    student: AdminUser,
    status: "normal" | "watch" | "risk" | string,
    labels?: string[],
  ) => Promise<void> | void;
  student: AdminUser | null;
};

const formatGradeLabel = (grade?: string | number | null) => {
  if (grade === "Mezun") {
    return "Mezun";
  }

  return typeof grade === "number" ? `${grade}. Sınıf` : "Belirtilmemiş";
};

const formatShortDate = (dateString?: string | null) => {
  if (!dateString) {
    return "Bilinmiyor";
  }

  return new Date(dateString).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
};

const getActivityTypeLabel = (activityType?: string | null) => {
  switch (activityType) {
    case "test":
      return "Test Çözümü";
    case "video":
      return "Video İzleme";
    case "kitap":
      return "Kitap Çalışması";
    case "not":
      return "Not Tekrarı";
    default:
      return "Çalışma";
  }
};

const buildWeeklyStudyCurve = (
  sessions: AdminStudentProfileData["studySessions"],
  targetMinutes: number,
) => {
  const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const today = new Date();
  const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const daily = days.map((name) => ({ minutes: 0, name }));

  for (const session of sessions) {
    const sessionDate = new Date(session.date);
    if (sessionDate >= startOfWeek) {
      const index = sessionDate.getDay() === 0 ? 6 : sessionDate.getDay() - 1;
      if (index >= 0 && index < daily.length) {
        daily[index].minutes += session.duration;
      }
    }
  }

  let cumulative = 0;
  return daily.map((day, index) => {
    cumulative += day.minutes;
    return {
      ...day,
      cumulative,
      target: Math.round((targetMinutes / 7) * (index + 1)),
    };
  });
};

const getTopStudyTopics = (
  sessions: AdminStudentProfileData["studySessions"],
) => {
  const totals = new Map<string, number>();

  for (const session of sessions) {
    for (const topic of session.topics || []) {
      totals.set(topic, (totals.get(topic) || 0) + session.duration);
    }
  }

  return Array.from(totals.entries())
    .map(([topic, minutes]) => ({ minutes, topic }))
    .sort((left, right) => right.minutes - left.minutes)
    .slice(0, 5);
};

export default function AdminStudentProfileDrawer({
  data,
  error,
  formatDate,
  isLoading,
  onAddAdminNote,
  onClose,
  onCreateWeeklyPlan,
  onUpdateStatus,
  student,
}: AdminStudentProfileDrawerProps) {
  const drawerRef = useAccessibleModal<HTMLElement>(true, onClose);
  const summary = data ? buildAdminStudentProfileSummary(data) : null;
  const submittedAssignmentIds = new Set(
    (data?.submissions || []).map((submission) => submission.assignment_id),
  );
  const completedAssignments = (data?.assignments || []).filter((assignment) =>
    submittedAssignmentIds.has(assignment.id),
  ).length;
  const weeklyStudyCurve =
    data && summary
      ? buildWeeklyStudyCurve(data.studySessions, summary.goalSnapshot.targetMinutes)
      : [];
  const maxCurveValue = Math.max(
    1,
    ...weeklyStudyCurve.flatMap((point) => [point.cumulative, point.target]),
  );
  const topStudyTopics = data ? getTopStudyTopics(data.studySessions) : [];
  const effectiveStudent = student ?? (data?.student as AdminUser | null) ?? null;
  const latestPlan = data?.weeklyPlans?.[0] ?? null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.aside
        initial={{ opacity: 0, x: 48 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 48 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        onClick={(event) => event.stopPropagation()}
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Öğrenci profili"
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col border-l border-white/10 bg-slate-950/95 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              Öğrenci Profili
            </p>
            <h2 className="truncate text-2xl font-bold text-white">
              {student?.name || data?.student.name || "Öğrenci"}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-400">
              <span>{student?.email || data?.student.email || "-"}</span>
              <span>•</span>
              <span>{formatGradeLabel(student?.grade || data?.student.grade)}</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Kayıt: {formatDate(student?.created_at || data?.student.created_at)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="rounded-xl border border-white/10 p-2 text-slate-400 transition-colors hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isLoading && !data ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-slate-300">
                <div className="h-5 w-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                Profil verileri yükleniyor...
              </div>
            </div>
          ) : error && !data ? (
            <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-200">
              {error}
            </div>
          ) : data && summary ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  icon={<Flame className="h-5 w-5 text-orange-300" />}
                  label="Çalışma Serisi"
                  value={`${summary.currentStreak} gün`}
                  meta="Profil verisinden"
                />
                <SummaryCard
                  icon={<Target className="h-5 w-5 text-cyan-300" />}
                  label="Haftalık Hedef"
                  value={`%${summary.goalSnapshot.progressPercent}`}
                  meta={`${summary.goalSnapshot.completedMinutes}/${summary.goalSnapshot.targetMinutes} dk`}
                />
                <SummaryCard
                  icon={<Trophy className="h-5 w-5 text-emerald-300" />}
                  label="Güçlü Konu"
                  value={summary.strongTopic || "Henüz yok"}
                  meta="En yüksek hakimiyet"
                />
                <SummaryCard
                  icon={<BookOpen className="h-5 w-5 text-amber-300" />}
                  label="Odak Konusu"
                  value={summary.focusTopic || "Tekrar gerektiren konu yok"}
                  meta={
                    summary.latestQuizScore !== null
                      ? `Son test: ${summary.latestQuizScore}`
                      : "Henüz test sonucu yok"
                  }
                />
              </div>

              <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Takip Durumu
                    </h3>
                    <p className="text-sm text-slate-400">
                      Admin notları, etiketler ve takip tarihi.
                    </p>
                  </div>
                  {effectiveStudent ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onUpdateStatus?.(effectiveStudent, "normal", [])}
                        className="rounded-xl bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-200 transition hover:bg-emerald-500/25"
                      >
                        Normal
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateStatus?.(effectiveStudent, "watch", ["takipte"])}
                        className="rounded-xl bg-amber-500/15 px-3 py-2 text-xs font-bold text-amber-200 transition hover:bg-amber-500/25"
                      >
                        Takipte
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateStatus?.(effectiveStudent, "risk", ["risk"])}
                        className="rounded-xl bg-red-500/15 px-3 py-2 text-xs font-bold text-red-200 transition hover:bg-red-500/25"
                      >
                        Riskte
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <MiniStat
                    label="Durum"
                    value={
                      data.adminStatus?.status === "risk"
                        ? "Risk"
                        : data.adminStatus?.status === "watch"
                          ? "Takip"
                          : "Normal"
                    }
                  />
                  <MiniStat
                    label="Takip Tarihi"
                    value={
                      data.adminStatus?.follow_up_at
                        ? formatShortDate(data.adminStatus.follow_up_at)
                        : "-"
                    }
                  />
                  <MiniStat
                    label="Etiket"
                    value={data.adminStatus?.labels?.join(", ") || "-"}
                  />
                </div>

                <div className="mt-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-white">Admin Notları</p>
                    {effectiveStudent ? (
                      <button
                        type="button"
                        onClick={() => onAddAdminNote?.(effectiveStudent)}
                        className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/15"
                      >
                        <MessageSquarePlus className="h-4 w-4" />
                        Not Ekle
                      </button>
                    ) : null}
                  </div>
                  {data.adminNotes.length === 0 ? (
                    <EmptyState text="Henüz admin notu yok." />
                  ) : (
                    <div className="space-y-2">
                      {data.adminNotes.slice(0, 5).map((note) => (
                        <div
                          key={note.id}
                          className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3"
                        >
                          <p className="whitespace-pre-wrap text-sm text-slate-200">
                            {note.body}
                          </p>
                          <p className="mt-2 text-xs text-slate-500">
                            {formatShortDate(note.created_at)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Haftalık Plan
                    </h3>
                    <p className="text-sm text-slate-400">
                      Öğrenci yalnızca kendi planını görür.
                    </p>
                  </div>
                  {effectiveStudent ? (
                    <button
                      type="button"
                      onClick={() => onCreateWeeklyPlan?.(effectiveStudent)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500/15 px-4 py-2 text-sm font-bold text-cyan-200 transition hover:bg-cyan-500/25"
                    >
                      <CalendarClock className="h-4 w-4" />
                      Plan Oluştur
                    </button>
                  ) : null}
                </div>

                {!latestPlan ? (
                  <EmptyState text="Bu öğrenci için haftalık plan yok." />
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-white">{latestPlan.title}</p>
                        <p className="text-xs text-slate-500">
                          Hafta: {formatShortDate(latestPlan.week_start)} • Hedef: {latestPlan.target_minutes} dk
                        </p>
                      </div>
                      <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-200">
                        {latestPlan.student_weekly_plan_items?.filter((item) => item.completed_at).length || 0}/
                        {latestPlan.student_weekly_plan_items?.length || 0}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {(latestPlan.student_weekly_plan_items || []).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm"
                        >
                          <CheckCircle2
                            className={`h-4 w-4 ${item.completed_at ? "text-emerald-300" : "text-slate-600"}`}
                          />
                          <span className={item.completed_at ? "text-slate-400 line-through" : "text-slate-200"}>
                            {item.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Haftalık Çalışma Eğrisi
                    </h3>
                    <p className="text-sm text-slate-400">
                      600 dk hedefe göre toplam çalışma ilerlemesi
                    </p>
                  </div>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-300">
                    {summary.goalSnapshot.completedMinutes}/{summary.goalSnapshot.targetMinutes} dk
                  </span>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                  <div className="flex h-40 items-end gap-2 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    {weeklyStudyCurve.map((point) => (
                      <div
                        key={point.name}
                        className="flex h-full flex-1 flex-col justify-end gap-2"
                      >
                        <div className="relative flex flex-1 items-end justify-center">
                          <div
                            className="absolute bottom-0 w-2 rounded-t-full bg-slate-700"
                            style={{
                              height: `${Math.max(8, (point.target / maxCurveValue) * 100)}%`,
                            }}
                            title={`Hedef: ${point.target} dk`}
                          />
                          <div
                            className="relative z-10 w-5 rounded-t-xl bg-gradient-to-t from-emerald-500 to-cyan-300 shadow-lg shadow-emerald-500/20"
                            style={{
                              height: `${Math.max(point.cumulative > 0 ? 10 : 4, (point.cumulative / maxCurveValue) * 100)}%`,
                            }}
                            title={`${point.cumulative} dk`}
                          />
                        </div>
                        <span className="text-center text-[11px] font-semibold text-slate-500">
                          {point.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <p className="mb-3 text-sm font-bold text-white">
                      En Çok Çalışılan Konular
                    </p>
                    {topStudyTopics.length === 0 ? (
                      <p className="text-sm text-slate-500">Henüz konu yok.</p>
                    ) : (
                      <div className="space-y-3">
                        {topStudyTopics.map((topic) => (
                          <div key={topic.topic}>
                            <div className="mb-1 flex justify-between gap-2 text-xs">
                              <span className="truncate text-slate-300">
                                {topic.topic}
                              </span>
                              <span className="font-semibold text-cyan-300">
                                {topic.minutes} dk
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-800">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                                style={{
                                  width: `${Math.min(100, (topic.minutes / Math.max(topStudyTopics[0]?.minutes || 1, 1)) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">Son Çalışmalar</h3>
                    <p className="text-sm text-slate-400">
                      Son 10 çalışma oturumu
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-cyan-300">
                    {data.studySessions.length} kayıt
                  </span>
                </div>

                {data.studySessions.length === 0 ? (
                  <EmptyState text="Henüz çalışma oturumu kaydı yok." />
                ) : (
                  <div className="space-y-3">
                    {data.studySessions.slice(0, 10).map((session) => (
                      <div
                        key={session.id || `${session.date}:${session.duration}`}
                        className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-semibold text-white">
                              {getActivityTypeLabel(session.activity_type)}
                            </p>
                            <p className="text-sm text-slate-400">
                              {session.topics?.join(", ") || "Konu belirtilmedi"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-cyan-300">
                              {session.duration} dk
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatShortDate(session.date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-violet-300" />
                  <h3 className="text-lg font-bold text-white">Konu İlerlemesi</h3>
                </div>

                {data.progressRows.length === 0 ? (
                  <EmptyState text="Henüz konu ilerleme verisi yok." />
                ) : (
                  <div className="space-y-3">
                    {data.progressRows.map((row) => (
                      <div key={row.id || `${row.user_id}:${row.topic}`}>
                        <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                          <span className="font-medium text-slate-200">{row.topic}</span>
                          <span className="font-semibold text-violet-300">
                            %{row.mastery_level}
                          </span>
                        </div>
                        <div className="h-2.5 rounded-full bg-slate-800">
                          <div
                            className="h-2.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                            style={{ width: `${Math.max(0, Math.min(100, row.mastery_level))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                    <h3 className="text-lg font-bold text-white">Son Test Sonuçları</h3>
                  </div>

                  {summary.recentQuizResults.length === 0 ? (
                    <EmptyState text="Henüz tamamlanmış test sonucu yok." />
                  ) : (
                    <div className="space-y-3">
                      {summary.recentQuizResults.map((result) => (
                        <div
                          key={result.id}
                          className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-white">
                                {result.quizzes?.title || "Test Sonucu"}
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatShortDate(result.completed_at)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-emerald-300">
                                {result.score}/{result.total_questions}
                              </p>
                              <p className="text-xs text-slate-500">
                                %{Math.round((result.score / Math.max(result.total_questions, 1)) * 100)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-300" />
                    <h3 className="text-lg font-bold text-white">Ödev Özeti</h3>
                  </div>

                  <div className="mb-4 grid grid-cols-3 gap-3">
                    <MiniStat label="Toplam" value={summary.totalAssignments} />
                    <MiniStat label="Teslim" value={completedAssignments} />
                    <MiniStat
                      label="Bekleyen"
                      value={summary.pendingAssignments.length}
                    />
                  </div>

                  {summary.reviewedSubmissions.length === 0 ? (
                    <EmptyState text="Henüz değerlendirilmiş ödev yok." />
                  ) : (
                    <div className="space-y-3">
                      {summary.reviewedSubmissions.map((submission) => (
                        <div
                          key={submission.id}
                          className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold text-white">
                                {formatShortDate(submission.submitted_at)}
                              </p>
                              <p className="text-sm text-slate-400 line-clamp-2">
                                {submission.feedback || "Geri bildirim bulunmuyor."}
                              </p>
                            </div>
                            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-300">
                              {submission.grade ?? "-"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Clock3 className="h-5 w-5 text-sky-300" />
                  <h3 className="text-lg font-bold text-white">Rozetler</h3>
                </div>

                {data.badges.length === 0 ? (
                  <EmptyState text="Henüz rozet kazanılmamış." />
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {data.badges.map((badge) => (
                      <div
                        key={badge.id}
                        className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3"
                      >
                        <p className="font-semibold text-amber-200">{badge.name}</p>
                        <p className="text-xs text-amber-100/70">
                          {formatShortDate(badge.earnedAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-slate-300">
              Öğrenci verisi bulunamadı.
            </div>
          )}
        </div>
      </motion.aside>
    </motion.div>
  );
}

function SummaryCard({
  icon,
  label,
  meta,
  value,
}: {
  icon: ReactNode;
  label: string;
  meta: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
        {icon}
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{meta}</p>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-3 text-center">
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 px-4 py-6 text-center text-sm text-slate-400">
      {text}
    </div>
  );
}
