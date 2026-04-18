import 'server-only';

import { hasSupabasePublicEnv } from '@/lib/env.server';
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

      if (images.length === 0) {
        return item;
      }

      // Yalnızca kart önizlemesi için ilk görseli çöz; TTFB’yi kısaltır.
      // Modal’daki ek görseller istemcide çözülür.
      const resolvedFirst = await resolveYandexPublicDownloadUrl(images[0]);

      if (item.image_urls?.length && Array.isArray(item.image_urls)) {
        return {
          ...item,
          image_url: resolvedFirst || item.image_url,
          image_urls: [resolvedFirst, ...item.image_urls.slice(1)],
        };
      }

      return {
        ...item,
        image_url: resolvedFirst || item.image_url,
      };
    }),
  );
}

export async function loadInitialHomeFeed(): Promise<HomeInitialFeed> {
  // CI / önizleme derlemesinde Supabase env yoksa statik üretim yine de tamamlanır.
  if (!hasSupabasePublicEnv()) {
    return {
      announcements: [],
      documents: [],
    };
  }

  const supabase = createServerSupabaseClient();

  const [documents, announcements] = await Promise.all([
    fetchHomeDocumentsServer(supabase),
    fetchAnnouncementsServer(supabase),
  ]);

  return {
    announcements,
    documents,
  };
}
