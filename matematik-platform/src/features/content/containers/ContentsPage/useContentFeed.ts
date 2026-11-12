import type { AppUser, ContentDocument } from '@/types';
import type { Dispatch, SetStateAction, RefObject } from 'react';
import { useEffect, useCallback, useRef } from 'react';

import { CONTENT_PAGE_SIZE } from '@/features/content/constants';

import {
  loadContentDocuments,
  resolveContentUser,
  seedContentDocumentCache,
} from '@/features/content/queries';
import type {
  ContentGradeFilter,
  ContentQueryOptions,
  ContentQuickFilter,
  ContentSortOrder,
} from '@/features/content/types';
import { normalizeContentGrade } from '@/features/content/utils';

type UseContentFeedProps = {
  loadRequestIdRef: RefObject<number>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setContentLoadError: Dispatch<SetStateAction<string | null>>;
  setDocuments: Dispatch<SetStateAction<ContentDocument[]>>;
  setHasMore: Dispatch<SetStateAction<boolean>>;
  setTotalCount: Dispatch<SetStateAction<number>>;
  initialLoadSucceeded: boolean;
  initialGrade: ContentGradeFilter;
  initialType: string;
  initialTotalCount: number;
  initialDocuments: ContentDocument[];
  worksheetGradeFromUrl: string | null;
  setSelectedGrade: Dispatch<SetStateAction<ContentGradeFilter>>;
  typeFromUrl: string;
  selectedType: string;
  setSelectedType: Dispatch<SetStateAction<string>>;
  isWorksheetBrowser: boolean;
  quickFilter: ContentQuickFilter;
  debouncedSearch: string;
  sortBy: ContentSortOrder;
  selectedGrade: ContentGradeFilter;
  setPage: Dispatch<SetStateAction<number>>;
  hasMore: boolean;
  loading: boolean;
  page: number;
  loadMoreRef: RefObject<HTMLDivElement | null>;
  setUser: Dispatch<SetStateAction<AppUser | null>>;
};

