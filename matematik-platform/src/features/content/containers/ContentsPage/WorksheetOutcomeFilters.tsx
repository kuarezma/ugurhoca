import type { ContentDocument } from '@/types';
import type { Dispatch, SetStateAction } from 'react';

import {
  WorksheetGradeSelection,
  splitWorksheetOutcomeHeading,
  getWorksheetOutcomeColorClass,
} from './helpers';

type WorksheetOutcomeFiltersProps = {
  setSelectedWorksheetOutcome: Dispatch<SetStateAction<string | null>>;
  updateWorksheetBrowserUrl: (
    grade: WorksheetGradeSelection | null,
    outcome?: string | null,
  ) => void;
  selectedWorksheetGrade: WorksheetGradeSelection;
  selectedWorksheetOutcome: string | null;
  matchingWorksheetDocuments: ContentDocument[];
  worksheetOutcomeEntries: {
    catalogItem: {
      index: number;
      code: string;
      full: string;
      label: string;
    } | null;
    count: number;
    documents: ContentDocument[];
    outcome: string;
  }[];
  searchTerm: string;
};

export function WorksheetOutcomeFilters({
  setSelectedWorksheetOutcome,
  updateWorksheetBrowserUrl,
  selectedWorksheetGrade,
  selectedWorksheetOutcome,
  matchingWorksheetDocuments,
  worksheetOutcomeEntries,
  searchTerm,
}: WorksheetOutcomeFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border-default bg-surface-1 p-3.5 sm:p-4 shadow-xs">
      <div className="flex w-full sm:w-auto items-center justify-start gap-2 pb-1 sm:pb-0">
        <span className="text-xs sm:text-sm font-bold text-secondary mr-1">
          Kazanım:
        </span>
        <button
          type="button"
          onClick={() => {
            setSelectedWorksheetOutcome(null);
            updateWorksheetBrowserUrl(selectedWorksheetGrade, null);
          }}
          className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all border ${
            !selectedWorksheetOutcome
              ? 'bg-accent-bg text-primary border-accent-fg shadow-xs'
              : 'bg-surface-2 text-secondary hover:text-primary border-border-default'
          }`}
        >
          Tüm İçerikler ({matchingWorksheetDocuments.length})
        </button>
      </div>
      {worksheetOutcomeEntries
        .filter(
          (entry) =>
            entry.count > 0 ||
            (searchTerm.trim() &&
              entry.outcome
                .toLowerCase()
                .includes(searchTerm.trim().toLowerCase())),
        )
        .map((entry) => {
          const isSelected = selectedWorksheetOutcome === entry.outcome;
          const heading = splitWorksheetOutcomeHeading(entry.outcome);
          const label = heading.label || entry.outcome;

          return (
            <button
              key={entry.outcome}
              type="button"
              onClick={() => {
                const nextOutcome = isSelected ? null : entry.outcome;
                setSelectedWorksheetOutcome(nextOutcome);
                updateWorksheetBrowserUrl(selectedWorksheetGrade, nextOutcome);
              }}
              className={`w-full sm:w-auto flex items-center justify-between gap-2.5 rounded-full px-3.5 py-2 sm:py-1.5 text-xs font-semibold transition-all border ${
                isSelected
                  ? 'bg-accent-bg border-accent-fg text-tone-success-fg dark:text-accent-fg shadow-xs font-bold'
                  : 'bg-surface-2 hover:bg-surface-3 border-border-default text-secondary hover:text-primary'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {heading.code ? (
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-black font-mono tracking-tight shrink-0 border ${getWorksheetOutcomeColorClass(
                      heading.code,
                    )}`}
                  >
                    {heading.code}
                  </span>
                ) : null}
                <span className="truncate min-w-0 flex-1 text-left sm:max-w-xs">
                  {label}
                </span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                  isSelected
                    ? 'bg-accent-bg text-primary'
                    : 'bg-surface-3 text-secondary'
                }`}
              >
                {entry.count}
              </span>
            </button>
          );
        })}
    </div>
  );
}
