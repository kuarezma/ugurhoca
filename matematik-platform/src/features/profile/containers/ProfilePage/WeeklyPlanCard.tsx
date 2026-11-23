'use client';

import { motion } from 'framer-motion';
import { CalendarClock, CheckCircle2, ExternalLink } from 'lucide-react';
import { SafeLink } from '@/components/SafeLink';
import type {
  ProfileWeeklyPlan,
  ProfileWeeklyPlanItem,
} from '@/features/profile/types';

export type WeeklyPlanCardProps = {
  plan: ProfileWeeklyPlan | null;
  onToggleItem: (item: ProfileWeeklyPlanItem) => Promise<void> | void;
};

const getSafeInternalHref = (href?: string | null): string | null => {
  if (typeof href !== 'string') return null;
  const trimmed = href.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return null;
  }
  return trimmed;
};

const getWeeklyPlanKindLabel = (kind?: string | null): string | null => {
  switch (kind) {
    case 'quiz':
      return 'Test';
    case 'assignment':
      return 'Ödev';
    case 'content':
      return 'İçerik';
    default:
      return null;
  }
};

export function WeeklyPlanCard({ plan, onToggleItem }: WeeklyPlanCardProps) {
  const items = plan?.student_weekly_plan_items || [];
  const completedCount = items.filter((item) => item.completed_at).length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 }}
      className="rounded-3xl border border-default bg-surface-1 p-6 sm:p-8 shadow-sm"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-hairline bg-accent-info-tint px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-accent-info-ink">
            <CalendarClock className="h-3.5 w-3.5" />
            Bu Haftaki Plan
          </div>
          <h2 className="text-2xl font-bold text-primary">
            {plan?.title || 'Bu Haftaki Plan'}
          </h2>
          <p className="mt-1 text-sm text-secondary">
            Planını sadece sen ve Uğur Hoca görebilir.
          </p>
        </div>
        <div className="rounded-2xl border border-default bg-surface-2 px-4 py-2 text-right">
          <p className="text-xs uppercase tracking-[0.18em] text-secondary">
            Tamamlanan
          </p>
          <p className="text-xl font-black text-primary">
            {completedCount}/{items.length}
          </p>
        </div>
      </div>

      {!plan ? (
        <div className="rounded-2xl border border-dashed border-default px-5 py-7 text-center text-sm text-secondary">
          Bu hafta için özel plan henüz eklenmedi.
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-default px-5 py-7 text-center text-sm text-secondary">
          Plan başlığı hazır, maddeler eklendiğinde burada görünecek.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((item) => {
            const completed = Boolean(item.completed_at);
            const safeHref = getSafeInternalHref(item.href);
            const kindLabel = getWeeklyPlanKindLabel(item.kind);
            return (
              <div
                key={item.id}
                className={`flex min-h-16 items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition ${
                  completed
                    ? 'border-tone-success-border bg-tone-success-bg'
                    : 'border-default bg-surface-2 hover:border-accent hover:bg-surface-3'
                }`}
              >
                <button
                  type="button"
                  aria-pressed={completed}
                  onClick={() => onToggleItem(item)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <CheckCircle2
                    aria-hidden="true"
                    className={`h-5 w-5 shrink-0 ${
                      completed ? 'text-accent-success-ink' : 'text-secondary'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    {kindLabel ? (
                      <span className="mb-1 inline-block rounded-full border border-border-subtle bg-surface-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary">
                        {kindLabel}
                      </span>
                    ) : null}
                    <span
                      className={`block text-sm font-semibold ${
                        completed
                          ? 'text-accent-success-ink line-through'
                          : 'text-primary'
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>
                </button>
                {safeHref ? (
                  <SafeLink
                    href={safeHref}
                    aria-label={`${item.title} bağlantısını aç`}
                    className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-border-default bg-surface-1 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-surface-3"
                  >
                    <span>Aç</span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </SafeLink>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}
