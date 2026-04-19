'use client';

import { ClipboardList, Clock, X } from 'lucide-react';
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white leading-tight">
                {assignment.title}
              </h2>
              <p className="text-slate-400 text-sm">
                Teslim Edilen Ödevler ({submissions.length})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {submissions.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
              <Clock className="w-12 h-12 mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400">Henüz teslimat yapılmadı</p>
            </div>
          ) : (
            submissions.map((submission) => (
              <AdminSubmissionReviewCard
                key={submission.id}
                submission={submission}
                onUpdateSubmission={onUpdateSubmission}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
