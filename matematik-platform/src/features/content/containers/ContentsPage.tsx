'use client';

import type { ContentDocument } from '@/types';

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';

import { useToast } from '@/components/Toast';
import RouteLoadingShell from '@/components/RouteLoadingShell';
import { CONTENT_TYPE_MAPPING } from '@/features/content/constants';
import { type ContentViewMode } from '@/features/content/components/ContentFilterBar';
import { useContentCompletion } from '@/features/content/hooks/useContentCompletion';
import { useCloudFavorites } from '@/features/content/hooks/useCloudFavorites';

import type {
  ContentComment,
  ContentFormState,
  ContentGradeFilter,
  ContentPageUser,
  ContentQuickFilter,
  ContentSortOrder,
} from '@/features/content/types';

import { isWorksheetType } from '@/features/content/worksheet-display';
import {
  WORKSHEET_OUTCOME_CATALOG,
  type WorksheetCatalogItem,
} from '@/features/content/worksheet-catalog';

import {
  WorksheetGradeSelection,
  ContentsPageProps,
  EMPTY_CONTENT_DOCUMENTS,
  buildContentFeedFilterKey,
  parseWorksheetGradeParam,
} from './ContentsPage/helpers';
import { useContentDocumentState } from './ContentsPage/useContentDocumentState';
import { useContentFeed } from './ContentsPage/useContentFeed';
import { useWorksheetNavigation } from './ContentsPage/useWorksheetNavigation';
import { useContentPreview } from './ContentsPage/useContentPreview';
import { useContentInteractions } from './ContentsPage/useContentInteractions';
import { useContentQuickAdd } from './ContentsPage/useContentQuickAdd';
import { useContentEditing } from './ContentsPage/useContentEditing';
import { getContentResults } from './ContentsPage/getContentResults';
import { ContentsView } from './ContentsPage/ContentsView';

