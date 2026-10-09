'use client';

import Image from 'next/image';

import { useState, useEffect, useCallback, Suspense, useRef, startTransition } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ChevronRight,
  Filter,
  FolderOpen,
  Layers3,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/components/Toast';
import { getErrorMessage } from '@/lib/error-utils';
import { trackStudentActivityEvent } from '@/features/analytics/trackActivity';
import { broadcastHomeDocumentsUpdated } from '@/features/home/home-documents-events';
import ContentCard from '@/features/content/components/ContentCard';
import { ContentCategoryChips } from '@/features/content/components/ContentCategoryChips';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { createLogger } from '@/lib/logger';

const log = createLogger('contents-page');

const ContentCommentsModal = dynamic(
  () => import('@/features/content/components/ContentCommentsModal'),
  { ssr: false },
);
const ContentEditModal = dynamic(
  () => import('@/features/content/components/ContentEditModal'),
  { ssr: false },
);
const ContentPreviewModal = dynamic(
  () => import('@/features/content/components/ContentPreviewModal'),
  { ssr: false },
);
const ContentQuickAddModal = dynamic(
  () => import('@/features/content/components/ContentQuickAddModal'),
  { ssr: false },
);
const ContentDeleteConfirmModal = dynamic(
  () => import('@/features/content/components/ContentDeleteConfirmModal'),
  { ssr: false },
);
import {
  CONTENT_PAGE_SIZE,
  CONTENT_TYPE_MAPPING,
} from '@/features/content/constants';
import ContentFilterBar, {
  type ContentViewMode,
} from '@/features/content/components/ContentFilterBar';
import ContentTopicPacks from '@/features/content/components/ContentTopicPacks';
import { useContentCompletion } from '@/features/content/hooks/useContentCompletion';
import { useCloudFavorites } from '@/features/content/hooks/useCloudFavorites';
import {
  createContentDocument,
  createDocumentComment,
  deleteContentDocument,
  loadContentDocuments,
  loadDocumentById,
  loadDocumentComments,
  loadWorksheetDocumentsByGrade,
  resolveContentUser,
  seedContentDocumentCache,
  updateContentDocument,
  updateDocumentMetric,
  uploadContentFile,
} from '@/features/content/queries';
import type {
  ContentComment,
  ContentFormState,
  ContentGradeFilter,
  ContentPageUser,
  ContentQueryOptions,
  ContentQuickFilter,
  ContentSortOrder,
} from '@/features/content/types';

import {
  getContentPageDescription,
  getContentPageTitle,
  normalizeContentGrade,
} from '@/features/content/utils';
import {
  getWorksheetVisibleDescription,
  getWorksheetOutcomeLabel,
  resolveWorksheetOutcome,
  isWorksheetType,
  sortWorksheetDocuments,
  WORKSHEET_GRADE_OPTIONS,
} from '@/features/content/worksheet-display';
import { isCurriculumTopic, matchesCurriculumDocument } from '@/features/content/curriculum-coverage';
import {
  WORKSHEET_OUTCOME_CATALOG,
  type WorksheetCatalogItem,
} from '@/features/content/worksheet-catalog';
import type { ContentDocument, GradeValue } from '@/types';

type WorksheetGradeSelection = number | 'Mezun';

