'use client';

import { ArrowLeft, ImagePlus, Loader2, Sparkles, X, Calculator } from 'lucide-react';
import Image from 'next/image';
import { useLayoutEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import type { ThreadMessage } from '@/features/messages/types';
import ImageViewerLightbox from '@/components/ImageViewerLightbox';
import MathText from '@/components/MathText';

const QUICK_FEEDBACK_TEMPLATES = [
  'Harika çözüm! 👏',
  'İşlem hatasına dikkat et ⚠️',
  'Ortak çarpan parantezine almayı dene 📐',
  'Soru kökündeki kısıtı tekrar oku 🔍',
  'Tebrikler, tam doğru! ⭐',
  'Yanlış defterindeki çözümlü videoyu izle 🎬',
  'Ödevini inceledim, eline sağlık! 📚',
];

export const MATH_QUICK_SYMBOLS = [
  { label: '√x', snippet: '$\\sqrt{x}$' },
  { label: 'x²', snippet: '$x^2$' },
  { label: 'a/b', snippet: '$\\frac{a}{b}$' },
  { label: 'π', snippet: '$\\pi$' },
  { label: '±', snippet: '$\\pm$' },
  { label: '≤', snippet: '$\\le$' },
  { label: '≥', snippet: '$\\ge$' },
  { label: '≠', snippet: '$\\neq$' },
  { label: '·', snippet: '$\\cdot$' },
  { label: '°', snippet: '$^\\circ$' },
  { label: 'Δ', snippet: '$\\Delta$' },
];

const formatTime = (value: string) =>
  new Date(value).toLocaleString('tr-TR', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  });

