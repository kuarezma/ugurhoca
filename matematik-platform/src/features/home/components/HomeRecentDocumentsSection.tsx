'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Eye,
  FileCheck2,
  FileSignature,
  FileText,
  Sparkles,
} from 'lucide-react';
import { SafeLink } from '@/components/SafeLink';
import { getContentTypeLabel } from '@/features/content/constants';
import { formatContentDate } from '@/features/content/utils';
import { HOME_DOCUMENTS_UPDATED_EVENT } from '@/features/home/home-documents-events';
import { fetchHomeDocuments, isNewContent } from '@/features/home/queries';
import { useHydrated } from '@/hooks/useClientPathname';
import type { AppUser, ContentDocument, GradeValue } from '@/types';

export const HomeUserContext = createContext<AppUser | null>(null);

export const useHomeUser = () => useContext(HomeUserContext);

type SupportedHomeGrade = 5 | 6 | 7 | 8;
type HomeGradeFilter = 'all' | SupportedHomeGrade;

const SUPPORTED_GRADES: readonly SupportedHomeGrade[] = [5, 6, 7, 8];
const WORKSHEET_META_PREFIX = '__WS_META__';
const MAX_VISIBLE_CARDS = 6;

type ParsedHomeDocMeta = {
  cleanDescription: string;
  outcome: string | null;
};

export function parseHomeDocumentMeta(
  description?: string | null,
): ParsedHomeDocMeta {
  const raw = description || '';
  if (!raw.startsWith(WORKSHEET_META_PREFIX)) {
    return {
      cleanDescription: raw.trim(),
      outcome: null,
    };
  }

  const lineBreakIndex = raw.indexOf('\n');
  const encodedMeta =
    lineBreakIndex === -1
      ? raw.slice(WORKSHEET_META_PREFIX.length)
      : raw.slice(WORKSHEET_META_PREFIX.length, lineBreakIndex);
  const cleanDescription =
    lineBreakIndex === -1 ? '' : raw.slice(lineBreakIndex + 1).trim();

  try {
    const parsed = JSON.parse(encodedMeta) as { outcome?: string };
    const outcome =
      typeof parsed.outcome === 'string' && parsed.outcome.trim().length > 0
        ? parsed.outcome.trim()
        : null;
    return {
      cleanDescription,
      outcome,
    };
  } catch {
    return {
      cleanDescription,
      outcome: null,
    };
  }
}

function getPrimarySupportedGrade(
  grades?: GradeValue[] | null,
): SupportedHomeGrade | null {
  if (!Array.isArray(grades)) {
    return null;
  }

  for (const grade of grades) {
    const num = Number(grade);
    if (num === 5 || num === 6 || num === 7 || num === 8) {
      return num;
    }
  }

  return null;
}

function matchesGradeFilter(
  doc: ContentDocument,
  filter: HomeGradeFilter,
): boolean {
  if (filter === 'all') {
    return true;
  }

  if (!Array.isArray(doc.grade)) {
    return false;
  }

  return doc.grade.some((g) => Number(g) === filter);
}

const GRADE_STYLES: Record<
  SupportedHomeGrade,
  {
    badge: string;
    pillActive: string;
    pillDot: string;
    label: string;
  }
> = {
  5: {
    badge:
      'bg-sky-100 text-sky-950 border-sky-300 dark:bg-sky-950/80 dark:text-sky-200 dark:border-sky-700',
    pillActive:
      'bg-sky-100 text-sky-950 border-sky-600 dark:bg-sky-950/80 dark:text-sky-200 dark:border-sky-400',
    pillDot: 'bg-sky-600 dark:bg-sky-400',
    label: '5. Sınıf',
  },
  6: {
    badge:
      'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700',
    pillActive:
      'bg-amber-100 text-amber-950 border-amber-700 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-400',
    pillDot: 'bg-amber-600 dark:bg-amber-400',
    label: '6. Sınıf',
  },
  7: {
    badge:
      'bg-violet-100 text-violet-950 border-violet-300 dark:bg-violet-950/80 dark:text-violet-200 dark:border-violet-700',
    pillActive:
      'bg-violet-100 text-violet-950 border-violet-600 dark:bg-violet-950/80 dark:text-violet-200 dark:border-violet-400',
    pillDot: 'bg-violet-600 dark:bg-violet-400',
    label: '7. Sınıf',
  },
  8: {
    badge:
      'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-700',
    pillActive:
      'bg-emerald-100 text-emerald-950 border-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-400',
    pillDot: 'bg-emerald-600 dark:bg-emerald-400',
    label: '8. Sınıf (LGS)',
  },
};

