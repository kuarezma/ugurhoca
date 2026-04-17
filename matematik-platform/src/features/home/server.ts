import 'server-only';

import type { Announcement, ContentDocument } from '@/types';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { InitialHomePageData } from '@/features/home/types';

const resolveServerYandexImageUrl = async (url: string) => {
  if (!url || !/disk\.yandex|yadi\.sk/i.test(url)) {
    return url;
  }

  try {
    const response = await fetch(
      `https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=${encodeURIComponent(url)}`,
      {
        next: {
          revalidate: 60 * 60,
        },
      },
    );

    const data = (await response.json().catch(() => null)) as {
      href?: string;
    } | null;

    return data?.href || url;
  } catch {
    return url;
  }
};

const resolveAnnouncementImages = async (announcement: Announcement) => {
  const images =
    announcement.image_urls?.length && Array.isArray(announcement.image_urls)
      ? announcement.image_urls
      : announcement.image_url
        ? [announcement.image_url]
        : [];

  if (images.length === 0) {
    return announcement;
  }

  const resolvedImageUrls = await Promise.all(
    images.map(resolveServerYandexImageUrl),
  );

  return {
    ...announcement,
    image_url: resolvedImageUrls[0] || announcement.image_url,
    image_urls:
      resolvedImageUrls.length > 0
        ? resolvedImageUrls
        : announcement.image_urls,
  };
};

export const loadInitialHomePageData =
  async (): Promise<InitialHomePageData> => {
    const supabase = createServerSupabaseClient();

    const [documentsResponse, writingsResponse, announcementsResponse] =
      await Promise.all([
        supabase
          .from('documents')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('documents')
          .select('*')
          .eq('type', 'writing')
          .order('created_at', { ascending: false })
          .limit(4),
        supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4),
      ]);

    const announcements = ([...(announcementsResponse.data || [])] as Announcement[])
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 4);

    return {
      announcements: await Promise.all(
        announcements.map(resolveAnnouncementImages),
      ),
      documents: (documentsResponse.data || []) as ContentDocument[],
      isHydrated: true,
      writings: (writingsResponse.data || []) as ContentDocument[],
    };
  };
