'use client';

/* eslint-disable @next/next/no-img-element -- announcement modal renders dynamic remote images */

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
  if (!announcement) {
    return null;
  }

  const images =
    announcement?.image_urls?.length && Array.isArray(announcement.image_urls)
      ? announcement.image_urls
      : announcement?.image_url
        ? [announcement.image_url]
        : [];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="animate-slide-up max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl"
      >
        {images.length > 0 ? (
          <div className="grid gap-0 md:grid-cols-2">
            <div className="bg-slate-950 p-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {images
                  .filter(
                    (image): image is string => typeof image === 'string',
                  )
                  .map((image, index) => (
                    <img
                      key={index}
                      src={proxiedImageSrc(image)}
                      alt={announcement.title}
                      loading="lazy"
                      decoding="async"
                      className="h-56 w-full rounded-xl object-cover"
                    />
                  ))}
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs font-semibold text-pink-300">
                  Haber
                </span>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
                {announcement.title}
              </h2>
              <p className="whitespace-pre-line leading-relaxed text-slate-300">
                {announcement.content}
              </p>
              {renderAnnouncementLink(announcement)}
              <p className="mt-6 text-sm text-slate-500">
                {new Date(announcement.created_at).toLocaleDateString('tr-TR')}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs font-semibold text-pink-300">
                Haber
              </span>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
              {announcement.title}
            </h2>
            <p className="whitespace-pre-line leading-relaxed text-slate-300">
              {announcement.content}
            </p>
            {renderAnnouncementLink(announcement)}
            <p className="mt-6 text-sm text-slate-500">
              {new Date(announcement.created_at).toLocaleDateString('tr-TR')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
