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
          className="block mb-2 text-sm light:text-slate-700 dark:text-slate-300"
        >
          Mesajın
        </label>
        <textarea
          id={messageId}
          rows={5}
          value={supportMessage}
          onChange={(event) => onSupportMessageChange(event.target.value)}
          placeholder="Uğur Hoca, ..."
          className="w-full rounded-2xl px-4 py-3 focus:outline-none light:focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors resize-none light:bg-white border light:border-slate-300 light:text-slate-900 placeholder:text-slate-400 dark:bg-slate-800/60 dark:border-slate-700 dark:text-white"
        />
      </div>

      <div>
        <label
          htmlFor={uploadId}
          className="block mb-2 text-sm light:text-slate-700 dark:text-slate-300"
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
          className="flex items-center justify-center gap-2 w-full rounded-2xl border border-dashed px-4 py-5 transition-colors cursor-pointer light:border-slate-300 light:bg-slate-50 light:text-slate-700 light:hover:bg-slate-100 light:hover:border-indigo-500 dark:hover:border-indigo-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800"
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
          className="text-xs light:text-slate-600 dark:text-slate-400"
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
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-emerald-300 text-sm">
          Mesajın gönderildi.
        </div>
      )}
    </form>
  );
}
