'use client';

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ChevronRight,
  Calculator,
  Filter,
  FolderOpen,
  Grid,
  Layers3,
  List,
  Plus,
  Search,
} from 'lucide-react';
import FloatingShapes from '@/components/FloatingShapes';
import ContentCard from '@/features/content/components/ContentCard';
import ContentCommentsModal from '@/features/content/components/ContentCommentsModal';
import ContentEditModal from '@/features/content/components/ContentEditModal';
import ContentPreviewModal from '@/features/content/components/ContentPreviewModal';
import ContentQuickAddModal from '@/features/content/components/ContentQuickAddModal';
import {
  CONTENT_PAGE_SIZE,
  CONTENT_TYPE_OPTIONS,
} from '@/features/content/constants';
import {
  createContentDocument,
  createDocumentComment,
  deleteContentDocument,
  loadContentDocuments,
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
} from '@/features/content/types';
import {
  getContentPageDescription,
  getContentPageTitle,
  normalizeContentGrade,
} from '@/features/content/utils';
import {
  getWorksheetVisibleDescription,
  getWorksheetOutcomeLabel,
  isWorksheetType,
  sortWorksheetDocuments,
  WORKSHEET_GRADE_OPTIONS,
} from '@/features/content/worksheet';
import { WORKSHEET_OUTCOME_CATALOG } from '@/features/content/worksheet-catalog';
import type { ContentDocument, GradeValue } from '@/types';

const GRADE_OPTIONS = [5, 6, 7, 8, 9, 10, 11, 12] as const;

type WorksheetGradeSelection = number | 'Mezun';

const WORKSHEET_UNIT_LABELS: Record<number, Record<string, string>> = {
  5: {
    'MAT.5.1': 'Sayılar ve Nicelikler',
    'MAT.5.2': 'İşlemlerle Cebirsel Düşünme',
    'MAT.5.3': 'Geometrik Şekiller',
    'MAT.5.4': 'Geometrik Nicelikler',
    'MAT.5.5': 'İstatistiksel Araştırma Süreci',
    'MAT.5.6': 'Veriden Olasılığa',
  },
  6: {
    'MAT.6.1': 'Sayılar ve Nicelikler',
    'MAT.6.2': 'İşlemlerle Cebirsel Düşünme ve Değişimler',
    'MAT.6.3': 'Geometrik Şekiller',
    'MAT.6.4': 'Geometrik Nicelikler',
    'MAT.6.5': 'İstatistiksel Araştırma Süreci',
    'MAT.6.6': 'Veriden Olasılığa',
  },
  7: {
    'M.7.1': 'Sayılar ve İşlemler',
    'M.7.2': 'Cebir',
    'M.7.3': 'Geometri ve Ölçme',
    'M.7.4': 'Veri İşleme',
  },
  8: {
    'M.8.1': 'Sayılar ve İşlemler',
    'M.8.2': 'Cebir',
    'M.8.3': 'Geometri ve Ölçme',
    'M.8.4': 'Veri Analizi',
    'M.8.5': 'Olasılık',
  },
};

