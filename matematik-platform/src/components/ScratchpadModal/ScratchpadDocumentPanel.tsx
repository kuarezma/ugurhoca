'use client';

import { useState } from 'react';
import type { ScratchpadDocumentContext } from './types';

type ScratchpadDocumentPanelProps = {
  documentContext: ScratchpadDocumentContext;
  expanded: boolean;
  onToggleExpanded: () => void;
};

const buttonClass =
  'rounded-lg border border-border-default bg-surface-2 px-3 py-2 text-xs font-semibold text-primary hover:bg-surface-3';

export function ScratchpadDocumentPanel({
  documentContext,
  expanded,
  onToggleExpanded,
}: ScratchpadDocumentPanelProps) {
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const { title, fileUrl, driveId, answerKeyText } = documentContext;
  // Yalnız web adreslerini göm; javascript:, data: vb. şemaları kabul etme.
  let safeFileUrl: string | null = null;
  try {
    const isLocalPath = fileUrl?.startsWith('/') && !fileUrl.startsWith('//');
    const url = new URL(
      fileUrl || '',
      isLocalPath ? 'https://local.invalid' : undefined,
    );
    if (url.protocol === 'https:' || url.protocol === 'http:') {
      safeFileUrl = isLocalPath
        ? url.pathname + url.search + url.hash
        : url.href;
    }
  } catch {}
  const drivePreview =
    driveId && /^[\w-]+$/.test(driveId)
      ? `https://drive.google.com/file/d/${driveId}/preview`
      : null;
  const isPdf =
    safeFileUrl && /\.pdf(?:[?#]|$)|application\/pdf/i.test(safeFileUrl);
  const previewUrl = drivePreview || (isPdf ? safeFileUrl : null);

  return (
    <section
      aria-label="Doküman"
      className="flex h-full min-h-0 flex-col bg-surface-1 text-primary"
    >
      <div className="shrink-0 border-b border-border-default p-3">
        <h2 className="mb-2 truncate text-sm font-bold" title={title}>
          {title}
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onToggleExpanded}
            aria-pressed={expanded}
            className={`${buttonClass} hidden md:block`}
          >
            {expanded ? 'Dokümanı daralt' : 'Dokümanı genişlet'}
          </button>
          {answerKeyText && (
            <button
              type="button"
              onClick={() => setShowAnswerKey((value) => !value)}
              aria-expanded={showAnswerKey}
              aria-controls="scratchpad-answer-key"
              className={buttonClass}
            >
              {showAnswerKey
                ? 'Cevap anahtarını gizle'
                : 'Cevap anahtarını göster'}
            </button>
          )}
          {(drivePreview || safeFileUrl) && (
            <a
              href={drivePreview || safeFileUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass}
            >
              Ayrı sekmede aç
            </a>
          )}
        </div>
      </div>
      {showAnswerKey && answerKeyText && (
        <div
          id="scratchpad-answer-key"
          className="max-h-48 shrink-0 overflow-auto border-b border-border-default bg-accent-bg p-3"
        >
          <h3 className="mb-2 text-sm font-bold text-accent-fg">
            Cevap Anahtarı
          </h3>
          <pre className="whitespace-pre-wrap break-words text-sm text-primary">
            {answerKeyText}
          </pre>
        </div>
      )}
      {previewUrl && (
        <p className="shrink-0 px-3 py-2 text-xs text-secondary">
          PDF görünmüyorsa ayrı sekmede açabilirsin. Çizimler bu sayfa açıkken
          saklanır.
        </p>
      )}
      {previewUrl ? (
        <iframe
          src={previewUrl}
          title={`${title} — PDF önizleme`}
          className="min-h-0 w-full flex-1 border-0"
          sandbox={
            drivePreview
              ? 'allow-scripts allow-same-origin allow-popups'
              : 'allow-same-origin'
          }
          allowFullScreen
        />
      ) : (
        <p className="p-4 text-sm text-secondary">
          {safeFileUrl
            ? 'Bu dosya burada önizlenemiyor. Ayrı sekmede açarak görüntüleyebilirsin.'
            : 'Bu içerik için görüntülenebilir bir doküman bulunamadı.'}
        </p>
      )}
    </section>
  );
}
