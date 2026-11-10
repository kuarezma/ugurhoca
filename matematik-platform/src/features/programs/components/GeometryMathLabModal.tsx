'use client';

import { useState, useId } from 'react';
import { X, Compass } from 'lucide-react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import { useTheme } from '@/components/ThemeProvider';
import type {
  LabTab,
  GeometryMathLabModalProps,
} from './GeometryMathLabModal/types';
import { LabTabSelector } from './GeometryMathLabModal/LabTabSelector';
import { PythagorasLabTab } from './GeometryMathLabModal/PythagorasLabTab';
import { CircleLabTab } from './GeometryMathLabModal/CircleLabTab';
import { ParabolaLabTab } from './GeometryMathLabModal/ParabolaLabTab';
import { SlopeLabTab } from './GeometryMathLabModal/SlopeLabTab';

export type { GeometryMathLabModalProps };

export function GeometryMathLabModal({
  isOpen,
  onClose,
  initialTab = 'pythagoras',
}: GeometryMathLabModalProps) {
  const titleId = useId();
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [activeTab, setActiveTab] = useState<LabTab>(initialTab);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-testid="geometry-math-lab-modal"
    >
      <div
        ref={modalRef}
        className={`relative flex flex-col w-full max-w-4xl max-h-[92vh] rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-900 border-white/10 text-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-default dark:border-white/10 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl shadow-md bg-brand-secondary text-slate-950 dark:text-slate-950">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id={titleId}
                  className="text-base sm:text-lg font-black tracking-tight"
                >
                  Etkileşimli Matematik & Geometri Laboratuvarı
                </h2>
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-400">
                  Canlı Simülatör
                </span>
              </div>
              <p
                className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}
              >
                Sürükle, değiştir ve formüllerin geometrik mantığını anında gör.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
              isLight
                ? 'hover:bg-slate-100 text-slate-500'
                : 'hover:bg-white/10 text-slate-400'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <LabTabSelector
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isLight={isLight}
        />

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'pythagoras' && <PythagorasLabTab isLight={isLight} />}
          {activeTab === 'circle' && <CircleLabTab isLight={isLight} />}
          {activeTab === 'parabola' && <ParabolaLabTab isLight={isLight} />}
          {activeTab === 'slope' && <SlopeLabTab isLight={isLight} />}
        </div>
      </div>
    </div>
  );
}

export default GeometryMathLabModal;
