import Image from 'next/image';
import { createElement, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Download,
  Edit3,
  Eye,
  Heart,
  MessageCircle,
  Play,
  Star,
  Trash2,
  Users,
} from 'lucide-react';
import {
  getContentPrimaryGradeBadgeClass,
  getContentTypeColor,
  getContentTypeIcon,
  getContentTypeLabel,
} from '@/features/content/constants';
import {
  formatContentDate,
  getContentAuthorLabel,
  getContentPrimaryGradeLabel,
} from '@/features/content/utils';
import { getWorksheetVisibleDescription } from '@/features/content/worksheet';
import { getGoogleDriveThumbnailUrl } from '@/lib/image-url';
import type { ContentPageUser } from '@/features/content/types';
import type { ContentDocument } from '@/types';

type ContentCardProps = {
  content: ContentDocument;
  index: number;
  isFavorite: boolean;
  isLiked: boolean;
  onDelete: (content: ContentDocument) => void | Promise<void>;
  onDownload: (content: ContentDocument) => void | Promise<void>;
  onEdit: (content: ContentDocument) => void;
  onOpenComments: (content: ContentDocument) => void | Promise<void>;
  onPreview: (content: ContentDocument) => void;
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

export default function ContentCard({
  content,
  index,
  isFavorite,
  isLiked,
  onDelete,
  onDownload,
  onEdit,
  onOpenComments,
  onPreview,
  onToggleFavorite,
  onToggleLike,
  user,
  viewMode,
}: ContentCardProps) {
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const visibleDescription = getWorksheetVisibleDescription(content);
  const isDriveImage =
    typeof content.file_url === 'string' &&
    /drive\.google\.com/i.test(content.file_url);
  const driveThumbnailSrc =
    isDriveImage && content.file_url
      ? getGoogleDriveThumbnailUrl(content.file_url, 'w400')
      : null;
  const showDriveThumbnail = Boolean(driveThumbnailSrc) && !thumbnailFailed;
  const gradeBadgeClass = getContentPrimaryGradeBadgeClass(content);

  const actionButtons = (
    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onPreview(content)}
        className={`col-span-1 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-4 py-2.5 text-xs font-semibold text-slate-100 transition-all hover:bg-slate-700/70 sm:flex-1 sm:py-3 sm:text-base ${!content.file_url ? 'col-span-2' : ''} ${viewMode === 'grid' ? 'sm:min-w-[150px]' : 'sm:min-w-[180px]'}`}
      >
        {content.type === 'ders-videolari' ? (
          <Play className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
        {content.type === 'ders-videolari' ? 'İzle' : 'Önizle'}
      </motion.button>
      {content.file_url && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDownload(content)}
          className="col-span-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2.5 text-xs font-semibold text-white transition-all shadow-lg shadow-cyan-500/20 hover:from-indigo-600 hover:to-cyan-600 sm:w-auto sm:px-5 sm:py-3 sm:text-base"
        >
          <Download className="w-4 h-4" /> İndir
        </motion.button>
      )}
      {user?.isAdmin && (
        <div className="col-span-2 grid grid-cols-2 gap-2 sm:contents">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(content)}
            className="flex items-center justify-center rounded-xl bg-slate-700/50 px-3 py-2 text-slate-300 transition-colors hover:bg-blue-600 sm:flex-none sm:rounded-lg"
          >
            <Edit3 className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(content)}
            className="flex items-center justify-center rounded-xl border border-red-400/40 bg-red-600/35 px-3 py-2 text-red-100 transition-colors hover:bg-red-600 sm:flex-none sm:rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </div>
  );

  const statsBar = (
    <div
      className={`grid grid-cols-4 gap-2 text-[11px] text-slate-300 sm:flex sm:flex-wrap sm:items-center ${viewMode === 'grid' ? 'sm:gap-6' : 'sm:gap-4'} sm:text-sm ${viewMode === 'grid' ? 'mb-4 sm:mb-5' : ''}`}
    >
      <button
        onClick={() => onToggleLike(content)}
        className={`flex min-w-0 items-center justify-center gap-1.5 rounded-xl bg-slate-800/40 px-2.5 py-2 transition-colors sm:justify-start sm:rounded-none sm:bg-transparent sm:px-0 sm:py-0 ${isLiked ? 'text-red-400' : 'hover:text-red-400'}`}
      >
        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
        {content.likes || 0}
      </button>
      {viewMode === 'grid' ? (
        <button
          onClick={() => onOpenComments(content)}
          className="flex min-w-0 items-center justify-center gap-1.5 rounded-xl bg-slate-800/40 px-2.5 py-2 transition-colors hover:text-cyan-300 sm:justify-start sm:rounded-none sm:bg-transparent sm:px-0 sm:py-0"
        >
          <MessageCircle className="w-5 h-5" />
          {content.comments_count || 0}
        </button>
      ) : (
        <div className="flex min-w-0 items-center justify-center gap-1.5 rounded-xl bg-slate-800/40 px-2.5 py-2 transition-colors hover:text-cyan-300 sm:justify-start sm:rounded-none sm:bg-transparent sm:px-0 sm:py-0">
          <MessageCircle className="w-5 h-5" />
          {content.comments_count || 0}
        </div>
      )}
      {content.file_url ? (
        <button
          onClick={() => onDownload(content)}
          className="flex min-w-0 items-center justify-center gap-1.5 rounded-xl bg-slate-800/40 px-2.5 py-2 transition-colors hover:text-cyan-300 sm:justify-start sm:rounded-none sm:bg-transparent sm:px-0 sm:py-0"
        >
          <Download className="w-5 h-5" />
          {content.downloads || 0}
        </button>
      ) : (
        <div className="flex min-w-0 items-center justify-center gap-1.5 rounded-xl bg-slate-800/40 px-2.5 py-2 sm:justify-start sm:rounded-none sm:bg-transparent sm:px-0 sm:py-0">
          <Download className="w-5 h-5" />
          {content.downloads || 0}
        </div>
      )}
      <button
        onClick={() => onToggleFavorite(content.id)}
        className={`flex min-w-0 items-center justify-center gap-1.5 rounded-xl bg-slate-800/40 px-2.5 py-2 transition-colors sm:justify-start sm:rounded-none sm:bg-transparent sm:px-0 sm:py-0 ${isFavorite ? 'text-amber-400' : 'hover:text-amber-400'}`}
      >
        <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        <span className="hidden sm:inline">
          {isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
        </span>
      </button>
    </div>
  );

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="glass rounded-3xl border border-white/10 p-4 sm:p-6 card-hover group"
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {showDriveThumbnail ? (
                <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 sm:h-14 sm:w-14">
                  <Image
                    src={driveThumbnailSrc || ''}
                    alt={content.title}
                    fill
                    sizes="(max-width: 640px) 44px, 56px"
                    className="object-cover"
                    onError={() => setThumbnailFailed(true)}
                    unoptimized
                  />
                </div>
              ) : null}
              <div
                className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${getContentTypeColor(content.type)} flex items-center justify-center flex-shrink-0 ${showDriveThumbnail ? 'hidden' : ''}`}
              >
                <ContentTypeIcon type={content.type} />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-2xl font-bold leading-tight text-white group-hover:text-cyan-300 transition-colors truncate">
                  {content.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-400">
                  {getContentTypeLabel(content.type)}
                </p>
              </div>
            </div>
            <div className="flex max-w-[48%] flex-wrap justify-end gap-1.5 sm:max-w-none sm:items-center sm:gap-2">
              <span
                className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${gradeBadgeClass}`}
              >
                {getContentPrimaryGradeLabel(content)}
              </span>
              {content.isNew && (
                <span className="px-2.5 sm:px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] sm:text-xs font-semibold border border-emerald-400/20">
                  Yeni
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-white/10" />

          {visibleDescription ? (
            <p className="text-slate-400 text-sm sm:text-base line-clamp-2">
              {visibleDescription}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] sm:text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{getContentAuthorLabel(content)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
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
      className="glass rounded-3xl overflow-hidden border border-white/10 card-hover group"
    >
      <div className={`h-2 bg-gradient-to-r ${getContentTypeColor(content.type)}`} />
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2 sm:gap-3 mb-4 sm:mb-5">
          {showDriveThumbnail ? (
            <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-white/10 sm:h-14 sm:w-14">
              <Image
                src={driveThumbnailSrc || ''}
                alt={content.title}
                fill
                sizes="(max-width: 640px) 44px, 56px"
                className="object-cover"
                onError={() => setThumbnailFailed(true)}
                unoptimized
              />
            </div>
          ) : null}
          <div
            className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${getContentTypeColor(content.type)} flex items-center justify-center ${showDriveThumbnail ? 'hidden' : ''}`}
          >
            <ContentTypeIcon type={content.type} />
          </div>
          <div className="flex max-w-[52%] flex-wrap justify-end gap-1.5 sm:max-w-none sm:items-center sm:gap-2">
            <span
              className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${gradeBadgeClass}`}
            >
              {getContentPrimaryGradeLabel(content)}
            </span>
            <span className="px-2.5 sm:px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-[10px] sm:text-xs font-semibold border border-amber-400/20">
              {getContentTypeLabel(content.type)}
            </span>
            {content.isNew && (
              <span className="px-2.5 sm:px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] sm:text-xs font-semibold border border-emerald-400/20">
                Yeni
              </span>
            )}
            {content.solution_url && (
              <span className="px-2.5 sm:px-3 py-1 rounded-full bg-green-500/15 text-green-300 text-[10px] sm:text-xs font-semibold border border-green-400/30">
                ÇÖZÜMLÜ
              </span>
            )}
          </div>
        </div>

        <h3 className="text-lg sm:text-2xl font-bold leading-tight text-white mb-2 line-clamp-2 group-hover:text-cyan-300 transition-colors">
          {content.title}
        </h3>
        <p className="text-slate-400 text-sm sm:text-base mb-4 line-clamp-2">
          {visibleDescription || getContentTypeLabel(content.type)}
        </p>

        <div className="border-t border-white/10 my-4" />

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-slate-400 text-[11px] sm:text-sm mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <Users className="w-4 h-4" />
            <span className="truncate">{getContentAuthorLabel(content)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatContentDate(content.created_at)}</span>
          </div>
        </div>

        {statsBar}
        {actionButtons}
      </div>
    </motion.div>
  );
}
