import type { AppUser, ContentDocument } from '@/types';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback } from 'react';

import { useToast } from '@/components/Toast';
import { broadcastHomeDocumentsUpdated } from '@/features/home/home-documents-events';

import {
  createContentDocument,
  uploadContentFile,
} from '@/features/content/queries';
import type {
  ContentFormState,
  ContentGradeFilter,
} from '@/features/content/types';

import { isWorksheetType } from '@/features/content/worksheet-display';
import { type WorksheetCatalogItem } from '@/features/content/worksheet-catalog';
import type { GradeValue } from '@/types';
import {
  WorksheetGradeSelection,
  SUPPORTED_WORKSHEET_QUICK_ADD_GRADES,
  normalizeWorksheetQuickAddGrade,
} from './helpers';

type UseContentQuickAddProps = {
  ensureWorksheetOutcomeCatalog: () => Promise<
    Record<number, WorksheetCatalogItem[]>
  >;
  selectedWorksheetGrade: WorksheetGradeSelection | null;
  selectedGrade: ContentGradeFilter;
  user: AppUser | null;
  setFormData: Dispatch<SetStateAction<ContentFormState>>;
  selectedType: string;
  isWorksheetBrowser: boolean;
  selectedWorksheetOutcome: string | null;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  showToast: ReturnType<typeof useToast>['showToast'];
  isSubmitting: boolean;
  formData: ContentFormState;
  setDocuments: Dispatch<SetStateAction<ContentDocument[]>>;
  refreshSelectedWorksheetGrade: () => Promise<void>;
  setSuccess: Dispatch<SetStateAction<boolean>>;
};

export function useContentQuickAdd({
  ensureWorksheetOutcomeCatalog,
  selectedWorksheetGrade,
  selectedGrade,
  user,
  setFormData,
  selectedType,
  isWorksheetBrowser,
  selectedWorksheetOutcome,
  setShowModal,
  setIsSubmitting,
  showToast,
  isSubmitting,
  formData,
  setDocuments,
  refreshSelectedWorksheetGrade,
  setSuccess,
}: UseContentQuickAddProps) {
  const handleQuickAddOpen = useCallback(() => {
    void ensureWorksheetOutcomeCatalog();
    const preferredWorksheetGrade =
      selectedWorksheetGrade ||
      (selectedGrade !== 'all' ? (selectedGrade as GradeValue) : user?.grade);
    const defaultWorksheetGrade = normalizeWorksheetQuickAddGrade(
      preferredWorksheetGrade,
    );

    setFormData({
      type: selectedType !== 'all' ? selectedType : 'yaprak-test',
      grade: [defaultWorksheetGrade],
      learning_outcome: isWorksheetBrowser
        ? selectedWorksheetOutcome || ''
        : '',
    });
    setShowModal(true);
  }, [
    ensureWorksheetOutcomeCatalog,
    selectedWorksheetGrade,
    selectedGrade,
    user?.grade,
    setFormData,
    selectedType,
    isWorksheetBrowser,
    selectedWorksheetOutcome,
    setShowModal,
  ]);

  const handleQuickAddChange = useCallback(
    (nextValue: Partial<ContentFormState>) => {
      setFormData((current) => ({ ...current, ...nextValue }));
    },
    [setFormData],
  );

  const handleQuickAddFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsSubmitting(true);

      try {
        const uploadedFile = await uploadContentFile(file);
        setFormData((current) => ({
          ...current,
          file_name: uploadedFile.fileName,
          file_url: uploadedFile.publicUrl,
        }));
      } catch (error) {
        showToast(
          'error',
          'Dosya yüklenemedi: ' +
            (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [setFormData, setIsSubmitting, showToast],
  );

  const handleQuickAddSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      if (isWorksheetType(formData.type)) {
        const selectedWorksheetGrade = formData.grade?.[0];

        if (
          typeof selectedWorksheetGrade !== 'number' ||
          !SUPPORTED_WORKSHEET_QUICK_ADD_GRADES.includes(selectedWorksheetGrade)
        ) {
          showToast(
            'warning',
            'Yaprak test için desteklenen bir sınıf düzeyi seçmelisiniz.',
          );
          return;
        }

        if (!formData.learning_outcome?.trim()) {
          showToast('warning', 'Yaprak test için bir kazanım seçmelisiniz.');
          return;
        }
      }

      if (
        !formData.file_url?.trim() &&
        !formData.video_url?.trim() &&
        !formData.solution_url?.trim()
      ) {
        showToast(
          'warning',
          'En az bir dosya, bağlantı veya video URL alanı doldurmalısınız.',
        );
        return;
      }

      setIsSubmitting(true);

      try {
        const document = await createContentDocument(formData);

        if (document) {
          setDocuments((current) => [document, ...current]);
          broadcastHomeDocumentsUpdated();

          if (
            isWorksheetType(document.type) &&
            selectedWorksheetGrade &&
            Array.isArray(document.grade) &&
            document.grade.some(
              (grade: GradeValue) =>
                String(grade) === String(selectedWorksheetGrade),
            )
          ) {
            await refreshSelectedWorksheetGrade();
          }
        }

        setSuccess(true);
        setTimeout(() => {
          setShowModal(false);
          setSuccess(false);
          setFormData({});
        }, 1500);
      } catch (error) {
        showToast(
          'error',
          'Kaydetme hatası: ' +
            (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      formData,
      isSubmitting,
      refreshSelectedWorksheetGrade,
      selectedWorksheetGrade,
      setDocuments,
      setFormData,
      setIsSubmitting,
      setShowModal,
      setSuccess,
      showToast,
    ],
  );
  return {
    handleQuickAddOpen,
    handleQuickAddChange,
    handleQuickAddFileUpload,
    handleQuickAddSubmit,
  };
}
