import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import { createLogger } from '@/lib/logger';

import type {
  ContentGradeFilter,
  ContentQuickFilter,
  ContentSortOrder,
} from '@/features/content/types';

import { WORKSHEET_GRADE_OPTIONS } from '@/features/content/worksheet-display';

import type { ContentDocument, GradeValue } from '@/types';
export const log = createLogger('contents-page');

export type WorksheetGradeSelection = number | 'Mezun';

export const parseWorksheetGradeParam = (
  value?: string | null,
): WorksheetGradeSelection | null => {
  if (!value) {
    return null;
  }

  if (value.toLocaleLowerCase('tr') === 'mezun') {
    return 'Mezun';
  }

  const grade = Number(value);

  return WORKSHEET_GRADE_OPTIONS.some((option) => option === grade)
    ? grade
    : null;
};

export const WORKSHEET_GRADE_CARD_STYLES: Record<
  WorksheetGradeSelection,
  {
    border: string;
    folder: string;
    surface: string;
  }
> = {
  5: {
    border: 'border-tone-success-border hover:border-tone-success-border',
    folder: 'from-tone-success-bg to-tone-success-bg',
    surface: 'bg-tone-success-bg hover:bg-tone-success-bg',
  },
  6: {
    border: 'border-tone-info-border hover:border-tone-info-border',
    folder: 'from-tone-info-bg to-tone-info-bg',
    surface: 'bg-tone-info-bg hover:bg-tone-info-bg',
  },
  7: {
    border: 'border-tone-info-border hover:border-tone-info-border',
    folder: 'from-tone-info-bg to-tone-info-bg',
    surface: 'bg-tone-info-bg hover:bg-tone-info-bg',
  },
  8: {
    border: 'border-tone-danger-border hover:border-tone-danger-border',
    folder: 'from-tone-danger-bg to-tone-danger-bg',
    surface: 'bg-tone-danger-bg hover:bg-tone-danger-bg',
  },
  9: {
    border: 'border-tone-warn-border hover:border-tone-warn-border',
    folder: 'from-tone-warn-bg to-tone-warn-bg',
    surface: 'bg-tone-warn-bg hover:bg-tone-warn-bg',
  },
  10: {
    border: 'border-tone-success-border hover:border-tone-success-border',
    folder: 'from-tone-success-bg to-tone-success-bg',
    surface: 'bg-tone-success-bg hover:bg-tone-success-bg',
  },
  11: {
    border: 'border-tone-info-border hover:border-tone-info-border',
    folder: 'from-tone-info-bg to-tone-info-bg',
    surface: 'bg-tone-info-bg hover:bg-tone-info-bg',
  },
  12: {
    border: 'border-tone-danger-border hover:border-tone-danger-border',
    folder: 'from-tone-danger-bg to-tone-danger-bg',
    surface: 'bg-tone-danger-bg hover:bg-tone-danger-bg',
  },
  Mezun: {
    border: 'border-border-default hover:border-border-default',
    folder: 'from-surface-2 to-surface-2',
    surface: 'bg-surface-3/10 hover:bg-surface-3/15',
  },
};

export const splitWorksheetOutcomeHeading = (outcome: string) => {
  const match = outcome.match(/^([A-Z]+\.[0-9]+(?:\.[0-9]+)+\.?)\s*(.*)$/i);

  if (!match) {
    return {
      code: '',
      label: outcome,
    };
  }

  return {
    code: match[1] || '',
    label: match[2] || '',
  };
};

export const getWorksheetOutcomeColorClass = (code: string) => {
  const parts = code.split('.').filter(Boolean);
  const unit = parts[2];
  switch (unit) {
    case '1':
      return 'bg-tone-info-bg text-tone-info-fg border-tone-info-border dark:bg-tone-info-bg dark:text-tone-info-fg dark:border-tone-info-border';
    case '2':
      return 'bg-tone-info-bg text-tone-info-fg border-tone-info-border dark:bg-tone-info-bg dark:text-tone-info-fg dark:border-tone-info-border';
    case '3':
      return 'bg-tone-success-bg text-tone-success-fg border-tone-success-border dark:bg-tone-success-bg dark:text-tone-success-fg dark:border-tone-success-border';
    case '4':
      return 'bg-tone-warn-bg text-tone-warn-fg border-tone-warn-border dark:bg-tone-warn-bg dark:text-tone-warn-fg dark:border-tone-warn-border';
    case '5':
      return 'bg-tone-danger-bg text-tone-danger-fg border-tone-danger-border dark:bg-tone-danger-bg dark:text-tone-danger-fg dark:border-tone-danger-border';
    case '6':
      return 'bg-tone-success-bg text-tone-success-fg border-tone-success-border dark:bg-tone-success-bg dark:text-tone-success-fg dark:border-tone-success-border';
    default:
      return 'bg-tone-info-bg text-tone-info-fg border-tone-info-border dark:bg-tone-info-bg dark:text-tone-info-fg dark:border-tone-info-border';
  }
};

export const SUPPORTED_WORKSHEET_QUICK_ADD_GRADES: readonly number[] = [
  5, 6, 7, 8,
];

export const normalizeWorksheetQuickAddGrade = (grade?: GradeValue | null) =>
  typeof grade === 'number' &&
  SUPPORTED_WORKSHEET_QUICK_ADD_GRADES.includes(grade)
    ? grade
    : SUPPORTED_WORKSHEET_QUICK_ADD_GRADES[0];

export type ContentsPageProps = {
  initialDocuments?: ContentDocument[];
  initialLoadSucceeded?: boolean;
  initialGrade?: ContentGradeFilter;
  initialTotalCount?: number;
  initialType?: string;
};

export const EMPTY_CONTENT_DOCUMENTS: ContentDocument[] = [];

export const buildContentFeedFilterKey = ({
  grade,
  type,
  quickFilter,
  searchTerm,
  sortBy,
}: {
  grade: ContentGradeFilter;
  type: string;
  quickFilter: ContentQuickFilter;
  searchTerm: string;
  sortBy: ContentSortOrder;
}) => {
  const serverQuickFilter =
    quickFilter === 'with_solution' || quickFilter === 'with_video'
      ? quickFilter
      : 'all';
  return `${String(grade)}:${type}:${serverQuickFilter}:${searchTerm.trim()}:${sortBy}`;
};

export function ContentUrlFilters({
  onChange,
}: {
  onChange: (params: URLSearchParams) => void;
}) {
  const searchParams = useSearchParams();
  useEffect(() => {
    onChange(new URLSearchParams(searchParams.toString()));
  }, [onChange, searchParams]);
  return null;
}