const parseWorksheetGradeParam = (
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

const WORKSHEET_GRADE_CARD_STYLES: Record<
  WorksheetGradeSelection,
  {
    border: string;
    folder: string;
    surface: string;
  }
> = {
  5: {
    border: 'border-emerald-400/30 hover:border-emerald-300/55',
    folder: 'from-emerald-400 to-teal-500',
    surface: 'bg-emerald-500/10 hover:bg-emerald-500/15',
  },
  6: {
    border: 'border-sky-400/30 hover:border-sky-300/55',
    folder: 'from-sky-400 to-cyan-500',
    surface: 'bg-sky-500/10 hover:bg-sky-500/15',
  },
  7: {
    border: 'border-violet-400/30 hover:border-violet-300/55',
    folder: 'from-violet-400 to-purple-500',
    surface: 'bg-violet-500/10 hover:bg-violet-500/15',
  },
  8: {
    border: 'border-rose-400/30 hover:border-rose-300/55',
    folder: 'from-rose-400 to-pink-500',
    surface: 'bg-rose-500/10 hover:bg-rose-500/15',
  },
  9: {
    border: 'border-amber-400/30 hover:border-amber-300/55',
    folder: 'from-amber-400 to-orange-500',
    surface: 'bg-amber-500/10 hover:bg-amber-500/15',
  },
  10: {
    border: 'border-lime-400/30 hover:border-lime-300/55',
    folder: 'from-lime-400 to-green-500',
    surface: 'bg-lime-500/10 hover:bg-lime-500/15',
  },
  11: {
    border: 'border-blue-400/30 hover:border-blue-300/55',
    folder: 'from-blue-400 to-indigo-500',
    surface: 'bg-blue-500/10 hover:bg-blue-500/15',
  },
  12: {
    border: 'border-red-400/30 hover:border-red-300/55',
    folder: 'from-red-400 to-rose-500',
    surface: 'bg-red-500/10 hover:bg-red-500/15',
  },
  Mezun: {
    border: 'border-slate-300/30 hover:border-slate-200/55',
    folder: 'from-slate-300 to-slate-500',
    surface: 'bg-slate-400/10 hover:bg-slate-400/15',
  },
};

const splitWorksheetOutcomeHeading = (outcome: string) => {
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

const SUPPORTED_WORKSHEET_QUICK_ADD_GRADES: readonly number[] = [5, 6, 7, 8];

const normalizeWorksheetQuickAddGrade = (grade?: GradeValue | null) =>
  typeof grade === 'number' &&
  SUPPORTED_WORKSHEET_QUICK_ADD_GRADES.includes(grade)
    ? grade
    : SUPPORTED_WORKSHEET_QUICK_ADD_GRADES[0];

type ContentsPageProps = {
  initialDocuments?: ContentDocument[];
  initialLoadSucceeded?: boolean;
  initialGrade?: ContentGradeFilter;
  initialTotalCount?: number;
  initialType?: string;
};

const EMPTY_CONTENT_DOCUMENTS: ContentDocument[] = [];

// URL okuması yalnızca bu görünmez bileşeni askıya alır; içerik HTML'de kalır.
function ContentUrlFilters({ onChange }: { onChange: (params: URLSearchParams) => void ;}) {
  const searchParams = useSearchParams();
  useEffect(() => {
    onChange(new URLSearchParams(searchParams.toString()));
  }, [onChange, searchParams]);
  return null;
}

function ContentsPageInner({
  initialDocuments = EMPTY_CONTENT_DOCUMENTS,
  initialLoadSucceeded = true,
  initialGrade = 'all',
  initialTotalCount = 0,
  initialType = 'all',
}: ContentsPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchParams, setSearchParams] = useState(() => new URLSearchParams());
  const { showToast } = useToast();
  const requestedTypeFromUrl =
    searchParams.get('type') || searchParams.get('category') || 'all';
  const typeFromUrl =
    CONTENT_TYPE_MAPPING[requestedTypeFromUrl] || requestedTypeFromUrl;
  const worksheetGradeFromUrl = searchParams.get('grade');
  const worksheetOutcomeFromUrl = searchParams.get('outcome');
  const searchFromUrl = searchParams.get('q') || '';
  const [user, setUser] = useState<ContentPageUser | null>(null);
  const [documents, setDocuments] = useState<ContentDocument[]>(
    initialDocuments
  );
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => { setSearchTerm(searchFromUrl); }, [searchFromUrl]);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<ContentSortOrder>('newest');
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
  const [worksheetDocuments, setWorksheetDocuments] = useState<ContentDocument[]>(
    []
  );
  const [worksheetOutcomeCatalog, setWorksheetOutcomeCatalog] = useState<
    Record<number, WorksheetCatalogItem[]>
  >(WORKSHEET_OUTCOME_CATALOG);
  const [worksheetCatalogLoading, setWorksheetCatalogLoading] = useState(false);
  const [worksheetLoading, setWorksheetLoading] = useState(false);
  const [selectedWorksheetGrade, setSelectedWorksheetGrade] =
    useState<WorksheetGradeSelection | null>(null);
  const [selectedWorksheetOutcome, setSelectedWorksheetOutcome] = useState<
    string | null
  >(null);
  const [hasMore, setHasMore] = useState(
    initialDocuments.length < initialTotalCount,
  );
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [authResolved, setAuthResolved] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<ContentDocument | null>(null);
  const [deleting, setDeleting] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const loadRequestIdRef = useRef(0);
  const worksheetRequestIdRef = useRef(0);
  const appliedWorksheetLinkRef = useRef<string | null>(null);
  const isWorksheetBrowser = isWorksheetType(selectedType);

  const ensureWorksheetOutcomeCatalog = useCallback(async () => {
    if (Object.keys(worksheetOutcomeCatalog).length > 0) {
      return worksheetOutcomeCatalog;
    }

    setWorksheetCatalogLoading(true);
    try {
      const { WORKSHEET_OUTCOME_CATALOG } = await import(
        '@/features/content/worksheet-catalog'
      );
      setWorksheetOutcomeCatalog(WORKSHEET_OUTCOME_CATALOG);
      return WORKSHEET_OUTCOME_CATALOG;
    } catch (error) {
      // Katalog yüklenemezse (chunk hatası) sessiz unhandled rejection yerine
      // logla ve mevcut (boş olabilir) kataloğu döndür; fonksiyon asla reject etmez.
      log.error('Kazanım kataloğu yüklenemedi', error);
      return worksheetOutcomeCatalog;
    } finally {
      setWorksheetCatalogLoading(false);
    }
  }, [worksheetOutcomeCatalog]);

  const applyDocumentPatch = useCallback(
    (documentId: string, patch: Partial<ContentDocument>) => {
      setDocuments((current) =>
        current.map((document) =>
          document.id === documentId ? { ...document, ...patch } : document,
        ),
      );
      setWorksheetDocuments((current) =>
        current.map((document) =>
          document.id === documentId ? { ...document, ...patch } : document,
        ),
      );
      setPreviewDoc((current) =>
        current?.id === documentId ? { ...current, ...patch } : current,
      );
    },
    [],
  );

  const removeDocumentFromState = useCallback((documentId: string) => {
    setDocuments((current) =>
      current.filter((document) => document.id !== documentId),
    );
    setWorksheetDocuments((current) =>
      current.filter((document) => document.id !== documentId),
    );
    setPreviewDoc((current) => (current?.id === documentId ? null : current));
    setEditDoc((current) => (current?.id === documentId ? null : current));
  }, []);

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
              const existingIds = new Set(current.map((document) => document.id));
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
        if (requestId === loadRequestIdRef.current) setContentLoadError('İçerikler yüklenemedi. Yeniden deneyin.');
      } finally {
        if (requestId === loadRequestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [],
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

  useEffect(() => {
    if (worksheetGradeFromUrl) {
      setSelectedGrade(normalizeContentGrade(worksheetGradeFromUrl));
    }
  }, [worksheetGradeFromUrl]);

  useEffect(() => {
    if (typeFromUrl !== selectedType) {
      setSelectedType(typeFromUrl);
    }
  }, [selectedType, typeFromUrl]);

  useEffect(() => {
    if (!authResolved) {
      return;
    }

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
    authResolved,
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
  ]);

  useEffect(() => {
    if (!authResolved) {
      return;
    }

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
    authResolved,
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
  ]);


  useEffect(() => {
    let disposed = false;
    const checkSession = async () => {
      try {
        const resolvedUser = await resolveContentUser();
        if (disposed) return;

        if (!resolvedUser) {
          setUser(null);
          return;
        }

        setUser(resolvedUser);
        // Açık URL filtresi, öğrencinin varsayılan sınıfından önce gelir.
        if (!new URLSearchParams(window.location.search).get('grade')) {
          setSelectedGrade(
            resolvedUser.isAdmin ? 'all' : normalizeContentGrade(resolvedUser.grade),
          );
        }
      } finally {
        if (!disposed) setAuthResolved(true);
      }
    };

    void checkSession();
    return () => { disposed = true; };
  }, []);


  const resetWorksheetHierarchy = useCallback(() => {
    worksheetRequestIdRef.current += 1;
    setSelectedWorksheetGrade(null);
    setSelectedWorksheetOutcome(null);
    setWorksheetDocuments([]);
    setWorksheetLoading(false);
  }, []);

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
        if (requestId === worksheetRequestIdRef.current) setContentLoadError('Yaprak testler yüklenemedi. Yeniden deneyin.');
      } finally {
        if (requestId === worksheetRequestIdRef.current) {
          setWorksheetLoading(false);
        }
      }
    },
    [ensureWorksheetOutcomeCatalog],
  );

  const refreshSelectedWorksheetGrade = useCallback(async () => {
    if (!selectedWorksheetGrade) {
      return;
    }

    await loadWorksheetGradeDocuments(selectedWorksheetGrade, true);
  }, [loadWorksheetGradeDocuments, selectedWorksheetGrade]);

  const handleTypeChange = useCallback((type: string) => {
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
  }, []);

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
    [],
  );

  useEffect(() => {
    if (!authResolved || !isWorksheetBrowser) {
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
    authResolved,
    isWorksheetBrowser,
    loadWorksheetGradeDocuments,
    worksheetGradeFromUrl,
    worksheetOutcomeFromUrl,
  ]);

  const handledRequestedDocIdRef = useRef<string | null>(null);
  // Önizlemenin geçmiş yönetimi tek noktadan yürür: URL tek doğruluk kaynağıdır.
  // `previewHistoryRef` bizim pushState ile eklediğimiz kaydın doc id'sini tutar;
  // `previewUrlSyncedRef` ise `?id=` parametresinin router'a yansıdığını doğrular.
  // İkincisi olmadan, açılış ile useSearchParams güncellemesi arasındaki boşlukta
  // "URL'de id yok" görünüp modal daha açılır açılmaz kapanırdı.
  const previewHistoryRef = useRef<string | null>(null);
  const previewUrlSyncedRef = useRef(false);
  const previewDocRef = useRef<ContentDocument | null>(null);

  useEffect(() => {
    previewDocRef.current = previewDoc;
  }, [previewDoc]);

  const handleOpenPreview = useCallback(
    (content: ContentDocument) => {
      setShowAnswerKey(false);
      handledRequestedDocIdRef.current = content.id;
      const nextViews = (content.views || 0) + 1;
      const updatedDoc = { ...content, views: nextViews };
      setPreviewDoc(updatedDoc);
      applyDocumentPatch(content.id, { views: nextViews });
      void updateDocumentMetric(content.id, { views: nextViews }).catch(() => undefined);
      void trackStudentActivityEvent({
        entityId: content.id,
        entityType: 'document',
        eventType: 'content_viewed',
        metadata: {
          grade: content.grade,
          title: content.title,
          type: content.type,
        },
        userId: user?.id,
      });

      try {
        const url = new URL(window.location.href);
        // Derin bağlantıyla gelindiyse kayıt zaten mevcut; yenisini eklemeyiz.
        const alreadyOnDoc = url.searchParams.get('id') === content.id;
        url.searchParams.set('id', content.id);

        if (alreadyOnDoc) {
          window.history.replaceState({}, '', url.toString());
          previewHistoryRef.current = null;
          previewUrlSyncedRef.current = true;
        } else {
          // Yeni geçmiş kaydı: geri tuşu bu kayıttan çıkıp önizlemeyi kapatır.
          window.history.pushState({}, '', url.toString());
          previewHistoryRef.current = content.id;
          previewUrlSyncedRef.current = false;
        }
      } catch {
        previewHistoryRef.current = null;
        previewUrlSyncedRef.current = false;
      }
    },
    [applyDocumentPatch, user?.id],
  );

  const handleClosePreview = useCallback(() => {
    const closingId =
      previewDocRef.current?.id ||
      searchParams.get('id') ||
      searchParams.get('doc') ||
      null;

    setPreviewDoc(null);
    setShowAnswerKey(false);
    handledRequestedDocIdRef.current = closingId;
    previewUrlSyncedRef.current = false;

    let currentUrlId: string | null = null;
    try {
      currentUrlId = new URL(window.location.href).searchParams.get('id');
    } catch {
      currentUrlId = null;
    }

    // Açılışta kaydı biz eklediysek ve hâlâ o kayıttaysak, kaydı geri alarak
    // kapatırız: geçmişte ölü kayıt birikmez ve geri tuşu önizlemeden önceki
    // duruma döner. URL temizliğini popstate'in kendisi yapar.
    if (
      previewHistoryRef.current &&
      previewHistoryRef.current === closingId &&
      currentUrlId === closingId
    ) {
      previewHistoryRef.current = null;
      window.history.back();
      return;
    }

    previewHistoryRef.current = null;

    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('id');
      url.searchParams.delete('doc');
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }

    const params = new URLSearchParams(searchParams.toString());
    if (params.has('id') || params.has('doc')) {
      params.delete('id');
      params.delete('doc');
      const nextQuery = params.toString();
      const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      router.replace(nextUrl, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  const requestedDocId = searchParams.get('id') || searchParams.get('doc');
  useEffect(() => {
    if (!requestedDocId) {
      // Geri tuşu veya harici gezinme `?id=` parametresini düşürdüyse önizlemeyi
      // de kapat. `previewUrlSyncedRef` koşulu şart: açılış ile router'ın
      // useSearchParams güncellemesi arasındaki boşlukta burası "id yok" görür ve
      // modalı daha görünmeden kapatırdı.
      if (previewUrlSyncedRef.current && previewDocRef.current) {
        previewUrlSyncedRef.current = false;
        previewHistoryRef.current = null;
        handledRequestedDocIdRef.current = null;
        setPreviewDoc(null);
        setShowAnswerKey(false);
      } else if (!previewDocRef.current) {
        handledRequestedDocIdRef.current = null;
      }
      // Önizleme açık ama URL henüz senkron değilse `handledRequestedDocIdRef`e
      // dokunulmaz: sıfırlanırsa, `?id=` nihayet geldiğinde efekt aynı belgeyi
      // ikinci kez açar (görüntülenme sayısı iki artar ve geçmiş kaydımız
      // `replaceState` ile ezilir).
      return;
    }

    if (previewDocRef.current?.id === requestedDocId) {
      previewUrlSyncedRef.current = true;
    }

    if (handledRequestedDocIdRef.current === requestedDocId) {
      return;
    }
    handledRequestedDocIdRef.current = requestedDocId;

    const found =
      documents.find((d) => d.id === requestedDocId) ||
      worksheetDocuments.find((d) => d.id === requestedDocId);

    if (found) {
      handleOpenPreview(found);
      return;
    }

    void loadDocumentById(requestedDocId).then((doc) => {
      if (doc) {
        handleOpenPreview(doc);
      }
    });
  }, [requestedDocId, documents, worksheetDocuments, handleOpenPreview]);


  const handleDownloadDocument = useCallback(
    async (content: ContentDocument) => {
      if (!content.file_url) return;

      window.open(content.file_url, '_blank');
      const nextDownloads = (content.downloads || 0) + 1;
      applyDocumentPatch(content.id, { downloads: nextDownloads });
      setPreviewDoc((current) =>
        current && current.id === content.id
          ? { ...current, downloads: nextDownloads }
          : current,
      );
      void updateDocumentMetric(content.id, { downloads: nextDownloads }).catch(() => undefined);
      void trackStudentActivityEvent({
        entityId: content.id,
        entityType: 'document',
        eventType: 'content_downloaded',
        metadata: {
          grade: content.grade,
          title: content.title,
          type: content.type,
        },
        userId: user?.id,
      });
    },
    [applyDocumentPatch, user?.id],
  );

  const handleToggleLike = useCallback(
    async (content: ContentDocument) => {
      const isLiked = likedDocs.has(content.id);
      const nextLikes = isLiked
        ? Math.max(0, (content.likes || 0) - 1)
        : (content.likes || 0) + 1;

      setLikedDocs((current) => {
        const next = new Set(current);
        if (isLiked) {
          next.delete(content.id);
        } else {
          next.add(content.id);
        }
        return next;
      });

      // Sayaç rotası yalnız +1 artırır; geri almayı sunucuya göndermek
      // sayacı düşürmek yerine artırırdı (azaltma bilinçli olarak yok).
      if (!isLiked) {
        await updateDocumentMetric(content.id, { likes: nextLikes });
      }
      applyDocumentPatch(content.id, { likes: nextLikes });
      void trackStudentActivityEvent({
        entityId: content.id,
        entityType: 'document',
        eventType: isLiked ? 'content_unliked' : 'content_liked',
        metadata: {
          title: content.title,
          type: content.type,
        },
        userId: user?.id,
      });
    },
    [applyDocumentPatch, likedDocs, user?.id],
  );

  const handleOpenComments = useCallback(async (content: ContentDocument) => {
    setShowComments(content.id);
    setNewComment('');
    const nextComments = await loadDocumentComments(content.id);
    setComments(nextComments);
  }, []);

  const handleCloseComments = useCallback(() => {
    setShowComments(null);
    setComments([]);
    setNewComment('');
  }, []);

  const handleCommentSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!newComment.trim() || !showComments || !user) return;

      const createdComment = await createDocumentComment({
        content: newComment,
        document_id: showComments,
        user_id: user.id,
        user_name: user.name || 'Anonim',
      });

      if (!createdComment) return;

      setComments((current) => [createdComment, ...current]);
      setNewComment('');

      const targetDocument =
        documents.find((document) => document.id === showComments) ||
        worksheetDocuments.find((document) => document.id === showComments);

      if (!targetDocument) return;

      const nextCount = (targetDocument.comments_count || 0) + 1;
      await updateDocumentMetric(showComments, { comments_count: nextCount });
      applyDocumentPatch(showComments, { comments_count: nextCount });
      void trackStudentActivityEvent({
        entityId: showComments,
        entityType: 'document',
        eventType: 'content_comment_added',
        metadata: {
          title: targetDocument.title,
          type: targetDocument.type,
        },
        userId: user.id,
      });
    },
    [
      applyDocumentPatch,
      documents,
      newComment,
      showComments,
      user,
      worksheetDocuments,
    ],
  );

  const handleQuickAddOpen = useCallback(() => {
    void ensureWorksheetOutcomeCatalog();
    const preferredWorksheetGrade =
      selectedWorksheetGrade ||
      (selectedGrade !== 'all' ? (selectedGrade as GradeValue) : user?.grade);
    const defaultWorksheetGrade =
      normalizeWorksheetQuickAddGrade(preferredWorksheetGrade);

    setFormData({
      type: selectedType !== 'all' ? selectedType : 'yaprak-test',
      grade: [defaultWorksheetGrade],
      learning_outcome: isWorksheetBrowser ? selectedWorksheetOutcome || '' : '',
    });
    setShowModal(true);
  }, [
    isWorksheetBrowser,
    selectedGrade,
    selectedType,
    selectedWorksheetGrade,
    selectedWorksheetOutcome,
    ensureWorksheetOutcomeCatalog,
    user?.grade,
  ]);

  const handleQuickAddChange = useCallback(
    (nextValue: Partial<ContentFormState>) => {
      setFormData((current) => ({ ...current, ...nextValue }));
    },
    [],
  );

  const handleQuickAddFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsSubmitting(true);

      try {
        const uploadedFile = await uploadContentFile(file);
        setFormData((current) => ({
          ...current,
          file_name: uploadedFile.fileName,
          file_url: uploadedFile.publicUrl,
        }));
      } catch (error) {
        showToast(
          'error',
          'Dosya yüklenemedi: ' +
            (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [showToast],
  );

  const handleQuickAddSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      if (isWorksheetType(formData.type)) {
        const selectedWorksheetGrade = formData.grade?.[0];

        if (
          typeof selectedWorksheetGrade !== 'number' ||
          !SUPPORTED_WORKSHEET_QUICK_ADD_GRADES.includes(selectedWorksheetGrade)
        ) {
          showToast(
            'warning',
            'Yaprak test için desteklenen bir sınıf düzeyi seçmelisiniz.',
          );
          return;
        }

        if (!formData.learning_outcome?.trim()) {
          showToast('warning', 'Yaprak test için bir kazanım seçmelisiniz.');
          return;
        }
      }

      if (
        !formData.file_url?.trim() &&
        !formData.video_url?.trim() &&
        !formData.solution_url?.trim()
      ) {
        showToast(
          'warning',
          'En az bir dosya, bağlantı veya video URL alanı doldurmalısınız.',
        );
        return;
      }

      setIsSubmitting(true);

      try {
        const document = await createContentDocument(formData);

        if (document) {
          setDocuments((current) => [document, ...current]);
          broadcastHomeDocumentsUpdated();

          if (
            isWorksheetType(document.type) &&
            selectedWorksheetGrade &&
            Array.isArray(document.grade) &&
            document.grade.some(
              (grade: GradeValue) =>
                String(grade) === String(selectedWorksheetGrade),
            )
          ) {
            await refreshSelectedWorksheetGrade();
          }
        }

        setSuccess(true);
        setTimeout(() => {
          setShowModal(false);
          setSuccess(false);
          setFormData({});
        }, 1500);
      } catch (error) {
        showToast(
          'error',
          'Kaydetme hatası: ' +
            (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, isSubmitting, refreshSelectedWorksheetGrade, selectedWorksheetGrade, showToast],
  );

  const handleOpenEdit = useCallback((content: ContentDocument) => {
    setEditDoc(content);
    setEditFormData({
      ...content,
      description: isWorksheetType(content.type)
        ? getWorksheetVisibleDescription(content)
        : content.description,
      learning_outcome: isWorksheetType(content.type)
        ? getWorksheetOutcomeLabel(content)
        : '',
      grade: content.grade,
    });
    setEditSuccess(false);
    setIsEditing(false);
  }, []);

  const handleEditChange = useCallback(
    (nextValue: Partial<ContentFormState>) => {
      setEditFormData((current) => ({ ...current, ...nextValue }));
    },
    [],
  );

  const handleEditFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsEditing(true);

      try {
        const uploadedFile = await uploadContentFile(file);
        setEditFormData((current) => ({
          ...current,
          file_name: uploadedFile.fileName,
          file_url: uploadedFile.publicUrl,
        }));
      } catch (error) {
        showToast(
          'error',
          `Dosya yüklenemedi: ${getErrorMessage(error)}`
        );
      } finally {
        setIsEditing(false);
      }
    },
    [showToast],
  );

  const handleEditSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!editDoc) return;

      setIsEditing(true);

      try {
        const updatedDocument = await updateContentDocument(
          editDoc.id,
          editFormData,
        );

        if (updatedDocument) {
          applyDocumentPatch(editDoc.id, updatedDocument);

          if (selectedWorksheetGrade) {
            await refreshSelectedWorksheetGrade();
          }
        }

        setEditSuccess(true);
        setTimeout(() => {
          setEditDoc(null);
          setEditSuccess(false);
        }, 1500);
      } catch (error) {
        showToast(
          'error',
          `Güncelleme hatası: ${getErrorMessage(error)}`
        );
      } finally {
        setIsEditing(false);
      }
    },
    [
      applyDocumentPatch,
      editDoc,
      editFormData,
      refreshSelectedWorksheetGrade,
      selectedWorksheetGrade,
      showToast,
    ],
  );

  const handleDeleteDocument = useCallback((content: ContentDocument) => {
    setDeleteCandidate(content);
  }, []);

  const confirmDeleteDocument = useCallback(async () => {
    if (!deleteCandidate) return;
    setDeleting(true);
    try {
      await deleteContentDocument(deleteCandidate.id);
      removeDocumentFromState(deleteCandidate.id);
      showToast('success', 'İçerik silindi.');
      setDeleteCandidate(null);
    } catch (error) {
      showToast('error', `Silme hatası: ${getErrorMessage(error)}`);
    } finally {
      setDeleting(false);
    }
  }, [deleteCandidate, removeDocumentFromState, showToast]);

  const filteredContents = documents.filter((content) => {
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
    if (typeof selectedGrade === 'number' && isCurriculumTopic(selectedGrade, searchTerm.trim()) && (selectedType === 'ders-notlari' || selectedType === 'yaprak-test')) {
      return matchesCurriculumDocument(content, selectedGrade, searchTerm.trim(), selectedType);
    }
    const term = searchTerm.toLowerCase();
    return (
      Boolean(content.title && content.title.toLowerCase().includes(term)) ||
      Boolean(
        content.description && content.description.toLowerCase().includes(term),
      )
    );
  });


  const filteredWorksheetGrades = WORKSHEET_GRADE_OPTIONS.filter((grade) => {
    if (!searchTerm.trim()) {
      return true;
    }

    const label = grade === 'Mezun' ? 'mezun' : `${grade}. sınıf`;
    return label.toLowerCase().includes(searchTerm.trim().toLowerCase());
  });

  const curriculumWorksheetTopic = typeof selectedWorksheetGrade === 'number' && isCurriculumTopic(selectedWorksheetGrade, searchTerm.trim()) ? searchTerm.trim() : null;
  const matchingWorksheetDocuments = curriculumWorksheetTopic && typeof selectedWorksheetGrade === 'number'
    ? worksheetDocuments.filter((document) => matchesCurriculumDocument(document, selectedWorksheetGrade, curriculumWorksheetTopic, 'yaprak-test'))
    : worksheetDocuments;
  const worksheetDocumentGroups = matchingWorksheetDocuments.reduce<
    Record<string, ContentDocument[]>
  >((groups, document) => {
    const outcome = resolveWorksheetOutcome({
      ...document,
      grade: document.grade || (typeof selectedWorksheetGrade === 'number' ? [selectedWorksheetGrade] : null),
    });
    groups[outcome] = [...(groups[outcome] || []), document];
    return groups;
  }, {});

  const worksheetCatalogOutcomes =
    selectedWorksheetGrade && typeof selectedWorksheetGrade === 'number'
      ? worksheetOutcomeCatalog[selectedWorksheetGrade] || []
      : [];
  const worksheetCatalogOutcomeMap = new Map(
    worksheetCatalogOutcomes.map((item, index) => [item.full, { ...item, index }]),
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
      documents: sortWorksheetDocuments(worksheetDocumentGroups[outcome] || []),
      outcome,
    }))
    .filter(({ outcome, count }) =>
      curriculumWorksheetTopic ? count > 0 : searchTerm.trim()
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
      if (selectedWorksheetOutcome) {
        const docOutcome = resolveWorksheetOutcome({
          ...document,
          grade: document.grade || (typeof selectedWorksheetGrade === 'number' ? [selectedWorksheetGrade] : null),
        });

        if (docOutcome !== selectedWorksheetOutcome) {
          return false;
        }
      }

      if (!searchTerm.trim() || curriculumWorksheetTopic) {
        return true;
      }

      return document.title
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase());
    }),
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

  const worksheetGradeLabel =
    selectedWorksheetGrade === 'Mezun'
      ? 'Mezun'
      : selectedWorksheetGrade
        ? `${selectedWorksheetGrade}. Sınıf`
        : null;

  const profileHref = user?.isAdmin ? '/admin' : user ? '/profil' : '/giris';

  return (
    <main className="page-surface icerikler-page min-h-screen gradient-bg pb-[max(6rem,calc(env(safe-area-inset-bottom)+5.5rem))] relative">
      {/* Ambient Glow Mesh */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-500/10 dark:bg-cyan-500/5 blur-3xl" />
        <div className="absolute top-48 -right-32 h-96 w-96 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-96 w-96 rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-3xl" />
      </div>

      <Suspense fallback={null}>
        <ContentUrlFilters onChange={setSearchParams} />
      </Suspense>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-1/95 backdrop-blur-md border-b-2 border-default py-3 sm:py-4 px-4 sm:px-6 xl:px-8 pt-[max(0.75rem,env(safe-area-inset-top))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        <div className="max-w-[1760px] mx-auto flex justify-between items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-2xl border-2 border-brand-accent bg-brand-accent/20 p-0.5 shadow-btn-3d-yellow">
              <Image
                src="/ugur.jpeg"
                alt="Uğur Hoca"
                width={44}
                height={44}
                className="h-full w-full rounded-xl object-cover"
              />
            </div>
            <span className="font-display text-base sm:text-xl font-bold text-primary truncate">
              Uğur Hoca Matematik
            </span>
          </Link>

          <Link
            href={profileHref}
            className="text-secondary hover:text-primary flex items-center gap-1.5 text-xs sm:text-base shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{user?.isAdmin ? 'Admin Panel' : 'Profil'}</span>
          </Link>
        </div>
      </nav>

      <div className="pt-[calc(4.5rem+env(safe-area-inset-top))] sm:pt-24 px-4 sm:px-6 xl:px-8">
        <div className="max-w-[1760px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-50/80 dark:bg-sky-950/40 px-3.5 py-1 text-xs font-bold text-sky-700 dark:text-sky-300 backdrop-blur-md shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                <span>MEB 2026-2027 Müfredat Arşivi · %100 Ücretsiz & Çözümlü</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-primary font-display mb-2">
                {getContentPageTitle(selectedType)}
              </h1>
              <p className="text-sm sm:text-base text-secondary max-w-2xl leading-relaxed">
                {getContentPageDescription(selectedType, selectedGrade)}
              </p>
            </div>
            {user?.isAdmin && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleQuickAddOpen}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
              >
                <Plus className="w-5 h-5" />
                Hızlı İçerik Ekle
              </motion.button>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl p-5 sm:p-7 mb-8 border border-default dark:border-white/[0.08] bg-surface-1/90 shadow-2xl backdrop-blur-2xl"
          >
            {/* Top ambient aura */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-brand-secondary" />

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
                      void loadWorksheetGradeDocuments(
                        selectedWorksheetGrade,
                        true,
                      );
                    } else {
                      void loadDocuments(
                        1,
                        false,
                        selectedGrade,
                        selectedType,
                        {
                          onlySolution: quickFilter === 'with_solution',
                          onlyVideo: quickFilter === 'with_video',
                          searchTerm: debouncedSearch,
                          sortBy,
                        },
                      );
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
              onSortChange={setSortBy}
              onViewModeChange={setViewMode}
              quickFilter={quickFilter}
              searchPlaceholder={searchPlaceholder}
              searchTerm={searchTerm}
              sortBy={sortBy}
              totalResults={filteredContents.length}
              viewMode={viewMode}
            />

            {!isWorksheetBrowser && (
              <div className="mt-5 border-t border-default dark:border-white/[0.08] pt-4">
                <ContentCategoryChips
                  selectedGrade={String(selectedGrade)}
                  selectedType={selectedType}
                  onSelectGrade={(g) => {
                    startTransition(() => {
                      if (g === 'all') setSelectedGrade('all');
                      else if (g === 'Mezun') setSelectedGrade('Mezun');
                      else setSelectedGrade(Number(g));
                    });
                  }}
                  onSelectType={(t) => handleTypeChange(t)}
                />
              </div>
            )}
          </motion.div>




          {isWorksheetBrowser && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-6 flex flex-wrap items-center gap-2 text-sm text-secondary"
            >
              <button
                onClick={() => {
                  resetWorksheetHierarchy();
                  updateWorksheetBrowserUrl(null);
                  setSearchTerm('');
                }}
                className={`rounded-full border px-4 py-2 transition-colors ${
                  selectedWorksheetGrade
                    ? 'border-default dark:border-slate-400 bg-surface-2 text-secondary hover:text-primary'
                    : 'border-brand-primary dark:border-brand-primary bg-brand-primary/15 text-tone-success-fg dark:text-brand-primary-soft'
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
                        ? 'border-default dark:border-slate-400 bg-surface-2 text-secondary hover:text-primary'
                        : 'border-brand-primary dark:border-brand-primary bg-brand-primary/15 text-tone-success-fg dark:text-brand-primary-soft'
                    }`}
                  >
                    {worksheetGradeLabel}
                  </button>
                </>
              )}
              {selectedWorksheetOutcome && (
                <>
                  <ChevronRight className="w-4 h-4 text-secondary" />
                  <span className="rounded-full border border-purple-500/30 bg-purple-500/15 px-4 py-2 text-purple-800 dark:text-purple-100">
                    {selectedWorksheetOutcome}
                  </span>
                </>
              )}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mb-6"
          >
            <Filter className="w-5 h-5 text-secondary" />
            {loading || worksheetLoading || worksheetCatalogLoading ? (
              <span className="text-secondary">Yükleniyor...</span>
            ) : (
              <span className="text-secondary">{resultLabel}</span>
            )}
          </motion.div>

          {isWorksheetBrowser ? (
            !selectedWorksheetGrade ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
                {filteredWorksheetGrades.map((grade, index) => (
                  <motion.button
                    key={String(grade)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => {
                      updateWorksheetBrowserUrl(grade);
                      void loadWorksheetGradeDocuments(grade);
                    }}
                    className={`rounded-3xl border p-5 text-center transition-all hover:-translate-y-1 sm:p-6 ${WORKSHEET_GRADE_CARD_STYLES[grade].border} ${WORKSHEET_GRADE_CARD_STYLES[grade].surface}`}
                  >
                    <div
                      className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${WORKSHEET_GRADE_CARD_STYLES[grade].folder}`}
                    >
                      <Layers3 className="h-7 w-7 text-white dark:text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-primary">
                      {grade === 'Mezun' ? grade : `${grade}. Sınıf`}
                    </h3>
                  </motion.button>
                ))}
              </div>
            ) : worksheetLoading ? (
              <div
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7"
                aria-busy="true"
                aria-live="polite"
              >
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="rounded-3xl overflow-hidden border border-default bg-surface-1 p-4 sm:p-6 space-y-4"
                  >
                    <Skeleton className="h-14 w-14 rounded-xl" />
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Kazanım Hızlı Filtre Çipleri */}
                {worksheetOutcomeEntries.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-default bg-surface-1 p-3.5 sm:p-4 shadow-xs">
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
                          ? 'bg-brand-accent text-slate-900 border-brand-accent shadow-xs'
                          : 'bg-surface-2 text-secondary hover:text-primary border-default'
                      }`}
                    >
                      Tüm İçerikler ({matchingWorksheetDocuments.length})
                    </button>
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
                        const label = heading.code
                          ? `${heading.code} ${heading.label}`
                          : entry.outcome;

                        return (
                          <button
                            key={entry.outcome}
                            type="button"
                            onClick={() => {
                              const nextOutcome = isSelected ? null : entry.outcome;
                              setSelectedWorksheetOutcome(nextOutcome);
                              updateWorksheetBrowserUrl(
                                selectedWorksheetGrade,
                                nextOutcome,
                              );
                            }}
                            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all border ${
                              isSelected
                                ? 'bg-brand-primary/15 border-brand-primary text-tone-success-fg dark:text-brand-primary-soft shadow-xs font-bold'
                                : 'bg-surface-2 hover:bg-surface-3 border-default text-secondary hover:text-primary'
                            }`}
                          >
                            <span className="truncate max-w-[280px] sm:max-w-xs">{label}</span>
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                isSelected
                                  ? 'bg-brand-primary text-white'
                                  : 'bg-surface-3 text-secondary'
                              }`}
                            >
                              {entry.count}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                )}

                {/* İçerik Listesi */}
                {filteredWorksheetTests.length > 0 ? (
                  viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
                      {filteredWorksheetTests.map((content, index) => (
                        <ContentCard
                          key={content.id}
                          content={content}
                          index={index}
                          isCompleted={isCompleted(content.id)}
                          isFavorite={isFavorite(content.id)}
                          isLiked={likedDocs.has(content.id)}
                          onDelete={handleDeleteDocument}
                          onDownload={handleDownloadDocument}
                          onEdit={handleOpenEdit}
                          onOpenComments={handleOpenComments}
                          onPreview={handleOpenPreview}
                          onToggleCompleted={toggleCompleted}
                          onToggleFavorite={toggleFavorite}
                          onToggleLike={handleToggleLike}
                          user={user}
                          viewMode="grid"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredWorksheetTests.map((content, index) => (
                        <ContentCard
                          key={content.id}
                          content={content}
                          index={index}
                          isCompleted={isCompleted(content.id)}
                          isFavorite={isFavorite(content.id)}
                          isLiked={likedDocs.has(content.id)}
                          onDelete={handleDeleteDocument}
                          onDownload={handleDownloadDocument}
                          onEdit={handleOpenEdit}
                          onOpenComments={handleOpenComments}
                          onPreview={handleOpenPreview}
                          onToggleCompleted={toggleCompleted}
                          onToggleFavorite={toggleFavorite}
                          onToggleLike={handleToggleLike}
                          user={user}
                          viewMode="list"
                        />
                      ))}
                    </div>
                  )
                ) : (
                  <EmptyState
                    tone="soft"
                    icon={<FolderOpen className="h-6 w-6" aria-hidden="true" />}
                    title={
                      selectedWorksheetOutcome
                        ? 'Bu kazanımda test bulunamadı'
                        : `${worksheetGradeLabel} için içerik bulunamadı`
                    }
                    description={
                      selectedWorksheetOutcome
                        ? 'Tüm içerikleri görmek için "Tüm İçerikler" filtresine tıklayabilirsiniz.'
                        : 'Bu sınıf düzeyine henüz yaprak test yüklenmemiş.'
                    }
                  />
                )}
              </div>
            )
          ) : loading && documents.length === 0 ? (
            <div
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7"
              aria-busy="true"
              aria-live="polite"
            >
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="glass rounded-3xl overflow-hidden border border-white/10 p-4 sm:p-6 space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredContents.length === 0 ? (
            <EmptyState
              icon={<Filter className="h-6 w-6" aria-hidden="true" />}
              title="Aradığın kriterlerde içerik yok"
              description="Farklı bir sınıf seviyesi, tür ya da anahtar kelime dene."
              action={
                searchTerm ? (
                  <Button variant="secondary" onClick={() => setSearchTerm('')}>
                    Aramayı temizle
                  </Button>
                ) : selectedGrade !== 'all' ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setQuickFilter('all');
                      setSelectedGrade('all');
                    }}
                  >
                    Tüm sınıflardaki içerikleri göster
                  </Button>
                ) : undefined
              }
            />
          ) : viewMode === 'packs' ? (
            <ContentTopicPacks
              documents={filteredContents}
              isCompleted={isCompleted}
              isFavorite={isFavorite}
              isLiked={(id) => likedDocs.has(id)}
              onDelete={handleDeleteDocument}
              onDownload={handleDownloadDocument}
              onEdit={handleOpenEdit}
              onOpenComments={handleOpenComments}
              onPreview={handleOpenPreview}
              onToggleCompleted={toggleCompleted}
              onToggleFavorite={toggleFavorite}
              onToggleLike={handleToggleLike}
              user={user}
            />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
              {filteredContents.map((content, index) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  index={index}
                  isCompleted={isCompleted(content.id)}
                  isFavorite={isFavorite(content.id)}
                  isLiked={likedDocs.has(content.id)}
                  onDelete={handleDeleteDocument}
                  onDownload={handleDownloadDocument}
                  onEdit={handleOpenEdit}
                  onOpenComments={handleOpenComments}
                  onPreview={handleOpenPreview}
                  onToggleCompleted={toggleCompleted}
                  onToggleFavorite={toggleFavorite}
                  onToggleLike={handleToggleLike}
                  user={user}
                  viewMode="grid"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredContents.map((content, index) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  index={index}
                  isCompleted={isCompleted(content.id)}
                  isFavorite={isFavorite(content.id)}
                  isLiked={likedDocs.has(content.id)}
                  onDelete={handleDeleteDocument}
                  onDownload={handleDownloadDocument}
                  onEdit={handleOpenEdit}
                  onOpenComments={handleOpenComments}
                  onPreview={handleOpenPreview}
                  onToggleCompleted={toggleCompleted}
                  onToggleFavorite={toggleFavorite}
                  onToggleLike={handleToggleLike}
                  user={user}
                  viewMode="list"
                />
              ))}
            </div>
          )}


          {!isWorksheetBrowser && loading && documents.length > 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!isWorksheetBrowser && !hasMore && documents.length > 0 && (
            <p className="text-center text-slate-400 py-8">
              Tüm içerikler yüklendi ({totalCount} içerik)
            </p>
          )}

          {!isWorksheetBrowser && <div ref={loadMoreRef} className="h-10" />}
        </div>
      </div>

      <AnimatePresence>
        {previewDoc && (
          <ContentPreviewModal
            isCompleted={isCompleted(previewDoc.id)}
            onClose={handleClosePreview}
            onDownload={handleDownloadDocument}
            onToggleAnswerKey={() => setShowAnswerKey((current) => !current)}
            onToggleCompleted={toggleCompleted}
            previewDoc={previewDoc}
            showAnswerKey={showAnswerKey}
          />
        )}
      </AnimatePresence>


      <AnimatePresence>
        {editDoc && (
          <ContentEditModal
            editDoc={editDoc}
            editFormData={editFormData}
            editSuccess={editSuccess}
            isEditing={isEditing}
            onChange={handleEditChange}
            onClose={() => {
              setEditDoc(null);
              setEditSuccess(false);
            }}
            onFileUpload={handleEditFileUpload}
            onSubmit={handleEditSubmit}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && user?.isAdmin && (
          <ContentQuickAddModal
            formData={formData}
            isSubmitting={isSubmitting}
            onChange={handleQuickAddChange}
            onClose={() => {
              setShowModal(false);
              setSuccess(false);
            }}
            onFileUpload={handleQuickAddFileUpload}
            onSubmit={handleQuickAddSubmit}
            success={success}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showComments && (
          <ContentCommentsModal
            comments={comments}
            newComment={newComment}
            onClose={handleCloseComments}
            onNewCommentChange={setNewComment}
            onSubmit={handleCommentSubmit}
            user={user}
          />
        )}
      </AnimatePresence>

      {deleteCandidate && (
        <ContentDeleteConfirmModal
          deleting={deleting}
          deleteCandidate={deleteCandidate}
          onCancel={() => setDeleteCandidate(null)}
          onConfirm={confirmDeleteDocument}
        />
      )}
    </main>
  );
}

export default function ContentsPage(props: ContentsPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface-0 px-4 py-24">
          <div className="mx-auto max-w-6xl space-y-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="glass rounded-3xl border border-slate-200 dark:border-white/10 p-4 sm:p-6 space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-14 w-14 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <ContentsPageInner {...props} />
    </Suspense>
  );
}
