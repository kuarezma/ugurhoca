/* eslint-disable @next/next/no-img-element -- content cards render external document preview URLs */

import { createElement } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
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
  getContentKindLabel,
  getContentTypeColor,
  getContentTypeIcon,
  getContentTypeLabel,
} from '@/features/content/constants';
import {
  formatContentDate,
  getContentAuthorLabel,
  getContentPrimaryGradeLabel,
} from '@/features/content/utils';
import { getGoogleDriveThumbnailUrl } from '@/lib/image-url';
import type { ContentPageUser } from '@/features/content/types';
import type { ContentDocument } from '@/types';

type ContentCardProps = {
  content: ContentDocument;
  index: number;
  isFavorite: boolean;
  isLiked: boolean;
  onCopyLink: (content: ContentDocument) => void;
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
  onCopyLink,
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
  const isDriveImage =
    typeof content.file_url === 'string' &&
    /drive\.google\.com/i.test(content.file_url);
  const driveThumbnailSrc =
    isDriveImage && content.file_url
      ? getGoogleDriveThumbnailUrl(content.file_url, 'w400')
      : null;

  const actionButtons = (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onPreview(content)}
        className={`flex-1 py-2.5 sm:py-3 bg-slate-800/70 border border-white/10 text-sm sm:text-base text-slate-100 font-semibold rounded-2xl hover:bg-slate-700/70 transition-all flex items-center justify-center gap-2 ${viewMode === 'grid' ? 'min-w-[130px] sm:min-w-[150px]' : 'min-w-[120px] sm:min-w-[180px]'}`}
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
          className="basis-full sm:basis-auto px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-sm sm:text-base text-white font-semibold rounded-2xl hover:from-indigo-600 hover:to-cyan-600 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" /> İndir
        </motion.button>
      )}
      {user?.isAdmin && (
        <>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(content)}
            className="px-3 py-2 bg-slate-700/50 hover:bg-blue-600 text-slate-300 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(content)}
            className="px-3 py-2 bg-red-600/35 hover:bg-red-600 text-red-100 rounded-lg transition-colors border border-red-400/40"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </>
      )}
    </div>
  );

  const statsBar = (
    <div
      className={`flex flex-wrap items-center gap-3 ${viewMode === 'grid' ? 'sm:gap-6' : 'sm:gap-4'} text-xs sm:text-sm text-slate-300 ${viewMode === 'grid' ? 'mb-4 sm:mb-5' : ''}`}
    >
      <button
        onClick={() => onToggleLike(content)}
        className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-red-400' : 'hover:text-red-400'}`}
      >
        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
        {content.likes || 0}
      </button>
      {viewMode === 'grid' ? (
        <button
          onClick={() => onOpenComments(content)}
          className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          {content.comments_count || 0}
        </button>
      ) : (
        <div className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors">
          <MessageCircle className="w-5 h-5" />
          {content.comments_count || 0}
        </div>
      )}
      {viewMode === 'grid' && (
        <button
          onClick={() => onDownload(content)}
          className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
        >
          <Download className="w-5 h-5" />
          {content.downloads || 0}
        </button>
      )}
      <button
        onClick={() => onToggleFavorite(content.id)}
        className={`flex items-center gap-1.5 transition-colors ${isFavorite ? 'text-amber-400' : 'hover:text-amber-400'}`}
      >
        <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        <span className="sm:hidden">{isFavorite ? 'Çıkar' : 'Favori'}</span>
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
              {isDriveImage ? (
                <img
                  src={driveThumbnailSrc || ''}
                  alt={content.title}
                  className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl object-cover border border-white/10 flex-shrink-0"
                  onError={(event) => {
                    const target = event.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div
                className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${getContentTypeColor(content.type)} flex items-center justify-center flex-shrink-0 ${isDriveImage ? 'hidden' : ''}`}
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
            <div className="flex flex-wrap justify-end items-center gap-1.5 sm:gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onCopyLink(content)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800/70 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </motion.button>
              <span className="px-2.5 sm:px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 text-[10px] sm:text-xs font-semibold border border-rose-400/20">
                {getContentKindLabel(content)}
              </span>
              <span className="px-2.5 sm:px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-[10px] sm:text-xs font-semibold border border-indigo-400/20">
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
          {isDriveImage ? (
            <img
              src={driveThumbnailSrc || ''}
              alt={content.title}
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl object-cover border border-white/10"
              onError={(event) => {
                const target = event.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div
            className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${getContentTypeColor(content.type)} flex items-center justify-center ${isDriveImage ? 'hidden' : ''}`}
          >
            <ContentTypeIcon type={content.type} />
          </div>
          <div className="flex flex-wrap justify-end items-center gap-1.5 sm:gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCopyLink(content)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800/70 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
            <span className="px-2.5 sm:px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 text-[10px] sm:text-xs font-semibold border border-rose-400/20">
              {getContentKindLabel(content)}
            </span>
            <span className="px-2.5 sm:px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-[10px] sm:text-xs font-semibold border border-indigo-400/20">
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
        <p className="text-slate-400 text-sm sm:text-base mb-4 line-clamp-1">
          {getContentTypeLabel(content.type)}
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
