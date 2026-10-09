import Image from 'next/image';
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
  getContentTypeColor,
  getContentTypeIcon,
  getContentTypeLabel,
} from '@/features/content/constants';
import { Chip } from '@/components/ui/Chip';
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


const ContentTypeIcon = ({ type }: { type: string }) => {
  const Icon = getContentTypeIcon(type);
  return createElement(Icon, {
    className: 'w-5 h-5 sm:w-7 sm:h-7 text-white',
  });
};

function ContentCard({
  content,
  index,
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
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
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

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const url = `${window.location.origin}/icerikler?id=${content.id}`;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // ignore
    }
  };

  const actionButtons = (
    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2.5">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onPreview(content)}
        className={`col-span-1 flex w-full items-center justify-center gap-2 rounded-2xl border border-purple-200/90 dark:border-purple-800/80 bg-purple-50/70 dark:bg-purple-950/40 hover:bg-purple-100/90 dark:hover:bg-purple-900/50 px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-purple-900 dark:text-purple-200 transition-all duration-200 backdrop-blur-md shadow-xs hover:border-purple-400 hover:-translate-y-0.5 sm:flex-1 ${
          !content.file_url ? 'col-span-2' : ''
        } ${viewMode === 'grid' ? 'sm:min-w-[130px]' : 'sm:min-w-[160px]'}`}
      >
        {content.type === 'ders-videolari' ? (
          <Play className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        ) : (
          <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        )}
        {content.type === 'ders-videolari' ? 'İzle' : 'Önizle'}
      </motion.button>
      {content.file_url && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onDownload(content)}
          className="col-span-1 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-all sm:w-auto sm:px-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white dark:text-slate-950 dark:from-emerald-400 dark:to-teal-400 dark:hover:from-emerald-300 dark:hover:to-teal-300 shadow-md shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0.5"
        >
          <Download className="w-4 h-4" /> İndir
        </motion.button>
      )}
      {user?.isAdmin && (
        <div className="col-span-2 flex items-center gap-1.5 sm:contents">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(content)}
            title="Düzenle"
            className="flex-1 sm:flex-none flex items-center justify-center rounded-2xl border border-sky-200 dark:border-sky-800/60 bg-sky-50/80 dark:bg-sky-950/30 p-2.5 text-sky-700 dark:text-sky-300 transition-all hover:bg-sky-600 hover:border-sky-500 hover:text-white"
          >
            <Edit3 className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(content)}
            title="Sil"
            className="flex-1 sm:flex-none flex items-center justify-center rounded-2xl border border-red-200 dark:border-red-800/60 bg-red-50/80 dark:bg-red-950/30 p-2.5 text-red-700 dark:text-red-300 transition-all hover:bg-red-600 hover:border-red-600 hover:text-white"
          >
            <Trash2 className="w-4 h-4" />
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
      {/* Metrics counters (left) */}
      <div className="flex items-center gap-3.5 text-xs font-bold text-slate-700 dark:text-slate-200">
        <button
          onClick={() => onPreview(content)}
          title="Görüntülenme sayısı"
          className="flex items-center gap-1.5 transition-colors hover:text-purple-600 dark:hover:text-purple-400"
        >
          <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>{content.views || 0}</span>
        </button>

        <button
          onClick={() => onToggleLike(content)}
          title="Beğen"
          className={`flex items-center gap-1.5 transition-colors ${
            isLiked ? 'text-rose-500 font-extrabold' : 'hover:text-rose-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-rose-500' : 'text-slate-500 dark:text-slate-400'}`} />
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
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{content.downloads || 0}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{content.downloads || 0}</span>
          </div>
        )}
      </div>

      {/* Interactive utility chips (right) */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onToggleFavorite(content.id)}
          title="Favori"
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-all duration-200 ${
            isFavorite
              ? 'border-2 border-amber-500 bg-amber-500/25 text-amber-900 dark:text-amber-100 font-extrabold shadow-xs'
              : 'border-2 border-amber-300/90 dark:border-amber-700/60 bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-200 font-bold hover:bg-amber-50 dark:hover:bg-amber-950/40'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current text-amber-500' : 'text-amber-600'}`} />
          <span className="text-xs">
            {isFavorite ? 'Favori' : 'Ekle'}
          </span>
        </button>

        {onToggleCompleted && (
          <button
            onClick={() => onToggleCompleted(content)}
            title={isCompleted ? 'Çözüldü işaretini kaldır' : 'Çözüldü olarak işaretle'}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-all duration-200 ${
              isCompleted
                ? 'border-2 border-emerald-500 bg-emerald-500/25 text-emerald-900 dark:text-emerald-100 font-extrabold shadow-xs'
                : 'border-2 border-emerald-300/90 dark:border-emerald-700/60 bg-white dark:bg-slate-800 text-emerald-900 dark:text-emerald-200 font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'fill-emerald-400/20 text-emerald-600 dark:text-emerald-400' : 'text-emerald-600'}`} />
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
              ? 'border-2 border-purple-500 bg-purple-500/25 text-purple-900 dark:text-purple-100 font-extrabold shadow-xs'
              : 'border-2 border-purple-300/90 dark:border-purple-700/60 bg-white dark:bg-slate-800 text-purple-900 dark:text-purple-200 font-bold hover:bg-purple-50 dark:hover:bg-purple-950/40'
          }`}
        >
          {copiedLink ? (
            <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-300" />
          ) : (
            <Share2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
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
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group relative overflow-hidden rounded-3xl border-2 border-purple-400/90 dark:border-purple-600/70 bg-gradient-to-br from-white via-indigo-50/35 to-purple-50/45 dark:from-slate-900 dark:via-slate-900/95 dark:to-purple-950/30 backdrop-blur-xl p-5 sm:p-6 shadow-lg shadow-purple-500/10 hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300 defer-card-list"
      >
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-400 group-hover:h-2.5 transition-all duration-300" />
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              {showDriveThumbnail ? (
                <div className="relative h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-purple-300 dark:border-purple-700 shadow-md ring-2 ring-purple-500/20 group-hover:scale-105 transition-transform duration-300">
                  <Image
                    src={driveThumbnailSrc || ''}
                    alt={content.title}
                    fill
                    sizes="(max-width: 640px) 48px, 56px"
                    className="object-cover"
                    onError={() => setThumbnailFailed(true)}
                    unoptimized
                  />
                </div>
              ) : null}
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${getContentTypeColor(content.type)} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300 ${showDriveThumbnail ? 'hidden' : ''}`}
              >
                <ContentTypeIcon type={content.type} />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-xl font-black leading-snug text-purple-900 dark:text-purple-200 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors truncate">
                  {content.title}
                </h3>
                <p className="text-xs sm:text-sm text-purple-700/80 dark:text-purple-300/80 font-bold">
                  {getContentTypeLabel(content.type)}
                </p>
              </div>
            </div>
            <div className="flex max-w-[52%] flex-wrap justify-end gap-1.5 sm:max-w-none sm:items-center sm:gap-2">
              {content.isNew && (
                <span className="px-2.5 sm:px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-900 dark:text-emerald-100 text-[11px] sm:text-xs font-black border-2 border-emerald-400/40 shadow-xs">
                  Yeni
                </span>
              )}
              {isCompleted && (
                <span className="flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-teal-500/20 text-teal-900 dark:text-teal-100 text-[11px] sm:text-xs font-black border-2 border-teal-400/40 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  Çözüldü
                </span>
              )}
              {hasSolution && (
                <span className="px-2.5 sm:px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-900 dark:text-cyan-100 text-[11px] sm:text-xs font-black border-2 border-cyan-400/40 shadow-xs">
                  ÇÖZÜMLÜ
                </span>
              )}
              <Chip
                tone={gradeBadgeTone}
                className="ml-auto rounded-full px-3.5 py-1 text-xs font-black shadow-xs border-2"
              >
                {getContentPrimaryGradeLabel(content)}
              </Chip>
            </div>
          </div>

          {outcomeLabel && (
            <div className="inline-flex max-w-full items-center gap-1.5 rounded-xl border-2 border-sky-400/60 bg-gradient-to-r from-sky-500/20 via-blue-500/15 to-transparent px-3 py-1.5 text-[11px] font-bold text-sky-950 dark:text-sky-100 shadow-2xs">
              <span className="font-black text-sky-700 dark:text-sky-400 shrink-0">🎯 Kazanım:</span>
              <span className="truncate">{outcomeLabel}</span>
            </div>
          )}

          {visibleDescription ? (
            <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold line-clamp-2 leading-relaxed">
              {visibleDescription}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-bold text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-1.5 min-w-0">
              <Users className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span className="truncate">{getContentAuthorLabel(content)}</span>
            </div>
            <span className="text-purple-300 dark:text-purple-700">•</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>{formatContentDate(content.created_at)}</span>
            </div>
          </div>

          {statsBar}
          {actionButtons}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-purple-400/90 dark:border-purple-600/70 bg-gradient-to-br from-white via-indigo-50/35 to-purple-50/45 dark:from-slate-900 dark:via-slate-900/95 dark:to-purple-950/30 backdrop-blur-xl shadow-lg shadow-purple-500/10 hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-500 dark:hover:border-purple-500 hover:-translate-y-1 transition-all duration-300 defer-card"
    >
      {/* Ambient glowing top accent line */}
      <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-400 group-hover:h-2.5 transition-all duration-300" />

      {/* Subtle corner light glow */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full bg-gradient-to-br from-purple-500/20 via-pink-500/15 to-transparent blur-3xl group-hover:scale-125 transition-transform duration-500" />

      <div className="p-5 sm:p-6 flex flex-col h-full justify-between gap-4">
        <div>
          {/* Header row: thumbnail & badges */}
          <div className="flex items-start justify-between gap-3 mb-4">
            {showDriveThumbnail ? (
              <div className="relative h-13 w-13 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-2xl border-2 border-purple-300 dark:border-purple-700 shadow-md ring-2 ring-purple-500/20 group-hover:scale-105 transition-transform duration-300">
                <Image
                  src={driveThumbnailSrc || ''}
                  alt={content.title}
                  fill
                  sizes="(max-width: 640px) 52px, 56px"
                  className="object-cover"
                  onError={() => setThumbnailFailed(true)}
                  unoptimized
                />
              </div>
            ) : null}
            <div
              className={`h-13 w-13 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br ${getContentTypeColor(content.type)} flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/15 group-hover:scale-105 transition-transform duration-300 ${showDriveThumbnail ? 'hidden' : ''}`}
            >
              <ContentTypeIcon type={content.type} />
            </div>

            <div className="flex max-w-[65%] flex-wrap items-center justify-end gap-1.5">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-100 text-[11px] font-black border-2 border-amber-400/40 shadow-xs">
                {getContentTypeLabel(content.type)}
              </span>
              {content.isNew && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-900 dark:text-emerald-100 text-[11px] font-black border-2 border-emerald-400/40 shadow-xs">
                  Yeni
                </span>
              )}
              {isCompleted && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-900 dark:text-teal-100 text-[11px] font-black border-2 border-teal-400/40 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  Çözüldü
                </span>
              )}
              {hasSolution && (
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-900 dark:text-cyan-100 text-[11px] font-black border-2 border-cyan-400/40 shadow-xs">
                  ÇÖZÜMLÜ
                </span>
              )}

              <Chip
                tone={gradeBadgeTone}
                className="rounded-full px-3 py-1 text-xs font-black shadow-xs border-2"
              >
                {getContentPrimaryGradeLabel(content)}
              </Chip>
            </div>
          </div>

          {/* Title & description */}
          <h3 className="text-base sm:text-lg font-black leading-snug text-purple-900 dark:text-purple-200 mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
            {content.title}
          </h3>

          {outcomeLabel && (
            <div className="mb-2.5 inline-flex max-w-full items-center gap-1.5 rounded-xl border-2 border-sky-400/60 bg-gradient-to-r from-sky-500/20 via-blue-500/15 to-transparent px-3 py-1.5 text-[11px] font-bold text-sky-950 dark:text-sky-100 shadow-2xs">
              <span className="font-black text-sky-700 dark:text-sky-400 shrink-0">🎯 Kazanım:</span>
              <span className="truncate">{outcomeLabel}</span>
            </div>
          )}

          <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">
            {visibleDescription || getContentTypeLabel(content.type)}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300 pt-3 border-t border-purple-200/80 dark:border-purple-800/40">
            <div className="flex items-center gap-1.5 min-w-0">
              <Users className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span className="truncate">{getContentAuthorLabel(content)}</span>
            </div>
            <span className="text-purple-300 dark:text-purple-700">•</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>{formatContentDate(content.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Action and stats section */}
        <div className="space-y-3">
          {statsBar}
          {actionButtons}
        </div>
      </div>
    </motion.div>
  );
}

const MemoizedContentCard = memo(ContentCard);
export default MemoizedContentCard;
export { MemoizedContentCard as ContentCard };
