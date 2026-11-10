import type { AppUser, Comment, ContentDocument } from '@/types';
import type { Dispatch, SetStateAction, RefObject } from 'react';
import { type ContentViewMode } from '@/features/content/components/ContentFilterBar';
import { useContentCompletion } from '@/features/content/hooks/useContentCompletion';
import { useCloudFavorites } from '@/features/content/hooks/useCloudFavorites';
import type {
  ContentFormState,
  ContentGradeFilter,
  ContentQueryOptions,
  ContentQuickFilter,
  ContentSortOrder,
} from '@/features/content/types';
import { WorksheetGradeSelection } from './helpers';
export type ContentsViewProps = {
  setSearchParams: Dispatch<SetStateAction<URLSearchParams>>;
  profileHref: '/admin' | '/profil' | '/';
  user: AppUser | null;
  selectedType: string;
  selectedGrade: ContentGradeFilter;
  handleQuickAddOpen: () => void;
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
  worksheetGradeLabel: string | null;
  setSelectedWorksheetOutcome: Dispatch<SetStateAction<string | null>>;
  selectedWorksheetOutcome: string | null;
  loading: boolean;
  worksheetLoading: boolean;
  worksheetCatalogLoading: boolean;
  resultLabel: string;
  filteredWorksheetGrades: ('Mezun' | 12 | 5 | 6 | 7 | 8 | 9 | 10 | 11)[];
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
  matchingWorksheetDocuments: ContentDocument[];
  filteredWorksheetTests: ContentDocument[];
  isCompleted: ReturnType<typeof useContentCompletion>['isCompleted'];
  isFavorite: ReturnType<typeof useCloudFavorites>['isFavorite'];
  likedDocs: Set<string>;
  handleDeleteDocument: (content: ContentDocument) => void;
  handleDownloadDocument: (content: ContentDocument) => Promise<void>;
  handleOpenEdit: (content: ContentDocument) => void;
  handleOpenComments: (content: ContentDocument) => Promise<void>;
  handleOpenPreview: (content: ContentDocument) => void;
  toggleCompleted: ReturnType<typeof useContentCompletion>['toggleCompleted'];
  toggleFavorite: ReturnType<typeof useCloudFavorites>['toggleFavorite'];
  handleToggleLike: (content: ContentDocument) => Promise<void>;
  documents: ContentDocument[];
  filteredContents: ContentDocument[];
  hasMore: boolean;
  totalCount: number;
  loadMoreRef: RefObject<HTMLDivElement | null>;
  previewDoc: ContentDocument | null;
  handleClosePreview: () => void;
  setShowAnswerKey: Dispatch<SetStateAction<boolean>>;
  showAnswerKey: boolean;
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
  showModal: boolean;
  formData: ContentFormState;
  isSubmitting: boolean;
  handleQuickAddChange: (nextValue: Partial<ContentFormState>) => void;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  setSuccess: Dispatch<SetStateAction<boolean>>;
  handleQuickAddFileUpload: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => Promise<void>;
  handleQuickAddSubmit: (
    event: React.FormEvent<HTMLFormElement>,
  ) => Promise<void>;
  success: boolean;
  showComments: string | null;
  comments: Comment[];
  newComment: string;
  handleCloseComments: () => void;
  setNewComment: Dispatch<SetStateAction<string>>;
  handleCommentSubmit: (
    event: React.FormEvent<HTMLFormElement>,
  ) => Promise<void>;
  deleteCandidate: ContentDocument | null;
  deleting: boolean;
  setDeleteCandidate: Dispatch<SetStateAction<ContentDocument | null>>;
  confirmDeleteDocument: () => Promise<void>;
};
