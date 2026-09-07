'use client';

/* eslint-disable @next/next/no-img-element -- message content can include dynamic remote image URLs */

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { DashboardNotification } from '@/types/dashboard';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';

type MessageDetailModalProps = {
  message: DashboardNotification;
  onClose: () => void;
};

export default function MessageDetailModal({
  message,
  onClose,
}: MessageDetailModalProps) {
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
        aria-labelledby="message-detail-title"
        tabIndex={-1}
        className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
              Mesaj
            </p>
            <h3 id="message-detail-title" className="text-2xl font-bold text-slate-900 dark:text-white">
              {message.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ChevronRight className="h-6 w-6 rotate-45" />
          </button>
        </div>

        {message.metadata?.image_url ? (
          <div className="mb-4">
            <img
              src={message.metadata.image_url}
              alt="Mesaj resmi"
              loading="lazy"
              decoding="async"
              className="max-h-64 rounded-lg border border-slate-200 dark:border-white/10"
            />
          </div>
        ) : null}

        <p className="whitespace-pre-line leading-relaxed text-slate-700 dark:text-slate-300">
          {message.message || 'Bu bildirim için ek içerik yok.'}
        </p>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white px-4 py-2 font-medium transition-colors"
          >
            Kapat
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
