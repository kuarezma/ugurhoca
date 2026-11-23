import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  MessageCircle,
  Send,
  Star,
  Target,
  UserRound,
} from 'lucide-react';
import type { AdminUser, StudentAdminStatus } from '@/features/admin/types';
import type { TrackingInsight } from '@/features/admin/utils/tracking-insights';
import { formatGrade, MiniSignal } from './helpers';
import { QuickLabelForm } from './QuickLabelForm';

type Props = {
  insight: TrackingInsight;
  onCreateWeeklyPlan: (student: AdminUser) => Promise<void> | void;
  onSendMessage: (student: AdminUser) => void;
  onUpdateStatus: (
    student: AdminUser,
    status: StudentAdminStatus['status'],
    labels?: string[],
  ) => Promise<void> | void;
  onViewProfile: (student: AdminUser) => Promise<void> | void;
};

export function TrackingStudentCard({
  insight,
  onCreateWeeklyPlan,
  onSendMessage,
  onUpdateStatus,
  onViewProfile,
}: Props) {
  return (
    <article className="rounded-2xl border border-border-default bg-surface-1 p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                insight.riskLevel === 'high'
                  ? 'bg-tone-danger-bg text-tone-danger-fg'
                  : insight.riskLevel === 'medium'
                    ? 'bg-tone-warn-bg text-tone-warn-fg'
                    : 'bg-tone-success-bg text-tone-success-fg'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {insight.riskLevel === 'high'
                ? 'Yüksek risk'
                : insight.riskLevel === 'medium'
                  ? 'Takipte'
                  : 'Normal'}
            </span>
            <span className="rounded-full border border-border-subtle bg-surface-2 px-2.5 py-1 text-xs font-semibold text-secondary">
              {formatGrade(insight.student.grade)}
            </span>
            {insight.student.is_favorite ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-tone-warn-border bg-tone-warn-bg px-2.5 py-1 text-xs font-semibold text-tone-warn-fg">
                <Star className="h-3.5 w-3.5 fill-current" />
                Favori
              </span>
            ) : null}
            {insight.status?.labels?.map((label) => (
              <span
                key={label}
                className="rounded-full border border-tone-info-border bg-tone-info-bg px-2.5 py-1 text-xs font-semibold text-tone-info-fg"
              >
                {label}
              </span>
            ))}
          </div>

          <h3 className="truncate text-lg font-bold text-primary">
            {insight.student.name || 'İsimsiz öğrenci'}
          </h3>
          <p className="mt-1 break-all text-sm text-secondary">
            {insight.student.email}
          </p>

          <QuickLabelForm
            studentName={insight.student.name || 'İsimsiz öğrenci'}
            labels={insight.status?.labels ?? []}
            onSave={(nextLabels) =>
              onUpdateStatus(
                insight.student,
                insight.status?.status ??
                  (insight.riskLevel === 'high' ? 'risk' : 'watch'),
                nextLabels,
              )
            }
          />
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
              <span className="rounded-full border border-tone-success-border bg-tone-success-bg px-3 py-1 text-xs font-semibold text-tone-success-fg">
                Kritik sinyal yok
              </span>
            ) : (
              insight.riskReasons.map((reason) => (
                <span
                  key={reason}
                  className="rounded-full border border-tone-danger-border bg-tone-danger-bg px-3 py-1 text-xs font-semibold text-tone-danger-fg"
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
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-tone-info-border bg-tone-info-bg px-4 py-2.5 text-sm font-bold text-tone-info-fg transition hover:opacity-90 active:scale-95"
          >
            <UserRound className="h-4 w-4" />
            Profil Aç
          </button>
          <button
            type="button"
            onClick={() => onSendMessage(insight.student)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border-default bg-accent-bg px-4 py-2.5 text-sm font-bold text-accent-fg transition hover:opacity-90 active:scale-95"
          >
            <Send className="h-4 w-4" />
            Mesaj Gönder
          </button>
          <button
            type="button"
            onClick={() => onCreateWeeklyPlan(insight.student)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-tone-success-border bg-tone-success-bg px-4 py-2.5 text-sm font-bold text-tone-success-fg transition hover:opacity-90 active:scale-95"
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
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-tone-warn-border bg-tone-warn-bg px-4 py-2.5 text-sm font-bold text-tone-warn-fg transition hover:opacity-90 active:scale-95"
          >
            <MessageCircle className="h-4 w-4" />
            Takibe Al
          </button>
        </div>
      </div>
    </article>
  );
}
