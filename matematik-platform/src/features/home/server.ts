import 'server-only';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Announcement, ContentDocument } from '@/types';

const HOME_FEED_CACHE_TTL_MS = 60_000;

type HomeFeedPayload = {
  announcements: Announcement[];
  documents: ContentDocument[];
  writings: ContentDocument[];
};

let homeFeedCache: { payload: HomeFeedPayload; timestamp: number } | null =
  null;

export const loadHomeFeedServer = async (): Promise<HomeFeedPayload> => {
  if (
    homeFeedCache &&
    Date.now() - homeFeedCache.timestamp < HOME_FEED_CACHE_TTL_MS
  ) {
    return homeFeedCache.payload;
  }

  const serverSupabase = createServerSupabaseClient();

  const [documentsResult, writingsResult, announcementsResult] =
    await Promise.all([
      serverSupabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5),
      serverSupabase
        .from('documents')
        .select('*')
        .eq('type', 'writing')
        .order('created_at', { ascending: false })
        .limit(4),
      serverSupabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4),
    ]);

  const documents = (documentsResult.data || []) as ContentDocument[];
  const writings = (writingsResult.data || []) as ContentDocument[];

  const rawAnnouncements = (announcementsResult.data || []) as Announcement[];
  const announcements = [...rawAnnouncements]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 4);

  const payload: HomeFeedPayload = { announcements, documents, writings };

  homeFeedCache = { payload, timestamp: Date.now() };

  return payload;
};
