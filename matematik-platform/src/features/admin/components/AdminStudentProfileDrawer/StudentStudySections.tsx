import { CalendarClock, CheckCircle2, MessageSquarePlus } from 'lucide-react';
import type {
  AdminStudentProfileData,
  AdminUser,
  StudentWeeklyPlan,
} from '@/features/admin/types';
import { EmptyState, formatShortDate, MiniStat } from './helpers';

export function StudentTrackingSection({
  data,
  effectiveStudent,
  onAddAdminNote,
  onUpdateStatus,
}: {
  data: AdminStudentProfileData;
  effectiveStudent: AdminUser | null;
  onAddAdminNote?: (student: AdminUser) => Promise<void> | void;
  onUpdateStatus?: (
    student: AdminUser,
    status: 'normal' | 'watch' | 'risk' | string,
    labels?: string[],
  ) => Promise<void> | void;
}) {
  return (
    <section className="rounded-3xl border border-default dark:border-white/10 bg-surface-2/50 dark:bg-white/5 p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-primary">Takip Durumu</h3>
          <p className="text-sm text-secondary">
            Admin notları, etiketler ve takip tarihi.
          </p>
        </div>
        {effectiveStudent ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onUpdateStatus?.(effectiveStudent, 'normal', [])}
              className="rounded-xl border border-emerald-500/40 dark:border-emerald-400/30 bg-emerald-100 dark:bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-900 dark:text-emerald-200 transition hover:bg-emerald-200/80 dark:hover:bg-emerald-500/25"
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() =>
                onUpdateStatus?.(effectiveStudent, 'watch', ['takipte'])
              }
              className="rounded-xl border border-amber-500/40 dark:border-amber-400/30 bg-amber-100 dark:bg-amber-500/15 px-3 py-2 text-xs font-bold text-amber-900 dark:text-amber-200 transition hover:bg-amber-200/80 dark:hover:bg-amber-500/25"
            >
              Takipte
            </button>
            <button
              type="button"
              onClick={() =>
                onUpdateStatus?.(effectiveStudent, 'risk', ['risk'])
              }
              className="rounded-xl border border-red-500/40 dark:border-red-400/30 bg-red-100 dark:bg-red-500/15 px-3 py-2 text-xs font-bold text-red-900 dark:text-red-200 transition hover:bg-red-200/80 dark:hover:bg-red-500/25"
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
            data.adminStatus?.status === 'risk'
              ? 'Risk'
              : data.adminStatus?.status === 'watch'
                ? 'Takip'
                : 'Normal'
          }
        />
        <MiniStat
          label="Takip Tarihi"
          value={
            data.adminStatus?.follow_up_at
              ? formatShortDate(data.adminStatus.follow_up_at)
              : '-'
          }
        />
        <MiniStat
          label="Etiket"
          value={data.adminStatus?.labels?.join(', ') || '-'}
        />
      </div>

      <div className="mt-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-primary">Admin Notları</p>
          {effectiveStudent ? (
            <button
              type="button"
              onClick={() => onAddAdminNote?.(effectiveStudent)}
              className="inline-flex items-center gap-2 rounded-xl border border-default dark:border-white/10 bg-surface-2 dark:bg-white/10 px-3 py-2 text-xs font-bold text-primary dark:text-white transition hover:bg-surface-3 dark:hover:bg-white/15"
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
                className="rounded-2xl border border-default dark:border-white/10 bg-surface-2 dark:bg-slate-900/60 px-4 py-3"
              >
                <p className="whitespace-pre-wrap text-sm text-primary dark:text-slate-200">
                  {note.body}
                </p>
                <p className="mt-2 text-xs text-tertiary">
                  {formatShortDate(note.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function StudentWeeklyPlanSection({
  effectiveStudent,
  latestPlan,
  onCreateWeeklyPlan,
}: {
  effectiveStudent: AdminUser | null;
  latestPlan: StudentWeeklyPlan | null;
  onCreateWeeklyPlan?: (student: AdminUser) => Promise<void> | void;
}) {
  return (
    <section className="rounded-3xl border border-default dark:border-white/10 bg-surface-2/50 dark:bg-white/5 p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-primary">Haftalık Plan</h3>
          <p className="text-sm text-secondary">
            Öğrenci yalnızca kendi planını görür.
          </p>
        </div>
        {effectiveStudent ? (
          <button
            type="button"
            onClick={() => onCreateWeeklyPlan?.(effectiveStudent)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-500/40 dark:border-cyan-400/30 bg-cyan-100 dark:bg-cyan-500/15 px-4 py-2 text-sm font-bold text-cyan-900 dark:text-cyan-200 transition hover:bg-cyan-200/80 dark:hover:bg-cyan-500/25"
          >
            <CalendarClock className="h-4 w-4" />
            Plan Oluştur
          </button>
        ) : null}
      </div>

      {!latestPlan ? (
        <EmptyState text="Bu öğrenci için haftalık plan yok." />
      ) : (
        <div className="rounded-2xl border border-default dark:border-white/10 bg-surface-2 dark:bg-slate-900/60 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-bold text-primary">{latestPlan.title}</p>
              <p className="text-xs text-tertiary">
                Hafta: {formatShortDate(latestPlan.week_start)} • Hedef:{' '}
                {latestPlan.target_minutes} dk
              </p>
            </div>
            <span className="rounded-full bg-cyan-100 dark:bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-900 dark:text-cyan-200">
              {latestPlan.student_weekly_plan_items?.filter(
                (item) => item.completed_at,
              ).length || 0}
              /{latestPlan.student_weekly_plan_items?.length || 0}
            </span>
          </div>
          <div className="space-y-2">
            {(latestPlan.student_weekly_plan_items || []).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-xl bg-surface-1 dark:bg-white/5 px-3 py-2 text-sm"
              >
                <CheckCircle2
                  className={`h-4 w-4 ${item.completed_at ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-600'}`}
                />
                <span
                  className={
                    item.completed_at
                      ? 'text-secondary line-through'
                      : 'text-primary dark:text-slate-200'
                  }
                >
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function StudentStudyCurveSection({
  completedMinutes,
  maxCurveValue,
  targetMinutes,
  topStudyTopics,
  weeklyStudyCurve,
}: {
  completedMinutes: number;
  maxCurveValue: number;
  targetMinutes: number;
  topStudyTopics: { minutes: number; topic: string }[];
  weeklyStudyCurve: {
    cumulative: number;
    minutes: number;
    name: string;
    target: number;
  }[];
}) {
  return (
    <section className="rounded-3xl border border-default dark:border-white/10 bg-surface-2/50 dark:bg-white/5 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-primary">
            Haftalık Çalışma Eğrisi
          </h3>
          <p className="text-sm text-secondary">
            {targetMinutes} dk hedefe göre toplam çalışma ilerlemesi
          </p>
        </div>
        <span className="rounded-full border border-emerald-500/40 dark:border-emerald-400/30 bg-emerald-100 dark:bg-emerald-500/10 px-3 py-1 text-sm font-bold text-emerald-900 dark:text-emerald-300">
          {completedMinutes}/{targetMinutes} dk
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
        <div className="flex h-40 items-end gap-2 rounded-2xl border border-default dark:border-white/10 bg-surface-2 dark:bg-slate-900/60 p-4">
          {weeklyStudyCurve.map((point) => (
            <div
              key={point.name}
              className="flex h-full flex-1 flex-col justify-end gap-2"
            >
              <div className="relative flex flex-1 items-end justify-center">
                <div
                  className="absolute bottom-0 w-2 rounded-t-full bg-surface-3 dark:bg-slate-700"
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
              <span className="text-center text-[11px] font-semibold text-tertiary">
                {point.name}
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-default dark:border-white/10 bg-surface-2 dark:bg-slate-900/60 p-4">
          <p className="mb-3 text-sm font-bold text-primary">
            En Çok Çalışılan Konular
          </p>
          {topStudyTopics.length === 0 ? (
            <p className="text-sm text-tertiary">Henüz konu yok.</p>
          ) : (
            <div className="space-y-3">
              {topStudyTopics.map((topic) => (
                <div key={topic.topic}>
                  <div className="mb-1 flex justify-between gap-2 text-xs">
                    <span className="truncate text-secondary">
                      {topic.topic}
                    </span>
                    <span className="font-semibold text-cyan-800 dark:text-cyan-300">
                      {topic.minutes} dk
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-3 dark:bg-slate-800">
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
  );
}
