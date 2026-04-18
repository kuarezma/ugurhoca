import 'server-only';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { resolveYandexPublicDownloadUrl } from '@/lib/yandex-public-download';
import type { HomeInitialFeed } from '@/features/home/home-initial-feed';
import type { Announcement, ContentDocument } from '@/types';

async function fetchHomeDocumentsServer(
  supabase: ReturnType<typeof createServerSupabaseClient>,
) {
  const { data } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  return (data || []) as ContentDocument[];
}

async function fetchHomeWritingsServer(
  supabase: ReturnType<typeof createServerSupabaseClient>,
) {
  const { data } = await supabase
    .from('documents')
    .select('*')
    .in('type', ['ders-notlari', 'writing', 'yaprak-test'])
    .order('created_at', { ascending: false })
    .limit(4);

  return (data || []) as ContentDocument[];
}

async function fetchAnnouncementsServer(
  supabase: ReturnType<typeof createServerSupabaseClient>,
) {
  const { data } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(4);

  const sorted = [...(data || [])]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 4) as Announcement[];

  return Promise.all(
    sorted.map(async (item) => {
      const images =
        item.image_urls?.length && Array.isArray(item.image_urls)
          ? item.image_urls
          : item.image_url
            ? [item.image_url]
            : [];
      const resolvedImageUrls = await Promise.all(
        images.map((u) => resolveYandexPublicDownloadUrl(u)),
      );

      return {
        ...item,
        image_url: resolvedImageUrls[0] || item.image_url,
        image_urls:
          resolvedImageUrls.length > 0 ? resolvedImageUrls : item.image_urls,
      };
    }),
  );
}

export async function loadInitialHomeFeed(): Promise<HomeInitialFeed> {
  const supabase = createServerSupabaseClient();

  const [documents, writings, announcements] = await Promise.all([
    fetchHomeDocumentsServer(supabase),
    fetchHomeWritingsServer(supabase),
    fetchAnnouncementsServer(supabase),
  ]);

  return { announcements, documents, writings };
}
