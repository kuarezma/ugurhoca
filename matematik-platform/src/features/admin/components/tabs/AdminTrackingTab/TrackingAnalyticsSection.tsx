import type {
  buildCoreWebVitalsSummary,
  buildTrackingActivityAnalytics,
  buildTrackingPeriodTrends,
} from '@/features/admin/utils/tracking-analytics';
import { Metric } from './helpers';

type Props = {
  activityAnalytics: ReturnType<typeof buildTrackingActivityAnalytics>;
  periodTrends: ReturnType<typeof buildTrackingPeriodTrends>;
  webVitals: ReturnType<typeof buildCoreWebVitalsSummary>;
};

export function TrackingAnalyticsSection({
  activityAnalytics,
  periodTrends,
  webVitals,
}: Props) {
  return (
    <>
      <section
        aria-label="Dönem eğilimleri ve site performansı"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {([7, 30] as const).map((days) => (
          <section
            key={days}
            aria-label={`${days} günlük eğilim`}
            className="rounded-2xl border border-subtle bg-surface-1 p-5 text-primary"
          >
            <h3 className="mb-3 font-bold">{days} günlük eğilim</h3>
            <dl className="space-y-2 text-sm">
              {[
                [
                  'Aktif öğrenci',
                  days === 7
                    ? periodTrends.activeStudents7d
                    : periodTrends.activeStudents30d,
                ],
                [
                  'Çözülen test',
                  days === 7
                    ? periodTrends.quiz7dCount
                    : periodTrends.quiz30dCount,
                ],
                [
                  'Test ortalaması',
                  `%${days === 7 ? periodTrends.quiz7dAvgPercent : periodTrends.quiz30dAvgPercent}`,
                ],
                [
                  'Ödev teslimi',
                  days === 7
                    ? periodTrends.submission7dCount
                    : periodTrends.submission30dCount,
                ],
                [
                  'Çalışma süresi',
                  `${days === 7 ? periodTrends.study7dMinutes : periodTrends.study30dMinutes} dk`,
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3">
                  <dt className="text-secondary">{label}</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
        <section
          aria-label="Core Web Vitals özeti"
          className="rounded-2xl border border-subtle bg-surface-1 p-5 text-primary md:col-span-2 xl:col-span-1"
        >
          <h3 className="font-bold">Core Web Vitals</h3>
          <p className="mb-3 text-xs text-secondary">
            {webVitals.totalSamples} ölçüm · Ortalama değerler
          </p>
          {webVitals.totalSamples === 0 && (
            <p className="text-sm text-secondary">
              Henüz performans ölçümü yok.
            </p>
          )}
          <dl className="space-y-2 text-sm">
            {(['LCP', 'INP', 'CLS', 'FCP', 'TTFB'] as const).map((name) => {
              const metric = webVitals[name];
              return (
                <div
                  key={name}
                  className="flex flex-wrap justify-between gap-2"
                >
                  <dt>{name}</dt>
                  <dd className="text-secondary">
                    {metric.count === 0
                      ? 'Ölçüm yok'
                      : `${metric.average}${name === 'CLS' ? '' : ' ms'} · ${{ good: 'İyi', 'needs-improvement': 'İyileştirilmeli', poor: 'Zayıf' }[metric.status]} (${metric.count} ölçüm)`}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.75fr_1fr_1fr]">
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-white">
            Canlı Ölçüm
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Metric label="7 gün event" value={activityAnalytics.last7Count} />
            <Metric
              label="30 gün event"
              value={activityAnalytics.last30Count}
            />
          </div>
          <div className="mt-4 space-y-2">
            {activityAnalytics.topTypes.length === 0 ? (
              <p className="text-sm text-slate-500">Henüz ölçüm kaydı yok.</p>
            ) : (
              activityAnalytics.topTypes.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between rounded-xl bg-slate-100 dark:bg-slate-950/45 px-3 py-2 text-sm"
                >
                  <span className="text-slate-700 dark:text-slate-300">
                    {item.type}
                  </span>
                  <span className="font-bold text-cyan-700 dark:text-cyan-200">
                    {item.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-white">
            En Çok Kullanılan İçerikler
          </h3>
          {activityAnalytics.topContent.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
              İçerik kullanım kaydı birikince burada listelenecek.
            </p>
          ) : (
            <div className="space-y-2">
              {activityAnalytics.topContent.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 dark:bg-slate-950/45 border border-slate-200/60 dark:border-transparent px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.type}
                    </p>
                  </div>
                  <span className="rounded-full bg-cyan-100 dark:bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-700 dark:text-cyan-200">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-white">
            Az Kullanılan İçerikler
          </h3>
          {activityAnalytics.lowContent.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
              İçerik eklenince burada kullanım açığı görülecek.
            </p>
          ) : (
            <div className="space-y-2">
              {activityAnalytics.lowContent.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 dark:bg-slate-950/45 border border-slate-200/60 dark:border-transparent px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.type}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-100 dark:bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-200">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
