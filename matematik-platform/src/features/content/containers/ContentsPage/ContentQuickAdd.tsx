import type { AppUser } from '@/types';
import type { Dispatch, SetStateAction } from 'react';
import { AnimatePresence } from 'framer-motion';

import type { ContentFormState } from '@/features/content/types';

import { ContentQuickAddModal } from './lazy';

type ContentQuickAddProps = {
  showModal: boolean;
  user: AppUser | null;
  formData: ContentFormState;
  isSubmitting: boolean;
  handleQuickAddChange: (nextValue: Partial<ContentFormState>) => void;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  setSuccess: Dispatch<SetStateAction<boolean>>;
  handleQuickAddFileUpload: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => Promise<void>;
  handleQuickAddSubmit: (
    event: React.FormEvent<HTMLFormElement>,
  ) => Promise<void>;
  success: boolean;
};

export function ContentQuickAdd({
  showModal,
  user,
  formData,
  isSubmitting,
  handleQuickAddChange,
  setShowModal,
  setSuccess,
  handleQuickAddFileUpload,
  handleQuickAddSubmit,
  success,
}: ContentQuickAddProps) {
  return (
    <AnimatePresence>
      {showModal && user?.isAdmin && (
        <ContentQuickAddModal
          formData={formData}
          isSubmitting={isSubmitting}
          onChange={handleQuickAddChange}
          onClose={() => {
            setShowModal(false);
            setSuccess(false);
          }}
          onFileUpload={handleQuickAddFileUpload}
          onSubmit={handleQuickAddSubmit}
          success={success}
        />
      )}
    </AnimatePresence>
  );
}