export function useContentFeed({
  loadRequestIdRef,
  setLoading,
  setContentLoadError,
  setDocuments,
  setHasMore,
  setTotalCount,
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
}: UseContentFeedProps) {
  const loadDocuments = useCallback(
    async (
      pageNum = 1,
      append = false,
      gradeFilter: ContentGradeFilter = 'all',
      typeFilter = 'all',
      options?: ContentQueryOptions,
    ) => {
      const requestId = ++loadRequestIdRef.current;
      setLoading(true);
      setContentLoadError(null);
      try {
        const { count, documents: nextDocuments } = await loadContentDocuments(
          pageNum,
          CONTENT_PAGE_SIZE,
          gradeFilter,
          typeFilter,
          options,
        );

        if (requestId !== loadRequestIdRef.current) {
          return;
        }

        if (nextDocuments.length > 0) {
          if (append) {
            setDocuments((current) => {
              const existingIds = new Set(
                current.map((document) => document.id),
              );
              const dedupedIncoming = nextDocuments.filter(
                (document) => !existingIds.has(document.id),
              );
              return [...current, ...dedupedIncoming];
            });
          } else {
            setDocuments(nextDocuments);
          }

          setHasMore(pageNum * CONTENT_PAGE_SIZE < count);
        } else if (!append) {
          setDocuments([]);
          setHasMore(false);
        } else {
          setHasMore(false);
        }

        setTotalCount(count);
      } catch {
        if (requestId === loadRequestIdRef.current)
          setContentLoadError('İçerikler yüklenemedi. Yeniden deneyin.');
      } finally {
        if (requestId === loadRequestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [
      loadRequestIdRef,
      setContentLoadError,
      setDocuments,
      setHasMore,
      setLoading,
      setTotalCount,
    ],
  );

  useEffect(() => {
    // Başarısız SSR sorgusu boş içerik olarak önbelleğe girmemeli.
    if (!initialLoadSucceeded) return;
    seedContentDocumentCache(1, CONTENT_PAGE_SIZE, initialGrade, initialType, {
      count: initialTotalCount,
      documents: initialDocuments,
    });
  }, [
    initialDocuments,
    initialGrade,
    initialLoadSucceeded,
    initialTotalCount,
    initialType,
  ]);

  const prevGradeFromUrlRef = useRef(worksheetGradeFromUrl);
  const prevTypeFromUrlRef = useRef(typeFromUrl);

  useEffect(() => {
    if (worksheetGradeFromUrl === prevGradeFromUrlRef.current) {
      return;
    }
    prevGradeFromUrlRef.current = worksheetGradeFromUrl;
    if (worksheetGradeFromUrl) {
      setSelectedGrade(normalizeContentGrade(worksheetGradeFromUrl));
    }
  }, [setSelectedGrade, worksheetGradeFromUrl]);

  useEffect(() => {
    if (typeFromUrl === prevTypeFromUrlRef.current) {
      return;
    }
    prevTypeFromUrlRef.current = typeFromUrl;
    setSelectedType(typeFromUrl);
  }, [setSelectedType, typeFromUrl]);

  useEffect(() => {
    if (isWorksheetBrowser) {
      setLoading(false);
      return;
    }

    const queryOptions: ContentQueryOptions = {
      onlySolution: quickFilter === 'with_solution',
      onlyVideo: quickFilter === 'with_video',
      searchTerm: debouncedSearch,
      sortBy,
    };

    const hasCustomFilters = Boolean(
      debouncedSearch.trim() ||
      sortBy !== 'newest' ||
      quickFilter === 'with_solution' ||
      quickFilter === 'with_video',
    );

    if (
      initialLoadSucceeded &&
      !hasCustomFilters &&
      selectedGrade === initialGrade &&
      selectedType === initialType
    ) {
      setPage(1);
      loadRequestIdRef.current += 1;
      setDocuments(initialDocuments);
      setTotalCount(initialTotalCount);
      setHasMore(initialDocuments.length < initialTotalCount);
      setLoading(false);
      return;
    }

    setPage(1);
    void loadDocuments(1, false, selectedGrade, selectedType, queryOptions);
  }, [
    debouncedSearch,
    initialDocuments,
    initialGrade,
    initialLoadSucceeded,
    initialTotalCount,
    initialType,
    loadDocuments,
    quickFilter,
    selectedGrade,
    selectedType,
    sortBy,
    isWorksheetBrowser,
    setPage,
    setLoading,
    loadRequestIdRef,
    setDocuments,
    setTotalCount,
    setHasMore,
  ]);

  useEffect(() => {
    if (isWorksheetBrowser) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          void loadDocuments(nextPage, true, selectedGrade, selectedType, {
            onlySolution: quickFilter === 'with_solution',
            onlyVideo: quickFilter === 'with_video',
            searchTerm: debouncedSearch,
            sortBy,
          });
        }
      },
      {
        rootMargin: '400px 0px',
      },
    );

    const target = loadMoreRef.current;
    if (target) {
      observer.observe(target);
    }

    return () => observer.disconnect();
  }, [
    debouncedSearch,
    hasMore,
    loadDocuments,
    loading,
    page,
    quickFilter,
    selectedGrade,
    selectedType,
    sortBy,
    isWorksheetBrowser,
    loadMoreRef,
    setPage,
  ]);

  useEffect(() => {
    let disposed = false;
    const checkSession = async () => {
      try {
        const resolvedUser = await resolveContentUser();
        if (disposed) return;

        if (!resolvedUser) {
          setUser((prev) => (prev === null ? prev : null));
          return;
        }

        setUser(resolvedUser);
      } catch {
        if (!disposed) {
          setUser((prev) => (prev === null ? prev : null));
        }
      }
    };

    void checkSession();
    return () => {
      disposed = true;
    };
  }, [setUser]);
  return { loadDocuments };
}
