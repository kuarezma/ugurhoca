'use client';

import { useId } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import type { ContentDocument } from '@/types';

type ContentDeleteConfirmModalProps = {
  deleting: boolean;
  deleteCandidate: ContentDocument;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

export default function ContentDeleteConfirmModal({
  deleting,
  deleteCandidate,
  onCancel,
  onConfirm,
}: ContentDeleteConfirmModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const handleClose = () => {
    if (!deleting) {
      onCancel();
    }
  };
  const containerRef = useAccessibleModal<HTMLDivElement>(true, handleClose);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
      <div
        onClick={deleting ? undefined : handleClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="relative flex w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl outline-none dark:border-white/10 dark:bg-slate-900 dark:text-white"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200/70 p-5 sm:p-6 dark:border-white/10">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="font-display text-xl font-bold leading-tight sm:text-2xl"
            >
              İçeriği silmek istediğine emin misin?
            </h2>
            <p
              id={descriptionId}
              className="mt-1 text-sm text-slate-600 dark:text-slate-400"
            >
              {deleteCandidate.title}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Kapat"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Bu işlem geri alınamaz. İçerik kalıcı olarak kaldırılacak.
          </p>
        </div>
        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200/70 bg-slate-50/60 p-4 sm:flex-row sm:justify-end sm:p-5 dark:border-white/10 dark:bg-slate-950/40">
          <Button variant="ghost" onClick={onCancel} disabled={deleting}>
            Vazgeç
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            loading={deleting}
          >
            Sil
          </Button>
        </div>
      </div>
    </div>
  );
}

