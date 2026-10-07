'use client';

import { useId } from 'react';
import { X, Layers, Printer } from 'lucide-react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import { CurriculumCoverageReport } from '@/features/content/components/CurriculumCoverageReport';

interface CurriculumCoverageMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGrade?: string;
  initialGrade?: string;
}

export function CurriculumCoverageMatrixModal({
  isOpen,
  onClose,
  defaultGrade,
  initialGrade,
}: CurriculumCoverageMatrixModalProps) {
  const titleId = useId();
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in duration-200 print:p-0 print:static">
      <div
        className="fixed inset-0 bg-slate-950/80 dark:bg-slate-950/80 backdrop-blur-md print:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative z-10 w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden transition-all print:border-none print:shadow-none print:max-h-none print:w-full print:rounded-none"
      >
        {/* Üst Bar */}
        <div className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/80 p-4 sm:p-5 flex flex-col gap-3.5 print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white dark:text-white shadow-md">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2
                  id={titleId}
                  className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
                >
                  Kazanım Kapsam & İçerik Haritası
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gerçek dokümanlardan yaprak test ve ders notu kapsamını
                  incele.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Yazdır</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-y-auto p-4 sm:p-5">
          <CurriculumCoverageReport
            defaultGrade={initialGrade || defaultGrade || '8'}
          />
        </div>
      </div>
    </div>
  );
}
