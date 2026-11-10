import type { ContentDocument } from '@/types';
import type { Dispatch, SetStateAction } from 'react';
import { AnimatePresence } from 'framer-motion';

import type { ContentFormState } from '@/features/content/types';

import { ContentEditModal } from './lazy';

type ContentEditorProps = {
  editDoc: ContentDocument | null;
  editFormData: ContentFormState;
  editSuccess: boolean;
  isEditing: boolean;
  handleEditChange: (nextValue: Partial<ContentFormState>) => void;
  setEditDoc: Dispatch<SetStateAction<ContentDocument | null>>;
  setEditSuccess: Dispatch<SetStateAction<boolean>>;
  handleEditFileUpload: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => Promise<void>;
  handleEditSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
};

export function ContentEditor({
  editDoc,
  editFormData,
  editSuccess,
  isEditing,
  handleEditChange,
  setEditDoc,
  setEditSuccess,
  handleEditFileUpload,
  handleEditSubmit,
}: ContentEditorProps) {
  return (
    <AnimatePresence>
      {editDoc && (
        <ContentEditModal
          editDoc={editDoc}
          editFormData={editFormData}
          editSuccess={editSuccess}
          isEditing={isEditing}
          onChange={handleEditChange}
          onClose={() => {
            setEditDoc(null);
            setEditSuccess(false);
          }}
          onFileUpload={handleEditFileUpload}
          onSubmit={handleEditSubmit}
        />
      )}
    </AnimatePresence>
  );
}
