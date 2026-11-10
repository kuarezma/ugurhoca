import { Award, CheckCircle2, Clock3, GraduationCap } from 'lucide-react';
import type { AdminStudentProfileData } from '@/features/admin/types';
import {
  type AdminStudentProfileSummary,
  EmptyState,
  formatShortDate,
  getActivityTypeLabel,
  MiniStat,
} from './helpers';

export function StudentRecentSessionsSection({
  sessions,
}: {
  sessions: AdminStudentProfileData['studySessions'];
}) {
  return (
    <section className="rounded-3xl border border-default dark:border-white/10 bg-surface-2/50 dark:bg-white/5 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-primary">Son Çalışmalar</h3>
          <p className="text-sm text-secondary">Son 10 çalışma oturumu</p>
        </div>
        <span className="text-sm font-semibold text-cyan-800 dark:text-cyan-300">
          {sessions.length} kayıt
        </span>
      </div>

      {sessions.length === 0 ? (
        <EmptyState text="Henüz çalışma oturumu kaydı yok." />
      ) : (
        <div className="space-y-3">
          {sessions.slice(0, 10).map((session) => (
            <div
              key={session.id || `${session.date}:${session.duration}`}
              className="rounded-2xl border border-default dark:border-white/10 bg-surface-2 dark:bg-slate-900/60 px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-primary">
                    {getActivityTypeLabel(session.activity_type)}
                  </p>
                  <p className="text-sm text-secondary">
                    {session.topics?.join(', ') || 'Konu belirtilmedi'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-cyan-800 dark:text-cyan-300">
                    {session.duration} dk
                  </p>
                  <p className="text-xs text-tertiary">
                    {formatShortDate(session.date)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function StudentTopicProgressSection({
  progressRows,
}: {
  progressRows: AdminStudentProfileData['progressRows'];
}) {
  return (
    <section className="rounded-3xl border border-default dark:border-white/10 bg-surface-2/50 dark:bg-white/5 p-5">
      <div className="mb-4 flex items-center gap-2">
        <GraduationCap className="h-5 w-5 text-violet-700 dark:text-violet-300" />
        <h3 className="text-lg font-bold text-primary">Konu İlerlemesi</h3>
      </div>

      {progressRows.length === 0 ? (
        <EmptyState text="Henüz konu ilerleme verisi yok." />
      ) : (
        <div className="space-y-3">
          {progressRows.map((row) => (
            <div key={row.id || `${row.user_id}:${row.topic}`}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-primary dark:text-slate-200">
                  {row.topic}
                </span>
                <span className="font-semibold text-violet-800 dark:text-violet-300">
                  %{row.mastery_level}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-surface-3 dark:bg-slate-800">
                <div
                  className="h-2.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                  style={{
                    width: `${Math.max(0, Math.min(100, row.mastery_level))}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function StudentQuizAndAssignmentSection({
  completedAssignments,
  summary,
}: {
  completedAssignments: number;
  summary: AdminStudentProfileSummary;
}) {
  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-default dark:border-white/10 bg-surface-2/50 dark:bg-white/5 p-5">
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
          <h3 className="text-lg font-bold text-primary">Son Test Sonuçları</h3>
        </div>

        {summary.recentQuizResults.length === 0 ? (
          <EmptyState text="Henüz tamamlanmış test sonucu yok." />
        ) : (
          <div className="space-y-3">
            {summary.recentQuizResults.map((result) => (
              <div
                key={result.id}
                className="rounded-2xl border border-default dark:border-white/10 bg-surface-2 dark:bg-slate-900/60 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-primary">
                      {result.quizzes?.title || 'Test Sonucu'}
                    </p>
                    <p className="text-xs text-tertiary">
                      {formatShortDate(result.completed_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                      {result.score}/{result.total_questions}
                    </p>
                    <p className="text-xs text-tertiary">
                      %
                      {Math.round(
                        (result.score / Math.max(result.total_questions, 1)) *
                          100,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-default dark:border-white/10 bg-surface-2/50 dark:bg-white/5 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-700 dark:text-amber-300" />
          <h3 className="text-lg font-bold text-primary">Ödev Özeti</h3>
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
                className="rounded-2xl border border-default dark:border-white/10 bg-surface-2 dark:bg-slate-900/60 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-primary">
                      {formatShortDate(submission.submitted_at)}
                    </p>
                    <p className="text-sm text-secondary line-clamp-2">
                      {submission.feedback || 'Geri bildirim bulunmuyor.'}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-900 dark:text-emerald-300">
                    {submission.grade ?? '-'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function StudentBadgesSection({
  badges,
}: {
  badges: AdminStudentProfileData['badges'];
}) {
  return (
    <section className="rounded-3xl border border-default dark:border-white/10 bg-surface-2/50 dark:bg-white/5 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Clock3 className="h-5 w-5 text-sky-700 dark:text-sky-300" />
        <h3 className="text-lg font-bold text-primary">Rozetler</h3>
      </div>

      {badges.length === 0 ? (
        <EmptyState text="Henüz rozet kazanılmamış." />
      ) : (
        <div className="flex flex-wrap gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="rounded-2xl border border-amber-500/30 dark:border-amber-500/20 bg-amber-100/80 dark:bg-amber-500/10 px-4 py-3"
            >
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                {badge.name}
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-100/70">
                {formatShortDate(badge.earnedAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
