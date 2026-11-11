'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { PenTool } from 'lucide-react';
import type { ScratchpadDocumentContext } from '@/components/ScratchpadModal/types';

const ScratchpadModal = dynamic(() => import('@/components/ScratchpadModal'), {
  ssr: false,
  loading: () => (
    <p role="status" className="text-sm text-secondary">
      İşlem tahtası açılıyor…
    </p>
  ),
});

export function ContentScratchpadButton({
  documentContext,
}: {
  documentContext: ScratchpadDocumentContext;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border-default bg-accent-bg px-4 py-3 text-sm font-bold text-accent-fg hover:bg-surface-2"
      >
        <PenTool className="h-4 w-4 shrink-0" aria-hidden="true" />
        Tam Ekran İşlem Tahtasında Çöz
      </button>
      {isOpen && (
        <ScratchpadModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title={`${documentContext.title} — İşlem Tahtası`}
          documentContext={documentContext}
        />
      )}
    </>
  );
}
