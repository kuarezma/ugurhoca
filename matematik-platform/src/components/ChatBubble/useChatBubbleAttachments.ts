'use client';

import { useCallback, useEffect, useState } from 'react';
import { validateSupportImageFile } from '@/features/home/queries';

export type UseChatBubbleAttachmentsOptions = {
  open: boolean;
  setSendError: (error: string | null) => void;
};

export function useChatBubbleAttachments({
  open,
  setSendError,
}: UseChatBubbleAttachmentsOptions) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<
    Array<{ name: string; url: string; kind: 'image'; size?: number }>
  >([]);

  // Ek dosya bellek temizliği
  useEffect(() => {
    return () => {
      attachmentPreviews.forEach((item) => {
        URL.revokeObjectURL(item.url);
      });
    };
  }, [attachmentPreviews]);

  const clearAttachments = useCallback(() => {
    attachmentPreviews.forEach((item) => {
      URL.revokeObjectURL(item.url);
    });
    setSelectedFiles([]);
    setAttachmentPreviews([]);
  }, [attachmentPreviews]);

  const handleAttachmentRemove = useCallback(
    (index?: number) => {
      if (typeof index !== 'number') {
        clearAttachments();
        return;
      }
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
      setAttachmentPreviews((prev) => {
        const item = prev[index];
        if (item) URL.revokeObjectURL(item.url);
        return prev.filter((_, i) => i !== index);
      });
    },
    [clearAttachments],
  );

  const handleAttachmentSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const addedFiles: File[] = [];
      const addedPreviews: Array<{
        name: string;
        url: string;
        kind: 'image';
        size?: number;
      }> = [];

      for (const file of Array.from(files)) {
        if (file.type.startsWith('image/')) {
          try {
            validateSupportImageFile(file);
            addedFiles.push(file);
            addedPreviews.push({
              kind: 'image',
              name: file.name,
              size: file.size,
              url: URL.createObjectURL(file),
            });
          } catch (err) {
            setSendError(
              err instanceof Error ? err.message : 'Fotoğraf geçersiz.',
            );
            return;
          }
        } else {
          setSendError('Sadece JPG, PNG veya WebP görsel eklenebilir.');
          return;
        }
      }

      setSelectedFiles((prev) => [...prev, ...addedFiles]);
      setAttachmentPreviews((prev) => [...prev, ...addedPreviews]);
      setSendError(null);
    },
    [setSendError],
  );

  // Panodan görsel yapıştırma (Ctrl+V / Cmd+V)
  useEffect(() => {
    if (!open) return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            try {
              validateSupportImageFile(file);
              setSelectedFiles((prev) => [...prev, file]);
              setAttachmentPreviews((prev) => [
                ...prev,
                {
                  kind: 'image',
                  name: file.name,
                  size: file.size,
                  url: URL.createObjectURL(file),
                },
              ]);
              setSendError(null);
            } catch (err) {
              setSendError(
                err instanceof Error ? err.message : 'Fotoğraf eklenemedi.',
              );
            }
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [open, setSendError]);

  return {
    selectedFiles,
    attachmentPreviews,
    clearAttachments,
    handleAttachmentRemove,
    handleAttachmentSelect,
  };
}
