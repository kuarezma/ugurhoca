import Image from 'next/image';
import Link from 'next/link';
import { createElement, memo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Check,
  CheckCircle2,
  Download,
  Edit3,
  Eye,
  Heart,
  MessageCircle,
  Play,
  Share2,
  Star,
  Trash2,
  Users,
} from 'lucide-react';
import {
  getContentPrimaryGradeBadgeTone,
  getContentTypeIcon,
  getContentTypeLabel,
} from '@/features/content/constants';
import { Chip } from '@/components/ui/Chip';
import { useToast } from '@/components/Toast';
import { copyToClipboard } from '@/lib/clipboard';
import {
  formatContentDate,
  getContentAuthorLabel,
  getContentPrimaryGradeLabel,
} from '@/features/content/utils';
import {
  getWorksheetVisibleDescription,
  resolveWorksheetOutcome,
} from '@/features/content/worksheet-display';
import { getGoogleDriveThumbnailUrl } from '@/lib/image-url';
import { buildDocumentSlug } from '@/lib/document-slug';
import type { ContentPageUser } from '@/features/content/types';
import type { ContentDocument } from '@/types';

type ContentCardProps = {
  content: ContentDocument;
  index: number;
  isCompleted?: boolean;
  isFavorite: boolean;
  isLiked: boolean;
  onDelete: (content: ContentDocument) => void | Promise<void>;
  onDownload: (content: ContentDocument) => void | Promise<void>;
  onEdit: (content: ContentDocument) => void;
  onOpenComments: (content: ContentDocument) => void | Promise<void>;
  onPreview: (content: ContentDocument) => void;
  onToggleCompleted?: (content: ContentDocument) => void | Promise<void>;
  onToggleFavorite: (docId: string) => void;
  onToggleLike: (content: ContentDocument) => void | Promise<void>;
  user: ContentPageUser | null;
  viewMode: 'grid' | 'list';
};

