'use client';

import { FileText as FileDoc, Image as ImageIcon } from 'lucide-react';
import type { SupportAttachment } from '@/types';

type HomeSupportAttachmentListProps = {
  attachments: SupportAttachment[];
  onRemove: (index: number) => void;
};

export function HomeSupportAttachmentList({
  attachments,
  onRemove,
}: HomeSupportAttachmentListProps) {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {attachments.map((file, index) => (
        <div
          key={`${file.url}-${index}`}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-default bg-surface-2 text-sm text-primary"
        >
          {file.kind === 'image' ? (
            <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-300" />
          ) : (
            <FileDoc className="w-4 h-4 text-sky-600 dark:text-sky-300" />
          )}
          <span className="max-w-[180px] truncate">{file.name}</span>
          <button
            type="button"
            onClick={() => onRemove(index)}
            aria-label={`${file.name} dosyasını kaldır`}
            className="text-secondary hover:text-tone-danger-fg transition-colors px-1"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
