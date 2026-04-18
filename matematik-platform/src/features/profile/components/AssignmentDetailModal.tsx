'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { DashboardAssignment } from '@/types/dashboard';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';

type AssignmentDetailModalProps = {
  assignment: DashboardAssignment;
  onClose: () => void;
  onOpenAssignments: () => void;
};

export default function AssignmentDetailModal({
  assignment,
  onClose,
  onOpenAssignments,
}: AssignmentDetailModalProps) {
  const modalRef = useAccessibleModal<HTMLDivElement>(true, onClose);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 12 }}
        onClick={(event) => event.stopPropagation()}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="assignment-detail-title"
        tabIndex={-1}
        className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-purple-300">
              Ödev
            </p>
            <h3 id="assignment-detail-title" className="text-2xl font-bold text-white">
              {assignment.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="text-slate-400 hover:text-white"
          >
            <ChevronRight className="h-6 w-6 rotate-45" />
          </button>
        </div>
        <p className="whitespace-pre-line leading-relaxed text-slate-300">
          {assignment.description || 'Ayrıntı bulunmuyor.'}
        </p>
        <div className="mt-6 flex justify-between gap-3">
          <button
            type="button"
            onClick={onOpenAssignments}
            className="rounded-xl bg-purple-500 px-4 py-2 text-white transition-colors hover:bg-purple-600"
          >
            Ödev Sayfasına Git
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white/10 px-4 py-2 font-medium text-white transition-colors hover:bg-white/15"
          >
            Kapat
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