const CARD_ACCENTS = [
  {
    card: 'border-sky-200/80 bg-surface-1/80 dark:border-sky-400/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_28px_-10px_rgba(14,165,233,0.15)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_36px_-12px_rgba(2,6,23,0.5)] hover:border-sky-400/80 hover:-translate-y-1 transition-all duration-300',
    topBar: 'bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500',
    outcome:
      'border-sky-200/80 bg-sky-50/80 text-sky-950 dark:border-sky-800/70 dark:bg-sky-950/65 dark:text-sky-200 backdrop-blur-md',
    divider: 'border-sky-200/70 dark:border-sky-800/50',
  },
  {
    card: 'border-emerald-200/80 bg-surface-1/80 dark:border-emerald-400/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_28px_-10px_rgba(16,185,129,0.15)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_36px_-12px_rgba(2,6,23,0.5)] hover:border-emerald-400/80 hover:-translate-y-1 transition-all duration-300',
    topBar: 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500',
    outcome:
      'border-emerald-200/80 bg-emerald-50/80 text-emerald-950 dark:border-emerald-800/70 dark:bg-emerald-950/65 dark:text-emerald-200 backdrop-blur-md',
    divider: 'border-emerald-200/70 dark:border-emerald-800/50',
  },
  {
    card: 'border-violet-200/80 bg-surface-1/80 dark:border-violet-400/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_28px_-10px_rgba(139,92,246,0.15)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_36px_-12px_rgba(2,6,23,0.5)] hover:border-violet-400/80 hover:-translate-y-1 transition-all duration-300',
    topBar: 'bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-500',
    outcome:
      'border-violet-200/80 bg-violet-50/80 text-violet-950 dark:border-violet-800/70 dark:bg-violet-950/65 dark:text-violet-200 backdrop-blur-md',
    divider: 'border-violet-200/70 dark:border-violet-800/50',
  },
  {
    card: 'border-amber-200/80 bg-surface-1/80 dark:border-amber-400/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_28px_-10px_rgba(245,158,11,0.15)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_36px_-12px_rgba(2,6,23,0.5)] hover:border-amber-400/80 hover:-translate-y-1 transition-all duration-300',
    topBar: 'bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-500',
    outcome:
      'border-amber-200/80 bg-amber-50/80 text-amber-950 dark:border-amber-800/70 dark:bg-amber-950/65 dark:text-amber-200 backdrop-blur-md',
    divider: 'border-amber-200/70 dark:border-amber-800/50',
  },
  {
    card: 'border-rose-200/80 bg-surface-1/80 dark:border-rose-400/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_28px_-10px_rgba(244,63,94,0.15)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_36px_-12px_rgba(2,6,23,0.5)] hover:border-rose-400/80 hover:-translate-y-1 transition-all duration-300',
    topBar: 'bg-gradient-to-r from-rose-400 via-pink-400 to-purple-500',
    outcome:
      'border-rose-200/80 bg-rose-50/80 text-rose-950 dark:border-rose-800/70 dark:bg-rose-950/65 dark:text-rose-200 backdrop-blur-md',
    divider: 'border-rose-200/70 dark:border-rose-800/50',
  },
  {
    card: 'border-indigo-200/80 bg-surface-1/80 dark:border-indigo-400/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_28px_-10px_rgba(99,102,241,0.15)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_36px_-12px_rgba(2,6,23,0.5)] hover:border-indigo-400/80 hover:-translate-y-1 transition-all duration-300',
    topBar: 'bg-gradient-to-r from-indigo-400 via-sky-400 to-cyan-500',
    outcome:
      'border-indigo-200/80 bg-indigo-50/80 text-indigo-950 dark:border-indigo-800/70 dark:bg-indigo-950/65 dark:text-indigo-200 backdrop-blur-md',
    divider: 'border-indigo-200/70 dark:border-indigo-800/50',
  },
] as const;

export type HomeRecentDocumentsSectionProps = {
  documents: ContentDocument[];
  userGrade?: GradeValue | null;
};

