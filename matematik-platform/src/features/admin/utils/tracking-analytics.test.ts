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
});
