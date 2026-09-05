'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  FolderTree,
  Video,
} from 'lucide-react';
import ContentCard from '@/features/content/components/ContentCard';
import { getWorksheetTitleTopic } from '@/features/content/worksheet';
import { getWorksheetOutcomeLabel } from '@/features/content/worksheet-display';
import type { ContentPageUser } from '@/features/content/types';
import type { ContentDocument } from '@/types';

type ContentTopicPacksProps = {
  documents: ContentDocument[];
  isCompleted: (docId: string) => boolean;
  isFavorite: (docId: string) => boolean;
  isLiked: (docId: string) => boolean;
  onDelete: (content: ContentDocument) => void | Promise<void>;
  onDownload: (content: ContentDocument) => void | Promise<void>;
  onEdit: (content: ContentDocument) => void;
  onOpenComments: (content: ContentDocument) => void | Promise<void>;
  onPreview: (content: ContentDocument) => void;
  onToggleCompleted: (content: ContentDocument) => void | Promise<void>;
  onToggleFavorite: (docId: string) => void;
  onToggleLike: (content: ContentDocument) => void | Promise<void>;
  user: ContentPageUser | null;
};

type TopicGroup = {
  completedCount: number;
  documents: ContentDocument[];
  testsCount: number;
  topicName: string;
  videosCount: number;
  worksheetsCount: number;
};

export default function ContentTopicPacks({
  documents,
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
}: ContentTopicPacksProps) {
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  // Group documents by topic
  const topicGroups = useMemo<TopicGroup[]>(() => {
    const map = new Map<string, ContentDocument[]>();

    for (const doc of documents) {
      const outcome = getWorksheetOutcomeLabel(doc);
      const topic =
        getWorksheetTitleTopic({ outcome, subject: doc.description }) ||
        doc.learning_outcome ||
        outcome ||
        'Genel Matematik';

      const existing = map.get(topic) || [];
      existing.push(doc);
      map.set(topic, existing);
    }

    return Array.from(map.entries()).map(([topicName, docs]) => {
      const worksheetsCount = docs.filter(
        (d) => d.type === 'yaprak-test' || d.type === 'ders-notlari',
      ).length;
      const videosCount = docs.filter(
        (d) => d.type === 'ders-videolari' || Boolean(d.video_url),
      ).length;
      const testsCount = docs.filter((d) =>
        ['deneme-sinav', 'deneme', 'sinav', 'test'].includes(d.type),
      ).length;
      const completedCount = docs.filter((d) => isCompleted(d.id)).length;

      return {
        completedCount,
        documents: docs,
        testsCount,
        topicName,
        videosCount,
        worksheetsCount,
      };
    });
  }, [documents, isCompleted]);

  const toggleExpand = (topicName: string) => {
    setExpandedTopics((current) => {
      const next = new Set(current);
      if (next.has(topicName)) {
        next.delete(topicName);
      } else {
        next.add(topicName);
      }
      return next;
    });
  };

  if (topicGroups.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center backdrop-blur-md">
        <FolderTree className="mx-auto h-12 w-12 text-slate-500 mb-3" />
        <p className="text-slate-300 font-semibold">Bu filtrelere uygun konu paketi bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {topicGroups.map((group, groupIdx) => {
        const isExpanded = expandedTopics.has(group.topicName) || groupIdx === 0;
        const totalDocs = group.documents.length;
        const progressPercent = totalDocs > 0 ? Math.round((group.completedCount / totalDocs) * 100) : 0;

        return (
          <div
            key={group.topicName}
            className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl backdrop-blur-xl transition-all"
          >
            {/* Header / Click to expand */}
            <button
              type="button"
              onClick={() => toggleExpand(group.topicName)}
              className="flex w-full flex-col gap-4 p-5 text-left transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20">
                  <FolderTree className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-purple-300">
                      {group.topicName}
                    </h3>
                    <span className="rounded-full border border-purple-400/30 bg-purple-500/15 px-2.5 py-0.5 text-xs font-semibold text-purple-200">
                      {totalDocs} Doküman
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    {group.worksheetsCount > 0 && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5 text-cyan-400" />
                        {group.worksheetsCount} Test / Not
                      </span>
                    )}
                    {group.videosCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Video className="h-3.5 w-3.5 text-red-400" />
                        {group.videosCount} Video
                      </span>
                    )}
                    {group.testsCount > 0 && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                        {group.testsCount} Deneme
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress & Toggle */}
              <div className="flex items-center justify-between sm:justify-end gap-5">
                <div className="min-w-[140px] text-right">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {group.completedCount} / {totalDocs}
                    </span>
                    <span>%{progressPercent}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-800/80 p-2 text-slate-300 transition-transform">
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </div>
            </button>

            {/* Pack contents accordion */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="border-t border-white/10 bg-slate-950/30 p-4 sm:p-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.documents.map((doc, idx) => (
                      <ContentCard
                        key={doc.id}
                        content={doc}
                        index={idx}
                        isFavorite={isFavorite(doc.id)}
                        isLiked={isLiked(doc.id)}
                        isCompleted={isCompleted(doc.id)}
                        onToggleCompleted={onToggleCompleted}
                        onDelete={onDelete}
                        onDownload={onDownload}
                        onEdit={onEdit}
                        onOpenComments={onOpenComments}
                        onPreview={onPreview}
                        onToggleFavorite={onToggleFavorite}
                        onToggleLike={onToggleLike}
                        user={user}
                        viewMode="grid"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
