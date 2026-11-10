import type { AppUser, Comment, ContentDocument } from '@/types';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback } from 'react';

import { trackStudentActivityEvent } from '@/features/analytics/trackActivity';

import {
  createDocumentComment,
  loadDocumentComments,
  updateDocumentMetric,
} from '@/features/content/queries';

type UseContentInteractionsProps = {
  applyDocumentPatch: (
    documentId: string,
    patch: Partial<ContentDocument>,
  ) => void;
  setPreviewDoc: Dispatch<SetStateAction<ContentDocument | null>>;
  user: AppUser | null;
  likedDocs: Set<string>;
  setLikedDocs: Dispatch<SetStateAction<Set<string>>>;
  setShowComments: Dispatch<SetStateAction<string | null>>;
  setNewComment: Dispatch<SetStateAction<string>>;
  setComments: Dispatch<SetStateAction<Comment[]>>;
  newComment: string;
  showComments: string | null;
  documents: ContentDocument[];
  worksheetDocuments: ContentDocument[];
};

export function useContentInteractions({
  applyDocumentPatch,
  setPreviewDoc,
  user,
  likedDocs,
  setLikedDocs,
  setShowComments,
  setNewComment,
  setComments,
  newComment,
  showComments,
  documents,
  worksheetDocuments,
}: UseContentInteractionsProps) {
  const handleDownloadDocument = useCallback(
    async (content: ContentDocument) => {
      if (!content.file_url) return;

      window.open(content.file_url, '_blank');
      const nextDownloads = (content.downloads || 0) + 1;
      applyDocumentPatch(content.id, { downloads: nextDownloads });
      setPreviewDoc((current) =>
        current && current.id === content.id
          ? { ...current, downloads: nextDownloads }
          : current,
      );
      void updateDocumentMetric(content.id, { downloads: nextDownloads }).catch(
        () => undefined,
      );
      void trackStudentActivityEvent({
        entityId: content.id,
        entityType: 'document',
        eventType: 'content_downloaded',
        metadata: {
          grade: content.grade,
          title: content.title,
          type: content.type,
        },
        userId: user?.id,
      });
    },
    [applyDocumentPatch, setPreviewDoc, user?.id],
  );

  const handleToggleLike = useCallback(
    async (content: ContentDocument) => {
      const isLiked = likedDocs.has(content.id);
      const nextLikes = isLiked
        ? Math.max(0, (content.likes || 0) - 1)
        : (content.likes || 0) + 1;

      setLikedDocs((current) => {
        const next = new Set(current);
        if (isLiked) {
          next.delete(content.id);
        } else {
          next.add(content.id);
        }
        return next;
      });

      // Sayaç rotası yalnız +1 artırır; geri almayı sunucuya göndermek
      // sayacı düşürmek yerine artırırdı (azaltma bilinçli olarak yok).
      if (!isLiked) {
        await updateDocumentMetric(content.id, { likes: nextLikes });
      }
      applyDocumentPatch(content.id, { likes: nextLikes });
      void trackStudentActivityEvent({
        entityId: content.id,
        entityType: 'document',
        eventType: isLiked ? 'content_unliked' : 'content_liked',
        metadata: {
          title: content.title,
          type: content.type,
        },
        userId: user?.id,
      });
    },
    [applyDocumentPatch, likedDocs, setLikedDocs, user?.id],
  );

  const handleOpenComments = useCallback(
    async (content: ContentDocument) => {
      setShowComments(content.id);
      setNewComment('');
      const nextComments = await loadDocumentComments(content.id);
      setComments(nextComments);
    },
    [setComments, setNewComment, setShowComments],
  );

  const handleCloseComments = useCallback(() => {
    setShowComments(null);
    setComments([]);
    setNewComment('');
  }, [setComments, setNewComment, setShowComments]);

  const handleCommentSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!newComment.trim() || !showComments || !user) return;

      const createdComment = await createDocumentComment({
        content: newComment,
        document_id: showComments,
        user_id: user.id,
        user_name: user.name || 'Anonim',
      });

      if (!createdComment) return;

      setComments((current) => [createdComment, ...current]);
      setNewComment('');

      const targetDocument =
        documents.find((document) => document.id === showComments) ||
        worksheetDocuments.find((document) => document.id === showComments);

      if (!targetDocument) return;

      const nextCount = (targetDocument.comments_count || 0) + 1;
      await updateDocumentMetric(showComments, { comments_count: nextCount });
      applyDocumentPatch(showComments, { comments_count: nextCount });
      void trackStudentActivityEvent({
        entityId: showComments,
        entityType: 'document',
        eventType: 'content_comment_added',
        metadata: {
          title: targetDocument.title,
          type: targetDocument.type,
        },
        userId: user.id,
      });
    },
    [
      applyDocumentPatch,
      documents,
      newComment,
      setComments,
      setNewComment,
      showComments,
      user,
      worksheetDocuments,
    ],
  );
  return {
    handleDownloadDocument,
    handleToggleLike,
    handleOpenComments,
    handleCloseComments,
    handleCommentSubmit,
  };
}
