'use client';

import { type FormEvent } from 'react';
import { Send, Upload } from 'lucide-react';
import { useToast } from '@/components/Toast';
import type { SupportAttachment } from '@/types';
import { HomeSupportAttachmentList } from '@/features/home/components/support/HomeSupportAttachmentList';

type HomeSupportFormProps = {
  isLight: boolean;
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
  isLight,
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

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label
          className={`block mb-2 text-sm ${
            isLight ? 'text-slate-700' : 'text-slate-300'
          }`}
        >
          Mesajın
        </label>
        <textarea
          rows={5}
          value={supportMessage}
          onChange={(event) => onSupportMessageChange(event.target.value)}
          placeholder="Uğur Hoca, ..."
          className={`w-full rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors resize-none ${
            isLight
              ? 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400'
              : 'bg-slate-800/60 border border-slate-700 text-white placeholder:text-slate-500'
          }`}
        />
      </div>

      <div>
        <label
          className={`block mb-2 text-sm ${
            isLight ? 'text-slate-700' : 'text-slate-300'
          }`}
        >
          Belge / Resim Ekle
        </label>
        <input
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          className="hidden"
          id="support-upload"
          onChange={async (event) => {
            if (event.target.files?.length) {
              try {
                await onUploadSupportAttachments(event.target.files);
                event.target.value = '';
              } catch {
                showToast('error', 'Dosya yüklenemedi.');
              }
            }
          }}
        />
        <label
          htmlFor="support-upload"
          className={`flex items-center justify-center gap-2 w-full rounded-2xl border border-dashed px-4 py-5 transition-colors cursor-pointer ${
            isLight
              ? 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-indigo-500'
              : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:border-indigo-500'
          }`}
        >
          <Upload className="w-5 h-5" />
          Resim veya belge seç
        </label>
      </div>

      <HomeSupportAttachmentList
        attachments={supportAttachments}
        isLight={isLight}
        onRemove={onRemoveSupportAttachment}
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <p
          className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-500'}`}
        >
          Gönderdiğin mesaj anında bildirim olarak iletilir.
        </p>
        <button
          type="submit"
          disabled={supportSending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-3 text-white font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-60"
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
