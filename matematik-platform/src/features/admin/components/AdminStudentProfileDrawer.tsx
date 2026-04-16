"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  Flame,
  GraduationCap,
  Target,
  Trophy,
  X,
} from "lucide-react";
import type {
  AdminStudentProfileData,
  AdminUser,
} from "@/features/admin/types";
import { buildAdminStudentProfileSummary } from "@/features/admin/utils/student-profile";

type AdminStudentProfileDrawerProps = {
  data: AdminStudentProfileData | null;
  error: string | null;
  formatDate: (dateString?: string | null) => string;
  isLoading: boolean;
  onClose: () => void;
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

export default function AdminStudentProfileDrawer({
  data,
  error,
  formatDate,
  isLoading,
  onClose,
  student,
}: AdminStudentProfileDrawerProps) {
  const summary = data ? buildAdminStudentProfileSummary(data) : null;
  const submittedAssignmentIds = new Set(
    (data?.submissions || []).map((submission) => submission.assignment_id),
  );
  const completedAssignments = (data?.assignments || []).filter((assignment) =>
    submittedAssignmentIds.has(assignment.id),
  ).length;

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
              <span>•</span>
              <span>
                {student?.is_private_student ? "Özel ders öğrencisi" : "Genel öğrenci"}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Kayıt: {formatDate(student?.created_at || data?.student.created_at)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
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
  value: number;
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
