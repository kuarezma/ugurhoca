import type { ContentDocument } from '@/types';
import type { Dispatch, SetStateAction } from 'react';
import { AnimatePresence } from 'framer-motion';

import { useContentCompletion } from '@/features/content/hooks/useContentCompletion';

import { ContentPreviewModal } from './lazy';

type ContentPreviewProps = {
  previewDoc: ContentDocument | null;
  isCompleted: ReturnType<typeof useContentCompletion>['isCompleted'];
  handleClosePreview: () => void;
  handleDownloadDocument: (content: ContentDocument) => Promise<void>;
  setShowAnswerKey: Dispatch<SetStateAction<boolean>>;
  toggleCompleted: ReturnType<typeof useContentCompletion>['toggleCompleted'];
  showAnswerKey: boolean;
};

export function ContentPreview({
  previewDoc,
  isCompleted,
  handleClosePreview,
  handleDownloadDocument,
  setShowAnswerKey,
  toggleCompleted,
  showAnswerKey,
}: ContentPreviewProps) {
  return (
    <AnimatePresence>
      {previewDoc && (
        <ContentPreviewModal
          isCompleted={isCompleted(previewDoc.id)}
          onClose={handleClosePreview}
          onDownload={handleDownloadDocument}
          onToggleAnswerKey={() => setShowAnswerKey((current) => !current)}
          onToggleCompleted={toggleCompleted}
          previewDoc={previewDoc}
          showAnswerKey={showAnswerKey}
        />
      )}
    </AnimatePresence>
  );
}
