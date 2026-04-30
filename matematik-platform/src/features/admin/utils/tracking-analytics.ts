import type {
  AdminDocument,
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
