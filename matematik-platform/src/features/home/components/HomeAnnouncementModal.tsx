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
import { useAccessibleModal } from '@/hooks/useAccessibleModal';

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

const renderRichAnnouncementContent = (content?: string | null) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      i++;
      continue;
    }

    // Markdown Table
    if (line.startsWith('|') && line.endsWith('|')) {
      const tableLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim().startsWith('|') &&
        lines[i].trim().endsWith('|')
      ) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const headerCells = tableLines[0]
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim());
        const isSeparator = (str: string) => /^[\s|:-]+$/.test(str);
        const dataRows = tableLines.slice(1).filter((l) => !isSeparator(l));

        elements.push(
          <div
            key={`table-${elements.length}`}
            className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 my-3"
          >
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {headerCells.map((h, hi) => (
                    <th key={hi} className="p-2 sm:px-3 sm:py-2">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300">
                {dataRows.map((row, ri) => {
                  const cells = row
                    .slice(1, -1)
                    .split('|')
                    .map((c) => c.trim());
                  return (
                    <tr
                      key={ri}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                    >
                      {cells.map((cell, ci) => (
                        <td key={ci} className="p-2 sm:px-3 sm:py-2">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>,
        );
        continue;
      }
    }

    // Header 3 (### )
    if (line.startsWith('### ')) {
      elements.push(
        <h3
          key={`h3-${elements.length}`}
          className="mt-6 mb-2 text-base sm:text-lg font-bold text-slate-900 dark:text-white"
        >
          {line.replace(/^###\s+/, '')}
        </h3>,
      );
      i++;
      continue;
    }

    // Standalone link line [Label](url)
    const linkMatch = line.match(/^\[(.*?)\]\((https?:\/\/[^\s)]+)\)$/);
    if (linkMatch) {
      const [, label, url] = linkMatch;
      elements.push(
        <div key={`link-${elements.length}`}>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 mt-2 mb-4 px-3.5 py-2 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 text-xs sm:text-sm font-semibold transition-colors"
          >
            <FileDoc className="w-4 h-4" />
            {label}
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>,
      );
      i++;
      continue;
    }

    // Normal paragraph
    elements.push(
      <p
        key={`p-${elements.length}`}
        className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3"
      >
        {line}
      </p>,
    );
    i++;
  }

  return <div>{elements}</div>;
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
  const modalRef = useAccessibleModal<HTMLDivElement>(
    Boolean(announcement),
    onClose,
  );
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
            ref={modalRef}
            className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="duyuru-baslik"
            tabIndex={-1}
          >
            {images.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-0">
                <div className="bg-slate-100 dark:bg-slate-950 p-2 sm:p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {images.length > 1 ? (
                      <>
                        <a
                          href={proxiedImageSrc(images[0])}
                          target="_blank"
                          rel="noreferrer"
                          className="sm:col-span-2 relative block h-52 w-full overflow-hidden rounded-xl transition-opacity hover:opacity-90 shadow-xs"
                        >
                          <Image
                            src={proxiedImageSrc(images[0])}
                            alt={`${announcement.title} — kapak`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 500px"
                            unoptimized
                          />
                        </a>
                        {images.slice(1).map((image, index) => (
                          <a
                            key={index + 1}
                            href={proxiedImageSrc(image)}
                            target="_blank"
                            rel="noreferrer"
                            className="relative block h-48 w-full overflow-hidden rounded-xl bg-white p-1 border border-slate-200 dark:border-slate-800 transition-opacity hover:opacity-90"
                          >
                            <Image
                              src={proxiedImageSrc(image)}
                              alt={`${announcement.title} — görsel ${index + 2}`}
                              fill
                              className="object-contain p-1"
                              sizes="(max-width: 768px) 50vw, 250px"
                              unoptimized
                            />
                          </a>
                        ))}
                      </>
                    ) : (
                      <a
                        href={proxiedImageSrc(images[0])}
                        target="_blank"
                        rel="noreferrer"
                        className="sm:col-span-2 relative block h-64 sm:h-80 w-full overflow-hidden rounded-xl transition-opacity hover:opacity-90"
                      >
                        <Image
                          src={proxiedImageSrc(images[0])}
                          alt={announcement.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 500px"
                          unoptimized
                        />
                      </a>
                    )}
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-semibold">
                      Haber
                    </span>
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      aria-label="Kapat"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <h2
                    id="duyuru-baslik"
                    className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3"
                  >
                    {announcement.title}
                  </h2>
                  <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {renderRichAnnouncementContent(announcement.content)}
                  </div>
                  {renderAnnouncementLink(announcement)}
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-6">
                    {new Date(announcement.created_at).toLocaleDateString(
                      'tr-TR',
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 sm:p-8">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-600 dark:text-purple-300">
                    Haber
                  </span>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    aria-label="Kapat"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <h2
                  id="duyuru-baslik"
                  className="mb-3 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl"
                >
                  {announcement.title}
                </h2>
                <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {renderRichAnnouncementContent(announcement.content)}
                </div>
                {renderAnnouncementLink(announcement)}
                <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
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
