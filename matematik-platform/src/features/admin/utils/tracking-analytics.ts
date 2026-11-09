import type {
  AdminDocument,
  AdminQuizResultRow,
  AdminStudySessionRow,
  AdminSubmission,
  StudentActivityEvent,
} from '@/features/admin/types';

const DAY_MS = 24 * 60 * 60 * 1000;

type ContentUsageRow = {
  count: number;
  id: string;
  title: string;
  type: string;
};

export const buildTrackingActivityAnalytics = (
  activityEvents: StudentActivityEvent[],
  documents: AdminDocument[],
  now = Date.now(),
) => {
  const last7Days = activityEvents.filter(
    (event) => now - new Date(event.created_at).getTime() <= 7 * DAY_MS,
  );
  const last30Days = activityEvents.filter(
    (event) => now - new Date(event.created_at).getTime() <= 30 * DAY_MS,
  );
  const byType = new Map<string, number>();
  const contentUsage = new Map<string, ContentUsageRow>();

  for (const event of last30Days) {
    byType.set(event.event_type, (byType.get(event.event_type) || 0) + 1);

    if (event.entity_type === 'document' && event.entity_id) {
      const metadata = event.metadata || {};
      const current = contentUsage.get(event.entity_id) || {
        count: 0,
        id: event.entity_id,
        title: typeof metadata.title === 'string' ? metadata.title : 'İçerik',
        type: typeof metadata.type === 'string' ? metadata.type : 'document',
      };
      contentUsage.set(event.entity_id, {
        ...current,
        count: current.count + 1,
      });
    }
  }

  const lowContent = documents
    .map((document) => ({
      count: contentUsage.get(document.id)?.count ?? 0,
      id: document.id,
      title: document.title || 'İçerik',
      type: document.type || 'document',
    }))
    .sort((left, right) => {
      if (left.count !== right.count) return left.count - right.count;
      return left.title.localeCompare(right.title, 'tr');
    })
    .slice(0, 5);

  return {
    last7Count: last7Days.length,
    last30Count: last30Days.length,
    lowContent,
    topContent: Array.from(contentUsage.values())
      .sort((left, right) => right.count - left.count)
      .slice(0, 5),
    topTypes: Array.from(byType.entries())
      .map(([type, count]) => ({ count, type }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 6),
  };
};

export const buildTrackingPeriodTrends = ({
  quizResults,
  submissions,
  studySessions,
  now = Date.now(),
}: {
  quizResults: AdminQuizResultRow[];
  submissions: AdminSubmission[];
  studySessions: AdminStudySessionRow[];
  now?: number;
}) => {
  const isWithin7d = (dateStr: string) =>
    now - new Date(dateStr).getTime() <= 7 * DAY_MS && new Date(dateStr).getTime() <= now;
  const isWithin30d = (dateStr: string) =>
    now - new Date(dateStr).getTime() <= 30 * DAY_MS && new Date(dateStr).getTime() <= now;

  const quizzes7d = quizResults.filter((q) => q.completed_at && isWithin7d(q.completed_at));
  const quizzes30d = quizResults.filter((q) => q.completed_at && isWithin30d(q.completed_at));

  const quiz7dCount = quizzes7d.length;
  const quiz30dCount = quizzes30d.length;

  const calcAvgPercent = (rows: AdminQuizResultRow[]) => {
    if (rows.length === 0) return 0;
    const total = rows.reduce(
      (sum, r) => sum + Math.round((r.score / Math.max(r.total_questions, 1)) * 100),
      0,
    );
    return Math.round(total / rows.length);
  };

  const quiz7dAvgPercent = calcAvgPercent(quizzes7d);
  const quiz30dAvgPercent = calcAvgPercent(quizzes30d);

  const subs7d = submissions.filter((s) => s.submitted_at && isWithin7d(s.submitted_at));
  const subs30d = submissions.filter((s) => s.submitted_at && isWithin30d(s.submitted_at));
  const submission7dCount = subs7d.length;
  const submission30dCount = subs30d.length;

  const sessions7d = studySessions.filter((s) => s.date && isWithin7d(s.date));
  const sessions30d = studySessions.filter((s) => s.date && isWithin30d(s.date));
  const study7dMinutes = sessions7d.reduce((sum, s) => sum + (s.duration || 0), 0);
  const study30dMinutes = sessions30d.reduce((sum, s) => sum + (s.duration || 0), 0);

  const active7dSet = new Set<string>();
  quizzes7d.forEach((q) => active7dSet.add(q.user_id));
  subs7d.forEach((s) => active7dSet.add(s.student_id));
  sessions7d.forEach((s) => active7dSet.add(s.user_id));

  const active30dSet = new Set<string>();
  quizzes30d.forEach((q) => active30dSet.add(q.user_id));
  subs30d.forEach((s) => active30dSet.add(s.student_id));
  sessions30d.forEach((s) => active30dSet.add(s.user_id));

  return {
    activeStudents7d: active7dSet.size,
    activeStudents30d: active30dSet.size,
    quiz7dAvgPercent,
    quiz7dCount,
    quiz30dAvgPercent,
    quiz30dCount,
    study7dMinutes,
    study30dMinutes,
    submission7dCount,
    submission30dCount,
  };
};

export type WebVitalMetricName = 'LCP' | 'INP' | 'CLS' | 'FCP' | 'TTFB';

export type WebVitalMetricSummary = {
  count: number;
  average: number;
  lastValue: number | null;
  status: 'good' | 'needs-improvement' | 'poor';
};

export type CoreWebVitalsSummary = Record<WebVitalMetricName, WebVitalMetricSummary> & {
  totalSamples: number;
};

const evaluateVitalStatus = (
  metric: WebVitalMetricName,
  value: number,
): 'good' | 'needs-improvement' | 'poor' => {
  switch (metric) {
    case 'LCP':
      if (value <= 2500) return 'good';
      if (value <= 4000) return 'needs-improvement';
      return 'poor';
    case 'INP':
      if (value <= 200) return 'good';
      if (value <= 500) return 'needs-improvement';
      return 'poor';
    case 'CLS':
      if (value <= 0.1) return 'good';
      if (value <= 0.25) return 'needs-improvement';
      return 'poor';
    case 'FCP':
      if (value <= 1800) return 'good';
      if (value <= 3000) return 'needs-improvement';
      return 'poor';
    case 'TTFB':
      if (value <= 800) return 'good';
      if (value <= 1800) return 'needs-improvement';
      return 'poor';
    default:
      return 'good';
  }
};

export const buildCoreWebVitalsSummary = (
  activityEvents: StudentActivityEvent[],
): CoreWebVitalsSummary => {
  const METRICS: WebVitalMetricName[] = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'];
  const groups: Record<WebVitalMetricName, number[]> = {
    CLS: [],
    FCP: [],
    INP: [],
    LCP: [],
    TTFB: [],
  };

  for (const event of activityEvents) {
    if (event.event_type !== 'web_vital' && event.entity_type !== 'web_vital') {
      continue;
    }
    const metadata = event.metadata || {};
    const rawName = String(metadata.name || metadata.metric || event.entity_id || '').toUpperCase();
    if (!METRICS.includes(rawName as WebVitalMetricName)) continue;

    const metricName = rawName as WebVitalMetricName;
    const rawVal = metadata.value ?? metadata.duration ?? metadata.metric_value;
    const numVal = typeof rawVal === 'number' ? rawVal : Number(rawVal);
    if (!Number.isNaN(numVal)) {
      groups[metricName].push(numVal);
    }
  }

  let totalSamples = 0;
  const summary: Partial<Record<WebVitalMetricName, WebVitalMetricSummary>> = {};

  for (const m of METRICS) {
    const values = groups[m];
    totalSamples += values.length;
    if (values.length === 0) {
      summary[m] = {
        average: 0,
        count: 0,
        lastValue: null,
        status: 'good',
      };
    } else {
      const sum = values.reduce((acc, v) => acc + v, 0);
      const rawAvg = sum / values.length;
      const average = m === 'CLS' ? Number(rawAvg.toFixed(3)) : Math.round(rawAvg);
      const lastRaw = values[values.length - 1];
      const lastValue = m === 'CLS' ? Number(lastRaw.toFixed(3)) : Math.round(lastRaw);
      summary[m] = {
        average,
        count: values.length,
        lastValue,
        status: evaluateVitalStatus(m, average),
      };
    }
  }

  return {
    ...(summary as Record<WebVitalMetricName, WebVitalMetricSummary>),
    totalSamples,
  };
};
