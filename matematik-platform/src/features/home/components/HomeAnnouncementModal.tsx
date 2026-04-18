'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronRight,
  ExternalLink,
  FileText as FileDoc,
  FolderOpen,
  X,
} from 'lucide-react';
import type { Announcement } from '@/types';
import {
  getAnnouncementLinkLabel,
  proxiedImageSrc,
  resolveYandexImageUrl,
} from '@/features/home/queries';

type HomeAnnouncementModalProps = {
  announcement: Announcement | null;
  onClose: () => void;
};

const renderAnnouncementLinkIcon = (url?: string | null) => {
  if (!url) {
    return <ExternalLink className="w-4 h-4" />;
  }

  const lower = url.toLowerCase();

  if (lower.includes('.pdf')) {
    return <FileDoc className="w-4 h-4" />;
  }

  if (
    lower.includes('drive.google') ||
    lower.includes('yadi.sk') ||
    lower.includes('disk.yandex')
  ) {
    return <FolderOpen className="w-4 h-4" />;
  }

  return <ExternalLink className="w-4 h-4" />;
};

const renderAnnouncementLink = (announcement: Announcement) => {
  if (!announcement.link_url) {
    return null;
  }

  return (
    <a
      href={announcement.link_url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:from-indigo-600 hover:to-purple-600 transition-colors"
    >
      {renderAnnouncementLinkIcon(announcement.link_url)}
      {getAnnouncementLinkLabel(announcement.link_url)}
      <ChevronRight className="w-4 h-4" />
    </a>
  );
};

export function HomeAnnouncementModal({
  announcement,
  onClose,
}: HomeAnnouncementModalProps) {
  const rawImages =
    announcement?.image_urls?.length && Array.isArray(announcement.image_urls)
      ? announcement.image_urls
      : announcement?.image_url
        ? [announcement.image_url]
        : [];

  const [resolvedImages, setResolvedImages] = useState<string[]>([]);

  useEffect(() => {
    if (!announcement) {
      setResolvedImages([]);
      return;
    }

    const urls =
      announcement.image_urls?.length && Array.isArray(announcement.image_urls)
        ? announcement.image_urls
        : announcement.image_url
          ? [announcement.image_url]
          : [];

    if (urls.length === 0) {
      setResolvedImages([]);
      return;
    }

    let cancelled = false;

    void Promise.all(urls.map((u) => resolveYandexImageUrl(u))).then(
      (resolved) => {
        if (!cancelled) {
          setResolvedImages(resolved);
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [announcement]);

  const images = resolvedImages.length > 0 ? resolvedImages : rawImages;

  return (
    <AnimatePresence>
      {announcement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="duyuru-baslik"
          >
            {images.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-0">
                <div className="bg-slate-950 p-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {images
                      .filter(
                        (image): image is string => typeof image === 'string',
                      )
                      .map((image, index) => (
                        <div
                          key={index}
                          className="relative h-56 w-full overflow-hidden rounded-xl"
                        >
                          <Image
                            src={proxiedImageSrc(image)}
                            alt={`${announcement.title} — görsel ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 400px"
                            unoptimized
                          />
                        </div>
                      ))}
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-semibold">
                      Haber
                    </span>
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-slate-400 hover:text-white"
                      aria-label="Kapat"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <h2
                    id="duyuru-baslik"
                    className="text-2xl sm:text-3xl font-bold text-white mb-3"
                  >
                    {announcement.title}
                  </h2>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                    {announcement.content}
                  </p>
                  {renderAnnouncementLink(announcement)}
                  <p className="text-slate-500 text-sm mt-6">
                    {new Date(announcement.created_at).toLocaleDateString(
                      'tr-TR',
                    )}
                  </p>
                </div>
              </div>
            ) : (
                <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-semibold">
                    Haber
                  </span>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-slate-400 hover:text-white"
                    aria-label="Kapat"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <h2
                  id="duyuru-baslik"
                  className="text-2xl sm:text-3xl font-bold text-white mb-3"
                >
                  {announcement.title}
                </h2>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {announcement.content}
                </p>
                {renderAnnouncementLink(announcement)}
                <p className="text-slate-500 text-sm mt-6">
                  {new Date(announcement.created_at).toLocaleDateString(
                    'tr-TR',
                  )}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
