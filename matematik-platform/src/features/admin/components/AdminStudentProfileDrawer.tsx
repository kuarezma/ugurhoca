'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Flame, Printer, Target, Trophy, X } from 'lucide-react';
import type {
  AdminStudentProfileData,
  AdminUser,
} from '@/features/admin/types';
import { buildAdminStudentProfileSummary } from '@/features/admin/utils/student-profile';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import { StudentReportPrintView } from './StudentReportPrintView';
import {
  buildWeeklyStudyCurve,
  formatGradeLabel,
  getTopStudyTopics,
  SummaryCard,
} from './AdminStudentProfileDrawer/helpers';
import {
  StudentStudyCurveSection,
  StudentTrackingSection,
  StudentWeeklyPlanSection,
} from './AdminStudentProfileDrawer/StudentStudySections';
import {
  StudentBadgesSection,
  StudentQuizAndAssignmentSection,
  StudentRecentSessionsSection,
  StudentTopicProgressSection,
} from './AdminStudentProfileDrawer/StudentAcademicSections';

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
    status: 'normal' | 'watch' | 'risk' | string,
    labels?: string[],
  ) => Promise<void> | void;
  student: AdminUser | null;
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
      ? buildWeeklyStudyCurve(
          data.studySessions,
          summary.goalSnapshot.targetMinutes,
        )
      : [];
  const maxCurveValue = Math.max(
    1,
    ...weeklyStudyCurve.flatMap((point) => [point.cumulative, point.target]),
  );
  const topStudyTopics = data ? getTopStudyTopics(data.studySessions) : [];
  const effectiveStudent =
    student ?? (data?.student as AdminUser | null) ?? null;
  const latestPlan = data?.weeklyPlans?.[0] ?? null;
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);

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
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        onClick={(event) => event.stopPropagation()}
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Öğrenci profili"
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col border-l border-default dark:border-white/10 bg-surface-1 dark:bg-slate-950/95 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-default dark:border-white/10 px-6 py-5">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-300">
              Öğrenci Profili
            </p>
            <h2 className="truncate text-2xl font-bold text-primary">
              {student?.name || data?.student.name || 'Öğrenci'}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-secondary">
              <span>{student?.email || data?.student.email || '-'}</span>
              <span>•</span>
              <span>
                {formatGradeLabel(student?.grade || data?.student.grade)}
              </span>
            </div>
            <p className="mt-2 text-xs text-tertiary">
              Kayıt:{' '}
              {formatDate(student?.created_at || data?.student.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPrintReportOpen(true)}
              title="Öğrenci Gelişim Raporunu Yazdır / PDF"
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/40 dark:border-indigo-400/30 bg-indigo-100 dark:bg-indigo-500/15 px-3 py-2 text-xs font-bold text-indigo-900 dark:text-indigo-200 transition hover:bg-indigo-200/80 dark:hover:bg-indigo-500/25"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Gelişim Raporu</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="rounded-xl border border-default dark:border-white/10 p-2 text-secondary transition-colors hover:bg-surface-2 hover:text-primary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isLoading && !data ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex items-center gap-3 rounded-2xl border border-default dark:border-white/10 bg-surface-2 dark:bg-white/5 px-5 py-4 text-secondary">
                <div className="h-5 w-5 rounded-full border-2 border-cyan-600 dark:border-cyan-400 border-t-transparent animate-spin" />
                Profil verileri yükleniyor...
              </div>
            </div>
          ) : error && !data ? (
            <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-700 dark:text-red-200">
              {error}
            </div>
          ) : data && summary ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  icon={
                    <Flame className="h-5 w-5 text-orange-600 dark:text-orange-300" />
                  }
                  label="Çalışma Serisi"
                  value={`${summary.currentStreak} gün`}
                  meta="Profil verisinden"
                />
                <SummaryCard
                  icon={
                    <Target className="h-5 w-5 text-cyan-700 dark:text-cyan-300" />
                  }
                  label="Haftalık Hedef"
                  value={`%${summary.goalSnapshot.progressPercent}`}
                  meta={`${summary.goalSnapshot.completedMinutes}/${summary.goalSnapshot.targetMinutes} dk`}
                />
                <SummaryCard
                  icon={
                    <Trophy className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                  }
                  label="Güçlü Konu"
                  value={summary.strongTopic || 'Henüz yok'}
                  meta="En yüksek hakimiyet"
                />
                <SummaryCard
                  icon={
                    <BookOpen className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                  }
                  label="Odak Konusu"
                  value={summary.focusTopic || 'Tekrar gerektiren konu yok'}
                  meta={
                    summary.latestQuizScore !== null
                      ? `Son test: ${summary.latestQuizScore}`
                      : 'Henüz test sonucu yok'
                  }
                />
              </div>

              <StudentTrackingSection
                data={data}
                effectiveStudent={effectiveStudent}
                onAddAdminNote={onAddAdminNote}
                onUpdateStatus={onUpdateStatus}
              />

              <StudentWeeklyPlanSection
                effectiveStudent={effectiveStudent}
                latestPlan={latestPlan}
                onCreateWeeklyPlan={onCreateWeeklyPlan}
              />

              <StudentStudyCurveSection
                completedMinutes={summary.goalSnapshot.completedMinutes}
                targetMinutes={summary.goalSnapshot.targetMinutes}
                maxCurveValue={maxCurveValue}
                topStudyTopics={topStudyTopics}
                weeklyStudyCurve={weeklyStudyCurve}
              />

              <StudentRecentSessionsSection sessions={data.studySessions} />

              <StudentTopicProgressSection progressRows={data.progressRows} />

              <StudentQuizAndAssignmentSection
                completedAssignments={completedAssignments}
                summary={summary}
              />

              <StudentBadgesSection badges={data.badges} />
            </div>
          ) : (
            <div className="rounded-3xl border border-default dark:border-white/10 bg-surface-2 dark:bg-white/5 p-5 text-secondary">
              Öğrenci verisi bulunamadı.
            </div>
          )}
        </div>
      </motion.aside>

      <StudentReportPrintView
        isOpen={isPrintReportOpen}
        onClose={() => setIsPrintReportOpen(false)}
        student={
          effectiveStudent
            ? {
                averageScore: summary?.latestQuizScore ?? 85,
                completedAssignments: data?.submissions?.length || 0,
                completedQuizzes: data?.quizResults?.length || 0,
                email: effectiveStudent.email,
                grade:
                  typeof effectiveStudent.grade === 'number'
                    ? effectiveStudent.grade
                    : undefined,
                id: effectiveStudent.id,
                name: effectiveStudent.name,
                status:
                  typeof effectiveStudent.status === 'string'
                    ? effectiveStudent.status
                    : undefined,
                totalMinutes: summary?.goalSnapshot.targetMinutes,
              }
            : null
        }
      />
    </motion.div>
  );
}
