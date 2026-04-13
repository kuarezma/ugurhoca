'use client';

/* eslint-disable @next/next/no-img-element -- gallery renders proxied dynamic remote images */

import { useEffect, useState } from 'react';
import { getRemoteImageSrc } from '@/lib/image-url';

type AnnouncementGalleryProps = {
  images: string[];
  title: string;
};

export function AnnouncementGallery({
  images,
  title,
}: AnnouncementGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [resolvedImages, setResolvedImages] = useState<string[]>(images);
  const hasMultiple = images.length > 1;

  useEffect(() => {
    const resolveYandexImageUrl = async (url: string) => {
      if (!url || !/disk\.yandex|yadi\.sk/i.test(url)) {
        return url;
      }

      try {
        const response = await fetch(
          `/api/yandex-resolve?url=${encodeURIComponent(url)}`,
        );
        const data = (await response.json().catch(() => null)) as
          | { href?: string }
          | null;

        return data?.href || url;
      } catch {
        return url;
      }
    };

    void (async () => {
      const normalized = await Promise.all(images.map(resolveYandexImageUrl));
      setResolvedImages(normalized);
    })();
  }, [images]);

  return (
    <div className="relative min-h-[320px] bg-slate-900">
      <img
        src={getRemoteImageSrc(resolvedImages[current] || images[current])}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
      {hasMultiple && (
        <>
          <button
            onClick={(event) => {
              event.stopPropagation();
              setCurrent(
                (prev) =>
                  (prev - 1 + resolvedImages.length) % resolvedImages.length,
              );
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-2 text-white/90 hover:bg-black/60"
          >
            ‹
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              setCurrent((prev) => (prev + 1) % resolvedImages.length);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-2 text-white/90 hover:bg-black/60"
          >
            ›
          </button>
        </>
      )}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {resolvedImages.map((_, index) => (
            <button
              key={index}
              onClick={(event) => {
                event.stopPropagation();
                setCurrent(index);
              }}
              className={`h-2.5 rounded-full transition-all ${
                index === current ? 'w-8 bg-white' : 'w-2.5 bg-white/50'
              }`}
              aria-label={`Görsel ${index + 1}`}
            />
          ))}
        </div>
        <span className="rounded-full bg-black/40 px-2 py-1 text-xs text-white">
          {current + 1}/{resolvedImages.length}
        </span>
      </div>
    </div>
  );
}
