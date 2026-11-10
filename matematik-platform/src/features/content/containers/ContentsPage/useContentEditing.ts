import type { ContentDocument } from '@/types';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback } from 'react';

import { useToast } from '@/components/Toast';
import { getErrorMessage } from '@/lib/error-utils';

import {
  deleteContentDocument,
  updateContentDocument,
  uploadContentFile,
} from '@/features/content/queries';
import type { ContentFormState } from '@/features/content/types';

import {
  getWorksheetVisibleDescription,
  getWorksheetOutcomeLabel,
  isWorksheetType,
} from '@/features/content/worksheet-display';

import { WorksheetGradeSelection } from './helpers';

type UseContentEditingProps = {
  setEditDoc: Dispatch<SetStateAction<ContentDocument | null>>;
  setEditFormData: Dispatch<SetStateAction<ContentFormState>>;
  setEditSuccess: Dispatch<SetStateAction<boolean>>;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  showToast: ReturnType<typeof useToast>['showToast'];
  editDoc: ContentDocument | null;
  editFormData: ContentFormState;
  applyDocumentPatch: (
    documentId: string,
    patch: Partial<ContentDocument>,
  ) => void;
  selectedWorksheetGrade: WorksheetGradeSelection | null;
  refreshSelectedWorksheetGrade: () => Promise<void>;
  setDeleteCandidate: Dispatch<SetStateAction<ContentDocument | null>>;
  deleteCandidate: ContentDocument | null;
  setDeleting: Dispatch<SetStateAction<boolean>>;
  removeDocumentFromState: (documentId: string) => void;
};

export function useContentEditing({
  setEditDoc,
  setEditFormData,
  setEditSuccess,
  setIsEditing,
  showToast,
  editDoc,
  editFormData,
  applyDocumentPatch,
  selectedWorksheetGrade,
  refreshSelectedWorksheetGrade,
  setDeleteCandidate,
  deleteCandidate,
  setDeleting,
  removeDocumentFromState,
}: UseContentEditingProps) {
  const handleOpenEdit = useCallback(
    (content: ContentDocument) => {
      setEditDoc(content);
      setEditFormData({
        ...content,
        description: isWorksheetType(content.type)
          ? getWorksheetVisibleDescription(content)
          : content.description,
        learning_outcome: isWorksheetType(content.type)
          ? getWorksheetOutcomeLabel(content)
          : '',
        grade: content.grade,
      });
      setEditSuccess(false);
      setIsEditing(false);
    },
    [setEditDoc, setEditFormData, setEditSuccess, setIsEditing],
  );

  const handleEditChange = useCallback(
    (nextValue: Partial<ContentFormState>) => {
      setEditFormData((current) => ({ ...current, ...nextValue }));
    },
    [setEditFormData],
  );

  const handleEditFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsEditing(true);

      try {
        const uploadedFile = await uploadContentFile(file);
        setEditFormData((current) => ({
          ...current,
          file_name: uploadedFile.fileName,
          file_url: uploadedFile.publicUrl,
        }));
      } catch (error) {
        showToast('error', `Dosya yüklenemedi: ${getErrorMessage(error)}`);
      } finally {
        setIsEditing(false);
      }
    },
    [setEditFormData, setIsEditing, showToast],
  );

  const handleEditSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!editDoc) return;

      setIsEditing(true);

      try {
        const updatedDocument = await updateContentDocument(
          editDoc.id,
          editFormData,
        );

        if (updatedDocument) {
          applyDocumentPatch(editDoc.id, updatedDocument);

          if (selectedWorksheetGrade) {
            await refreshSelectedWorksheetGrade();
          }
        }

        setEditSuccess(true);
        setTimeout(() => {
          setEditDoc(null);
          setEditSuccess(false);
        }, 1500);
      } catch (error) {
        showToast('error', `Güncelleme hatası: ${getErrorMessage(error)}`);
      } finally {
        setIsEditing(false);
      }
    },
    [
      applyDocumentPatch,
      editDoc,
      editFormData,
      refreshSelectedWorksheetGrade,
      selectedWorksheetGrade,
      setEditDoc,
      setEditSuccess,
      setIsEditing,
      showToast,
    ],
  );

  const handleDeleteDocument = useCallback(
    (content: ContentDocument) => {
      setDeleteCandidate(content);
    },
    [setDeleteCandidate],
  );

  const confirmDeleteDocument = useCallback(async () => {
    if (!deleteCandidate) return;
    setDeleting(true);
    try {
      await deleteContentDocument(deleteCandidate.id);
      removeDocumentFromState(deleteCandidate.id);
      showToast('success', 'İçerik silindi.');
      setDeleteCandidate(null);
    } catch (error) {
      showToast('error', `Silme hatası: ${getErrorMessage(error)}`);
    } finally {
      setDeleting(false);
    }
  }, [
    deleteCandidate,
    removeDocumentFromState,
    setDeleteCandidate,
    setDeleting,
    showToast,
  ]);
  return {
    handleOpenEdit,
    handleEditChange,
    handleEditFileUpload,
    handleEditSubmit,
    handleDeleteDocument,
    confirmDeleteDocument,
  };
}
