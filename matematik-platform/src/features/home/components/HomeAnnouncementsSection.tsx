'use client';

/* eslint-disable @next/next/no-img-element -- announcement cards render dynamic remote images */

import { Bell } from 'lucide-react';
import type { Announcement } from '@/types';
import { isNewContent, proxiedImageSrc } from '@/features/home/queries';

type HomeAnnouncementsSectionProps = {
  announcements: Announcement[];
  isLight: boolean;
  onSelectAnnouncement: (announcement: Announcement) => void;
};

export function HomeAnnouncementsSection({
  announcements,
  isLight,
  onSelectAnnouncement,
}: HomeAnnouncementsSectionProps) {
  if (announcements.length === 0) {
    return null;
  }

  return (
    <section className="px-4 pt-2 pb-3 sm:py-6">
      <div
        className={`max-w-6xl mx-auto ${isLight ? 'light-section p-5 sm:p-6' : ''}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              className={`text-lg sm:text-2xl font-bold ${
                isLight ? 'light-text-strong' : 'text-white'
              }`}
            >
              Haberler
            </h2>
            <p
              className={`text-sm ${
                isLight ? 'light-text-muted' : 'text-slate-400'
              }`}
            >
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

            return (
              <button
                key={item.id}
                onClick={() => onSelectAnnouncement(item)}
                className={`animate-fade-up relative text-left rounded-2xl overflow-hidden transition-all min-w-[82vw] sm:min-w-[46vw] md:min-w-0 md:w-full ${
                  isLight
                    ? 'light-card hover:-translate-y-0.5'
                    : 'glass hover:scale-[1.01]'
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {isNewContent(item.created_at) && (
                  <span className="absolute top-3 right-3 z-10 px-2 py-1 rounded-full bg-pink-500 text-white text-[10px] font-bold shadow-lg">
                    Yeni
                  </span>
                )}
                {images[0] && (
                  <div className="h-32 sm:h-36 overflow-hidden">
                    <img
                      src={proxiedImageSrc(images[0])}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-3 sm:p-4">
                  <div
                    className={`flex items-center gap-2 mb-2 text-xs ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    <Bell className="w-4 h-4 text-pink-400" />
                    {new Date(item.created_at).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                  <h3
                    className={`text-sm sm:text-base font-bold line-clamp-2 mb-1 sm:mb-2 ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`text-xs sm:text-sm line-clamp-2 ${
                      isLight ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    {item.content}
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
