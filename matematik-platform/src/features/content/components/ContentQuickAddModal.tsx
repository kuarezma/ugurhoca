'use client';

import { motion } from 'framer-motion';
import { useId, type ChangeEvent, type FormEvent } from 'react';
import { Check, Upload, X } from 'lucide-react';
import ContentDocumentForm from '@/features/content/components/ContentDocumentForm';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import type { ContentFormState } from '@/features/content/types';

type ContentQuickAddModalProps = {
  formData: ContentFormState;
  isSubmitting: boolean;
  onChange: (nextValue: Partial<ContentFormState>) => void;
  onClose: () => void;
  onFileUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  success: boolean;
};

export default function ContentQuickAddModal({
  formData,
  isSubmitting,
  onChange,
  onClose,
  onFileUpload,
  onSubmit,
  success,
}: ContentQuickAddModalProps) {
  const titleId = useId();
  const modalRef = useAccessibleModal<HTMLDivElement>(true, onClose);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(event) => event.stopPropagation()}
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative outline-none"
      >
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 id={titleId} className="min-w-0 text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Upload className="w-6 h-6 shrink-0 text-purple-600 dark:text-purple-400" />
            <span className="truncate">Yeni İçerik Ekle</span>
          </h2>
          <button onClick={onClose} aria-label="Kapat" className="shrink-0 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {success ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <Check className="w-10 h-10 text-slate-950 dark:text-slate-950" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Başarılı!</h3>
            <p className="text-slate-600 dark:text-slate-400">
              İçeriğiniz anında eklendi ve yayınlandı.
            </p>
          </motion.div>
        ) : (
          <ContentDocumentForm
            accent="purple"
            fileInputId="quick-file-upload"
            formData={formData}
            isSubmitting={isSubmitting}
            onChange={onChange}
            onFileUpload={onFileUpload}
            onSubmit={onSubmit}
            submitLabel="Hızlı Yayınla"
            submittingLabel="Ekleniyor..."
          />
        )}
      </motion.div>
    </motion.div>
  );
}
