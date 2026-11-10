import type { Dispatch, SetStateAction } from 'react';
import { startTransition } from 'react';

import { ContentCategoryChips } from '@/features/content/components/ContentCategoryChips';

import ContentFilterBar, {
  type ContentViewMode,
} from '@/features/content/components/ContentFilterBar';

import type {
  ContentGradeFilter,
  ContentQueryOptions,
  ContentQuickFilter,
  ContentSortOrder,
} from '@/features/content/types';

import { WorksheetGradeSelection } from './helpers';

type ContentFiltersProps = {
  contentLoadError: string | null;
  isWorksheetBrowser: boolean;
  selectedWorksheetGrade: WorksheetGradeSelection | null;
  loadWorksheetGradeDocuments: (
    grade: WorksheetGradeSelection,
    preserveOutcome?: boolean,
  ) => Promise<void>;
  loadDocuments: (
    pageNum?: number,
    append?: boolean,
    gradeFilter?: ContentGradeFilter,
    typeFilter?: string,
    options?: ContentQueryOptions,
  ) => Promise<void>;
  selectedGrade: ContentGradeFilter;
  selectedType: string;
  quickFilter: ContentQuickFilter;
  debouncedSearch: string;
  sortBy: ContentSortOrder;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  setQuickFilter: Dispatch<SetStateAction<ContentQuickFilter>>;
  setWorksheetSortBy: Dispatch<SetStateAction<ContentSortOrder>>;
  setSortBy: Dispatch<SetStateAction<ContentSortOrder>>;
  setViewMode: Dispatch<SetStateAction<ContentViewMode>>;
  searchPlaceholder:
    | 'Test veya içerik ara...'
    | 'Sınıf düzeyi ara...'
    | 'İçerik ara...';
  searchTerm: string;
  worksheetSortBy: ContentSortOrder;
  activeTotalResults: number;
  viewMode: ContentViewMode;
  resetWorksheetHierarchy: () => void;
  updateWorksheetBrowserUrl: (
    grade: WorksheetGradeSelection | null,
    outcome?: string | null,
  ) => void;
  setSelectedGrade: Dispatch<SetStateAction<ContentGradeFilter>>;
  handleTypeChange: (type: string) => void;
};

export function ContentFilters({
  contentLoadError,
  isWorksheetBrowser,
  selectedWorksheetGrade,
  loadWorksheetGradeDocuments,
  loadDocuments,
  selectedGrade,
  selectedType,
  quickFilter,
  debouncedSearch,
  sortBy,
  setSearchTerm,
  setQuickFilter,
  setWorksheetSortBy,
  setSortBy,
  setViewMode,
  searchPlaceholder,
  searchTerm,
  worksheetSortBy,
  activeTotalResults,
  viewMode,
  resetWorksheetHierarchy,
  updateWorksheetBrowserUrl,
  setSelectedGrade,
  handleTypeChange,
}: ContentFiltersProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl p-5 sm:p-7 mb-8 border border-sky-200/75 dark:border-sky-400/20 bg-surface-1/75 shadow-[0_18px_46px_-18px_rgba(14,116,144,0.16),inset_0_1px_0_rgba(255,255,255,0.88)] dark:shadow-[0_22px_52px_-18px_rgba(2,6,23,0.7),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl">
      {/* Top prismatic refraction */}
      <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500" />

      {contentLoadError && (
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <p role="alert" className="text-sm text-tone-danger-fg">
            {contentLoadError}
          </p>
          <button
            type="button"
            className="text-sm font-semibold text-primary underline"
            onClick={() => {
              if (isWorksheetBrowser && selectedWorksheetGrade !== null) {
                void loadWorksheetGradeDocuments(selectedWorksheetGrade, true);
              } else {
                void loadDocuments(1, false, selectedGrade, selectedType, {
                  onlySolution: quickFilter === 'with_solution',
                  onlyVideo: quickFilter === 'with_video',
                  searchTerm: debouncedSearch,
                  sortBy,
                });
              }
            }}
          >
            Yeniden dene
          </button>
        </div>
      )}
      <ContentFilterBar
        isWorksheetBrowser={isWorksheetBrowser}
        onClearSearch={() => setSearchTerm('')}
        onQuickFilterChange={setQuickFilter}
        onSearchChange={setSearchTerm}
        onSortChange={isWorksheetBrowser ? setWorksheetSortBy : setSortBy}
        onViewModeChange={setViewMode}
        quickFilter={quickFilter}
        searchPlaceholder={searchPlaceholder}
        searchTerm={searchTerm}
        sortBy={isWorksheetBrowser ? worksheetSortBy : sortBy}
        totalResults={activeTotalResults}
        viewMode={viewMode}
      />

      <div className="mt-5 border-t border-border-default dark:border-border-default pt-4">
        <ContentCategoryChips
          selectedGrade={
            isWorksheetBrowser
              ? String(selectedWorksheetGrade ?? 'all')
              : String(selectedGrade)
          }
          selectedType={selectedType}
          onSelectGrade={(g) => {
            if (isWorksheetBrowser) {
              if (g === 'all') {
                resetWorksheetHierarchy();
                updateWorksheetBrowserUrl(null);
              } else {
                const nextGrade =
                  g === 'Mezun'
                    ? 'Mezun'
                    : (Number(g) as WorksheetGradeSelection);
                updateWorksheetBrowserUrl(nextGrade);
                void loadWorksheetGradeDocuments(nextGrade);
              }
              return;
            }
            startTransition(() => {
              if (g === 'all') setSelectedGrade('all');
              else if (g === 'Mezun') setSelectedGrade('Mezun');
              else setSelectedGrade(Number(g));
            });
          }}
          onSelectType={(t) => handleTypeChange(t)}
        />
      </div>
    </div>
  );
}
