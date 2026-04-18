import { motion } from 'framer-motion';
import type { ChangeEvent, FormEvent } from 'react';
import { Check, Upload, X } from 'lucide-react';
import ContentDocumentForm from '@/features/content/components/ContentDocumentForm';
import type { ContentFormState } from '@/features/content/types';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';

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
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(event) => event.stopPropagation()}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="content-quick-add-title"
        tabIndex={-1}
        className="glass rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            id="content-quick-add-title"
            className="text-2xl font-bold text-white flex items-center gap-2"
          >
            <Upload className="w-6 h-6 text-purple-400" />
            Yeni İçerik Ekle
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="text-slate-400 hover:text-white"
          >
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
              <Check className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Başarılı!</h3>
            <p className="text-slate-400">
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
