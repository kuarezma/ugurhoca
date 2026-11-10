'use client';

import { type ChangeEvent, type FormEvent, type RefObject } from 'react';
import Image from 'next/image';
import {
  FileText,
  ImagePlus,
  Loader2,
  Mic,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import type { ThreadMessage } from '@/features/messages/types';
import { formatAudioDuration } from './constants';
import { SupportChatQuickBars } from './SupportChatQuickBars';
import type { ChatAttachmentPreview } from './types';

export type SupportChatInputBarProps = {
  appearance: 'navbar' | 'admin';
  isLight?: boolean;
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  sending: boolean;
  inputDisabled?: boolean;
  placeholder?: string;
  error: string | null;
  recordingError: string | null;
  replyingTo: ThreadMessage | null;
  onCancelReply: () => void;
  peerDisplayName: string;
  allAttachments: ChatAttachmentPreview[];
  onAttachmentRemove?: (index?: number) => void;
  onAttachmentSelect?: (files: FileList | null) => void;
  onVoiceRecordComplete?: (audioFile: File) => void;
  isRecording: boolean;
  recordingSeconds: number;
  onCancelRecording: () => void;
  onStopRecordingAndSend: () => void;
  onStartRecording: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onTyping?: () => void;
  onOpenLightbox: (imageUrl: string) => void;
};

export function SupportChatInputBar({
  appearance,
  isLight = true,
  draft,
  onDraftChange,
  onSubmit,
  sending,
  inputDisabled = false,
  placeholder = 'Mesaj yaz...',
  error,
  recordingError,
  replyingTo,
  onCancelReply,
  peerDisplayName,
  allAttachments,
  onAttachmentRemove,
  onAttachmentSelect,
  onVoiceRecordComplete,
  isRecording,
  recordingSeconds,
  onCancelRecording,
  onStopRecordingAndSend,
  onStartRecording,
  fileInputRef,
  onTyping,
  onOpenLightbox,
}: SupportChatInputBarProps) {
  const formBorder =
    appearance === 'navbar'
      ? isLight
        ? 'border-slate-200 bg-white'
        : 'border-slate-800 bg-slate-900'
      : 'border-[var(--border)] bg-[var(--bg-elevated)]';

  const textareaClass =
    appearance === 'navbar'
      ? isLight
        ? 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
        : 'border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500'
      : 'border-[var(--border)] bg-[var(--bg-soft)] text-[var(--text)] placeholder:text-[var(--text-muted)]';

  const canSend =
    !sending &&
    !inputDisabled &&
    (draft.trim().length > 0 || allAttachments.length > 0);

  const handleAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    onAttachmentSelect?.(event.target.files);
    event.target.value = '';
  };

  return (
    <form
      onSubmit={onSubmit}
      className={`shrink-0 border-t px-3 py-2.5 transition-colors ${formBorder}`}
    >
      {error || recordingError ? (
        <p role="alert" className="mb-1.5 text-[11px] font-medium text-red-500">
          {error || recordingError}
        </p>
      ) : null}

      <SupportChatQuickBars
        appearance={appearance}
        isLight={isLight}
        draft={draft}
        onDraftChange={onDraftChange}
      />

      {/* Yanıtlanan Mesaj Banner'ı */}
      {replyingTo && (
        <div className="mb-2 flex items-center justify-between gap-2 rounded-xl border-l-4 border-indigo-500 bg-indigo-500/10 p-2 text-xs">
          <div className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold text-indigo-500">
              {replyingTo.isOwn
                ? 'Kendi Mesajını Yanıtlıyorsun'
                : `${peerDisplayName}'ı Yanıtlıyorsun`}
            </span>
            <p className="line-clamp-1 italic text-slate-600 dark:text-slate-300">
              {replyingTo.text || 'Ek dosya / Fotoğraf'}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            aria-label="Yanıtı kaldır"
            className="rounded-lg p-1 text-slate-400 hover:bg-black/10 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Ekler Önizleme Çubuğu */}
      {allAttachments.length > 0 ? (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {allAttachments.map((att, idx) => (
            <div
              key={`${att.name}-${idx}`}
              className="flex items-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-500/10 p-1.5 text-xs shadow-2xs"
            >
              {att.kind !== 'file' ? (
                <button
                  type="button"
                  onClick={() => onOpenLightbox(att.url)}
                  className="cursor-zoom-in"
                >
                  <Image
                    src={att.url}
                    alt={att.name ? `${att.name} önizlemesi` : 'Ek önizlemesi'}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-lg object-cover"
                    unoptimized
                  />
                </button>
              ) : (
                <FileText className="h-5 w-5 shrink-0 text-indigo-500" />
              )}
              <span className="max-w-[120px] truncate text-[11px] font-medium text-slate-700 dark:text-slate-200">
                {att.name}
              </span>
              <button
                type="button"
                onClick={() => onAttachmentRemove?.(idx)}
                aria-label="Eki kaldır"
                className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-black/10 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {/* Canlı Ses Kaydı Durumu */}
      {isRecording ? (
        <div className="flex h-11 items-center justify-between rounded-xl bg-red-500/10 border border-red-500/30 px-3">
          <div className="flex items-center gap-2 text-red-500">
            <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono text-xs font-bold">
              {formatAudioDuration(recordingSeconds)} / 1:00
            </span>
            <span className="text-[11px] font-medium ml-1">
              Ses kaydediliyor...
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onCancelRecording}
              aria-label="Kaydı iptal et"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/20 hover:text-red-500 transition"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onStopRecordingAndSend}
              aria-label="Kaydı tamamla ve gönder"
              className="rounded-lg bg-red-500 p-1.5 text-white dark:text-white hover:bg-red-600 transition"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
            </button>
          </div>
        </div>
      ) : (
        /* Normal Mesaj Giriş Satırı */
        <div className="flex items-end gap-2">
          {onAttachmentSelect ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                onChange={handleAttachmentChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending || inputDisabled}
                aria-label="Görsel ekle (JPG, PNG, WebP)"
                title="Görsel ekle (JPG, PNG, WebP)"
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  appearance === 'navbar'
                    ? isLight
                      ? 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                      : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    : 'border-[var(--border)] bg-[var(--bg-soft)] text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-strong)]'
                }`}
              >
                <ImagePlus className="h-5 w-5" aria-hidden="true" />
              </button>
            </>
          ) : null}

          {/* Ses Kaydı Başlatma Butonu */}
          {onVoiceRecordComplete ? (
            <button
              type="button"
              onClick={onStartRecording}
              disabled={sending || inputDisabled}
              aria-label="Sesli mesaj kaydet"
              title="Sesli mesaj kaydet"
              className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                appearance === 'navbar'
                  ? isLight
                    ? 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-indigo-600'
                    : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-indigo-300'
                  : 'border-[var(--border)] bg-[var(--bg-soft)] text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-strong)]'
              }`}
            >
              <Mic className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : null}

          <textarea
            value={draft}
            onChange={(event) => {
              onDraftChange(event.target.value);
              onTyping?.();
            }}
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();
                (
                  event.currentTarget.form as HTMLFormElement | null
                )?.requestSubmit();
              }
            }}
            placeholder={placeholder}
            rows={1}
            autoComplete="off"
            autoCorrect="on"
            enterKeyHint="send"
            disabled={sending || inputDisabled}
            className={`max-h-32 min-h-[2.5rem] flex-1 resize-none appearance-none rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${textareaClass}`}
          />
          <button
            type="submit"
            disabled={!canSend}
            aria-busy={sending}
            aria-label={sending ? 'Gönderiliyor' : 'Gönder'}
            className="inline-flex h-10 min-w-[5.25rem] flex-shrink-0 items-center justify-center rounded-xl px-3 text-sm font-semibold transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              'Gönder'
            )}
          </button>
        </div>
      )}
    </form>
  );
}
