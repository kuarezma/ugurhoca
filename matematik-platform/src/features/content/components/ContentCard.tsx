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
import { getWorksheetVisibleDescription } from '@/features/content/worksheet-display';
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
        className={`col-span-1 flex w-full items-center justify-center gap-2 rounded-2xl border border-default dark:border-white/[0.1] bg-surface-2/80 hover:bg-surface-3 px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-primary transition-all duration-200 backdrop-blur-md shadow-xs hover:border-purple-500/40 sm:flex-1 ${
          !content.file_url ? 'col-span-2' : ''
        } ${viewMode === 'grid' ? 'sm:min-w-[130px]' : 'sm:min-w-[160px]'}`}
      >
        {content.type === 'ders-videolari' ? (
          <Play className="w-4 h-4 text-purple-500" />
        ) : (
          <Eye className="w-4 h-4 text-purple-500" />
        )}
        {content.type === 'ders-videolari' ? 'İzle' : 'Önizle'}
      </motion.button>
      {content.file_url && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onDownload(content)}
          className="col-span-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition-all shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 sm:w-auto sm:px-5"
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
            className="flex-1 sm:flex-none flex items-center justify-center rounded-2xl border border-default dark:border-white/[0.08] bg-surface-2/60 p-2.5 text-secondary transition-all hover:bg-blue-600 hover:border-blue-500 hover:text-white"
          >
            <Edit3 className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(content)}
            title="Sil"
            className="flex-1 sm:flex-none flex items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 p-2.5 text-red-600 dark:text-red-400 transition-all hover:bg-red-600 hover:border-red-600 hover:text-white"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </div>
  );

  const statsBar = (
    <div
      className={`flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-default dark:border-white/[0.06] ${
        viewMode === 'grid' ? 'mb-2' : ''
      }`}
    >
      {/* Metrics counters (left) */}
      <div className="flex items-center gap-3 text-xs text-secondary">
        <button
          onClick={() => onPreview(content)}
          title="Görüntülenme sayısı"
          className="flex items-center gap-1.5 transition-colors hover:text-primary"
        >
          <Eye className="w-3.5 h-3.5 text-secondary" />
          <span>{content.views || 0}</span>
        </button>

        <button
          onClick={() => onToggleLike(content)}
          title="Beğen"
          className={`flex items-center gap-1.5 transition-colors ${
            isLiked ? 'text-rose-500 font-semibold' : 'hover:text-rose-500'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
          <span>{content.likes || 0}</span>
        </button>

        {viewMode === 'grid' ? (
          <button
            onClick={() => onOpenComments(content)}
            title="Yorumlar"
            className="flex items-center gap-1.5 transition-colors hover:text-primary"
          >
            <MessageCircle className="w-3.5 h-3.5 text-secondary" />
            <span>{content.comments_count || 0}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 transition-colors hover:text-primary">
            <MessageCircle className="w-3.5 h-3.5 text-secondary" />
            <span>{content.comments_count || 0}</span>
          </div>
        )}

        {content.file_url ? (
          <button
            onClick={() => onDownload(content)}
            title="İndirme sayısı"
            className="flex items-center gap-1.5 transition-colors hover:text-primary"
          >
            <Download className="w-3.5 h-3.5 text-secondary" />
            <span>{content.downloads || 0}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-secondary" />
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
              ? 'border border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold shadow-xs'
              : 'border border-default dark:border-white/[0.08] bg-surface-2/60 text-secondary hover:bg-surface-3 hover:text-primary'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
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
                ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs'
                : 'border border-default dark:border-white/[0.08] bg-surface-2/60 text-secondary hover:bg-surface-3 hover:text-primary'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'fill-emerald-400/20 text-emerald-600 dark:text-emerald-400' : ''}`} />
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
              ? 'border border-purple-500/40 bg-purple-500/15 text-purple-700 dark:text-purple-300 font-semibold shadow-xs'
              : 'border border-default dark:border-white/[0.08] bg-surface-2/60 text-secondary hover:bg-surface-3 hover:text-primary'
          }`}
        >
          {copiedLink ? (
            <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-300" />
          ) : (
            <Share2 className="w-3.5 h-3.5 text-secondary" />
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
        className="group relative overflow-hidden rounded-3xl border border-default dark:border-white/[0.08] bg-surface-1/90 backdrop-blur-xl p-5 sm:p-6 shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.35),0_0_30px_rgba(168,85,247,0.12)] hover:border-purple-500/40 transition-all duration-300 defer-card-list"
      >
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent group-hover:via-purple-400 transition-all duration-500" />
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              {showDriveThumbnail ? (
                <div className="relative h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 overflow-hidden rounded-2xl border border-default dark:border-white/10 shadow-md group-hover:scale-105 transition-transform duration-300">
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
                <h3 className="text-base sm:text-xl font-bold leading-snug text-primary group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors truncate">
                  {content.title}
                </h3>
                <p className="text-xs sm:text-sm text-secondary">
                  {getContentTypeLabel(content.type)}
                </p>
              </div>
            </div>
            <div className="flex max-w-[52%] flex-wrap justify-end gap-1.5 sm:max-w-none sm:items-center sm:gap-2">
              {content.isNew && (
                <span className="px-2.5 sm:px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] sm:text-xs font-semibold border border-emerald-500/20">
                  Yeni
                </span>
              )}
              {isCompleted && (
                <span className="flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[11px] sm:text-xs font-semibold border border-teal-500/20">
                  <CheckCircle2 className="w-3 h-3 text-teal-400" />
                  Çözüldü
                </span>
              )}
              {hasSolution && (
                <span className="px-2.5 sm:px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-[11px] sm:text-xs font-semibold border border-cyan-500/20">
                  ÇÖZÜMLÜ
                </span>
              )}
              <Chip
                tone={gradeBadgeTone}
                className="ml-auto rounded-full px-3.5 py-1 text-xs font-bold"
              >
                {getContentPrimaryGradeLabel(content)}
              </Chip>
            </div>
          </div>

          {visibleDescription ? (
            <p className="text-secondary text-xs sm:text-sm line-clamp-2 leading-relaxed">
              {visibleDescription}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-secondary/80">
            <div className="flex items-center gap-1.5 min-w-0">
              <Users className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span className="truncate">{getContentAuthorLabel(content)}</span>
            </div>
            <span className="text-secondary/40">•</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-secondary shrink-0" />
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
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-default dark:border-white/[0.08] bg-surface-1/90 backdrop-blur-xl shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.35),0_0_30px_rgba(168,85,247,0.12)] hover:border-purple-500/40 hover:-translate-y-1 transition-all duration-300 defer-card"
    >
      {/* Ambient glowing top accent line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent group-hover:via-purple-400 group-hover:h-[3px] transition-all duration-500" />

      {/* Subtle corner light glow */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-purple-500/5 blur-3xl group-hover:bg-purple-500/10 transition-colors duration-500" />

      <div className="p-5 sm:p-6 flex flex-col h-full justify-between gap-4">
        <div>
          {/* Header row: thumbnail & badges */}
          <div className="flex items-start justify-between gap-3 mb-4">
            {showDriveThumbnail ? (
              <div className="relative h-13 w-13 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-2xl border border-default dark:border-white/10 shadow-md group-hover:scale-105 transition-transform duration-300">
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
              className={`h-13 w-13 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br ${getContentTypeColor(content.type)} flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/10 group-hover:scale-105 transition-transform duration-300 ${showDriveThumbnail ? 'hidden' : ''}`}
            >
              <ContentTypeIcon type={content.type} />
            </div>

            <div className="flex max-w-[65%] flex-wrap items-center justify-end gap-1.5">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[11px] font-semibold border border-amber-500/20">
                {getContentTypeLabel(content.type)}
              </span>
              {content.isNew && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-500/20">
                  Yeni
                </span>
              )}
              {isCompleted && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[11px] font-semibold border border-teal-500/20">
                  <CheckCircle2 className="w-3 h-3 text-teal-400" />
                  Çözüldü
                </span>
              )}
              {hasSolution && (
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-[11px] font-semibold border border-cyan-500/20">
                  ÇÖZÜMLÜ
                </span>
              )}

              <Chip
                tone={gradeBadgeTone}
                className="rounded-full px-3 py-1 text-xs font-bold"
              >
                {getContentPrimaryGradeLabel(content)}
              </Chip>
            </div>
          </div>

          {/* Title & description */}
          <h3 className="text-base sm:text-lg font-bold leading-snug text-primary mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
            {content.title}
          </h3>
          <p className="text-secondary text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">
            {visibleDescription || getContentTypeLabel(content.type)}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-3 text-xs text-secondary/80 pt-3 border-t border-default dark:border-white/[0.06]">
            <div className="flex items-center gap-1.5 min-w-0">
              <Users className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span className="truncate">{getContentAuthorLabel(content)}</span>
            </div>
            <span className="text-secondary/40">•</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-secondary shrink-0" />
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
