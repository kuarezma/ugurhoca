'use client';

import { useMemo, useState } from 'react';
import { Download, Filter, Search, ShieldCheck } from 'lucide-react';
import { isAdminEmail } from '@/lib/admin';
import { formatIstanbulDate } from '@/lib/date-format';
import {
  buildCoreWebVitalsSummary,
  buildTrackingPeriodTrends,
  buildTrackingActivityAnalytics,
} from '@/features/admin/utils/tracking-analytics';
import {
  type FollowUpFilter,
  matchesFollowUpFilter,
  buildTrackingDashboard,
  buildTrackingInsights,
} from '@/features/admin/utils/tracking-insights';
import type {
  AdminAssignment,
  AdminDocument,
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
import {
  getCurrentWeekStart,
  Metric,
  Select,
  type ActivityFilter,
  type FavoriteFilter,
  type RiskFilter,
} from './AdminTrackingTab/helpers';
import { TrackingAnalyticsSection } from './AdminTrackingTab/TrackingAnalyticsSection';
import { TrackingStudentCard } from './AdminTrackingTab/TrackingStudentCard';

type AdminTrackingTabProps = {
  activityEvents: StudentActivityEvent[];
  adminStatuses: StudentAdminStatus[];
  assignments: AdminAssignment[];
  documents: AdminDocument[];
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

export default function AdminTrackingTab({
  activityEvents,
  adminStatuses,
  assignments,
  documents,
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
  const [favoriteFilter, setFavoriteFilter] = useState<FavoriteFilter>('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [labelFilter, setLabelFilter] = useState('');
  const [followUpFilter, setFollowUpFilter] = useState<
    Exclude<FollowUpFilter, 'any'> | 'scheduled'
  >('all');
  const hasActiveFilters = Boolean(
    searchQuery ||
    labelFilter ||
    riskFilter !== 'all' ||
    activityFilter !== 'all' ||
    favoriteFilter !== 'all' ||
    gradeFilter !== 'all' ||
    followUpFilter !== 'all',
  );
  const weekStart = useMemo(() => getCurrentWeekStart(), []);
  const todayStart = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return start;
  }, []);

  const studentUsers = useMemo(
    () =>
      students.filter(
        (student) => !student.isAdmin && !isAdminEmail(student.email),
      ),
    [students],
  );

  const gradeOptions = useMemo(() => {
    const grades = new Set(
      studentUsers.map((student) => String(student.grade)),
    );
    return Array.from(grades).sort((left, right) => {
      if (left === 'Mezun') return 1;
      if (right === 'Mezun') return -1;
      return Number(left) - Number(right);
    });
  }, [studentUsers]);

  const insights = useMemo(
    () =>
      buildTrackingInsights({
        activityEvents,
        adminStatuses,
        assignments,
        notifications,
        quizResults,
        students: studentUsers,
        studyGoals,
        studySessions,
        submissions,
        todayStart,
        weekStart,
        weeklyPlans,
      }),
    [
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
    ],
  );

  const filteredInsights = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase('tr-TR');
    const normalizedLabel = labelFilter.trim().toLocaleLowerCase('tr-TR');

    return insights
      .filter((insight) => {
        const matchesSearch =
          !normalizedQuery ||
          (insight.student.name || '')
            .toLocaleLowerCase('tr-TR')
            .includes(normalizedQuery);
        const matchesRisk =
          riskFilter === 'all' || insight.riskLevel === riskFilter;
        const matchesActivity =
          activityFilter === 'all' || insight.activityStatus === activityFilter;
        const matchesGrade =
          gradeFilter === 'all' ||
          String(insight.student.grade) === gradeFilter;
        const matchesFavorite =
          favoriteFilter === 'all' || Boolean(insight.student.is_favorite);
        const matchesLabel =
          !normalizedLabel ||
          (insight.status?.labels || []).some((label) =>
            label.toLocaleLowerCase('tr-TR').includes(normalizedLabel),
          );

        return (
          matchesFollowUpFilter(
            insight,
            followUpFilter === 'scheduled' ? 'any' : followUpFilter,
          ) &&
          matchesSearch &&
          matchesRisk &&
          matchesActivity &&
          matchesGrade &&
          matchesFavorite &&
          matchesLabel
        );
      })
      .sort((left, right) => {
        const riskOrder = { high: 0, medium: 1, low: 2 };
        const riskDelta =
          riskOrder[left.riskLevel] - riskOrder[right.riskLevel];
        if (riskDelta !== 0) return riskDelta;

        const favoriteDelta =
          Number(Boolean(right.student.is_favorite)) -
          Number(Boolean(left.student.is_favorite));
        if (favoriteDelta !== 0) return favoriteDelta;

        return (left.student.name || '').localeCompare(
          right.student.name || '',
          'tr-TR',
        );
      });
  }, [
    followUpFilter,
    activityFilter,
    favoriteFilter,
    gradeFilter,
    insights,
    labelFilter,
    riskFilter,
    searchQuery,
  ]);

  const dashboard = useMemo(() => buildTrackingDashboard(insights), [insights]);

  const activityAnalytics = useMemo(
    () => buildTrackingActivityAnalytics(activityEvents, documents),
    [activityEvents, documents],
  );

  const periodTrends = useMemo(
    () =>
      buildTrackingPeriodTrends({ quizResults, submissions, studySessions }),
    [quizResults, submissions, studySessions],
  );
  const webVitals = useMemo(
    () => buildCoreWebVitalsSummary(activityEvents),
    [activityEvents],
  );

  const handleExportCsv = () => {
    const headers = [
      'Öğrenci Adı',
      'E-posta',
      'Sınıf',
      'Risk Durumu',
      'Risk Sebepleri',
      'Son Aktivite',
      'Pasif Gün Sayısı',
      'Son Test Başarısı (%)',
      'Haftalık Çalışma (dk)',
      'Haftalık Hedef (dk)',
      'Hedef İlerleme (%)',
      'Geciken Ödev Sayısı',
      'Okunmamış Mesaj',
      'Takip Etiketleri',
    ];

    const rows = filteredInsights.map((item) => {
      const escape = (val: unknown) =>
        `"${String(val ?? '').replace(/"/g, '""')}"`;
      return [
        escape(item.student.name || 'İsimsiz'),
        escape(item.student.email),
        escape(item.student.grade),
        escape(
          item.riskLevel === 'high'
            ? 'Yüksek Risk'
            : item.riskLevel === 'medium'
              ? 'Takipte'
              : 'Normal',
        ),
        escape(item.riskReasons.join('; ')),
        escape(
          item.lastActivityAt
            ? formatIstanbulDate(item.lastActivityAt)
            : 'Hiç yok',
        ),
        escape(
          item.inactiveDays === Number.POSITIVE_INFINITY
            ? '-'
            : item.inactiveDays,
        ),
        escape(
          item.latestQuizPercent !== null ? `%${item.latestQuizPercent}` : '-',
        ),
        escape(item.weeklyMinutes),
        escape(item.targetMinutes),
        escape(`%${item.weeklyProgress}`),
        escape(item.overdueAssignments.length),
        escape(item.unreadMessages),
        escape((item.status?.labels || []).join(', ')),
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Ugur-Hoca-Ogrenci-Takip-Raporu-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 p-6 shadow-sm dark:shadow-xl dark:shadow-black/20">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-cyan-100 dark:bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-700 dark:text-cyan-200">
              <ShieldCheck className="h-4 w-4" />
              Canlı Dashboard
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Takip Merkezi
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Risk, pasiflik, ödev, test, hedef ve mesaj sinyalleri tek ekranda.
            </p>
            <div className="mt-3">
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 transition hover:bg-emerald-500/25 active:scale-95"
                title="Filtrelenen öğrenci takip listesini Excel/CSV olarak indir"
              >
                <Download className="h-3.5 w-3.5" />
                <span>
                  Excel / CSV Raporu İndir ({filteredInsights.length})
                </span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Metric label="Bugün aktif" value={dashboard.activeToday} />
            <Metric label="7+ gün pasif" value={dashboard.inactive} />
            <Metric label="Yüksek risk" value={dashboard.highRisk} />
            <Metric label="Okunmamış" value={dashboard.unreadMessages} />
          </div>
        </div>
      </section>

      <TrackingAnalyticsSection
        activityAnalytics={activityAnalytics}
        periodTrends={periodTrends}
        webVitals={webVitals}
      />

      <section className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="relative block">
            <span className="sr-only">Öğrenci ara</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Öğrenci ara..."
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/60 py-2.5 pl-10 pr-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-cyan-500 dark:focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
            />
          </label>
          <Select
            value={riskFilter}
            onChange={(value) => setRiskFilter(value as RiskFilter)}
          >
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
          <Select
            aria-label="Takip tarihi filtresi"
            value={followUpFilter}
            onChange={(value) =>
              setFollowUpFilter(value as typeof followUpFilter)
            }
          >
            <option value="all">Tüm takip tarihleri</option>
            <option value="overdue">Takip tarihi geçen</option>
            <option value="today">Bugün takip</option>
            <option value="upcoming">Yaklaşan takip</option>
            <option value="scheduled">Takip tarihi olan</option>
          </Select>
          <Select value={gradeFilter} onChange={setGradeFilter}>
            <option value="all">Tüm sınıflar</option>
            {gradeOptions.map((grade) => (
              <option key={grade} value={grade}>
                {grade === 'Mezun' ? 'Mezun' : `${grade}. Sınıf`}
              </option>
            ))}
          </Select>
          <Select
            value={favoriteFilter}
            onChange={(value) => setFavoriteFilter(value as FavoriteFilter)}
          >
            <option value="all">Tüm öğrenciler</option>
            <option value="favorites">Favoriler</option>
          </Select>
          <label className="relative block">
            <span className="sr-only">Takip etiketi</span>
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              value={labelFilter}
              onChange={(event) => setLabelFilter(event.target.value)}
              placeholder="Etiket"
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/60 py-2.5 pl-10 pr-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-cyan-500 dark:focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20 lg:w-36"
            />
          </label>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            className="mt-3 rounded-xl border border-subtle px-4 py-2 text-sm text-primary"
            onClick={() => {
              setSearchQuery('');
              setLabelFilter('');
              setRiskFilter('all');
              setActivityFilter('all');
              setFavoriteFilter('all');
              setGradeFilter('all');
              setFollowUpFilter('all');
            }}
          >
            Filtreyi Sıfırla
          </button>
        )}
      </section>

      {filteredInsights.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 p-10 text-center text-slate-500 dark:text-slate-400">
          {studentUsers.length === 0
            ? 'Takip edilecek öğrenci kaydı henüz yok.'
            : 'Filtrelere uygun öğrenci bulunamadı.'}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInsights.map((insight) => (
            <TrackingStudentCard
              key={insight.student.id}
              insight={insight}
              onViewProfile={onViewProfile}
              onSendMessage={onSendMessage}
              onCreateWeeklyPlan={onCreateWeeklyPlan}
              onUpdateStatus={onUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
