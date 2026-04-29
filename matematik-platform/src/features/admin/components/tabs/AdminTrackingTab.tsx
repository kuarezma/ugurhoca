'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Filter,
  MessageCircle,
  Search,
  Send,
  ShieldCheck,
  Target,
  UserRound,
} from 'lucide-react';
import { isAdminEmail } from '@/lib/admin';
import { parseSupportPayload } from '@/features/messages/supportChatUtils';
import type {
  AdminAssignment,
  AdminNotification,
  AdminQuizResultRow,
  AdminStudyGoalRow,
  AdminStudySessionRow,
  AdminSubmission,
  AdminUser,
  StudentActivityEvent,
  StudentAdminStatus,
  StudentWeeklyPlan,
} from '@/features/admin/types';

type AdminTrackingTabProps = {
  activityEvents: StudentActivityEvent[];
  adminStatuses: StudentAdminStatus[];
  assignments: AdminAssignment[];
  notifications: AdminNotification[];
  onCreateWeeklyPlan: (student: AdminUser) => Promise<void> | void;
  onSendMessage: (student: AdminUser) => void;
  onUpdateStatus: (
    student: AdminUser,
    status: StudentAdminStatus['status'],
    labels?: string[],
  ) => Promise<void> | void;
  onViewProfile: (student: AdminUser) => Promise<void> | void;
  quizResults: AdminQuizResultRow[];
  studyGoals: AdminStudyGoalRow[];
  studySessions: AdminStudySessionRow[];
  students: AdminUser[];
  submissions: AdminSubmission[];
  weeklyPlans: StudentWeeklyPlan[];
};

type RiskFilter = 'all' | 'high' | 'medium' | 'low';
type ActivityFilter = 'all' | 'today' | 'week' | 'inactive';

const DAY_MS = 24 * 60 * 60 * 1000;