const AcademicSheetCover = ({
  content,
  size = 'md',
}: {
  content: ContentDocument;
  size?: 'sm' | 'md';
}) => {
  const gradeLabel = getContentPrimaryGradeLabel(content);
  const typeLabel = getContentTypeLabel(content.type);
  const isSm = size === 'sm';

  return (
    <div
      aria-label={`${content.title} akademik föy kapağı`}
      className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border border-amber-900/15 dark:border-amber-400/20 bg-gradient-to-br from-amber-50/95 via-orange-50/40 to-stone-100 dark:from-stone-900 dark:via-stone-900/95 dark:to-stone-950 shadow-sm ring-1 ring-amber-950/5 group-hover:scale-105 transition-transform duration-300 shrink-0 ${
        isSm
          ? 'h-12 w-12 sm:h-14 sm:w-14 p-1.5'
          : 'h-13 w-13 sm:h-14 sm:w-14 p-1.5'
      }`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-1 -right-0.5 select-none font-mono text-[22px] font-black text-amber-900/10 dark:text-amber-200/10 leading-none"
      >
        ∑
      </span>

      <div className="flex items-center justify-between gap-0.5 z-10">
        <span className="truncate text-[9px] font-black tracking-tight text-amber-900/90 dark:text-amber-200">
          {gradeLabel}
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0" />
      </div>

      <div className="my-auto flex items-center justify-center z-10">
        {createElement(getContentTypeIcon(content.type), {
          className:
            'h-4 w-4 sm:h-5 sm:w-5 text-amber-800 dark:text-amber-300 shrink-0',
        })}
      </div>

      <div className="truncate text-center text-[8px] font-bold text-stone-700 dark:text-stone-300 leading-tight z-10">
        {typeLabel}
      </div>
    </div>
  );
};

function ContentCard({
  content,
  index: _index,
  isCompleted,
  isFavorite,
  isLiked,
  onDelete,
  onDownload,
  onEdit,
  onOpenComments,
  onPreview,
  onToggleCompleted,
  onToggleFavorite,
  onToggleLike,
  user,
  viewMode,
}: ContentCardProps) {
  const { showToast } = useToast();
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const visibleDescription = getWorksheetVisibleDescription(content);
  const isDriveImage =
    typeof content.file_url === 'string' &&
    /drive\.google\.com/i.test(content.file_url);
  const driveThumbnailSrc =
    isDriveImage && content.file_url
      ? getGoogleDriveThumbnailUrl(content.file_url, 'w400')
      : null;
  const showDriveThumbnail = Boolean(driveThumbnailSrc) && !thumbnailFailed;
  const gradeBadgeTone = getContentPrimaryGradeBadgeTone(content);
  const isWorksheet = content.type === 'yaprak-test';
  const outcomeLabel = isWorksheet ? resolveWorksheetOutcome(content) : null;
  const hasSolution = Boolean(
    content.solution_url?.trim() || content.answer_key_text?.trim(),
  );

  const documentSlug = buildDocumentSlug(content);

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/icerikler/${documentSlug}`;
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      showToast(
        'share',
        `"${content.title}" bağlantısı kopyalandı! Artık dilediğin yerde paylaşabilirsin.`,
        { title: 'Bağlantı Kopyalandı' },
      );
    } else {
      showToast('error', 'Bağlantı kopyalanamadı. Lütfen tekrar deneyin.');
    }
  };

  const actionButtons = (
    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2.5">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onPreview(content)}
        className={`col-span-1 flex w-full items-center justify-center gap-2 rounded-2xl border border-sky-600 dark:border-sky-400 bg-sky-50/80 dark:bg-sky-950/50 hover:bg-sky-100/90 dark:hover:bg-sky-900/60 px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-sky-950 dark:text-sky-200 transition-all duration-200 backdrop-blur-md shadow-xs hover:border-sky-500 hover:-translate-y-0.5 sm:flex-1 ${
          !content.file_url ? 'col-span-2' : ''
        } ${viewMode === 'grid' ? 'sm:min-w-[130px]' : 'sm:min-w-[160px]'}`}
      >
        {content.type === 'ders-videolari' ? (
          <Play className="shrink-0 w-4 h-4 text-sky-600 dark:text-sky-400" />
        ) : (
          <Eye className="shrink-0 w-4 h-4 text-sky-600 dark:text-sky-400" />
        )}
        {content.type === 'ders-videolari' ? 'İzle' : 'Önizle'}
      </motion.button>
      {content.file_url && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onDownload(content)}
          className="col-span-1 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-all sm:w-auto sm:px-5 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-[var(--on-brand)] dark:text-slate-950 dark:from-emerald-400 dark:to-teal-400 dark:hover:from-emerald-300 dark:hover:to-teal-300 shadow-md shadow-emerald-600/25 hover:-translate-y-0.5 active:translate-y-0.5"
        >
          <Download className="shrink-0 w-4 h-4" /> İndir
        </motion.button>
      )}
      {user?.isAdmin && (
        <div className="col-span-2 flex items-center gap-1.5 sm:contents">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(content)}
            title="Düzenle"
            className="flex-1 sm:flex-none flex items-center justify-center rounded-2xl border border-sky-200 dark:border-sky-800/60 bg-sky-50/80 dark:bg-sky-950/30 p-2.5 text-sky-700 dark:text-sky-300 transition-all hover:bg-sky-600 hover:border-sky-500 hover:text-[var(--on-brand)] dark:hover:text-slate-100"
          >
            <Edit3 className="shrink-0 w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(content)}
            title="Sil"
            className="flex-1 sm:flex-none flex items-center justify-center rounded-2xl border border-red-200 dark:border-red-800/60 bg-red-50/80 dark:bg-red-950/30 p-2.5 text-red-700 dark:text-red-300 transition-all hover:bg-red-600 hover:border-red-600 hover:text-[var(--on-brand)] dark:hover:text-slate-100"
          >
            <Trash2 className="shrink-0 w-4 h-4" />
          </motion.button>
        </div>
      )}
    </div>
  );

  const statsBar = (
    <div
      className={`flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between pt-3.5 border-t border-purple-200/80 dark:border-purple-800/40 ${
        viewMode === 'grid' ? 'mb-2' : ''
      }`}
    >
      <div className="flex flex-wrap items-center gap-3 sm:gap-3.5 text-xs font-bold text-slate-700 dark:text-slate-200">
        <button
          onClick={() => onPreview(content)}
          title="Görüntülenme sayısı"
          className="flex items-center gap-1.5 transition-colors hover:text-purple-600 dark:hover:text-purple-400"
        >
          <Eye className="shrink-0 w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>{content.views || 0}</span>
        </button>

        <button
          onClick={() => onToggleLike(content)}
          title="Beğen"
          className={`flex items-center gap-1.5 transition-colors ${
            isLiked ? 'text-rose-500 font-extrabold' : 'hover:text-rose-500'
          }`}
        >
          <Heart
            className={`w-4 h-4 ${isLiked ? 'fill-current text-rose-500' : 'text-slate-500 dark:text-slate-400'}`}
          />
          <span>{content.likes || 0}</span>
        </button>

        {viewMode === 'grid' ? (
          <button
            onClick={() => onOpenComments(content)}
            title="Yorumlar"
            className="flex items-center gap-1.5 transition-colors hover:text-purple-600 dark:hover:text-purple-400"
          >
            <MessageCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>{content.comments_count || 0}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 transition-colors hover:text-purple-600 dark:hover:text-purple-400">
            <MessageCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>{content.comments_count || 0}</span>
          </div>
        )}

        {content.file_url ? (
          <button
            onClick={() => onDownload(content)}
            title="İndirme sayısı"
            className="flex items-center gap-1.5 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            <Download className="shrink-0 w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{content.downloads || 0}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <Download className="shrink-0 w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{content.downloads || 0}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => onToggleFavorite(content.id)}
          title="Favori"
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-all duration-200 ${
            isFavorite
              ? 'border-2 border-amber-700 bg-amber-500/25 text-amber-900 dark:text-amber-100 font-extrabold shadow-xs'
              : 'border-2 border-amber-700 dark:border-amber-400 bg-surface-1/90 text-amber-900 dark:text-amber-200 font-bold hover:bg-amber-50 dark:hover:bg-amber-950/40 backdrop-blur-md'
          }`}
        >
          <Star
            className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current text-amber-500' : 'text-amber-600'}`}
          />
          <span className="text-xs">{isFavorite ? 'Favori' : 'Ekle'}</span>
        </button>

        {onToggleCompleted && (
          <button
            onClick={() => onToggleCompleted(content)}
            title={
              isCompleted
                ? 'Çözüldü işaretini kaldır'
                : 'Çözüldü olarak işaretle'
            }
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-all duration-200 ${
              isCompleted
                ? 'border-2 border-emerald-700 bg-emerald-500/25 text-emerald-900 dark:text-emerald-100 font-extrabold shadow-xs'
                : 'border-2 border-emerald-700 dark:border-emerald-400 bg-surface-1/90 text-emerald-900 dark:text-emerald-200 font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/40 backdrop-blur-md'
            }`}
          >
            <CheckCircle2
              className={`w-3.5 h-3.5 ${isCompleted ? 'fill-emerald-400/20 text-emerald-600 dark:text-emerald-400' : 'text-emerald-600'}`}
            />
            <span className="text-xs">
              {isCompleted ? 'Çözüldü' : 'Tamamla'}
            </span>
          </button>
        )}

        <button
          onClick={handleCopyLink}
          title="Bağlantıyı Kopyala"
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-all duration-200 ${
            copiedLink
              ? 'border-2 border-purple-700 bg-purple-500/25 text-purple-900 dark:text-purple-100 font-extrabold shadow-xs'
              : 'border-2 border-purple-700 dark:border-purple-400 bg-surface-1/90 text-purple-900 dark:text-purple-200 font-bold hover:bg-purple-50 dark:hover:bg-purple-950/40 backdrop-blur-md'
          }`}
        >
          {copiedLink ? (
            <Check className="shrink-0 w-3.5 h-3.5 text-purple-600 dark:text-purple-300" />
          ) : (
            <Share2 className="shrink-0 w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          )}
          <span className="text-xs">
            {copiedLink ? 'Kopyalandı!' : 'Paylaş'}
          </span>
        </button>
      </div>
    </div>
  );

  if (viewMode === 'list') {
    return (
      <div className="group relative overflow-hidden rounded-3xl border border-sky-200/80 dark:border-sky-400/20 bg-surface-1/85 backdrop-blur-2xl p-5 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_28px_-10px_rgba(14,165,233,0.12)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_36px_-12px_rgba(2,6,23,0.5)] hover:border-sky-400/80 hover:shadow-xl transition-[transform,box-shadow,border-color] duration-200 ease-out defer-card-list">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 transition-all duration-200" />
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              {showDriveThumbnail ? (
                <div className="relative h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 overflow-hidden rounded-2xl border border-sky-300 dark:border-sky-700 shadow-md ring-2 ring-sky-500/20 group-hover:scale-105 transition-transform duration-300">
                  {!thumbnailLoaded && (
                    <AcademicSheetCover content={content} size="sm" />
                  )}
                  <Image
                    src={driveThumbnailSrc || ''}
                    alt={content.title}
                    fill
                    sizes="(max-width: 640px) 48px, 56px"
                    className={`object-cover transition-opacity duration-200 ${
                      thumbnailLoaded
                        ? 'opacity-100'
                        : 'opacity-0 pointer-events-none absolute inset-0'
                    }`}
                    onLoad={() => setThumbnailLoaded(true)}
                    onError={() => setThumbnailFailed(true)}
                    unoptimized
                  />
                </div>
              ) : (
                <AcademicSheetCover content={content} size="sm" />
              )}
              <div className="min-w-0">
                <h3 className="text-base sm:text-xl font-black leading-snug text-primary group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors truncate">
                  <Link
                    href={`/icerikler/${documentSlug}`}
                    className="hover:underline focus:outline-hidden"
                  >
                    {content.title}
                  </Link>
                </h3>
                <p className="text-xs sm:text-sm text-secondary font-bold">
                  {getContentTypeLabel(content.type)}
                </p>
              </div>
            </div>
            <div className="flex max-w-[52%] flex-wrap justify-end gap-1.5 sm:max-w-none sm:items-center sm:gap-2">
              {content.isNew && (
                <span className="px-2.5 sm:px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-900 dark:text-emerald-100 text-[11px] sm:text-xs font-black border border-emerald-400/40 shadow-xs backdrop-blur-md">
                  Yeni
                </span>
              )}
              {isCompleted && (
                <span className="flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-teal-500/20 text-teal-900 dark:text-teal-100 text-[11px] sm:text-xs font-black border border-teal-400/40 shadow-xs backdrop-blur-md">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  Çözüldü
                </span>
              )}
              {hasSolution && (
                <span className="px-2.5 sm:px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-900 dark:text-cyan-100 text-[11px] sm:text-xs font-black border border-cyan-400/40 shadow-xs backdrop-blur-md">
                  ÇÖZÜMLÜ
                </span>
              )}
              <Chip
                tone={gradeBadgeTone}
                className="ml-auto rounded-full px-3.5 py-1 text-xs font-black shadow-xs border"
              >
                {getContentPrimaryGradeLabel(content)}
              </Chip>
            </div>
          </div>

          {outcomeLabel && (
            <div className="inline-flex max-w-full items-center gap-1.5 rounded-xl border border-sky-400/50 bg-sky-50/70 dark:bg-sky-950/50 px-3 py-1.5 text-[11px] font-bold text-sky-950 dark:text-sky-100 shadow-2xs backdrop-blur-md">
              <span className="font-black text-sky-950 dark:text-sky-200 shrink-0">
                🎯 Kazanım:
              </span>
              <span className="truncate">{outcomeLabel}</span>
            </div>
          )}

          {visibleDescription ? (
            <p className="text-secondary text-xs sm:text-sm font-semibold line-clamp-2 leading-relaxed">
              {visibleDescription}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-bold text-secondary">
            <div className="flex items-center gap-1.5 min-w-0">
              <Users className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <span className="truncate">{getContentAuthorLabel(content)}</span>
            </div>
            <span className="text-tertiary font-black">•</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <span>{formatContentDate(content.created_at)}</span>
            </div>
          </div>

          {statsBar}
          {actionButtons}
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-sky-200/80 dark:border-sky-400/20 bg-surface-1/85 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_14px_32px_-10px_rgba(14,165,233,0.14)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_40px_-12px_rgba(2,6,23,0.5)] hover:border-sky-400/80 hover:-translate-y-1 transition-[transform,box-shadow,border-color] duration-200 ease-out defer-card">
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 transition-all duration-200" />

      <div className="pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full bg-gradient-to-br from-sky-400/15 via-indigo-400/10 to-transparent blur-3xl group-hover:scale-125 transition-transform duration-500" />

      <div className="p-5 sm:p-6 flex flex-col h-full justify-between gap-4">
        <div>
          <div className="flex items-start justify-between gap-3 mb-4">
            {showDriveThumbnail ? (
              <div className="relative h-13 w-13 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-2xl border border-sky-300 dark:border-sky-700 shadow-md ring-2 ring-sky-500/20 group-hover:scale-105 transition-transform duration-300">
                {!thumbnailLoaded && (
                  <AcademicSheetCover content={content} size="md" />
                )}
                <Image
                  src={driveThumbnailSrc || ''}
                  alt={content.title}
                  fill
                  sizes="(max-width: 640px) 52px, 56px"
                  className={`object-cover transition-opacity duration-200 ${
                    thumbnailLoaded
                      ? 'opacity-100'
                      : 'opacity-0 pointer-events-none absolute inset-0'
                  }`}
                  onLoad={() => setThumbnailLoaded(true)}
                  onError={() => setThumbnailFailed(true)}
                  unoptimized
                />
              </div>
            ) : (
              <AcademicSheetCover content={content} size="md" />
            )}

            <div className="flex max-w-[65%] flex-wrap items-center justify-end gap-1.5">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-100 text-[11px] font-black border border-amber-400/40 shadow-xs backdrop-blur-md">
                {getContentTypeLabel(content.type)}
              </span>
              {content.isNew && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-900 dark:text-emerald-100 text-[11px] font-black border border-emerald-400/40 shadow-xs backdrop-blur-md">
                  Yeni
                </span>
              )}
              {isCompleted && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-900 dark:text-teal-100 text-[11px] font-black border border-teal-400/40 shadow-xs backdrop-blur-md">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  Çözüldü
                </span>
              )}
              {hasSolution && (
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-900 dark:text-cyan-100 text-[11px] font-black border border-cyan-400/40 shadow-xs backdrop-blur-md">
                  ÇÖZÜMLÜ
                </span>
              )}

              <Chip
                tone={gradeBadgeTone}
                className="rounded-full px-3 py-1 text-xs font-black shadow-xs border"
              >
                {getContentPrimaryGradeLabel(content)}
              </Chip>
            </div>
          </div>

          <h3 className="text-base sm:text-lg font-black leading-snug text-primary mb-2 line-clamp-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            <Link
              href={`/icerikler/${documentSlug}`}
              className="hover:underline focus:outline-hidden"
            >
              {content.title}
            </Link>
          </h3>

          {outcomeLabel && (
            <div className="mb-2.5 inline-flex max-w-full items-center gap-1.5 rounded-xl border border-sky-400/50 bg-sky-50/70 dark:bg-sky-950/50 px-3 py-1.5 text-[11px] font-bold text-sky-950 dark:text-sky-100 shadow-2xs backdrop-blur-md">
              <span className="font-black text-sky-950 dark:text-sky-200 shrink-0">
                🎯 Kazanım:
              </span>
              <span className="truncate">{outcomeLabel}</span>
            </div>
          )}

          <p className="text-secondary text-xs sm:text-sm font-semibold line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">
            {visibleDescription || getContentTypeLabel(content.type)}
          </p>

          <div className="flex items-center gap-3 text-xs font-bold text-secondary pt-3 border-t border-sky-200/60 dark:border-sky-800/40">
            <div className="flex items-center gap-1.5 min-w-0">
              <Users className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <span className="truncate">{getContentAuthorLabel(content)}</span>
            </div>
            <span className="text-tertiary font-black">•</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <span>{formatContentDate(content.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {statsBar}
          {actionButtons}
        </div>
      </div>
    </div>
  );
}

const MemoizedContentCard = memo(ContentCard);
export default MemoizedContentCard;
export { MemoizedContentCard as ContentCard };
