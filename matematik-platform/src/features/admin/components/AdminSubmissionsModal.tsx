'use client';

import { useState, useCallback } from 'react';
import {
  ClipboardList,
  Clock,
  X,
  Zap,
  List,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import AdminSubmissionReviewCard from '@/features/admin/components/AdminSubmissionReviewCard';
import type { AdminAssignment, AdminSubmission } from '@/features/admin/types';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';

type AdminSubmissionsModalProps = {
  assignment: AdminAssignment;
  onClose: () => void;
  onUpdateSubmission: (
    submissionId: string,
    grade: number,
    feedback: string,
  ) => void;
  submissions: AdminSubmission[];
};

export default function AdminSubmissionsModal({
  assignment,
  onClose,
  onUpdateSubmission,
  submissions,
}: AdminSubmissionsModalProps) {
  const modalRef = useAccessibleModal<HTMLDivElement>(true, onClose);
  const [viewMode, setViewMode] = useState<'list' | 'speedGrader'>('list');
  const [currentIndex, setCurrentIndex] = useState(0);

  const gradedCount = submissions.filter((s) => s.grade !== null && s.grade !== undefined).length;
  const currentSubmission = submissions[currentIndex] || null;

  const handleNext = useCallback(() => {
    if (currentIndex < submissions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, submissions.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Kapat"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md animate-fade-in"
      />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Teslim edilen ödevler"
        tabIndex={-1}
        className="relative w-full max-w-4xl max-h-[90vh] glass rounded-3xl p-6 sm:p-8 flex flex-col overflow-hidden animate-fade-up"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shrink-0">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white leading-tight">
                {assignment.title}
              </h2>
              <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm mt-0.5">
                <span>Teslim Edilen: {submissions.length}</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">
                  {gradedCount}/{submissions.length} Değerlendirildi
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {submissions.length > 0 && (
              <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'list'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Liste</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('speedGrader')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'speedGrader'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Hızlı İnceleme</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
            <Clock className="w-12 h-12 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400">Henüz teslimat yapılmadı</p>
          </div>
        ) : viewMode === 'speedGrader' ? (
          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            {/* Speed Grader Controller */}
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-3 px-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Öğrenci {currentIndex + 1} / {submissions.length}
                </span>
                <span className="text-sm font-semibold text-white">
                  {currentSubmission?.student_name || 'Öğrenci'}
                </span>
                {currentSubmission?.grade !== null && currentSubmission?.grade !== undefined && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3 h-3" />
                    {currentSubmission.grade} Puan
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Önceki</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentIndex === submissions.length - 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-bold text-slate-950 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <span className="hidden sm:inline">Sonraki</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Student Carousel Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {submissions.map((sub, idx) => {
                const isSelected = idx === currentIndex;
                const isGraded = sub.grade !== null && sub.grade !== undefined;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`shrink-0 px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400'
                        : isGraded
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                          : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {idx + 1}. {sub.student_name || 'Öğrenci'}
                  </button>
                );
              })}
            </div>

            {/* Single Review Card in Focus */}
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
              {currentSubmission && (
                <AdminSubmissionReviewCard
                  key={currentSubmission.id}
                  submission={currentSubmission}
                  onUpdateSubmission={(subId, grade, feedback) => {
                    onUpdateSubmission(subId, grade, feedback);
                    // İnceleme yapıldıktan sonra otomatik sonraki öğrenciye geçiş önerisi
                    if (currentIndex < submissions.length - 1) {
                      setTimeout(() => {
                        setCurrentIndex((prev) => prev + 1);
                      }, 500);
                    }
                  }}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {submissions.map((submission) => (
              <AdminSubmissionReviewCard
                key={submission.id}
                submission={submission}
                onUpdateSubmission={onUpdateSubmission}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
