'use client';

import { useState, useEffect, useId } from 'react';
import {
  X,
  Compass,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Award,
  Layers,
  History,
} from 'lucide-react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import {
  MATH_PROOFS_COLLECTION,
  getCompletedProofIds,
  toggleProofCompleted,
  type MathProofItem,
} from '../lib/mathProofsData';

interface VisualMathProofsModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
}

export function VisualMathProofsModal({
  isOpen,
  onClose,
  studentName: _studentName = 'Öğrenci',
}: VisualMathProofsModalProps) {
  const titleId = useId();
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);

  const [selectedProof, setSelectedProof] = useState<MathProofItem>(MATH_PROOFS_COLLECTION[0]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setCompletedIds(getCompletedProofIds());
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  const handleSelectProof = (proof: MathProofItem) => {
    setSelectedProof(proof);
    setCurrentStepIndex(0);
  };

  const handleToggleComplete = () => {
    toggleProofCompleted(selectedProof.id);
    setCompletedIds(getCompletedProofIds());
  };

  if (!isOpen) return null;

  const isCompleted = completedIds.includes(selectedProof.id);
  const currentStep = selectedProof.steps[currentStepIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 id={titleId} className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                &ldquo;Neden Doğru?&rdquo; Matematiksel İspat Koleksiyonu
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/50 font-medium">
                  Ezber Değil Mantık
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Formüller nereden geliyor? Teoremleri adım adım görselleştir ve mantığını kalıcı olarak kavra.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress & Selector Bar */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {MATH_PROOFS_COLLECTION.map((p) => {
              const active = selectedProof.id === p.id;
              const done = completedIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectProof(p)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    active
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{p.title.split(' ')[0]} {p.formula}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
            <Award className="w-4 h-4 text-cyan-500" />
            <span>
              {completedIds.length} / {MATH_PROOFS_COLLECTION.length} İspat Kavrandı
            </span>
          </div>
        </div>

        {/* Main Proof Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Active Proof Overview Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-transparent border border-cyan-200/60 dark:border-cyan-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300">
                  {selectedProof.category}
                </span>
                <span className="text-xs text-slate-500">
                  Seviye: {selectedProof.difficulty}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                {selectedProof.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
                {selectedProof.intuitiveExplanation}
              </p>
            </div>

            <button
              onClick={handleToggleComplete}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition-all ${
                isCompleted
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-500'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-slate-400'}`} />
              {isCompleted ? 'Kavrandı (Rozet Kazanıldı)' : 'İspatı İnceledim & Anladım'}
            </button>
          </div>

          {/* Step by Step Stage */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-cyan-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                  {currentStep.stepNumber}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {currentStep.title}
                </h4>
              </div>

              <span className="text-xs font-medium text-slate-400">
                Adım {currentStepIndex + 1} / {selectedProof.steps.length}
              </span>
            </div>

            {/* Step Description */}
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {currentStep.description}
            </p>

            {/* Visual Scheme Simulation Box */}
            <div className="p-6 rounded-xl border border-dashed border-cyan-300 dark:border-cyan-800/80 bg-cyan-50/40 dark:bg-cyan-950/20 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-2">
                <Layers className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-cyan-900 dark:text-cyan-200">
                {currentStep.visualHint}
              </p>
              <div className="mt-2 text-xs font-mono font-bold text-cyan-700 dark:text-cyan-300 bg-white/80 dark:bg-slate-900/80 px-3 py-1 rounded-lg border border-cyan-200 dark:border-cyan-800">
                Formül Özü: {selectedProof.formula}
              </div>
            </div>

            {/* Step Navigation Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                disabled={currentStepIndex === 0}
                onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Önceki Adım
              </button>

              <button
                type="button"
                disabled={currentStepIndex === selectedProof.steps.length - 1}
                onClick={() => setCurrentStepIndex((prev) => Math.min(selectedProof.steps.length - 1, prev + 1))}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm"
              >
                Sonraki Adım
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Historical Lore / Background */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3">
            <History className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
              <span className="font-bold text-slate-900 dark:text-white block">Tarihsel Köken & İlham:</span>
              <p>{selectedProof.historyNote}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
