'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Bell, Megaphone } from 'lucide-react';
import type { Announcement } from '@/types';
import { isNewContent, proxiedImageSrc } from '@/features/home/queries';
import { formatIstanbulDate } from '@/lib/date-format';
import { useHydrated } from '@/hooks/useClientPathname';

type HomeAnnouncementsSectionProps = {
  announcements: Announcement[];
  onSelectAnnouncement: (announcement: Announcement) => void;
};

export function HomeAnnouncementsSection({
  announcements,
  onSelectAnnouncement,
}: HomeAnnouncementsSectionProps) {
  const hydrated = useHydrated();
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  if (announcements.length === 0) {
    return null;
  }

  return (
    <section className="px-4 pt-2 pb-3 sm:py-6">
      <div className="max-w-6xl mx-auto light-section light:p-5 light:sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-primary">
              Haberler
            </h2>
            <p className="text-sm text-secondary">
              Kısa duyuru başlıkları. Detay için tıkla.
            </p>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 xl:grid-cols-4 md:overflow-visible md:pb-0">
          {announcements.map((item, index) => {
            const images =
              item.image_urls?.length && Array.isArray(item.image_urls)
                ? item.image_urls
                : item.image_url
                  ? [item.image_url]
                  : [];
            const coverSrc =
              images[0] && !failedImages[item.id]
                ? proxiedImageSrc(images[0])
                : null;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectAnnouncement(item)}
                className="animate-fade-up relative flex flex-col text-left rounded-2xl overflow-hidden transition-all min-w-[82vw] sm:min-w-[46vw] md:min-w-0 md:w-full border border-default dark:border-slate-400 bg-surface-1 hover:bg-surface-2 hover:-translate-y-0.5"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {hydrated && isNewContent(item.created_at) && (
                  <span className="absolute top-3 right-3 z-10 px-2 py-1 rounded-full bg-purple-700 text-white dark:text-white text-[10px] font-bold shadow-lg">
                    Yeni
                  </span>
                )}
                <div className="relative flex h-32 w-full shrink-0 items-center justify-center overflow-hidden border-b border-subtle bg-gradient-to-br from-sky-500/12 via-indigo-500/10 to-emerald-500/12 dark:from-sky-500/20 dark:via-indigo-500/15 dark:to-emerald-500/15 sm:h-36">
                  <div
                    aria-hidden="true"
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-300/50 dark:border-sky-400/25 bg-surface-1/85 text-accent-fg shadow-xs backdrop-blur-md"
                  >
                    <Megaphone className="h-6 w-6" />
                  </div>
                  {coverSrc && (
                    <Image
                      src={coverSrc}
                      alt=""
                      fill
                      className="z-10 object-cover"
                      sizes="(max-width: 639px) 82vw, (max-width: 767px) 46vw, (max-width: 1279px) 320px, 288px"
                      quality={54}
                      priority={index === 0}
                      unoptimized={coverSrc.startsWith('/api/')}
                      onError={() =>
                        setFailedImages((prev) => ({
                          ...prev,
                          [item.id]: true,
                        }))
                      }
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                  <div className="flex items-center gap-2 mb-2 text-xs text-secondary">
                    <Bell className="w-4 h-4 shrink-0 text-purple-400" />
                    {formatIstanbulDate(item.created_at, {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold line-clamp-2 mb-1 sm:mb-2 text-primary">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm line-clamp-2 text-secondary">
                    {item.content?.split('\n')[0] || item.content}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
