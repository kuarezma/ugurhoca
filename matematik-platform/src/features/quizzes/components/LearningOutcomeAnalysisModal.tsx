'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  X,
  Target,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  TrendingUp,
  FileCheck2,
} from 'lucide-react';
import {
  analyzeQuizLearningOutcomes,
  type QuizOutcomeAnalysisResult,
  type OutcomeMasteryStatus,
} from '@/features/quizzes/lib/learningOutcomeAnalysis';
import type { QuizQuestion } from '@/types/quiz';

interface LearningOutcomeAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuizQuestion[];
  answers: Record<number, number>;
  quizTitle?: string;
  grade?: number | string;
}

const STATUS_CONFIG: Record<
  OutcomeMasteryStatus,
  { label: string; badgeClass: string; barClass: string; icon: React.FC<{ className?: string }> }
> = {
  critical: {
    label: 'Kritik Eksik',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    barClass: 'bg-rose-500',
    icon: AlertTriangle,
  },
  developing: {
    label: 'Geliştirilmeli',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    barClass: 'bg-amber-500',
    icon: TrendingUp,
  },
  mastered: {
    label: 'Tam Kavrandı',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    barClass: 'bg-emerald-500',
    icon: CheckCircle2,
  },
};

export const LearningOutcomeAnalysisModal: React.FC<LearningOutcomeAnalysisModalProps> = ({
  isOpen,
  onClose,
  questions,
  answers,
  quizTitle,
  grade,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const analysis: QuizOutcomeAnalysisResult = useMemo(() => {
    return analyzeQuizLearningOutcomes({
      questions,
      answers,
      quizTitle,
      grade,
    });
  }, [questions, answers, quizTitle, grade]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="outcome-modal-title"
        className="relative z-10 w-full max-w-2xl flex flex-col max-h-[90vh] rounded-3xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/70 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h2 id="outcome-modal-title" className="font-display text-lg font-bold text-white">
                Kazanım & Eksik Analizi
              </h2>
              <p className="text-xs text-slate-400">
                Testteki başarı durumun ve konuya özel otomatik telafi önerileri
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Overall Score Summary */}
        <div className="border-b border-white/5 bg-slate-950/40 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-400">Genel Başarı Oranı</div>
              <div className="text-2xl font-black text-white mt-0.5">
                %{analysis.overallAccuracy}
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{analysis.correctCount} Doğru</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20">
                <X className="w-3.5 h-3.5" />
                <span>{analysis.wrongCount} Yanlış</span>
              </div>
              {analysis.emptyCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 border border-slate-700">
                  <span>{analysis.emptyCount} Boş</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Body: Topic breakdown list */}
        <div className="overflow-y-auto p-6 space-y-4 flex-1">
          {analysis.items.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              Analiz edilecek konu verisi bulunamadı.
            </div>
          ) : (
            analysis.items.map((item) => {
              const statusCfg = STATUS_CONFIG[item.status];
              const StatusIcon = statusCfg.icon;

              return (
                <div
                  key={item.topic}
                  className="rounded-2xl bg-slate-800/40 border border-white/5 p-4 hover:border-white/10 transition-colors"
                >
                  {/* Topic Header & Status */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="font-semibold text-white text-sm tracking-tight">
                      {item.topic}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusCfg.badgeClass}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Progress Bar & Stats */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>
                        {item.correctCount}/{item.totalQuestions} Soru Doğru
                      </span>
                      <span className="font-bold text-slate-200">%{item.accuracy}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${statusCfg.barClass}`}
                        style={{ width: `${item.accuracy}%` }}
                      />
                    </div>
                  </div>

                  {/* Remediation Action Links */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                    <Link
                      href={item.worksheetHref}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      Telafi Yaprak Testini Aç
                    </Link>
                    <Link
                      href={item.summaryHref}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700/40 hover:bg-slate-700/60 text-slate-300 border border-slate-600/40 text-xs font-medium transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Konu Özeti
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 bg-slate-950/70 px-6 py-4">
          <Link
            href="/icerikler?type=yaprak-test"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>Tüm Çalışma Kağıtlarını Keşfet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};