function ContentsPageInner({
  initialDocuments = EMPTY_CONTENT_DOCUMENTS,
  initialLoadSucceeded = true,
  initialGrade = 'all',
  initialTotalCount = 0,
  initialType = 'all',
}: ContentsPageProps) {
  const [searchParams, setSearchParams] = useState(() => new URLSearchParams());
  const handleUrlFiltersChange = useCallback(
    (action: React.SetStateAction<URLSearchParams>) => {
      setSearchParams((prev) => {
        const nextParams = typeof action === 'function' ? action(prev) : action;
        return prev.toString() === nextParams.toString() ? prev : nextParams;
      });
    },
    [],
  );
  const { showToast } = useToast();
  const rawTypeFromUrl =
    searchParams.get('type') || searchParams.get('category');
  const typeFromUrl = rawTypeFromUrl
    ? CONTENT_TYPE_MAPPING[rawTypeFromUrl] || rawTypeFromUrl
    : initialType;
  const worksheetGradeFromUrl = searchParams.get('grade');
  const worksheetOutcomeFromUrl = searchParams.get('outcome');
  const searchFromUrl = searchParams.get('q') || '';
  const [user, setUser] = useState<ContentPageUser | null>(null);
  const [documents, setDocuments] =
    useState<ContentDocument[]>(initialDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    setSearchTerm(searchFromUrl);
  }, [searchFromUrl]);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<ContentSortOrder>('newest');
  const [worksheetSortBy, setWorksheetSortBy] =
    useState<ContentSortOrder>('curriculum');
  const [quickFilter, setQuickFilter] = useState<ContentQuickFilter>('all');
  const [selectedGrade, setSelectedGrade] =
    useState<ContentGradeFilter>(initialGrade);
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [viewMode, setViewMode] = useState<ContentViewMode>('grid');
  const [likedDocs, setLikedDocs] = useState<Set<string>>(new Set());
  const { isFavorite, toggleFavorite } = useCloudFavorites(user?.id);
  const {
    completedDocIds: _completedDocIds,
    isCompleted,
    toggleCompleted,
  } = useContentCompletion(user?.id);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const [showComments, setShowComments] = useState<string | null>(null);
  const [comments, setComments] = useState<ContentComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<ContentFormState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<ContentDocument | null>(null);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [editDoc, setEditDoc] = useState<ContentDocument | null>(null);
  const [editFormData, setEditFormData] = useState<ContentFormState>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [contentLoadError, setContentLoadError] = useState<string | null>(null);
  const [worksheetDocuments, setWorksheetDocuments] = useState<
    ContentDocument[]
  >([]);
  const [worksheetOutcomeCatalog, setWorksheetOutcomeCatalog] = useState<
    Record<number, WorksheetCatalogItem[]>
  >(WORKSHEET_OUTCOME_CATALOG);
  const initialWorksheetGrade = isWorksheetType(initialType)
    ? parseWorksheetGradeParam(
        initialGrade === 'all' ? null : String(initialGrade),
      )
    : null;
  const [worksheetCatalogLoading, setWorksheetCatalogLoading] = useState(false);
  const [worksheetLoading, setWorksheetLoading] = useState(
    Boolean(initialWorksheetGrade),
  );
  const [selectedWorksheetGrade, setSelectedWorksheetGrade] =
    useState<WorksheetGradeSelection | null>(initialWorksheetGrade);
  const [selectedWorksheetOutcome, setSelectedWorksheetOutcome] = useState<
    string | null
  >(null);
  const [loadedFeedKey, setLoadedFeedKey] = useState<string>(() =>
    initialLoadSucceeded && !isWorksheetType(initialType)
      ? buildContentFeedFilterKey({
          grade: initialGrade,
          type: initialType,
          quickFilter: 'all',
          searchTerm: '',
          sortBy: 'newest',
        })
      : '',
  );
  const [hasMore, setHasMore] = useState(
    initialDocuments.length < initialTotalCount,
  );
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [deleteCandidate, setDeleteCandidate] =
    useState<ContentDocument | null>(null);
  const [deleting, setDeleting] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const loadRequestIdRef = useRef(0);
  const worksheetRequestIdRef = useRef(0);
  const appliedWorksheetLinkRef = useRef<string | null>(null);
  const isWorksheetBrowser = isWorksheetType(selectedType);

  const {
    ensureWorksheetOutcomeCatalog,
    applyDocumentPatch,
    removeDocumentFromState,
  } = useContentDocumentState({
    worksheetOutcomeCatalog,
    setWorksheetCatalogLoading,
    setWorksheetOutcomeCatalog,
    setDocuments,
    setWorksheetDocuments,
    setPreviewDoc,
    setEditDoc,
  });

  const { loadDocuments } = useContentFeed({
    loadRequestIdRef,
    setLoading,
    setContentLoadError,
    setDocuments,
    setHasMore,
    setTotalCount,
    setLoadedFeedKey,
    initialLoadSucceeded,
    initialGrade,
    initialType,
    initialTotalCount,
    initialDocuments,
    worksheetGradeFromUrl,
    setSelectedGrade,
    typeFromUrl,
    selectedType,
    setSelectedType,
    isWorksheetBrowser,
    quickFilter,
    debouncedSearch,
    sortBy,
    selectedGrade,
    setPage,
    hasMore,
    loading,
    page,
    loadMoreRef,
    setUser,
  });

  const {
    resetWorksheetHierarchy,
    loadWorksheetGradeDocuments,
    refreshSelectedWorksheetGrade,
    handleTypeChange,
    updateWorksheetBrowserUrl,
  } = useWorksheetNavigation({
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
  });

  const handledRequestedDocIdRef = useRef<string | null>(null);
  // Önizlemenin geçmiş yönetimi tek noktadan yürür: URL tek doğruluk kaynağıdır.
  // `previewHistoryRef` bizim pushState ile eklediğimiz kaydın doc id'sini tutar;
  // `previewUrlSyncedRef` ise `?id=` parametresinin router'a yansıdığını doğrular.
  // İkincisi olmadan, açılış ile useSearchParams güncellemesi arasındaki boşlukta
  // "URL'de id yok" görünüp modal daha açılır açılmaz kapanırdı.
  const previewHistoryRef = useRef<string | null>(null);
  const previewUrlSyncedRef = useRef(false);
  const previewDocRef = useRef<ContentDocument | null>(null);

  const { handleOpenPreview, handleClosePreview } = useContentPreview({
    previewDocRef,
    previewDoc,
    setShowAnswerKey,
    handledRequestedDocIdRef,
    setPreviewDoc,
    applyDocumentPatch,
    user,
    previewHistoryRef,
    previewUrlSyncedRef,
    searchParams,
    documents,
    worksheetDocuments,
  });

  const {
    handleDownloadDocument,
    handleToggleLike,
    handleOpenComments,
    handleCloseComments,
    handleCommentSubmit,
  } = useContentInteractions({
    applyDocumentPatch,
    setPreviewDoc,
    user,
    likedDocs,
    setLikedDocs,
    setShowComments,
    setNewComment,
    setComments,
    newComment,
    showComments,
    documents,
    worksheetDocuments,
  });

  const {
    handleQuickAddOpen,
    handleQuickAddChange,
    handleQuickAddFileUpload,
    handleQuickAddSubmit,
  } = useContentQuickAdd({
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
  });

  const {
    handleOpenEdit,
    handleEditChange,
    handleEditFileUpload,
    handleEditSubmit,
    handleDeleteDocument,
    confirmDeleteDocument,
  } = useContentEditing({
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
  });

  const {
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
  } = getContentResults({
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
  });

  const currentFeedKey = buildContentFeedFilterKey({
    grade: selectedGrade,
    type: selectedType,
    quickFilter,
    searchTerm: debouncedSearch,
    sortBy,
  });
  const isFeedSwitching =
    !isWorksheetBrowser &&
    !contentLoadError &&
    currentFeedKey !== loadedFeedKey;

  return (
    <ContentsView
      setSearchParams={handleUrlFiltersChange}
      isFeedSwitching={isFeedSwitching}
      profileHref={profileHref}
      user={user}
      selectedType={selectedType}
      selectedGrade={selectedGrade}
      handleQuickAddOpen={handleQuickAddOpen}
      contentLoadError={contentLoadError}
      isWorksheetBrowser={isWorksheetBrowser}
      selectedWorksheetGrade={selectedWorksheetGrade}
      loadWorksheetGradeDocuments={loadWorksheetGradeDocuments}
      loadDocuments={loadDocuments}
      quickFilter={quickFilter}
      debouncedSearch={debouncedSearch}
      sortBy={sortBy}
      setSearchTerm={setSearchTerm}
      setQuickFilter={setQuickFilter}
      setWorksheetSortBy={setWorksheetSortBy}
      setSortBy={setSortBy}
      setViewMode={setViewMode}
      searchPlaceholder={searchPlaceholder}
      searchTerm={searchTerm}
      worksheetSortBy={worksheetSortBy}
      activeTotalResults={activeTotalResults}
      viewMode={viewMode}
      resetWorksheetHierarchy={resetWorksheetHierarchy}
      updateWorksheetBrowserUrl={updateWorksheetBrowserUrl}
      setSelectedGrade={setSelectedGrade}
      handleTypeChange={handleTypeChange}
      worksheetGradeLabel={worksheetGradeLabel}
      setSelectedWorksheetOutcome={setSelectedWorksheetOutcome}
      selectedWorksheetOutcome={selectedWorksheetOutcome}
      loading={loading}
      worksheetLoading={worksheetLoading}
      worksheetCatalogLoading={worksheetCatalogLoading}
      resultLabel={resultLabel}
      filteredWorksheetGrades={filteredWorksheetGrades}
      worksheetOutcomeEntries={worksheetOutcomeEntries}
      matchingWorksheetDocuments={matchingWorksheetDocuments}
      filteredWorksheetTests={filteredWorksheetTests}
      isCompleted={isCompleted}
      isFavorite={isFavorite}
      likedDocs={likedDocs}
      handleDeleteDocument={handleDeleteDocument}
      handleDownloadDocument={handleDownloadDocument}
      handleOpenEdit={handleOpenEdit}
      handleOpenComments={handleOpenComments}
      handleOpenPreview={handleOpenPreview}
      toggleCompleted={toggleCompleted}
      toggleFavorite={toggleFavorite}
      handleToggleLike={handleToggleLike}
      documents={documents}
      filteredContents={filteredContents}
      hasMore={hasMore}
      totalCount={totalCount}
      loadMoreRef={loadMoreRef}
      previewDoc={previewDoc}
      handleClosePreview={handleClosePreview}
      setShowAnswerKey={setShowAnswerKey}
      showAnswerKey={showAnswerKey}
      editDoc={editDoc}
      editFormData={editFormData}
      editSuccess={editSuccess}
      isEditing={isEditing}
      handleEditChange={handleEditChange}
      setEditDoc={setEditDoc}
      setEditSuccess={setEditSuccess}
      handleEditFileUpload={handleEditFileUpload}
      handleEditSubmit={handleEditSubmit}
      showModal={showModal}
      formData={formData}
      isSubmitting={isSubmitting}
      handleQuickAddChange={handleQuickAddChange}
      setShowModal={setShowModal}
      setSuccess={setSuccess}
      handleQuickAddFileUpload={handleQuickAddFileUpload}
      handleQuickAddSubmit={handleQuickAddSubmit}
      success={success}
      showComments={showComments}
      comments={comments}
      newComment={newComment}
      handleCloseComments={handleCloseComments}
      setNewComment={setNewComment}
      handleCommentSubmit={handleCommentSubmit}
      deleteCandidate={deleteCandidate}
      deleting={deleting}
      setDeleteCandidate={setDeleteCandidate}
      confirmDeleteDocument={confirmDeleteDocument}
    />
  );
}

export default function ContentsPage(props: ContentsPageProps) {
  return (
    <Suspense fallback={<RouteLoadingShell />}>
      <ContentsPageInner {...props} />
    </Suspense>
  );
}
