import { motion } from 'framer-motion';
import type { ChangeEvent, FormEvent } from 'react';
import { Check, Edit3, X } from 'lucide-react';
import ContentDocumentForm from '@/features/content/components/ContentDocumentForm';
import type { ContentFormState } from '@/features/content/types';
import type { ContentDocument } from '@/types';

type ContentEditModalProps = {
  editDoc: ContentDocument;
  editFormData: ContentFormState;
  editSuccess: boolean;
  isEditing: boolean;
  onChange: (nextValue: Partial<ContentFormState>) => void;
  onClose: () => void;
  onFileUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
};

export default function ContentEditModal({
  editDoc,
  editFormData,
  editSuccess,
  isEditing,
  onChange,
  onClose,
  onFileUpload,
  onSubmit,
}: ContentEditModalProps) {
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
        className="glass rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Edit3 className="w-6 h-6 text-blue-400" />
            İçeriği Düzenle
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {editSuccess ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Güncellendi!</h3>
            <p className="text-slate-400">
              İçeriğiniz başarıyla güncellendi.
            </p>
          </motion.div>
        ) : (
          <ContentDocumentForm
            accent="blue"
            fileInputId={`edit-file-upload-${editDoc.id}`}
            formData={editFormData}
            isSubmitting={isEditing}
            onChange={onChange}
            onFileUpload={onFileUpload}
            onSubmit={onSubmit}
            submitLabel="Güncelle"
            submittingLabel="Güncelleniyor..."
          />
        )}
      </motion.div>
    </motion.div>
  );
}
