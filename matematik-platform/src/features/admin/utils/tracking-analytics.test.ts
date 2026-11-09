import type {
  AdminDocument,
  StudentActivityEvent,
} from '@/features/admin/types';
import { buildTrackingActivityAnalytics } from '@/features/admin/utils/tracking-analytics';

const now = new Date('2026-04-30T12:00:00Z').getTime();

const documents: AdminDocument[] = [
  {
    created_at: '2026-04-01T10:00:00Z',
    grade: [8],
    id: 'doc-a',
    title: 'Çarpanlar',
    type: 'yaprak-test',
  },
  {
    created_at: '2026-04-01T10:00:00Z',
    grade: [8],
    id: 'doc-b',
    title: 'Denklemler',
    type: 'video',
  },
  {
    created_at: '2026-04-01T10:00:00Z',
    grade: [8],
    id: 'doc-c',
    title: 'Olasılık',
    type: 'pdf',
  },
];

const event = (
  id: string,
  createdAt: string,
  overrides: Partial<StudentActivityEvent> = {},
): StudentActivityEvent => ({
  created_at: createdAt,
  event_type: 'content_viewed',
  id,
  user_id: 'student-1',
  ...overrides,
});

describe('buildTrackingActivityAnalytics', () => {
  it('calculates 7 and 30 day event totals', () => {
    const analytics = buildTrackingActivityAnalytics(
      [
        event('recent', '2026-04-29T12:00:00Z'),
        event('week', '2026-04-24T12:00:00Z'),
        event('month', '2026-04-10T12:00:00Z'),
        event('old', '2026-03-01T12:00:00Z'),
      ],
      documents,
      now,
    );

    expect(analytics.last7Count).toBe(2);
    expect(analytics.last30Count).toBe(3);
  });

  it('ranks content usage and exposes low usage content', () => {
    const analytics = buildTrackingActivityAnalytics(
      [
        event('a1', '2026-04-29T12:00:00Z', {
          entity_id: 'doc-a',
          entity_type: 'document',
          metadata: { title: 'Çarpanlar', type: 'yaprak-test' },
        }),
        event('a2', '2026-04-28T12:00:00Z', {
          entity_id: 'doc-a',
          entity_type: 'document',
          metadata: { title: 'Çarpanlar', type: 'yaprak-test' },
        }),
        event('b1', '2026-04-27T12:00:00Z', {
          entity_id: 'doc-b',
          entity_type: 'document',
          metadata: { title: 'Denklemler', type: 'video' },
        }),
      ],
      documents,
      now,
    );

    expect(analytics.topContent.map((item) => [item.id, item.count])).toEqual([
      ['doc-a', 2],
      ['doc-b', 1],
    ]);
    expect(analytics.lowContent.map((item) => [item.id, item.count])).toEqual([
      ['doc-c', 0],
      ['doc-b', 1],
      ['doc-a', 2],
    ]);
  });

  it('handles empty input without breaking dashboard data', () => {
    expect(buildTrackingActivityAnalytics([], [], now)).toEqual({
      last7Count: 0,
      last30Count: 0,
      lowContent: [],
      topContent: [],
      topTypes: [],
    });
  });

  it('sorts topTypes by count and sorts lowContent by title alphabetically when counts are equal', () => {
    const mixedEvents = [
      event('e1', '2026-04-29T12:00:00Z', { event_type: 'content_viewed' }),
      event('e2', '2026-04-29T12:00:00Z', { event_type: 'content_viewed' }),
      event('e3', '2026-04-29T12:00:00Z', { event_type: 'quiz_submitted' }),
    ];

    const docsWithEqualCount: AdminDocument[] = [
      { created_at: '2026-04-01T10:00:00Z', grade: [8], id: 'doc-z', title: 'Zor Problemler', type: 'yaprak-test' },
      { created_at: '2026-04-01T10:00:00Z', grade: [8], id: 'doc-a', title: 'Aritmetik', type: 'yaprak-test' },
    ];

    const analytics = buildTrackingActivityAnalytics(mixedEvents, docsWithEqualCount, now);

    expect(analytics.topTypes).toEqual([
      { count: 2, type: 'content_viewed' },
      { count: 1, type: 'quiz_submitted' },
    ]);
    expect(analytics.lowContent.map((d) => d.title)).toEqual([
      'Aritmetik',
      'Zor Problemler',
    ]);
  });
});