export function HomeRecentDocumentsSection({
  documents: initialDocuments,
  userGrade,
}: HomeRecentDocumentsSectionProps) {
  const hydrated = useHydrated();
  const contextUser = useHomeUser();
  const [documents, setDocuments] =
    useState<ContentDocument[]>(initialDocuments);
  const [selectedGrade, setSelectedGrade] = useState<HomeGradeFilter>('all');
  const [hasManualSelection, setHasManualSelection] = useState(false);
  const [gradeDocuments, setGradeDocuments] = useState<
    Partial<Record<SupportedHomeGrade, ContentDocument[]>>
  >({});
  const [loadingGrade, setLoadingGrade] = useState(false);
  const [gradeError, setGradeError] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [retryVersion, setRetryVersion] = useState(0);

  useEffect(() => {
    setDocuments(initialDocuments);
    setGradeDocuments({});
  }, [initialDocuments]);

  const resolvedUserGrade = useMemo((): SupportedHomeGrade | null => {
    const raw = userGrade ?? contextUser?.grade;
    const num = Number(raw);
    if (num === 5 || num === 6 || num === 7 || num === 8) {
      return num;
    }
    return null;
  }, [contextUser?.grade, userGrade]);

  useEffect(() => {
    if (hasManualSelection || !resolvedUserGrade) {
      return;
    }

    setSelectedGrade(resolvedUserGrade);
  }, [hasManualSelection, resolvedUserGrade]);

  useEffect(() => {
    const handleUpdated = () => {
      setGradeDocuments({});
      setRefreshVersion((version) => version + 1);
    };
    window.addEventListener(HOME_DOCUMENTS_UPDATED_EVENT, handleUpdated);
    return () =>
      window.removeEventListener(HOME_DOCUMENTS_UPDATED_EVENT, handleUpdated);
  }, []);

  useEffect(() => {
    if (refreshVersion === 0) return;
    let cancelled = false;
    void fetchHomeDocuments(16)
      .then((fresh) => {
        if (!cancelled) setDocuments(fresh);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [refreshVersion]);

  useEffect(() => {
    if (
      selectedGrade === 'all' ||
      gradeDocuments[selectedGrade] !== undefined
    ) {
      setLoadingGrade(false);
      setGradeError(false);
      return;
    }
    let cancelled = false;
    setLoadingGrade(true);
    setGradeError(false);
    void fetchHomeDocuments(MAX_VISIBLE_CARDS, selectedGrade)
      .then((fresh) => {
        if (!cancelled) {
          setLoadingGrade(false);
          setGradeDocuments((previous) => ({
            ...previous,
            [selectedGrade]: fresh,
          }));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGradeError(true);
          setLoadingGrade(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selectedGrade, gradeDocuments, refreshVersion, retryVersion]);

  const filteredDocuments = useMemo(() => {
    const source =
      selectedGrade === 'all'
        ? documents
        : (gradeDocuments[selectedGrade] ??
          documents.filter((doc) => matchesGradeFilter(doc, selectedGrade)));
    return source
      .filter((doc) => !doc.is_admin_only)
      .slice(0, MAX_VISIBLE_CARDS);
  }, [documents, gradeDocuments, selectedGrade]);

  if (documents.length === 0 && selectedGrade === 'all') {
    return null;
  }

  const allLibraryHref =
    selectedGrade === 'all'
      ? '/icerikler?type=yaprak-test'
      : `/icerikler?type=yaprak-test&grade=${selectedGrade}`;

  return (
    <div
      data-testid="home-recent-documents-section"
      className="relative overflow-hidden rounded-3xl border border-sky-200/75 dark:border-sky-400/20 bg-surface-1/80 backdrop-blur-2xl p-5 sm:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_45px_-15px_rgba(14,165,233,0.12)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_20px_50px_-15px_rgba(2,6,23,0.65)] font-sans"
    >
      {/* Üst Prizmatik Işık Kırılım Çizgisi */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400" />

      {/* Üst Başlık ve Sınıf Filtre Sekmeleri */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-subtle">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-bg border border-sky-300/40 dark:border-sky-400/20 px-3.5 py-1 text-xs font-black text-accent-fg uppercase tracking-wider backdrop-blur-md shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-accent-fg shrink-0" />
            <span>Yeni Yüklenen İçerikler & Çözümlü Testler</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-primary flex items-center gap-2.5">
            <FileSignature className="h-6 w-6 text-sky-600 dark:text-sky-400 shrink-0" />
            <span>Son Eklenen Yaprak Testler ve Çalışma Kağıtları</span>
          </h2>
          <p className="text-xs sm:text-sm text-secondary font-medium">
            Öğrenci föylerini hemen indir veya kırmızı kalem el yazısı öğretmen
            çözümleriyle adım adım incele.
          </p>
        </div>

        {/* Sınıf Filtre Hapları */}
        <div
          role="tablist"
          aria-label="Sınıf düzeyine göre yeni içerikleri filtrele"
          className="flex flex-wrap items-center gap-2"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedGrade === 'all'}
            onClick={() => {
              setHasManualSelection(true);
              setSelectedGrade('all');
            }}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold border transition-all ${
              selectedGrade === 'all'
                ? 'bg-accent-bg text-accent-fg border-sky-600 dark:border-sky-400 shadow-xs'
                : 'bg-surface-1/90 text-secondary border-default hover:border-strong'
            }`}
          >
            <span>Tümü</span>
          </button>

          {SUPPORTED_GRADES.map((grade) => {
            const isSelected = selectedGrade === grade;
            const isUserGrade = resolvedUserGrade === grade;
            const style = GRADE_STYLES[grade];

            return (
              <button
                key={grade}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  setHasManualSelection(true);
                  setSelectedGrade(grade);
                }}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold border transition-all ${
                  isSelected
                    ? style.pillActive
                    : 'bg-surface-1/90 text-secondary border-default hover:border-strong'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${style.pillDot}`} />
                <span>{style.label}</span>
                {isUserGrade && (
                  <span className="ml-0.5 rounded-full bg-surface-3 px-1.5 py-0.2 text-xs font-black">
                    Sınıfın
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* İçerik Kartları Grid'i (Ferah 2 Sütunlu Bento Düzeni) */}
      {filteredDocuments.length === 0 && loadingGrade ? (
        <p className="py-10 text-center text-sm text-secondary" role="status">
          İçerikler yükleniyor...
        </p>
      ) : filteredDocuments.length === 0 && gradeError ? (
        <div className="py-10 text-center space-y-3" role="alert">
          <p className="text-sm text-secondary">İçerikler yüklenemedi.</p>
          <button
            type="button"
            className="rounded-xl bg-accent-bg text-accent-fg px-4 py-2 text-sm font-bold"
            onClick={() => setRetryVersion((version) => version + 1)}
          >
            Tekrar dene
          </button>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="py-10 text-center space-y-3">
          <p className="text-sm font-semibold text-secondary">
            Bu sınıf düzeyi için son eklenenler listesinde içerik bulunamadı.
          </p>
          <SafeLink
            href={allLibraryHref}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-bg hover:bg-surface-3 text-accent-fg border border-subtle px-4 py-2.5 text-xs font-bold transition-colors shadow-xs"
          >
            <span>Tüm Kütüphaneyi Aç</span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </SafeLink>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {filteredDocuments.map((doc, index) => {
            const primaryGrade = getPrimarySupportedGrade(doc.grade);
            const gradeStyle = primaryGrade ? GRADE_STYLES[primaryGrade] : null;
            const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];
            const gradeLabel = gradeStyle
              ? gradeStyle.label
              : Array.isArray(doc.grade) && doc.grade.length > 0
                ? `${doc.grade[0]}. Sınıf`
                : 'Tüm Sınıflar';
            const { cleanDescription, outcome } = parseHomeDocumentMeta(
              doc.description,
            );
            const hasSolutionPdf = Boolean(doc.solution_url?.trim());
            const hasAnswerKey = Boolean(doc.answer_key_text?.trim());
            const isHandwrittenSolution =
              hasSolutionPdf &&
              /el yazısı|el yazisi|çözümlü|cozumlu/i.test(
                `${doc.title} ${cleanDescription}`,
              );
            const isFresh =
              Boolean(doc.isNew) ||
              Boolean(doc.is_new) ||
              (hydrated && isNewContent(doc.created_at));

            return (
              <article
                key={doc.id}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border transition-all duration-300 backdrop-blur-xl ${accent.card}`}
              >
                {/* Üst Renkli Kristal Prizma Şeridi */}
                <div className={`h-1.5 w-full ${accent.topBar}`} />

                <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                  <div>
                    {/* Rozetler Satırı */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black backdrop-blur-md ${
                            gradeStyle
                              ? gradeStyle.badge
                              : 'bg-surface-2 text-secondary border-subtle'
                          }`}
                        >
                          {gradeLabel}
                        </span>

                        <span className="inline-flex items-center rounded-full border border-violet-300/80 dark:border-violet-700/70 bg-violet-100/90 dark:bg-violet-950/75 px-3 py-1 text-xs font-bold text-violet-950 dark:text-violet-200 backdrop-blur-md">
                          {getContentTypeLabel(doc.type)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {isFresh && (
                          <span className="inline-flex items-center rounded-full border border-amber-300/80 dark:border-amber-700/70 bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 px-2.5 py-0.5 text-xs font-black uppercase tracking-wide backdrop-blur-md">
                            ✨ Yeni
                          </span>
                        )}

                        {(hasSolutionPdf || hasAnswerKey) && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-teal-300/80 dark:border-teal-700/70 bg-teal-100/90 dark:bg-teal-950/80 text-teal-950 dark:text-teal-200 px-2.5 py-1 text-xs font-black backdrop-blur-md">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-teal-700 dark:text-teal-300" />
                            <span>
                              {isHandwrittenSolution
                                ? 'El Yazısı Çözümlü'
                                : hasSolutionPdf
                                  ? 'Çözüm PDF'
                                  : 'Cevap Anahtarlı'}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Başlık */}
                    <SafeLink
                      href={`/icerikler?id=${doc.id}`}
                      className="block group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors"
                    >
                      <h3 className="font-display text-base sm:text-lg font-extrabold text-primary line-clamp-2 leading-snug mb-3">
                        {doc.title}
                      </h3>
                    </SafeLink>

                    {/* Kazanım Etiketi */}
                    {outcome && (
                      <div
                        className={`mb-3 inline-flex max-w-full items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold ${accent.outcome}`}
                      >
                        <span className="font-black shrink-0">🎯 Kazanım:</span>
                        <span className="truncate">{outcome}</span>
                      </div>
                    )}

                    {/* Açıklama */}
                    {cleanDescription && (
                      <p className="text-xs sm:text-sm text-secondary font-medium line-clamp-2 leading-relaxed mb-4">
                        {cleanDescription}
                      </p>
                    )}
                  </div>

                  {/* Alt Tarih & Hızlı Eylem Butonları */}
                  <div className={`pt-4 border-t ${accent.divider} space-y-3`}>
                    <div className="flex items-center justify-between text-xs font-semibold text-secondary">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-sky-700 dark:text-sky-400" />
                        <span>{formatContentDate(doc.created_at)}</span>
                      </span>
                      <span className="text-primary font-bold">Uğur Hoca</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <SafeLink
                        href={`/icerikler?id=${doc.id}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-indigo-300/80 dark:border-indigo-700/80 bg-indigo-50/80 dark:bg-indigo-950/60 hover:bg-indigo-100/90 dark:hover:bg-indigo-900/60 px-3.5 py-2.5 text-xs font-bold text-indigo-950 dark:text-indigo-200 backdrop-blur-md transition-all shadow-xs"
                      >
                        <Eye className="h-4 w-4 shrink-0" />
                        <span>İncele</span>
                      </SafeLink>

                      {doc.file_url && (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-sky-300/80 dark:border-sky-700/80 bg-sky-50/80 dark:bg-sky-950/60 hover:bg-sky-100/90 dark:hover:bg-sky-900/60 px-3.5 py-2.5 text-xs font-bold text-sky-950 dark:text-sky-200 backdrop-blur-md transition-all shadow-xs"
                        >
                          <FileText className="h-4 w-4 shrink-0 text-sky-700 dark:text-sky-300" />
                          <span>Öğrenci PDF</span>
                        </a>
                      )}

                      {doc.solution_url &&
                        doc.solution_url !== doc.file_url && (
                          <a
                            href={doc.solution_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-800 text-[var(--on-brand)] dark:from-emerald-400 dark:to-teal-400 dark:text-slate-950 hover:opacity-95 border border-transparent px-3.5 py-2.5 text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                          >
                            <FileCheck2 className="h-4 w-4 shrink-0" />
                            <span>Çözüm PDF</span>
                          </a>
                        )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Alt Tümünü Gör Bağlantısı */}
      <div className="mt-6 pt-5 border-t border-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs sm:text-sm font-semibold text-secondary">
          Tüm sınıflara ait yaprak testler, çalışma kağıtları ve el yazısı
          çözümlü öğretmen föyleri kütüphanede.
        </p>
        <SafeLink
          href={allLibraryHref}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-bg hover:opacity-90 border border-default px-4 py-2.5 text-xs sm:text-sm font-bold text-accent-fg transition-colors shrink-0"
        >
          <span>
            {selectedGrade === 'all'
              ? 'Tüm İçerikleri ve Yaprak Testleri Gör'
              : `${GRADE_STYLES[selectedGrade].label} Tüm Testleri Gör`}
          </span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </SafeLink>
      </div>
    </div>
  );
}
