import 'server-only';

import { hasSupabasePublicEnv } from '@/lib/env.server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { resolveYandexPublicDownloadUrl } from '@/lib/yandex-public-download';
import type {
  HomeInitialFeed,
  HomeStatsSnapshot,
} from '@/features/home/home-initial-feed';
import type { Announcement, ContentDocument } from '@/types';

async function fetchHomeStatsServer(
  supabase: ReturnType<typeof createServerSupabaseClient>,
): Promise<HomeStatsSnapshot> {
  const safeCount = async (
    query: ReturnType<typeof createServerSupabaseClient>,
    table: 'students' | 'quizzes' | 'documents' | 'assignments',
  ): Promise<number> => {
    try {
      const { count } = await query
        .from(table)
        .select('*', { count: 'exact', head: true });
      return count ?? 0;
    } catch {
      return 0;
    }
  };

  const [students, quizzes, documents, assignments] = await Promise.all([
    safeCount(supabase, 'students'),
    safeCount(supabase, 'quizzes'),
    safeCount(supabase, 'documents'),
    safeCount(supabase, 'assignments'),
  ]);

  return { students, quizzes, documents, assignments };
}

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
      stats: { students: 0, quizzes: 0, documents: 0, assignments: 0 },
    };
  }

  const supabase = createServerSupabaseClient();

  const [documents, announcements, stats] = await Promise.all([
    fetchHomeDocumentsServer(supabase),
    fetchAnnouncementsServer(supabase),
    fetchHomeStatsServer(supabase),
  ]);

  return {
    announcements,
    documents,
    stats,
  };
}