export type SupportChatPanelProps = {
  peerDisplayName: string;
  peerSubtitle?: string;
  peerAvatarSrc?: string;
  messages: ThreadMessage[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  sending: boolean;
  error: string | null;
  onClose?: () => void;
  onBack?: () => void;
  appearance: 'navbar' | 'admin';
  isLight?: boolean;
  placeholder?: string;
  inputDisabled?: boolean;
  attachmentPreview?: { name: string; url: string } | null;
  onAttachmentRemove?: () => void;
  onAttachmentSelect?: (files: FileList | null) => void;
};

export function SupportChatPanel({
  peerDisplayName,
  peerSubtitle,
  peerAvatarSrc,
  messages,
  draft,
  onDraftChange,
  onSubmit,
  sending,
  error,
  onClose,
  onBack,
  appearance,
  isLight = true,
  placeholder = "Mesaj yaz...",
  inputDisabled = false,
  attachmentPreview = null,
  onAttachmentRemove,
  onAttachmentSelect,
}: SupportChatPanelProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length]);

  const headerBorder =
    appearance === 'navbar'
      ? isLight
        ? 'border-slate-200'
        : 'border-slate-700'
      : 'border-[var(--border)]';

  const headerBg =
    appearance === 'navbar'
      ? isLight
        ? 'bg-white'
        : 'bg-slate-900'
      : 'bg-[var(--bg-elevated)]';

  const titleClass =
    appearance === 'navbar'
      ? isLight
        ? 'text-slate-900'
        : 'text-white'
      : 'text-[var(--text-strong)]';

  const subtitleClass =
    appearance === 'navbar'
      ? isLight
        ? 'text-slate-500'
        : 'text-slate-400'
      : 'text-[var(--text-muted)]';

  const listBg =
    appearance === 'navbar'
      ? isLight
        ? 'bg-slate-50/60'
        : 'bg-slate-950/30'
      : 'bg-[var(--bg-soft,#0f172a)]';

  const formBorder =
    appearance === 'navbar'
      ? isLight
        ? 'border-slate-200 bg-white'
        : 'border-slate-700 bg-slate-900'
      : 'border-[var(--border)] bg-[var(--bg-elevated)]';

  const textareaClass =
    appearance === 'navbar'
      ? isLight
        ? 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
        : 'border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500'
      : 'border-[var(--border)] bg-[var(--bg-soft)] text-[var(--text)] placeholder:text-[var(--text-muted)]';

  const ownBubble =
    appearance === 'navbar'
      ? 'rounded-br-sm bg-indigo-500 text-white'
      : 'rounded-br-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white';

  const peerBubble = (() => {
    if (appearance === 'navbar') {
      return isLight
        ? 'rounded-bl-sm bg-white text-slate-900 ring-1 ring-slate-200'
        : 'rounded-bl-sm bg-slate-800 text-slate-100 ring-1 ring-slate-700';
    }
    return 'rounded-bl-sm bg-[var(--bg-muted)] text-[var(--text)] ring-1 ring-[var(--border)]';
  })();
  const canSend =
    !sending &&
    !inputDisabled &&
    (draft.trim().length > 0 || Boolean(attachmentPreview));

  const handleAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    onAttachmentSelect?.(event.target.files);
    event.target.value = '';
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className={`flex shrink-0 items-center justify-between border-b px-4 py-3 ${headerBorder} ${headerBg}`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Geri"
              className={`shrink-0 rounded-lg p-1.5 transition-colors ${
                appearance === 'navbar'
                  ? isLight
                    ? 'text-slate-500 hover:bg-slate-100'
                    : 'text-slate-400 hover:bg-white/5'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-muted)]'
              }`}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
          {peerAvatarSrc ? (
            <Image
              src={peerAvatarSrc}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white ${
                appearance === 'admin' ? 'shadow-sm' : ''
              }`}
              aria-hidden
            >
              {(peerDisplayName.trim()[0] || '?').toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span className={`block truncate text-sm font-semibold ${titleClass}`}>
              {peerDisplayName}
            </span>
            {peerSubtitle ? (
              <span className={`block truncate text-[11px] ${subtitleClass}`}>
                {peerSubtitle}
              </span>
            ) : null}
          </div>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className={`shrink-0 rounded-lg p-1.5 transition-colors ${
              appearance === 'navbar'
                ? isLight
                  ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-muted)]'
            }`}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div
        ref={listRef}
        className={`flex-1 overflow-y-auto px-3 py-3 ${listBg}`}
        style={{ minHeight: 0 }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center my-auto">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
              <Calculator className="h-6 w-6" />
            </div>
            <p className={`text-sm font-semibold mb-1 ${titleClass}`}>
              Uğur Hoca ile Matematik Sohbeti
            </p>
            <p className={`text-xs max-w-xs ${subtitleClass}`}>
              Takıldığın bir soru, ödev veya çalışma programın hakkında Uğur Hoca'ya doğrudan yazabilirsin.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {messages.map((message) => {
              const isOwn = message.isOwn;
              return (
                <li
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                      isOwn ? ownBubble : peerBubble
                    }`}
                  >
                    {message.imageUrl ? (
                      <button
                        type="button"
                        onClick={() => setActiveLightboxImage(message.imageUrl || null)}
                        aria-label="Görseli tam ekran incele"
                        className="mb-1 block overflow-hidden rounded-lg cursor-zoom-in text-left transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                      >
                        <Image
                          src={message.imageUrl}
                          alt="Ek görsel"
                          width={240}
                          height={180}
                          className="h-auto w-full max-w-[240px] rounded-lg object-cover"
                          unoptimized
                        />
                      </button>
                    ) : null}
                    {message.text ? (
                      <div className="whitespace-pre-wrap break-words text-[13px] leading-relaxed">
                        <MathText>{message.text}</MathText>
                      </div>
                    ) : null}
                    <p
                      className={`mt-1 text-[10px] ${
                        isOwn
                          ? appearance === 'navbar'
                            ? 'text-indigo-100/80'
                            : 'text-white/80'
                          : appearance === 'navbar'
                            ? isLight
                              ? 'text-slate-400'
                              : 'text-slate-500'
                            : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className={`border-t px-3 py-2 ${formBorder}`}
      >
        {error ? (
          <p className="mb-1 text-[11px] text-red-500">{error}</p>
        ) : null}

        {/* Öğretmen / Admin Hızlı Geri Bildirim Şablonları */}
        {appearance === 'admin' && (
          <div className="mb-2 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-400" />
              Hızlı Not:
            </span>
            {QUICK_FEEDBACK_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl}
                type="button"
                onClick={() => onDraftChange(draft ? `${draft} ${tmpl}` : tmpl)}
                className="shrink-0 rounded-lg border border-[var(--border)] bg-[var(--bg-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-strong)] hover:bg-[var(--bg-muted)] hover:border-indigo-400/40 transition shadow-sm"
              >
                {tmpl}
              </button>
            ))}
          </div>
        )}

        {/* Hızlı Matematik Sembolleri Çubuğu */}
        <div className="mb-2 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-bold text-indigo-500 shrink-0 flex items-center gap-1 px-1">
            <Calculator className="h-3 w-3" />
            Sembol:
          </span>
          {MATH_QUICK_SYMBOLS.map((sym) => (
            <button
              key={sym.label}
              type="button"
              onClick={() => onDraftChange(draft ? `${draft} ${sym.snippet}` : sym.snippet)}
              title={`${sym.label} ekle`}
              className={`shrink-0 rounded-lg border px-2 py-0.5 text-xs font-medium transition shadow-xs ${
                appearance === 'navbar'
                  ? isLight
                    ? 'border-slate-200 bg-slate-100/80 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600'
                    : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:border-indigo-400 hover:text-indigo-300'
                  : 'border-[var(--border)] bg-[var(--bg-soft)] text-[var(--text)] hover:border-indigo-400 hover:bg-[var(--bg-muted)]'
              }`}
            >
              {sym.label}
            </button>
          ))}
        </div>

        {/* Canlı Matematik Önizleme */}
        {draft.includes('$') && (
          <div className="mb-2 rounded-xl border border-indigo-400/30 bg-indigo-500/10 p-2 text-xs">
            <span className="block text-[10px] font-bold text-indigo-500 mb-0.5">
              Canlı Formül Önizleme:
            </span>
            <div className="text-[13px] font-serif text-slate-800 dark:text-slate-100">
              <MathText>{draft}</MathText>
            </div>
          </div>
        )}

        {attachmentPreview ? (
          <div className="mb-2 flex items-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-500/10 p-2">
            <button
              type="button"
              onClick={() => setActiveLightboxImage(attachmentPreview.url)}
              className="cursor-zoom-in"
            >
              <Image
                src={attachmentPreview.url}
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 rounded-lg object-cover"
                unoptimized
              />
            </button>
            <span className="min-w-0 flex-1 truncate text-xs text-[var(--text-muted,#94a3b8)]">
              {attachmentPreview.name}
            </span>
            <button
              type="button"
              onClick={onAttachmentRemove}
              aria-label="Fotoğrafı kaldır"
              className="rounded-lg p-1.5 text-[var(--text-muted,#94a3b8)] transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}
        <div className="flex items-end gap-2">
          {onAttachmentSelect ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handleAttachmentChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending || inputDisabled}
                aria-label="Fotoğraf ekle"
                title="Fotoğraf ekle"
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
          <textarea
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
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
            className="inline-flex h-10 min-w-[5.25rem] flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-3 text-sm font-semibold text-white transition-all hover:from-indigo-600 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              'Gönder'
            )}
          </button>
        </div>
      </form>

      {/* Görsel Büyütme Lightbox */}
      <ImageViewerLightbox
        src={activeLightboxImage}
        alt="Fotoğraf Önizleme"
        onClose={() => setActiveLightboxImage(null)}
      />
    </div>
  );
}
