'use client';

import { useId, type FormEvent } from 'react';
import { Send, Upload } from 'lucide-react';
import { useToast } from '@/components/Toast';
import type { SupportAttachment } from '@/types';
import { HomeSupportAttachmentList } from '@/features/home/components/support/HomeSupportAttachmentList';

type HomeSupportFormProps = {
  onRemoveSupportAttachment: (index: number) => void;
  onSubmit: (event: FormEvent) => void;
  onSupportMessageChange: (message: string) => void;
  onUploadSupportAttachments: (files: FileList | null) => Promise<void>;
  supportAttachments: SupportAttachment[];
  supportMessage: string;
  supportSending: boolean;
  supportSent: boolean;
};

export function HomeSupportForm({
  onRemoveSupportAttachment,
  onSubmit,
  onSupportMessageChange,
  onUploadSupportAttachments,
  supportAttachments,
  supportMessage,
  supportSending,
  supportSent,
}: HomeSupportFormProps) {
  const { showToast } = useToast();
  const baseId = useId();
  const messageId = `${baseId}-message`;
  const uploadId = `${baseId}-upload`;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label
          htmlFor={messageId}
          className="block mb-2 text-sm font-medium text-secondary"
        >
          Mesajın
        </label>
        <textarea
          id={messageId}
          rows={5}
          value={supportMessage}
          onChange={(event) => onSupportMessageChange(event.target.value)}
          placeholder="Uğur Hoca, ..."
          className="w-full rounded-2xl border border-default bg-surface-1 px-4 py-3 text-primary placeholder:text-tertiary focus:outline-none focus:border-indigo-500 transition-colors resize-none"
        />
      </div>

      <div>
        <label
          htmlFor={uploadId}
          className="block mb-2 text-sm font-medium text-secondary"
        >
          Fotoğraf Ekle
        </label>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          id={uploadId}
          onChange={async (event) => {
            if (event.target.files?.length) {
              try {
                await onUploadSupportAttachments(event.target.files);
                event.target.value = '';
              } catch {
                showToast('error', 'Fotoğraf yüklenemedi.');
              }
            }
          }}
        />
        <label
          htmlFor={uploadId}
          className="flex items-center justify-center gap-2 w-full rounded-2xl border border-dashed border-default bg-surface-2/70 text-secondary hover:bg-surface-3 hover:text-primary hover:border-indigo-500 px-4 py-5 transition-colors cursor-pointer"
        >
          <Upload className="w-5 h-5" />
          Fotoğraf seç
        </label>
      </div>

      <HomeSupportAttachmentList
        attachments={supportAttachments}
        onRemove={onRemoveSupportAttachment}
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <p
          className="text-xs text-secondary"
        >
          Gönderdiğin mesaj anında bildirim olarak iletilir.
        </p>
        <button
          type="submit"
          disabled={supportSending}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition-all disabled:opacity-60 bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
        >
          <Send className="w-4 h-4" />
          {supportSending ? 'Gönderiliyor...' : 'Gönder'}
        </button>
      </div>

      {supportSent && (
        <div className="rounded-2xl border border-tone-success-border bg-tone-success-bg px-4 py-3 text-tone-success-fg text-sm font-semibold">
          Mesajın gönderildi.
        </div>
      )}
    </form>
  );
}
