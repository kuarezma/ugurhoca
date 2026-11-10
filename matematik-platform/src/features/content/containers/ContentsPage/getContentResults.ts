import type { AppUser, ContentDocument } from '@/types';

import { useContentCompletion } from '@/features/content/hooks/useContentCompletion';
import { useCloudFavorites } from '@/features/content/hooks/useCloudFavorites';

import type {
  ContentGradeFilter,
  ContentQuickFilter,
  ContentSortOrder,
} from '@/features/content/types';

import {
  resolveWorksheetOutcome,
  sortWorksheetDocuments,
  WORKSHEET_GRADE_OPTIONS,
} from '@/features/content/worksheet-display';
import {
  isCurriculumTopic,
  matchesCurriculumDocument,
} from '@/features/content/curriculum-coverage';
import { type WorksheetCatalogItem } from '@/features/content/worksheet-catalog';

import { WorksheetGradeSelection } from './helpers';

type GetContentResultsProps = {
  documents: ContentDocument[];
  quickFilter: ContentQuickFilter;
  isFavorite: ReturnType<typeof useCloudFavorites>['isFavorite'];
  isCompleted: ReturnType<typeof useContentCompletion>['isCompleted'];
  searchTerm: string;
  selectedGrade: ContentGradeFilter;
  selectedType: string;
  sortBy: ContentSortOrder;
  selectedWorksheetGrade: WorksheetGradeSelection | null;
  worksheetDocuments: ContentDocument[];
  worksheetOutcomeCatalog: Record<number, WorksheetCatalogItem[]>;
  worksheetSortBy: ContentSortOrder;
  selectedWorksheetOutcome: string | null;
  isWorksheetBrowser: boolean;
  user: AppUser | null;
};

