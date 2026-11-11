import type { ContentDocument } from '@/types';
import type { Dispatch, SetStateAction, RefObject } from 'react';
import { useEffect, useCallback, startTransition } from 'react';

import { loadWorksheetDocumentsByGrade } from '@/features/content/queries';

import { isWorksheetType } from '@/features/content/worksheet-display';
import { type WorksheetCatalogItem } from '@/features/content/worksheet-catalog';

import { WorksheetGradeSelection, parseWorksheetGradeParam } from './helpers';

type UseWorksheetNavigationProps = {
  worksheetRequestIdRef: RefObject<number>;
  setSelectedWorksheetGrade: Dispatch<
    SetStateAction<WorksheetGradeSelection | null>
  >;
  setSelectedWorksheetOutcome: Dispatch<SetStateAction<string | null>>;
  setWorksheetDocuments: Dispatch<SetStateAction<ContentDocument[]>>;
  setWorksheetLoading: Dispatch<SetStateAction<boolean>>;
  isWorksheetBrowser: boolean;
  setContentLoadError: Dispatch<SetStateAction<string | null>>;
  ensureWorksheetOutcomeCatalog: () => Promise<
    Record<number, WorksheetCatalogItem[]>
  >;
  selectedWorksheetGrade: WorksheetGradeSelection | null;
  setSelectedType: Dispatch<SetStateAction<string>>;
  appliedWorksheetLinkRef: RefObject<string | null>;
  worksheetGradeFromUrl: string | null;
  worksheetOutcomeFromUrl: string | null;
};

export function useWorksheetNavigation({
  worksheetRequestIdRef,
  setSelectedWorksheetGrade,
  setSelectedWorksheetOutcome,
  setWorksheetDocuments,
  setWorksheetLoading,
  isWorksheetBrowser,
  setContentLoadError,
  ensureWorksheetOutcomeCatalog,
  selectedWorksheetGrade,
  setSelectedType,
  appliedWorksheetLinkRef,
  worksheetGradeFromUrl,
  worksheetOutcomeFromUrl,
}: UseWorksheetNavigationProps) {
  const resetWorksheetHierarchy = useCallback(() => {
    worksheetRequestIdRef.current += 1;
    setSelectedWorksheetGrade(null);
    setSelectedWorksheetOutcome(null);
    setWorksheetDocuments([]);
    setWorksheetLoading(false);
  }, [
    setSelectedWorksheetGrade,
    setSelectedWorksheetOutcome,
    setWorksheetDocuments,
    setWorksheetLoading,
    worksheetRequestIdRef,
  ]);

  useEffect(() => {
    if (!isWorksheetBrowser) {
      resetWorksheetHierarchy();
    }
  }, [isWorksheetBrowser, resetWorksheetHierarchy]);

  const loadWorksheetGradeDocuments = useCallback(
    async (grade: WorksheetGradeSelection, preserveOutcome = false) => {
      const requestId = ++worksheetRequestIdRef.current;
      setWorksheetLoading(true);
      setContentLoadError(null);
      setSelectedWorksheetGrade(grade);
      void ensureWorksheetOutcomeCatalog();

      if (!preserveOutcome) {
        setSelectedWorksheetOutcome(null);
      }

      try {
        const nextDocuments = await loadWorksheetDocumentsByGrade(grade);

        if (requestId !== worksheetRequestIdRef.current) {
          return;
        }

        setWorksheetDocuments(nextDocuments);
      } catch {
        if (requestId === worksheetRequestIdRef.current)
          setContentLoadError('Yaprak testler yüklenemedi. Yeniden deneyin.');
      } finally {
        if (requestId === worksheetRequestIdRef.current) {
          setWorksheetLoading(false);
        }
      }
    },
    [
      ensureWorksheetOutcomeCatalog,
      setContentLoadError,
      setSelectedWorksheetGrade,
      setSelectedWorksheetOutcome,
      setWorksheetDocuments,
      setWorksheetLoading,
      worksheetRequestIdRef,
    ],
  );

  const refreshSelectedWorksheetGrade = useCallback(async () => {
    if (!selectedWorksheetGrade) {
      return;
    }

    await loadWorksheetGradeDocuments(selectedWorksheetGrade, true);
  }, [loadWorksheetGradeDocuments, selectedWorksheetGrade]);

  const handleTypeChange = useCallback(
    (type: string) => {
      startTransition(() => {
        setSelectedType(type);
      });
      const url = new URL(window.location.href);

      if (type === 'all') {
        url.searchParams.delete('type');
      } else {
        url.searchParams.set('type', type);
      }

      if (!isWorksheetType(type)) {
        url.searchParams.delete('grade');
        url.searchParams.delete('outcome');
      }

      window.history.pushState({}, '', url.toString());
    },
    [setSelectedType],
  );

  const updateWorksheetBrowserUrl = useCallback(
    (grade: WorksheetGradeSelection | null, outcome?: string | null) => {
      const url = new URL(window.location.href);
      url.searchParams.set('type', 'yaprak-test');

      if (grade) {
        url.searchParams.set('grade', String(grade));
      } else {
        url.searchParams.delete('grade');
      }

      if (outcome) {
        url.searchParams.set('outcome', outcome);
      } else {
        url.searchParams.delete('outcome');
      }

      appliedWorksheetLinkRef.current = grade
        ? `${String(grade)}:${outcome?.trim() || ''}`
        : null;
      window.history.pushState({}, '', url.toString());
    },
    [appliedWorksheetLinkRef],
  );

  useEffect(() => {
    if (!isWorksheetBrowser) {
      return;
    }

    const grade = parseWorksheetGradeParam(worksheetGradeFromUrl);
    const outcome = worksheetOutcomeFromUrl?.trim() || '';
    const linkKey = `${String(grade || '')}:${outcome}`;

    if (!grade || appliedWorksheetLinkRef.current === linkKey) {
      return;
    }

    appliedWorksheetLinkRef.current = linkKey;
    void loadWorksheetGradeDocuments(grade).then(() => {
      if (outcome) {
        setSelectedWorksheetOutcome(outcome);
      }
    });
  }, [
    appliedWorksheetLinkRef,
    isWorksheetBrowser,
    loadWorksheetGradeDocuments,
    setSelectedWorksheetOutcome,
    worksheetGradeFromUrl,
    worksheetOutcomeFromUrl,
  ]);
  return {
    resetWorksheetHierarchy,
    loadWorksheetGradeDocuments,
    refreshSelectedWorksheetGrade,
    handleTypeChange,
    updateWorksheetBrowserUrl,
  };
}