const getCurrentWeekStart = () => {
  const today = new Date();
  const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const start = new Date(today);
  start.setDate(today.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getDaysSince = (value?: string | null) => {
  if (!value) return Number.POSITIVE_INFINITY;
  return Math.floor((Date.now() - new Date(value).getTime()) / DAY_MS);
};

const formatGrade = (grade: AdminUser['grade']) =>
  grade === 'Mezun' ? 'Mezun' : `${grade}. Sınıf`;

const assignmentAppliesToStudent = (
  assignment: AdminAssignment,
  student: AdminUser,
) => {
  if (assignment.student_id) {
    return assignment.student_id === student.id;
  }

  if (assignment.grade === null || typeof assignment.grade === 'undefined') {
    return true;
  }

  return String(assignment.grade) === String(student.grade);
};

const getQuizPercent = (result?: AdminQuizResultRow | null) => {
  if (!result) return null;
  return Math.round((result.score / Math.max(result.total_questions, 1)) * 100);
};

export default function AdminTrackingTab({
  activityEvents,
  adminStatuses,
  assignments,
  notifications,
  onCreateWeeklyPlan,
  onSendMessage,
  onUpdateStatus,
  onViewProfile,
  quizResults,
  studyGoals,
  studySessions,
  students,
  submissions,
  weeklyPlans,
}: AdminTrackingTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [labelFilter, setLabelFilter] = useState('');
  const weekStart = useMemo(() => getCurrentWeekStart(), []);
  const todayStart = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return start;
  }, []);

  const studentUsers = useMemo(
    () => students.filter((student) => !student.isAdmin && !isAdminEmail(student.email)),
    [students],
  );

  const gradeOptions = useMemo(() => {
    const grades = new Set(studentUsers.map((student) => String(student.grade)));
    return Array.from(grades).sort((left, right) => {
      if (left === 'Mezun') return 1;
      if (right === 'Mezun') return -1;
      return Number(left) - Number(right);
    });
  }, [studentUsers]);

  const insights = useMemo(() => {
    const submissionsByStudent = new Map<string, Set<string>>();
    for (const submission of submissions) {
      const set = submissionsByStudent.get(submission.student_id) ?? new Set<string>();
      set.add(submission.assignment_id);
      submissionsByStudent.set(submission.student_id, set);
    }

    const quizByStudent = new Map<string, AdminQuizResultRow[]>();
    for (const result of quizResults) {
      const rows = quizByStudent.get(result.user_id) ?? [];
      rows.push(result);
      quizByStudent.set(result.user_id, rows);
    }

    const sessionsByStudent = new Map<string, AdminStudySessionRow[]>();
    for (const session of studySessions) {
      const rows = sessionsByStudent.get(session.user_id) ?? [];
      rows.push(session);
      sessionsByStudent.set(session.user_id, rows);
    }

    const eventsByStudent = new Map<string, StudentActivityEvent[]>();
    for (const event of activityEvents) {
      const rows = eventsByStudent.get(event.user_id) ?? [];
      rows.push(event);
      eventsByStudent.set(event.user_id, rows);
    }

    const goalsByStudent = new Map(studyGoals.map((goal) => [goal.user_id, goal]));
    const statusesByStudent = new Map(
      adminStatuses.map((status) => [status.student_id, status]),
    );
    const plansByStudent = new Map<string, StudentWeeklyPlan[]>();
    for (const plan of weeklyPlans) {
      const rows = plansByStudent.get(plan.student_id) ?? [];
      rows.push(plan);
      plansByStudent.set(plan.student_id, rows);
    }

    const unreadMessagesByStudent = new Map<string, number>();
    for (const notification of notifications) {
      if (notification.type !== 'message' || notification.is_read) continue;
      const parsed = parseSupportPayload(notification.message);
      if (!parsed?.sender_id) continue;
      unreadMessagesByStudent.set(
        parsed.sender_id,
        (unreadMessagesByStudent.get(parsed.sender_id) || 0) + 1,
      );
    }

    return studentUsers.map((student) => {
      const submittedAssignments = submissionsByStudent.get(student.id) ?? new Set<string>();
      const studentAssignments = assignments.filter((assignment) =>
        assignmentAppliesToStudent(assignment, student),
      );
      const overdueAssignments = studentAssignments.filter((assignment) => {
        if (!assignment.due_date || submittedAssignments.has(assignment.id)) {
          return false;
        }
        return new Date(assignment.due_date).getTime() < Date.now();
      });

      const studentQuizResults = quizByStudent.get(student.id) ?? [];
      const latestQuiz = studentQuizResults[0] ?? null;
      const latestQuizPercent = getQuizPercent(latestQuiz);
      const studentSessions = sessionsByStudent.get(student.id) ?? [];
      const weeklyMinutes = studentSessions
        .filter((session) => new Date(session.date) >= weekStart)
        .reduce((sum, session) => sum + (session.duration || 0), 0);
      const targetMinutes = goalsByStudent.get(student.id)?.target_duration ?? 600;
      const weeklyProgress = Math.round((weeklyMinutes / Math.max(targetMinutes, 1)) * 100);

      const candidateDates = [
        ...studentSessions.map((session) => session.date),
        ...studentQuizResults.map((result) => result.completed_at),
        ...submissions
          .filter((submission) => submission.student_id === student.id)
          .map((submission) => submission.submitted_at || null),
        ...(eventsByStudent.get(student.id) ?? []).map((event) => event.created_at),
      ].filter(Boolean) as string[];
      const lastActivityAt =
        candidateDates.sort(
          (left, right) => new Date(right).getTime() - new Date(left).getTime(),
        )[0] || student.created_at || null;
      const inactiveDays = getDaysSince(lastActivityAt);
      const status = statusesByStudent.get(student.id) ?? null;
      const studentPlans = plansByStudent.get(student.id) ?? [];
      const currentWeekPlan = studentPlans.find(
        (plan) => plan.week_start === weekStart.toISOString().slice(0, 10),
      );

      const riskReasons: string[] = [];
      if (inactiveDays >= 7) riskReasons.push('7+ gün pasif');
      if (overdueAssignments.length > 0) riskReasons.push('Gecikmiş ödev');
      if (latestQuizPercent !== null && latestQuizPercent < 60) {
        riskReasons.push('Düşük son test');
      }
      if (weeklyProgress < 40 && new Date().getDay() >= 4) {
        riskReasons.push('Haftalık hedef geride');
      }
      if ((unreadMessagesByStudent.get(student.id) || 0) > 0) {
        riskReasons.push('Okunmamış mesaj');
      }

      const riskLevel: 'high' | 'medium' | 'low' =
        status?.status === 'risk' || riskReasons.length >= 2
          ? 'high'
          : status?.status === 'watch' || riskReasons.length === 1
            ? 'medium'
            : 'low';
      const activityStatus =
        lastActivityAt && new Date(lastActivityAt) >= todayStart
          ? 'today'
          : inactiveDays <= 7
            ? 'week'
            : 'inactive';

      return {
        activityStatus,
        currentWeekPlan,
        inactiveDays,
        lastActivityAt,
        latestQuizPercent,
        overdueAssignments,
        riskLevel,
        riskReasons,
        status,
        student,
        unreadMessages: unreadMessagesByStudent.get(student.id) || 0,
        weeklyMinutes,
        weeklyProgress,
        targetMinutes,
      };
    });
  }, [
    activityEvents,
    adminStatuses,
    assignments,
    notifications,
    quizResults,
    studentUsers,
    studyGoals,
    studySessions,
    submissions,
    todayStart,
    weekStart,
    weeklyPlans,
  ]);

  const filteredInsights = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase('tr-TR');
    const normalizedLabel = labelFilter.trim().toLocaleLowerCase('tr-TR');

    return insights
      .filter((insight) => {
        const matchesSearch =
          !normalizedQuery ||
          (insight.student.name || '').toLocaleLowerCase('tr-TR').includes(normalizedQuery);
        const matchesRisk = riskFilter === 'all' || insight.riskLevel === riskFilter;
        const matchesActivity =
          activityFilter === 'all' || insight.activityStatus === activityFilter;
        const matchesGrade =
          gradeFilter === 'all' || String(insight.student.grade) === gradeFilter;
        const matchesLabel =
          !normalizedLabel ||
          (insight.status?.labels || []).some((label) =>
            label.toLocaleLowerCase('tr-TR').includes(normalizedLabel),
          );

        return (
          matchesSearch &&
          matchesRisk &&
          matchesActivity &&
          matchesGrade &&
          matchesLabel
        );
      })
      .sort((left, right) => {
        const riskOrder = { high: 0, medium: 1, low: 2 };
        return riskOrder[left.riskLevel] - riskOrder[right.riskLevel];
      });
  }, [activityFilter, gradeFilter, insights, labelFilter, riskFilter, searchQuery]);

  const dashboard = useMemo(() => {
    const activeToday = insights.filter((insight) => insight.activityStatus === 'today').length;
    const inactive = insights.filter((insight) => insight.inactiveDays >= 7).length;
    const highRisk = insights.filter((insight) => insight.riskLevel === 'high').length;
    const unreadMessages = insights.reduce((sum, insight) => sum + insight.unreadMessages, 0);

    return { activeToday, highRisk, inactive, unreadMessages };
  }, [insights]);

  const activityAnalytics = useMemo(() => {
    const now = Date.now();
    const last7Days = activityEvents.filter(
      (event) => now - new Date(event.created_at).getTime() <= 7 * DAY_MS,
    );
    const last30Days = activityEvents.filter(
      (event) => now - new Date(event.created_at).getTime() <= 30 * DAY_MS,
    );
    const byType = new Map<string, number>();
    const contentUsage = new Map<string, { count: number; title: string; type: string }>();

    for (const event of last30Days) {
      byType.set(event.event_type, (byType.get(event.event_type) || 0) + 1);

      if (event.entity_type === 'document' && event.entity_id) {
        const metadata = event.metadata || {};
        const current = contentUsage.get(event.entity_id) || {
          count: 0,
          title:
            typeof metadata.title === 'string'
              ? metadata.title
              : 'İçerik',
          type:
            typeof metadata.type === 'string'
              ? metadata.type
              : 'document',
        };
        contentUsage.set(event.entity_id, {
          ...current,
          count: current.count + 1,
        });
      }
    }

    return {
      last7Count: last7Days.length,
      last30Count: last30Days.length,
      topContent: Array.from(contentUsage.values())
        .sort((left, right) => right.count - left.count)
        .slice(0, 5),
      topTypes: Array.from(byType.entries())
        .map(([type, count]) => ({ count, type }))
        .sort((left, right) => right.count - left.count)
        .slice(0, 6),
    };
  }, [activityEvents]);

  return (
    <div className="space-y-5 animate-fade-up">
      <section className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-200">
              <ShieldCheck className="h-4 w-4" />
              Canlı Dashboard
            </div>
            <h2 className="text-2xl font-bold text-white">Takip Merkezi</h2>
            <p className="mt-1 text-sm text-slate-400">
              Risk, pasiflik, ödev, test, hedef ve mesaj sinyalleri tek ekranda.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Metric label="Bugün aktif" value={dashboard.activeToday} />
            <Metric label="7+ gün pasif" value={dashboard.inactive} />
            <Metric label="Yüksek risk" value={dashboard.highRisk} />
            <Metric label="Okunmamış" value={dashboard.unreadMessages} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto]">
          <label className="relative block">
            <span className="sr-only">Öğrenci ara</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Öğrenci ara..."
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
            />
          </label>
          <Select value={riskFilter} onChange={(value) => setRiskFilter(value as RiskFilter)}>
            <option value="all">Tüm riskler</option>
            <option value="high">Yüksek risk</option>
            <option value="medium">Takipte</option>
            <option value="low">Normal</option>
          </Select>
          <Select
            value={activityFilter}
            onChange={(value) => setActivityFilter(value as ActivityFilter)}
          >
            <option value="all">Tüm aktiviteler</option>
            <option value="today">Bugün aktif</option>
            <option value="week">Bu hafta aktif</option>
            <option value="inactive">Pasif</option>
          </Select>
          <Select value={gradeFilter} onChange={setGradeFilter}>
            <option value="all">Tüm sınıflar</option>
            {gradeOptions.map((grade) => (
              <option key={grade} value={grade}>
                {grade === 'Mezun' ? 'Mezun' : `${grade}. Sınıf`}
              </option>
            ))}
          </Select>
          <label className="relative block">
            <span className="sr-only">Takip etiketi</span>
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={labelFilter}
              onChange={(event) => setLabelFilter(event.target.value)}
              placeholder="Etiket"
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 lg:w-36"
            />
          </label>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="mb-4 text-base font-bold text-white">
            Canlı Ölçüm
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Metric label="7 gün event" value={activityAnalytics.last7Count} />
            <Metric label="30 gün event" value={activityAnalytics.last30Count} />
          </div>
          <div className="mt-4 space-y-2">
            {activityAnalytics.topTypes.length === 0 ? (
              <p className="text-sm text-slate-500">Henüz ölçüm kaydı yok.</p>
            ) : (
              activityAnalytics.topTypes.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between rounded-xl bg-slate-950/45 px-3 py-2 text-sm"
                >
                  <span className="text-slate-300">{item.type}</span>
                  <span className="font-bold text-cyan-200">{item.count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="mb-4 text-base font-bold text-white">
            En Çok Kullanılan İçerikler
          </h3>
          {activityAnalytics.topContent.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-500">
              İçerik kullanım kaydı birikince burada listelenecek.
            </p>
          ) : (
            <div className="space-y-2">
              {activityAnalytics.topContent.map((item) => (
                <div
                  key={`${item.title}:${item.type}`}
                  className="flex items-center justify-between gap-3 rounded-xl bg-slate-950/45 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500">{item.type}</p>
                  </div>
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-200">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {filteredInsights.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-slate-400">
          Filtrelere uygun öğrenci bulunamadı.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInsights.map((insight) => (
            <article
              key={insight.student.id}
              className="rounded-2xl border border-white/10 bg-slate-950/55 p-4 shadow-lg shadow-black/10"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                        insight.riskLevel === 'high'
                          ? 'bg-red-500/15 text-red-200'
                          : insight.riskLevel === 'medium'
                            ? 'bg-amber-500/15 text-amber-200'
                            : 'bg-emerald-500/15 text-emerald-200'
                      }`}
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {insight.riskLevel === 'high'
                        ? 'Yüksek risk'
                        : insight.riskLevel === 'medium'
                          ? 'Takipte'
                          : 'Normal'}
                    </span>
                    <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">
                      {formatGrade(insight.student.grade)}
                    </span>
                    {insight.status?.labels?.map((label) => (
                      <span
                        key={label}
                        className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-200"
                      >
                        {label}
                      </span>
                    ))}
                  </div>

                  <h3 className="truncate text-lg font-bold text-white">
                    {insight.student.name || 'İsimsiz öğrenci'}
                  </h3>
                  <p className="mt-1 break-all text-sm text-slate-500">
                    {insight.student.email}
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MiniSignal
                      icon={<Clock3 className="h-4 w-4" />}
                      label="Son aktivite"
                      value={
                        insight.lastActivityAt
                          ? `${insight.inactiveDays} gün önce`
                          : 'Yok'
                      }
                    />
                    <MiniSignal
                      icon={<Target className="h-4 w-4" />}
                      label="Haftalık hedef"
                      value={`%${Math.min(100, insight.weeklyProgress)}`}
                      meta={`${insight.weeklyMinutes}/${insight.targetMinutes} dk`}
                    />
                    <MiniSignal
                      icon={<CheckCircle2 className="h-4 w-4" />}
                      label="Son test"
                      value={
                        insight.latestQuizPercent === null
                          ? 'Yok'
                          : `%${insight.latestQuizPercent}`
                      }
                    />
                    <MiniSignal
                      icon={<CalendarClock className="h-4 w-4" />}
                      label="Haftalık plan"
                      value={insight.currentWeekPlan ? 'Hazır' : 'Yok'}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {insight.riskReasons.length === 0 ? (
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                        Kritik sinyal yok
                      </span>
                    ) : (
                      insight.riskReasons.map((reason) => (
                        <span
                          key={reason}
                          className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-200"
                        >
                          {reason}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="grid min-w-[14rem] gap-2 sm:grid-cols-2 xl:grid-cols-1">
                  <button
                    type="button"
                    onClick={() => onViewProfile(insight.student)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500/15 px-4 py-2.5 text-sm font-bold text-cyan-200 transition hover:bg-cyan-500/25"
                  >
                    <UserRound className="h-4 w-4" />
                    Profil Aç
                  </button>
                  <button
                    type="button"
                    onClick={() => onSendMessage(insight.student)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500/15 px-4 py-2.5 text-sm font-bold text-violet-200 transition hover:bg-violet-500/25"
                  >
                    <Send className="h-4 w-4" />
                    Mesaj Gönder
                  </button>
                  <button
                    type="button"
                    onClick={() => onCreateWeeklyPlan(insight.student)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500/15 px-4 py-2.5 text-sm font-bold text-emerald-200 transition hover:bg-emerald-500/25"
                  >
                    <CalendarClock className="h-4 w-4" />
                    Plan Oluştur
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateStatus(
                        insight.student,
                        insight.riskLevel === 'high' ? 'risk' : 'watch',
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500/15 px-4 py-2.5 text-sm font-bold text-amber-200 transition hover:bg-amber-500/25"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Takibe Al
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Select({
  children,
  onChange,
  value,
}: {
  children: ReactNode;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 lg:w-40"
    >
      {children}
    </select>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3">
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs font-semibold text-slate-400">{label}</p>
    </div>
  );
}

function MiniSignal({
  icon,
  label,
  meta,
  value,
}: {
  icon: ReactNode;
  label: string;
  meta?: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
      <div className="mb-2 flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <p className="text-base font-bold text-white">{value}</p>
      {meta ? <p className="text-xs text-slate-500">{meta}</p> : null}
    </div>
  );
}
