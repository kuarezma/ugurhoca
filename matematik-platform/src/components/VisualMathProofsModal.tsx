'use client';

import { useState } from 'react';
import { X, Compass } from 'lucide-react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import type {
  VisualProofTab,
  VisualMathProofsModalProps,
} from './VisualMathProofsModal/types';
import { ProofTabSelector } from './VisualMathProofsModal/ProofTabSelector';
import { PythagorasTab } from './VisualMathProofsModal/PythagorasTab';
import { DifferenceOfSquaresTab } from './VisualMathProofsModal/DifferenceOfSquaresTab';
import { TrigIdentityTab } from './VisualMathProofsModal/TrigIdentityTab';
import { PascalBinomialTab } from './VisualMathProofsModal/PascalBinomialTab';
import { CircleSectorTab } from './VisualMathProofsModal/CircleSectorTab';

export type { VisualProofTab, VisualMathProofsModalProps };

export function VisualMathProofsModal({
  isOpen,
  onClose,
  isLight = false,
  initialTab = 'pythagoras',
}: VisualMathProofsModalProps) {
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);
  const [activeTab, setActiveTab] = useState<VisualProofTab>(initialTab);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Görsel Matematik İspatları"
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-2 sm:p-4 backdrop-blur-md overflow-y-auto outline-none"
    >
      <div
        className={`relative flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl border shadow-2xl transition-all my-auto max-h-[95vh] ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-900 border-white/15 text-slate-100'
        }`}
      >
        {/* Üst Başlık & Sekmeler */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6 ${
            isLight
              ? 'bg-slate-50 border-slate-200'
              : 'bg-slate-950/80 border-white/10'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-md bg-brand-secondary text-slate-950 dark:text-slate-950">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base sm:text-lg font-bold">
                  İnteraktif Görsel Formül İspatları
                </h2>
                <span className="rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  Görsel Deney 🔬
                </span>
              </div>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Ezberleme, neden öyle olduğunu kendi gözlerinle gör!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="İspat penceresini kapat"
            className={`rounded-xl p-2 transition ${
              isLight
                ? 'hover:bg-slate-200 text-slate-600'
                : 'hover:bg-white/10 text-slate-300'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sekme Seçici */}
        <ProofTabSelector
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isLight={isLight}
        />

        {/* Sekme İçerikleri */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'pythagoras' && <PythagorasTab />}
          {activeTab === 'difference_of_squares' && <DifferenceOfSquaresTab />}
          {activeTab === 'trig_identity' && <TrigIdentityTab />}
          {activeTab === 'pascal_binomial' && <PascalBinomialTab />}
          {activeTab === 'circle_sector' && <CircleSectorTab />}
        </div>

        {/* Alt Kapat Çubuğu */}
        <div
          className={`flex items-center justify-between border-t px-4 py-3 sm:px-6 ${
            isLight
              ? 'bg-slate-50 border-slate-200'
              : 'bg-slate-950/80 border-white/10'
          }`}
        >
          <span className="text-xs text-slate-400 hidden sm:inline">
            Formülleri görsel olarak anladığında asla unutmazsın.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold shadow-md transition bg-surface-2 hover:bg-surface-3 text-primary border border-default"
          >
            Anladım, Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

export default VisualMathProofsModal;
