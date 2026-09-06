'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Target, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import {
  generateStudyPrescription,
  type StudyPrescription,
} from '@/features/quizzes/lib/studyPrescription';
import type { QuizQuestion } from '@/types/quiz';

type StudyPrescriptionCardProps = {
  isLight?: boolean;
  onStartQuiz?: (questions: QuizQuestion[], topic: string) => void;
};

export function StudyPrescriptionCard({
  isLight = true,
  onStartQuiz,
}: StudyPrescriptionCardProps) {
  const [prescription, setPrescription] = useState<StudyPrescription | null>(
    null,
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPrescription(generateStudyPrescription());
  }, []);

  if (!mounted) return null;

  if (!prescription) {
    return (
      <div
        className={`rounded-3xl border p-5 transition-all shadow-sm ${
          isLight
            ? 'border-emerald-200 bg-emerald-50/50 text-slate-800'
            : 'border-emerald-500/20 bg-emerald-950/20 text-slate-200'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-500 font-bold">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Haftalık Reçete: Eksik Konun Yok!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Hata defterindeki tüm soruları başarıyla temizledin. Yeni testler çözerek formunu koru.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border p-5 sm:p-6 transition-all shadow-md ${
        isLight
          ? 'border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 text-slate-900'
          : 'border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-purple-950/30 text-white'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-3 py-0.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              Kişisel Çalışma Reçetesi
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-500/20">
              <span>{prescription.weaknessEmoji}</span>
              <span>{prescription.weaknessType}</span>
            </span>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold">
              Hedef Konu:{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {prescription.focusTopic}
              </span>
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              💡 {prescription.actionTip}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
            <span className="flex items-center gap-1 font-medium">
              <Target className="h-3.5 w-3.5 text-indigo-500" />
              {prescription.recommendedQuestions.length} Kritik Soru
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-medium">
              <Clock className="h-3.5 w-3.5 text-indigo-500" />
              ~{prescription.estimatedMinutes} Dakika
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            onStartQuiz?.(
              prescription.recommendedQuestions,
              prescription.focusTopic,
            )
          }
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <span>Reçeteyi Çöz</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