describe('buildTrackingPeriodTrends', () => {
  it('calculates 7d and 30d trends for quizzes, submissions and study sessions', async () => {
    const { buildTrackingPeriodTrends } = await import(
      '@/features/admin/utils/tracking-analytics'
    );

    const quizResults = [
      // 3 gün önce (%80)
      { id: 'q1', user_id: 's1', score: 8, total_questions: 10, completed_at: '2026-04-27T10:00:00Z', quiz_id: 'q-1' },
      // 5 gün önce (%60)
      { id: 'q2', user_id: 's2', score: 6, total_questions: 10, completed_at: '2026-04-25T10:00:00Z', quiz_id: 'q-2' },
      // 20 gün önce (%90) -> 30d içinde ama 7d dışında
      { id: 'q3', user_id: 's3', score: 9, total_questions: 10, completed_at: '2026-04-10T10:00:00Z', quiz_id: 'q-3' },
      // 40 gün önce -> 30d dışında
      { id: 'q4', user_id: 's4', score: 10, total_questions: 10, completed_at: '2026-03-20T10:00:00Z', quiz_id: 'q-4' },
    ];

    const submissions = [
      // 2 gün önce
      { id: 'sub1', student_id: 's1', assignment_id: 'a1', submitted_at: '2026-04-28T10:00:00Z' },
      // 15 gün önce
      { id: 'sub2', student_id: 's5', assignment_id: 'a2', submitted_at: '2026-04-15T10:00:00Z' },
      // 50 gün önce
      { id: 'sub3', student_id: 's6', assignment_id: 'a3', submitted_at: '2026-03-01T10:00:00Z' },
    ];

    const studySessions = [
      // 1 gün önce (60 dk)
      { id: 'ss1', user_id: 's1', date: '2026-04-29T10:00:00Z', duration: 60 },
      // 4 gün önce (45 dk)
      { id: 'ss2', user_id: 's7', date: '2026-04-26T10:00:00Z', duration: 45 },
      // 18 gün önce (90 dk)
      { id: 'ss3', user_id: 's2', date: '2026-04-12T10:00:00Z', duration: 90 },
    ];

    const trends = buildTrackingPeriodTrends({
      now,
      quizResults,
      studySessions,
      submissions,
    });

    // Quizzes
    expect(trends.quiz7dCount).toBe(2);
    expect(trends.quiz30dCount).toBe(3);
    expect(trends.quiz7dAvgPercent).toBe(70); // (80 + 60) / 2 = 70
    expect(trends.quiz30dAvgPercent).toBe(77); // (80 + 60 + 90) / 3 = 76.66 -> 77

    // Submissions
    expect(trends.submission7dCount).toBe(1);
    expect(trends.submission30dCount).toBe(2);

    // Study
    expect(trends.study7dMinutes).toBe(105); // 60 + 45
    expect(trends.study30dMinutes).toBe(195); // 60 + 45 + 90

    // Active students
    // 7d: s1 (q, sub, ss), s2 (q), s7 (ss) -> 3 öğrenci
    expect(trends.activeStudents7d).toBe(3);
    // 30d: s1, s2, s3 (q), s5 (sub), s7 (ss) -> 5 öğrenci
    expect(trends.activeStudents30d).toBe(5);
  });
});

describe('buildCoreWebVitalsSummary', () => {
  it('aggregates web vitals metrics with correct status and averages', async () => {
    const { buildCoreWebVitalsSummary } = await import(
      '@/features/admin/utils/tracking-analytics'
    );

    const events: StudentActivityEvent[] = [
      {
        created_at: '2026-04-30T10:00:00Z',
        entity_id: 'LCP',
        entity_type: 'web_vital',
        event_type: 'web_vital',
        id: 'wv-1',
        metadata: { name: 'LCP', value: 2100 },
        user_id: 'u1',
      },
      {
        created_at: '2026-04-30T10:05:00Z',
        entity_id: 'LCP',
        entity_type: 'web_vital',
        event_type: 'web_vital',
        id: 'wv-2',
        metadata: { name: 'LCP', value: 2700 },
        user_id: 'u2',
      },
      {
        created_at: '2026-04-30T10:00:00Z',
        entity_id: 'INP',
        entity_type: 'web_vital',
        event_type: 'web_vital',
        id: 'wv-3',
        metadata: { name: 'INP', value: 150 },
        user_id: 'u1',
      },
      {
        created_at: '2026-04-30T10:00:00Z',
        entity_id: 'CLS',
        entity_type: 'web_vital',
        event_type: 'web_vital',
        id: 'wv-4',
        metadata: { name: 'CLS', value: 0.05 },
        user_id: 'u1',
      },
    ];

    const summary = buildCoreWebVitalsSummary(events);

    expect(summary.LCP.count).toBe(2);
    expect(summary.LCP.average).toBe(2400); // (2100 + 2700) / 2
    expect(summary.LCP.lastValue).toBe(2700);
    expect(summary.LCP.status).toBe('good'); // average 2400 <= 2500

    expect(summary.INP.count).toBe(1);
    expect(summary.INP.average).toBe(150);
    expect(summary.INP.status).toBe('good');

    expect(summary.CLS.count).toBe(1);
    expect(summary.CLS.average).toBe(0.05);
    expect(summary.CLS.status).toBe('good');

    expect(summary.FCP.count).toBe(0);
    expect(summary.FCP.average).toBe(0);
    expect(summary.FCP.status).toBe('good');
  });
});
