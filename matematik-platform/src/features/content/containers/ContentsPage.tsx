'use client';

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Calculator,
  Filter,
  Grid,
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
import type { ContentDocument } from '@/types';

const GRADE_OPTIONS = [5, 6, 7, 8, 9, 10, 11, 12] as const;

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
  const [hasMore, setHasMore] = useState(
    initialDocuments.length < initialTotalCount,
  );
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [authResolved, setAuthResolved] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const loadRequestIdRef = useRef(0);

  const applyDocumentPatch = useCallback(
    (documentId: string, patch: Partial<ContentDocument>) => {
      setDocuments((current) =>
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
  ]);

  useEffect(() => {
    if (!authResolved) {
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

      const targetDocument = documents.find(
        (document) => document.id === showComments,
      );

      if (!targetDocument) return;

      const nextCount = (targetDocument.comments_count || 0) + 1;
      await updateDocumentMetric(showComments, { comments_count: nextCount });
      applyDocumentPatch(showComments, { comments_count: nextCount });
    },
    [applyDocumentPatch, documents, newComment, showComments, user],
  );

  const handleQuickAddOpen = useCallback(() => {
    setFormData({
      type: selectedType !== 'all' ? selectedType : 'yaprak-test',
      grade: [
        selectedGrade !== 'all' && selectedGrade !== 'Mezun'
          ? Number(selectedGrade)
          : user?.grade ?? 5,
      ],
    });
    setShowModal(true);
  }, [selectedGrade, selectedType, user?.grade]);

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
    [formData],
  );

  const handleOpenEdit = useCallback((content: ContentDocument) => {
    setEditDoc(content);
    setEditFormData({ ...content });
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
    [applyDocumentPatch, editDoc, editFormData],
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
                  placeholder="İçerik ara..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="flex gap-3 flex-wrap">
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
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mb-6"
          >
            <Filter className="w-5 h-5 text-slate-400" />
            {loading ? (
              <span className="text-slate-400">Yükleniyor...</span>
            ) : (
              <span className="text-slate-400">
                {filteredContents.length} içerik bulundu
              </span>
            )}
          </motion.div>

          {loading && documents.length === 0 ? (
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

          {loading && documents.length > 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!hasMore && documents.length > 0 && (
            <p className="text-center text-slate-400 py-8">
              Tüm içerikler yüklendi ({totalCount} içerik)
            </p>
          )}

          <div ref={loadMoreRef} className="h-10" />
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
