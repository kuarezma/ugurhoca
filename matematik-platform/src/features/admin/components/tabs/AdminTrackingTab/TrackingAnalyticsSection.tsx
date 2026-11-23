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
        <div className="rounded-2xl border border-border-default bg-surface-1 p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-primary">Canlı Ölçüm</h3>
          <div className="grid grid-cols-2 gap-3">
            <Metric label="7 gün event" value={activityAnalytics.last7Count} />
            <Metric
              label="30 gün event"
              value={activityAnalytics.last30Count}
            />
          </div>
          <div className="mt-4 space-y-2">
            {activityAnalytics.topTypes.length === 0 ? (
              <p className="text-sm text-secondary">Henüz ölçüm kaydı yok.</p>
            ) : (
              activityAnalytics.topTypes.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-2 px-3 py-2 text-sm"
                >
                  <span className="text-secondary">{item.type}</span>
                  <span className="font-bold text-tone-info-fg">
                    {item.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border-default bg-surface-1 p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-primary">
            En Çok Kullanılan İçerikler
          </h3>
          {activityAnalytics.topContent.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border-default px-4 py-8 text-center text-sm text-secondary">
              İçerik kullanım kaydı birikince burada listelenecek.
            </p>
          ) : (
            <div className="space-y-2">
              {activityAnalytics.topContent.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-2 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-primary">
                      {item.title}
                    </p>
                    <p className="text-xs text-secondary">{item.type}</p>
                  </div>
                  <span className="rounded-full bg-tone-info-bg px-3 py-1 text-xs font-bold text-tone-info-fg">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border-default bg-surface-1 p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-primary">
            Az Kullanılan İçerikler
          </h3>
          {activityAnalytics.lowContent.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border-default px-4 py-8 text-center text-sm text-secondary">
              İçerik eklenince burada kullanım açığı görülecek.
            </p>
          ) : (
            <div className="space-y-2">
              {activityAnalytics.lowContent.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-2 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-primary">
                      {item.title}
                    </p>
                    <p className="text-xs text-secondary">{item.type}</p>
                  </div>
                  <span className="rounded-full bg-tone-warn-bg px-3 py-1 text-xs font-bold text-tone-warn-fg">
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
