'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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

const hasRichStructuredContent = (content?: string | null) =>
  Boolean(content && (/^###\s+/m.test(content) || /^\|.+\|$/m.test(content)));

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
            className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 my-3 shadow-xs"
          >
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {headerCells.map((h, hi) => (
                    <th
                      key={hi}
                      className={`p-2.5 sm:px-4 sm:py-3 ${
                        hi === headerCells.length - 1 ? 'text-center w-20' : ''
                      }`}
                    >
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
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    >
                      {cells.map((cell, ci) => (
                        <td
                          key={ci}
                          className={`p-2.5 sm:px-4 sm:py-2.5 ${
                            ci === cells.length - 1
                              ? 'text-center font-bold text-purple-700 dark:text-purple-300'
                              : ''
                          }`}
                        >
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
          className="mt-6 mb-2 pt-4 border-t border-slate-200/80 dark:border-slate-800 first:border-t-0 first:pt-0 text-base sm:text-lg font-bold text-slate-900 dark:text-white"
        >
          {line.replace(/^###\s+/, '')}
        </h3>,
      );
      i++;
      continue;
    }

    // Standalone image line ![Alt](url)
    const imgMatch = line.match(/^!\[(.*?)\]\(((?:https?:\/\/|\/)[^\s)]+)\)$/);
    if (imgMatch) {
      const [, alt, url] = imgMatch;
      elements.push(
        <a
          key={`img-${elements.length}`}
          href={proxiedImageSrc(url)}
          target="_blank"
          rel="noreferrer"
          className="block w-full overflow-hidden rounded-xl bg-white p-2 my-3 border border-slate-200 dark:border-slate-700 transition-opacity hover:opacity-95 shadow-xs"
          title="Tam boyutta açmak için tıklayın"
        >
          <Image
            src={proxiedImageSrc(url)}
            alt={alt || 'Konu soru dağılım tablosu'}
            width={1200}
            height={620}
            className="w-full h-auto block rounded-lg"
            unoptimized
          />
        </a>,
      );
      i++;
      continue;
    }

    // Standalone link line [Label](url)
    const linkMatch = line.match(/^\[(.*?)\]\(((?:https?:\/\/|\/)[^\s)]+)\)$/);
    if (linkMatch) {
      const [, label, url] = linkMatch;
      elements.push(
        <div key={`link-${elements.length}`}>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 mt-1 mb-3 px-4 py-2 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 text-xs sm:text-sm font-semibold transition-colors"
          >
            <FileDoc className="w-4 h-4 shrink-0" />
            {label}
            <ChevronRight className="w-4 h-4 shrink-0" />
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
  const isRich = hasRichStructuredContent(announcement?.content);

  const modalContent = (
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
            {images.length > 0 && isRich ? (
              <div>
                <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-slate-950">
                  <Image
                    src={proxiedImageSrc(images[0])}
                    alt={announcement.title}
                    width={1280}
                    height={720}
                    className="h-48 sm:h-64 w-full object-cover block"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors"
                    aria-label="Kapat"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-semibold">
                      Haber
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                      {new Date(announcement.created_at).toLocaleDateString(
                        'tr-TR',
                      )}
                    </span>
                  </div>
                  <h2
                    id="duyuru-baslik"
                    className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4"
                  >
                    {announcement.title}
                  </h2>
                  <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {renderRichAnnouncementContent(announcement.content)}
                  </div>
                  {images.length > 1 &&
                    !/^!\[.*?\]\(/m.test(announcement.content || '') && (
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-3">
                        Resmi Konu & Soru Dağılım Tablosu Görselleri (Büyütmek için tıklayın)
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {images.slice(1).map((image, index) => (
                          <a
                            key={index + 1}
                            href={proxiedImageSrc(image)}
                            target="_blank"
                            rel="noreferrer"
                            className="relative block h-56 w-full overflow-hidden rounded-xl bg-white p-2 border border-slate-200 dark:border-slate-700 transition-opacity hover:opacity-90 shadow-xs"
                          >
                            <Image
                              src={proxiedImageSrc(image)}
                              alt={`${announcement.title} — tablo ${index + 1}`}
                              fill
                              className="object-contain p-1"
                              sizes="(max-width: 768px) 100vw, 460px"
                              unoptimized
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {renderAnnouncementLink(announcement)}
                </div>
              </div>
            ) : images.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-0">
                <div className="bg-slate-100 dark:bg-slate-950 p-2 sm:p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {images
                      .filter(
                        (image): image is string => typeof image === 'string',
                      )
                      .map((image, index) => (
                        <a
                          key={index}
                          href={proxiedImageSrc(image)}
                          target="_blank"
                          rel="noreferrer"
                          className="relative block h-56 w-full overflow-hidden rounded-xl transition-opacity hover:opacity-90"
                        >
                          <Image
                            src={proxiedImageSrc(image)}
                            alt={`${announcement.title} — görsel ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 400px"
                            unoptimized
                          />
                        </a>
                      ))}
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

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}
