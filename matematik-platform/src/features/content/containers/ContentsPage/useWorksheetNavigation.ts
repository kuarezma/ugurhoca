import type { ContentGradeFilter } from '@/features/content/types';
import type { ContentDocument } from '@/types';
import type { Dispatch, SetStateAction, RefObject } from 'react';
import { useEffect, useCallback, useRef, startTransition } from 'react';

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
  setSelectedGrade: Dispatch<SetStateAction<ContentGradeFilter>>;
  appliedWorksheetLinkRef: RefObject<string | null>;
  worksheetGradeFromUrl: string | null;
  worksheetOutcomeFromUrl: string | null;
  worksheetLoading: boolean;
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
  setSelectedGrade,
  appliedWorksheetLinkRef,
  worksheetGradeFromUrl,
  worksheetOutcomeFromUrl,
  worksheetLoading,
}: UseWorksheetNavigationProps) {
  const inFlightGradeRef = useRef<WorksheetGradeSelection | null>(null);
  const resetWorksheetHierarchy = useCallback(() => {
    worksheetRequestIdRef.current += 1;
    inFlightGradeRef.current = null;
    appliedWorksheetLinkRef.current = null;
    setContentLoadError(null);
    setSelectedWorksheetGrade(null);
    setSelectedWorksheetOutcome(null);
    setWorksheetDocuments([]);
    setWorksheetLoading(false);
  }, [
    appliedWorksheetLinkRef,
    setContentLoadError,
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
      inFlightGradeRef.current = grade;
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
          inFlightGradeRef.current = null;
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
        if (!isWorksheetType(type)) setSelectedGrade('all');
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
    [setSelectedGrade, setSelectedType],
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

    if (!grade) {
      resetWorksheetHierarchy();
      return;
    }
    if (appliedWorksheetLinkRef.current === linkKey) return;

    appliedWorksheetLinkRef.current = linkKey;
    // Kazanım geçmişinde aynı sınıfın verisini tekrar istemeyiz.
    if (
      selectedWorksheetGrade === grade &&
      (!worksheetLoading || inFlightGradeRef.current === grade)
    ) {
      setSelectedWorksheetOutcome(outcome || null);
      return;
    }
    const requestId = worksheetRequestIdRef.current + 1;
    void loadWorksheetGradeDocuments(grade).then(() => {
      if (
        requestId === worksheetRequestIdRef.current &&
        appliedWorksheetLinkRef.current === linkKey
      ) {
        setSelectedWorksheetOutcome(outcome || null);
      }
    });
  }, [
    appliedWorksheetLinkRef,
    isWorksheetBrowser,
    loadWorksheetGradeDocuments,
    resetWorksheetHierarchy,
    selectedWorksheetGrade,
    setSelectedWorksheetOutcome,
    worksheetGradeFromUrl,
    worksheetOutcomeFromUrl,
    worksheetLoading,
    worksheetRequestIdRef,
  ]);
  return {
    resetWorksheetHierarchy,
    loadWorksheetGradeDocuments,
    refreshSelectedWorksheetGrade,
    handleTypeChange,
    updateWorksheetBrowserUrl,
  };
}
