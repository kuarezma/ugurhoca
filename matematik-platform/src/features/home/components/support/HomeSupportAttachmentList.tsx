'use client';

import { FileText as FileDoc, Image as ImageIcon } from 'lucide-react';
import type { SupportAttachment } from '@/types';

type HomeSupportAttachmentListProps = {
  attachments: SupportAttachment[];
  isLight: boolean;
  onRemove: (index: number) => void;
};

export function HomeSupportAttachmentList({
  attachments,
  isLight,
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
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-700'
              : 'bg-white/5 border-white/10 text-slate-200'
          }`}
        >
          {file.kind === 'image' ? (
            <ImageIcon className="w-4 h-4 text-pink-300" />
          ) : (
            <FileDoc className="w-4 h-4 text-sky-300" />
          )}
          <span className="max-w-[180px] truncate">{file.name}</span>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-slate-400 hover:text-white"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
