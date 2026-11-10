import type { Dispatch, SetStateAction } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

import type { ContentSortOrder } from '@/features/content/types';

import { WorksheetGradeSelection } from './helpers';

type WorksheetBreadcrumbsProps = {
  resetWorksheetHierarchy: () => void;
  updateWorksheetBrowserUrl: (
    grade: WorksheetGradeSelection | null,
    outcome?: string | null,
  ) => void;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  selectedWorksheetGrade: WorksheetGradeSelection | null;
  worksheetGradeLabel: string | null;
  setSelectedWorksheetOutcome: Dispatch<SetStateAction<string | null>>;
  selectedWorksheetOutcome: string | null;
  setWorksheetSortBy: Dispatch<SetStateAction<ContentSortOrder>>;
  worksheetSortBy: ContentSortOrder;
};

export function WorksheetBreadcrumbs({
  resetWorksheetHierarchy,
  updateWorksheetBrowserUrl,
  setSearchTerm,
  selectedWorksheetGrade,
  worksheetGradeLabel,
  setSelectedWorksheetOutcome,
  selectedWorksheetOutcome,
  setWorksheetSortBy,
  worksheetSortBy,
}: WorksheetBreadcrumbsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-secondary"
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            resetWorksheetHierarchy();
            updateWorksheetBrowserUrl(null);
            setSearchTerm('');
          }}
          className={`rounded-full border px-4 py-2 transition-colors ${
            selectedWorksheetGrade
              ? 'border-border-default dark:border-border-default bg-surface-2 text-secondary hover:text-primary'
              : 'border-accent-fg dark:border-accent-fg bg-accent-bg text-tone-success-fg dark:text-accent-fg'
          }`}
        >
          Sınıf Düzeyleri
        </button>
        {worksheetGradeLabel && (
          <>
            <ChevronRight className="w-4 h-4 text-secondary" />
            <button
              onClick={() => {
                setSelectedWorksheetOutcome(null);
                updateWorksheetBrowserUrl(selectedWorksheetGrade);
              }}
              className={`rounded-full border px-4 py-2 transition-colors ${
                selectedWorksheetOutcome
                  ? 'border-border-default dark:border-border-default bg-surface-2 text-secondary hover:text-primary'
                  : 'border-accent-fg dark:border-accent-fg bg-accent-bg text-tone-success-fg dark:text-accent-fg'
              }`}
            >
              {worksheetGradeLabel}
            </button>
          </>
        )}
        {selectedWorksheetOutcome && (
          <>
            <ChevronRight className="w-4 h-4 text-secondary" />
            <span className="rounded-full border border-tone-info-border bg-tone-info-bg px-4 py-2 text-tone-info-fg dark:text-tone-info-fg">
              {selectedWorksheetOutcome}
            </span>
          </>
        )}
      </div>

      {selectedWorksheetGrade && (
        <div
          role="group"
          aria-label="Yaprak test listeleme sırası"
          className="inline-flex items-center rounded-2xl border border-border-default bg-surface-1 p-1 shadow-xs"
        >
          <button
            type="button"
            onClick={() => setWorksheetSortBy('curriculum')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              worksheetSortBy === 'curriculum'
                ? 'bg-accent-bg text-primary dark:text-primary shadow-xs'
                : 'text-secondary hover:text-primary'
            }`}
          >
            Konu Sırasına Göre
          </button>
          <button
            type="button"
            onClick={() => setWorksheetSortBy('newest')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              worksheetSortBy === 'newest'
                ? 'bg-accent-bg text-primary dark:text-primary shadow-xs'
                : 'text-secondary hover:text-primary'
            }`}
          >
            Tarih Sırasına Göre (En Yeni)
          </button>
        </div>
      )}
    </motion.div>
  );
}