const getWorksheetUnitPrefix = (code: string) => {
  const match = code.match(/^([A-Z]+(?:\.[0-9]+){2})\./i);
  return match?.[1] || null;
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

type ContentsPageProps = {
  initialDocuments?: ContentDocument[];
  initialGrade?: ContentGradeFilter;
  initialTotalCount?: number;
  initialType?: string;
};

function ContentsPageInner({
  initialDocuments = [],
  initialGrade = 'all',
  initialTotalCount = 0,
  initialType = 'all',
}: ContentsPageProps) {
  const searchParams = useSearchParams();
  const typeFromUrl = searchParams.get('type') || 'all';
  const [user, setUser] = useState<ContentPageUser | null>(null);
  const [documents, setDocuments] = useState<ContentDocument[]>(
    initialDocuments,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] =
    useState<ContentGradeFilter>(initialGrade);
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [likedDocs, setLikedDocs] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
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
  const [worksheetDocuments, setWorksheetDocuments] = useState<ContentDocument[]>(
    [],
  );
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
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const loadRequestIdRef = useRef(0);
  const worksheetRequestIdRef = useRef(0);
  const isWorksheetBrowser = isWorksheetType(selectedType);

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
    ) => {
      const requestId = ++loadRequestIdRef.current;
      setLoading(true);
      try {
        const { count, documents: nextDocuments } = await loadContentDocuments(
          pageNum,
          CONTENT_PAGE_SIZE,
          gradeFilter,
          typeFilter,
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
      } finally {
        if (requestId === loadRequestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    seedContentDocumentCache(1, CONTENT_PAGE_SIZE, initialGrade, initialType, {
      count: initialTotalCount,
      documents: initialDocuments,
    });
  }, [initialDocuments, initialGrade, initialTotalCount, initialType]);

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

    if (selectedGrade === initialGrade && selectedType === initialType) {
      setPage(1);
      loadRequestIdRef.current += 1;
      setDocuments(initialDocuments);
      setTotalCount(initialTotalCount);
      setHasMore(initialDocuments.length < initialTotalCount);
      setLoading(false);
      return;
    }

    setPage(1);
    void loadDocuments(1, false, selectedGrade, selectedType);
  }, [
    authResolved,
    initialDocuments,
    initialGrade,
    initialTotalCount,
    initialType,
    loadDocuments,
    selectedGrade,
    selectedType,
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
          void loadDocuments(nextPage, true, selectedGrade, selectedType);
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
    hasMore,
    loadDocuments,
    loading,
    page,
    selectedGrade,
    selectedType,
    isWorksheetBrowser,
  ]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const resolvedUser = await resolveContentUser();

        if (!resolvedUser) {
          setUser(null);
          return;
        }

        setUser(resolvedUser);
        setSelectedGrade(
          resolvedUser.isAdmin
            ? 'all'
            : normalizeContentGrade(String(resolvedUser.grade)),
        );
      } finally {
        setAuthResolved(true);
      }
    };

    void checkSession();
  }, []);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (!savedFavorites) return;

    try {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    } catch {}
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
      setSelectedWorksheetGrade(grade);

      if (!preserveOutcome) {
        setSelectedWorksheetOutcome(null);
      }

      try {
        const nextDocuments = await loadWorksheetDocumentsByGrade(grade);

        if (requestId !== worksheetRequestIdRef.current) {
          return;
        }

        setWorksheetDocuments(nextDocuments);
      } finally {
        if (requestId === worksheetRequestIdRef.current) {
          setWorksheetLoading(false);
        }
      }
    },
    [],
  );

  const refreshSelectedWorksheetGrade = useCallback(async () => {
    if (!selectedWorksheetGrade) {
      return;
    }

    await loadWorksheetGradeDocuments(selectedWorksheetGrade, true);
  }, [loadWorksheetGradeDocuments, selectedWorksheetGrade]);

  const handleTypeChange = useCallback((type: string) => {
    setSelectedType(type);
    const url = new URL(window.location.href);

    if (type === 'all') {
      url.searchParams.delete('type');
    } else {
      url.searchParams.set('type', type);
    }

    window.history.pushState({}, '', url.toString());
  }, []);

  const toggleFavorite = useCallback((docId: string) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        next.add(docId);
      }

      localStorage.setItem('favorites', JSON.stringify([...next]));
      return next;
    });
  }, []);

  const handleCopyLink = useCallback((content: ContentDocument) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/icerikler?id=${content.id}`,
    );
    alert('Link kopyalandı!');
  }, []);

  const handleOpenPreview = useCallback((content: ContentDocument) => {
    setShowAnswerKey(false);
    setPreviewDoc(content);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewDoc(null);
    setShowAnswerKey(false);
  }, []);

  const handleDownloadDocument = useCallback(
    async (content: ContentDocument) => {
      if (!content.file_url) return;

      window.open(content.file_url, '_blank');
      const nextDownloads = (content.downloads || 0) + 1;
      await updateDocumentMetric(content.id, { downloads: nextDownloads });
      applyDocumentPatch(content.id, { downloads: nextDownloads });
    },
    [applyDocumentPatch],
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

      await updateDocumentMetric(content.id, { likes: nextLikes });
      applyDocumentPatch(content.id, { likes: nextLikes });
    },
    [applyDocumentPatch, likedDocs],
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
    const defaultWorksheetGrade =
      selectedWorksheetGrade ||
      (selectedGrade !== 'all' ? (selectedGrade as GradeValue) : user?.grade || 5);

    setFormData({
      type: selectedType !== 'all' ? selectedType : 'yaprak-test',
      grade: isWorksheetBrowser ? [defaultWorksheetGrade] : [defaultWorksheetGrade],
      learning_outcome: isWorksheetBrowser ? selectedWorksheetOutcome || '' : '',
    });
    setShowModal(true);
  }, [
    isWorksheetBrowser,
    selectedGrade,
    selectedType,
    selectedWorksheetGrade,
    selectedWorksheetOutcome,
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
        alert(
          'Dosya yüklenemedi: ' +
            (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  const handleQuickAddSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);

      try {
        const document = await createContentDocument(formData);

        if (document) {
          setDocuments((current) => [document, ...current]);

          if (
            isWorksheetType(document.type) &&
            selectedWorksheetGrade &&
            Array.isArray(document.grade) &&
            document.grade.some(
              (grade) => String(grade) === String(selectedWorksheetGrade),
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
        alert(
          'Kaydetme hatası: ' +
            (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, refreshSelectedWorksheetGrade, selectedWorksheetGrade],
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
        alert(
          'Dosya yüklenemedi: ' +
            (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        );
      } finally {
        setIsEditing(false);
      }
    },
    [],
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
        alert(
          'Güncelleme hatası: ' +
            (error instanceof Error ? error.message : 'Bilinmeyen hata'),
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
    ],
  );

  const handleDeleteDocument = useCallback(
    async (content: ContentDocument) => {
      if (!confirm('Bu içeriği silmek istediğinize emin misiniz?')) {
        return;
      }

      await deleteContentDocument(content.id);
      removeDocumentFromState(content.id);
    },
    [removeDocumentFromState],
  );

  const filteredContents = documents.filter((content) => {
    if (!content.title) return false;
    return content.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredWorksheetGrades = WORKSHEET_GRADE_OPTIONS.filter((grade) => {
    if (!searchTerm.trim()) {
      return true;
    }

    const label = grade === 'Mezun' ? 'mezun' : `${grade}. sınıf`;
    return label.toLowerCase().includes(searchTerm.trim().toLowerCase());
  });

  const worksheetDocumentGroups = worksheetDocuments.reduce<
    Record<string, ContentDocument[]>
  >((groups, document) => {
    const outcome = getWorksheetOutcomeLabel(document);
    groups[outcome] = [...(groups[outcome] || []), document];
    return groups;
  }, {});

  const worksheetCatalogOutcomes =
    selectedWorksheetGrade && typeof selectedWorksheetGrade === 'number'
      ? WORKSHEET_OUTCOME_CATALOG[selectedWorksheetGrade] || []
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
    .filter(({ outcome }) =>
      searchTerm.trim()
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

  const worksheetOutcomeGroups = worksheetOutcomeEntries.reduce<
    Array<{
      entries: typeof worksheetOutcomeEntries;
      key: string;
      title: string;
    }>
  >((groups, entry) => {
    const grade =
      typeof selectedWorksheetGrade === 'number' ? selectedWorksheetGrade : null;
    const prefix = entry.catalogItem
      ? getWorksheetUnitPrefix(entry.catalogItem.code)
      : null;
    const title =
      grade && prefix
        ? WORKSHEET_UNIT_LABELS[grade]?.[prefix] || prefix
        : 'Diğer Kazanımlar';
    const key = prefix || 'other';
    const existingGroup = groups.find((group) => group.key === key);

    if (existingGroup) {
      existingGroup.entries.push(entry);
      return groups;
    }

    groups.push({
      entries: [entry],
      key,
      title,
    });

    return groups;
  }, []);

  const filteredWorksheetTests = sortWorksheetDocuments(
    worksheetDocuments.filter((document) => {
      if (!selectedWorksheetOutcome) {
        return false;
      }

      if (getWorksheetOutcomeLabel(document) !== selectedWorksheetOutcome) {
        return false;
      }

      if (!searchTerm.trim()) {
        return true;
      }

      return document.title
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase());
    }),
  );

  const searchPlaceholder = isWorksheetBrowser
    ? selectedWorksheetOutcome
      ? 'Test ara...'
      : selectedWorksheetGrade
        ? 'Kazanım ara...'
        : 'Sınıf düzeyi ara...'
    : 'İçerik ara...';

  const resultLabel = isWorksheetBrowser
    ? selectedWorksheetOutcome
      ? `${filteredWorksheetTests.length} test bulundu`
      : selectedWorksheetGrade
        ? `${worksheetOutcomeEntries.length} kazanım bulundu`
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
    <main className="icerikler-page min-h-screen gradient-bg pb-20">
      <FloatingShapes />

      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0b1220]/95 backdrop-blur-md border-b border-white/10 py-4 px-4 sm:px-6 xl:px-8">
        <div className="max-w-[1760px] mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Uğur Hoca Matematik
            </span>
          </Link>

          <Link
            href={profileHref}
            className="text-slate-300 hover:text-white flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            {user?.isAdmin ? 'Admin Panel' : 'Profil'}
          </Link>
        </div>
      </nav>

      <div className="pt-24 px-4 sm:px-6 xl:px-8">
        <div className="max-w-[1760px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-2">
                {getContentPageTitle(selectedType)}
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
                {getContentPageDescription(selectedType, selectedGrade)}
              </p>
            </div>
            {user?.isAdmin && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleQuickAddOpen}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-sm sm:text-base text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg flex items-center justify-center gap-2"
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
            className="glass rounded-2xl p-4 sm:p-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="flex gap-3 flex-wrap">
                {!isWorksheetBrowser && (
                  <>
                    <select
                      value={selectedGrade}
                      onChange={(event) => {
                        const value = event.target.value;
                        if (value === 'all') {
                          setSelectedGrade('all');
                        } else if (value === 'Mezun') {
                          setSelectedGrade('Mezun');
                        } else {
                          setSelectedGrade(parseInt(value));
                        }
                      }}
                      className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      <option value="all">Tüm Sınıflar</option>
                      {GRADE_OPTIONS.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}. Sınıf
                        </option>
                      ))}
                      <option value="Mezun">Mezun</option>
                    </select>

                    {user && !user.isAdmin && (
                      <button
                        onClick={() =>
                          setSelectedGrade(
                            selectedGrade === 'all'
                              ? normalizeContentGrade(user.grade)
                              : 'all',
                          )
                        }
                        className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                          selectedGrade === 'all'
                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                            : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        {selectedGrade === 'all'
                          ? 'Tüm Sınıflar Açık'
                          : 'Diğer Sınıfları da Göster'}
                      </button>
                    )}
                  </>
                )}

                <select
                  value={selectedType}
                  onChange={(event) => handleTypeChange(event.target.value)}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="all">Tüm Türler</option>
                  {CONTENT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {isWorksheetBrowser && (
                  <>
                    {selectedWorksheetGrade && (
                      <button
                        onClick={() => {
                          resetWorksheetHierarchy();
                          setSearchTerm('');
                        }}
                        className="px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/50 text-sm font-semibold text-slate-200 transition-colors hover:text-white"
                      >
                        Sınıf Kartları
                      </button>
                    )}
                    {selectedWorksheetOutcome && (
                      <button
                        onClick={() => {
                          setSelectedWorksheetOutcome(null);
                          setSearchTerm('');
                        }}
                        className="px-4 py-3 rounded-xl border border-purple-500/30 bg-purple-500/15 text-sm font-semibold text-purple-100 transition-colors hover:bg-purple-500/25"
                      >
                        Kazanımlara Dön
                      </button>
                    )}
                  </>
                )}

                {(!isWorksheetBrowser || selectedWorksheetOutcome) && (
                  <div className="flex glass rounded-xl overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-3 transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-purple-500 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-3 transition-colors ${
                        viewMode === 'list'
                          ? 'bg-purple-500 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {isWorksheetBrowser && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-300"
            >
              <button
                onClick={() => {
                  resetWorksheetHierarchy();
                  setSearchTerm('');
                }}
                className={`rounded-full border px-4 py-2 transition-colors ${
                  selectedWorksheetGrade
                    ? 'border-slate-700 bg-slate-800/50 hover:text-white'
                    : 'border-purple-500/30 bg-purple-500/15 text-purple-100'
                }`}
              >
                Sınıf Düzeyleri
              </button>
              {worksheetGradeLabel && (
                <>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                  <button
                    onClick={() => setSelectedWorksheetOutcome(null)}
                    className={`rounded-full border px-4 py-2 transition-colors ${
                      selectedWorksheetOutcome
                        ? 'border-slate-700 bg-slate-800/50 hover:text-white'
                        : 'border-purple-500/30 bg-purple-500/15 text-purple-100'
                    }`}
                  >
                    {worksheetGradeLabel}
                  </button>
                </>
              )}
              {selectedWorksheetOutcome && (
                <>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                  <span className="rounded-full border border-purple-500/30 bg-purple-500/15 px-4 py-2 text-purple-100">
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
            <Filter className="w-5 h-5 text-slate-400" />
            {loading || worksheetLoading ? (
              <span className="text-slate-400">Yükleniyor...</span>
            ) : (
              <span className="text-slate-400">{resultLabel}</span>
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
                    onClick={() => void loadWorksheetGradeDocuments(grade)}
                    className="text-left rounded-3xl border border-purple-500/20 bg-purple-500/10 p-5 sm:p-6 transition-all hover:-translate-y-1 hover:border-purple-400/40 hover:bg-purple-500/15"
                  >
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500">
                      <Layers3 className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {grade === 'Mezun' ? grade : `${grade}. Sınıf`}
                    </h3>
                  </motion.button>
                ))}
              </div>
            ) : worksheetLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="glass rounded-3xl overflow-hidden border border-white/10"
                  >
                    <div className="h-2 bg-slate-700 animate-pulse" />
                    <div className="p-4 sm:p-6 space-y-4">
                      <div className="w-14 h-14 rounded-xl bg-slate-700 animate-pulse" />
                      <div className="h-5 bg-slate-700 rounded w-2/3 animate-pulse" />
                      <div className="h-4 bg-slate-700 rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !selectedWorksheetOutcome ? (
              worksheetOutcomeEntries.length > 0 ? (
                <div className="space-y-8">
                  {worksheetOutcomeGroups.map((group, groupIndex) => (
                    <div key={group.key} className="space-y-3">
                      <div className="rounded-2xl border border-cyan-400/15 bg-cyan-500/10 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="worksheet-unit-line h-px flex-1 bg-gradient-to-r from-cyan-400/70 to-transparent" />
                          <p className="shrink-0 text-sm font-extrabold uppercase tracking-[0.24em] text-cyan-100 sm:text-base">
                            {group.title}
                          </p>
                          <div className="worksheet-unit-line h-px flex-1 bg-gradient-to-l from-cyan-400/70 to-transparent" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        {group.entries.map((entry, entryIndex) => {
                          const outcomeHeading = splitWorksheetOutcomeHeading(
                            entry.outcome,
                          );

                          return (
                            <motion.button
                              key={entry.outcome}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                delay: groupIndex * 0.06 + entryIndex * 0.03,
                              }}
                              onClick={() =>
                                setSelectedWorksheetOutcome(entry.outcome)
                              }
                              className="group flex w-full items-center gap-4 rounded-2xl border border-cyan-500/15 bg-slate-900/50 px-4 py-4 text-left transition-all hover:border-cyan-400/35 hover:bg-slate-900/70 sm:px-5"
                            >
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500">
                                <FolderOpen className="h-6 w-6 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="worksheet-outcome-title text-sm font-semibold leading-relaxed text-white transition-colors group-hover:text-cyan-200 sm:text-base">
                                  {outcomeHeading.code ? (
                                    <>
                                      <span className="text-red-400">
                                        {outcomeHeading.code}
                                      </span>{' '}
                                      <span>{outcomeHeading.label}</span>
                                    </>
                                  ) : (
                                    entry.outcome
                                  )}
                                </h3>
                              </div>
                              <div className="ml-auto flex shrink-0 items-center gap-3">
                                <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                                  {entry.count} test
                                </span>
                                <ChevronRight className="h-5 w-5 text-slate-500 transition-colors group-hover:text-cyan-200" />
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass rounded-3xl border border-white/10 p-8 text-center">
                  <p className="text-xl font-semibold text-white">
                    {worksheetGradeLabel} için kazanım bulunamadı
                  </p>
                  <p className="mt-3 text-slate-400">
                    Bu sınıf düzeyine henüz yaprak test yüklenmemiş.
                  </p>
                </div>
              )
            ) : viewMode === 'grid' ? (
              filteredWorksheetTests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
                  {filteredWorksheetTests.map((content, index) => (
                    <ContentCard
                      key={content.id}
                      content={content}
                      index={index}
                      isFavorite={favorites.has(content.id)}
                      isLiked={likedDocs.has(content.id)}
                      onCopyLink={handleCopyLink}
                      onDelete={handleDeleteDocument}
                      onDownload={handleDownloadDocument}
                      onEdit={handleOpenEdit}
                      onOpenComments={handleOpenComments}
                      onPreview={handleOpenPreview}
                      onToggleFavorite={toggleFavorite}
                      onToggleLike={handleToggleLike}
                      user={user}
                      viewMode="grid"
                    />
                  ))}
                </div>
              ) : (
                <div className="glass rounded-3xl border border-white/10 p-8 text-center">
                  <p className="text-xl font-semibold text-white">
                    Bu kazanımda test bulunamadı
                  </p>
                  <p className="mt-3 text-slate-400">
                    Uygun test yüklendiğinde burada listelenecek.
                  </p>
                </div>
              )
            ) : filteredWorksheetTests.length > 0 ? (
              <div className="space-y-4">
                {filteredWorksheetTests.map((content, index) => (
                  <ContentCard
                    key={content.id}
                    content={content}
                    index={index}
                    isFavorite={favorites.has(content.id)}
                    isLiked={likedDocs.has(content.id)}
                    onCopyLink={handleCopyLink}
                    onDelete={handleDeleteDocument}
                    onDownload={handleDownloadDocument}
                    onEdit={handleOpenEdit}
                    onOpenComments={handleOpenComments}
                    onPreview={handleOpenPreview}
                    onToggleFavorite={toggleFavorite}
                    onToggleLike={handleToggleLike}
                    user={user}
                    viewMode="list"
                  />
                ))}
              </div>
            ) : (
              <div className="glass rounded-3xl border border-white/10 p-8 text-center">
                <p className="text-xl font-semibold text-white">
                  Bu kazanımda test bulunamadı
                </p>
                <p className="mt-3 text-slate-400">
                  Uygun test yüklendiğinde burada listelenecek.
                </p>
              </div>
            )
          ) : loading && documents.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="glass rounded-3xl overflow-hidden border border-white/10"
                >
                  <div className="h-2 bg-slate-700 animate-pulse" />
                  <div className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-700 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-700 rounded w-3/4 animate-pulse" />
                        <div className="h-3 bg-slate-700 rounded w-1/2 animate-pulse" />
                      </div>
                    </div>
                    <div className="h-6 bg-slate-700 rounded w-full animate-pulse" />
                    <div className="h-4 bg-slate-700 rounded w-2/3 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
              {filteredContents.map((content, index) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  index={index}
                  isFavorite={favorites.has(content.id)}
                  isLiked={likedDocs.has(content.id)}
                  onCopyLink={handleCopyLink}
                  onDelete={handleDeleteDocument}
                  onDownload={handleDownloadDocument}
                  onEdit={handleOpenEdit}
                  onOpenComments={handleOpenComments}
                  onPreview={handleOpenPreview}
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
                  isFavorite={favorites.has(content.id)}
                  isLiked={likedDocs.has(content.id)}
                  onCopyLink={handleCopyLink}
                  onDelete={handleDeleteDocument}
                  onDownload={handleDownloadDocument}
                  onEdit={handleOpenEdit}
                  onOpenComments={handleOpenComments}
                  onPreview={handleOpenPreview}
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
            onClose={handleClosePreview}
            onDownload={handleDownloadDocument}
            onToggleAnswerKey={() => setShowAnswerKey((current) => !current)}
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
    </main>
  );
}

export default function ContentsPage(props: ContentsPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <ContentsPageInner {...props} />
    </Suspense>
  );
}