export function getContentResults({
  documents,
  quickFilter,
  isFavorite,
  isCompleted,
  searchTerm,
  selectedGrade,
  selectedType,
  sortBy,
  selectedWorksheetGrade,
  worksheetDocuments,
  worksheetOutcomeCatalog,
  worksheetSortBy,
  selectedWorksheetOutcome,
  isWorksheetBrowser,
  user,
}: GetContentResultsProps) {
  const rawFilteredContents = documents.filter((content) => {
    if (quickFilter === 'favorites' && !isFavorite(content.id)) {
      return false;
    }
    if (quickFilter === 'completed' && !isCompleted(content.id)) {
      return false;
    }
    if (
      quickFilter === 'with_solution' &&
      !content.solution_url &&
      !content.answer_key_text
    ) {
      return false;
    }
    if (
      quickFilter === 'with_video' &&
      !content.video_url &&
      content.type !== 'ders-videolari'
    ) {
      return false;
    }
    if (!searchTerm.trim()) return true;
    if (
      typeof selectedGrade === 'number' &&
      isCurriculumTopic(selectedGrade, searchTerm.trim()) &&
      (selectedType === 'ders-notlari' || selectedType === 'yaprak-test')
    ) {
      return matchesCurriculumDocument(
        content,
        selectedGrade,
        searchTerm.trim(),
        selectedType,
      );
    }
    const term = searchTerm.toLowerCase();
    return (
      Boolean(content.title && content.title.toLowerCase().includes(term)) ||
      Boolean(
        content.description && content.description.toLowerCase().includes(term),
      )
    );
  });

  const filteredContents =
    sortBy === 'curriculum'
      ? sortWorksheetDocuments(rawFilteredContents, 'curriculum')
      : rawFilteredContents;

  const filteredWorksheetGrades = WORKSHEET_GRADE_OPTIONS.filter((grade) => {
    if (!searchTerm.trim()) {
      return true;
    }

    const label = grade === 'Mezun' ? 'mezun' : `${grade}. sınıf`;
    return label.toLowerCase().includes(searchTerm.trim().toLowerCase());
  });

  const curriculumWorksheetTopic =
    typeof selectedWorksheetGrade === 'number' &&
    isCurriculumTopic(selectedWorksheetGrade, searchTerm.trim())
      ? searchTerm.trim()
      : null;
  const matchingWorksheetDocuments =
    curriculumWorksheetTopic && typeof selectedWorksheetGrade === 'number'
      ? worksheetDocuments.filter((document) =>
          matchesCurriculumDocument(
            document,
            selectedWorksheetGrade,
            curriculumWorksheetTopic,
            'yaprak-test',
          ),
        )
      : worksheetDocuments;
  const worksheetDocumentGroups = matchingWorksheetDocuments.reduce<
    Record<string, ContentDocument[]>
  >((groups, document) => {
    const outcome = resolveWorksheetOutcome({
      ...document,
      grade:
        document.grade ||
        (typeof selectedWorksheetGrade === 'number'
          ? [selectedWorksheetGrade]
          : null),
    });
    groups[outcome] = [...(groups[outcome] || []), document];
    return groups;
  }, {});

  const worksheetCatalogOutcomes =
    selectedWorksheetGrade && typeof selectedWorksheetGrade === 'number'
      ? worksheetOutcomeCatalog[selectedWorksheetGrade] || []
      : [];
  const worksheetCatalogOutcomeMap = new Map(
    worksheetCatalogOutcomes.map((item, index) => [
      item.full,
      { ...item, index },
    ]),
  );

  const worksheetOutcomeEntries = Array.from(
    new Set([
      ...worksheetCatalogOutcomes.map((item) => item.full),
      ...Object.keys(worksheetDocumentGroups),
    ]),
  )
    .map((outcome) => ({
      catalogItem: worksheetCatalogOutcomeMap.get(outcome) || null,
      count: worksheetDocumentGroups[outcome]?.length || 0,
      documents: sortWorksheetDocuments(
        worksheetDocumentGroups[outcome] || [],
        worksheetSortBy,
      ),
      outcome,
    }))
    .filter(({ outcome, count }) =>
      curriculumWorksheetTopic
        ? count > 0
        : searchTerm.trim()
          ? outcome.toLowerCase().includes(searchTerm.trim().toLowerCase())
          : true,
    )
    .sort((left, right) => {
      if (left.catalogItem && right.catalogItem) {
        return left.catalogItem.index - right.catalogItem.index;
      }

      if (left.catalogItem || right.catalogItem) {
        return left.catalogItem ? -1 : 1;
      }

      return left.outcome.localeCompare(right.outcome, 'tr');
    });

  const filteredWorksheetTests = sortWorksheetDocuments(
    matchingWorksheetDocuments.filter((document) => {
      if (quickFilter === 'favorites' && !isFavorite(document.id)) {
        return false;
      }
      if (quickFilter === 'completed' && !isCompleted(document.id)) {
        return false;
      }
      if (
        quickFilter === 'with_solution' &&
        !document.solution_url &&
        !document.answer_key_text
      ) {
        return false;
      }
      if (
        quickFilter === 'with_video' &&
        !document.video_url &&
        document.type !== 'ders-videolari'
      ) {
        return false;
      }

      if (selectedWorksheetOutcome) {
        const docOutcome = resolveWorksheetOutcome({
          ...document,
          grade:
            document.grade ||
            (typeof selectedWorksheetGrade === 'number'
              ? [selectedWorksheetGrade]
              : null),
        });

        if (docOutcome !== selectedWorksheetOutcome) {
          return false;
        }
      }

      if (!searchTerm.trim() || curriculumWorksheetTopic) {
        return true;
      }

      const term = searchTerm.trim().toLowerCase();
      return (
        document.title.toLowerCase().includes(term) ||
        Boolean(
          document.description &&
          document.description.toLowerCase().includes(term),
        )
      );
    }),
    worksheetSortBy,
  );

  const searchPlaceholder = isWorksheetBrowser
    ? selectedWorksheetGrade
      ? 'Test veya içerik ara...'
      : 'Sınıf düzeyi ara...'
    : 'İçerik ara...';

  const resultLabel = isWorksheetBrowser
    ? selectedWorksheetGrade
      ? `${filteredWorksheetTests.length} içerik bulundu`
      : `${filteredWorksheetGrades.length} sınıf düzeyi bulundu`
    : `${filteredContents.length} içerik bulundu`;

  const activeTotalResults = isWorksheetBrowser
    ? selectedWorksheetGrade
      ? filteredWorksheetTests.length
      : filteredWorksheetGrades.length
    : filteredContents.length;

  const worksheetGradeLabel =
    selectedWorksheetGrade === 'Mezun'
      ? 'Mezun'
      : selectedWorksheetGrade
        ? `${selectedWorksheetGrade}. Sınıf`
        : null;

  const profileHref = user?.isAdmin ? '/admin' : user ? '/profil' : '/';
  return {
    filteredContents,
    filteredWorksheetGrades,
    matchingWorksheetDocuments,
    worksheetOutcomeEntries,
    filteredWorksheetTests,
    searchPlaceholder,
    resultLabel,
    activeTotalResults,
    worksheetGradeLabel,
    profileHref,
  } as const;
}
