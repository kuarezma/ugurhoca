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
    badge: 'bg-sky-50 text-sky-900 border-sky-200/90 dark:bg-sky-950/50 dark:text-sky-200 dark:border-sky-800/60',
    pillActive: 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/70 dark:text-sky-200 dark:border-sky-700/60',
    pillDot: 'bg-sky-600 dark:bg-sky-400',
    label: '5. Sınıf',
  },
  6: {
    badge: 'bg-amber-50 text-amber-900 border-amber-200/90 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800/60',
    pillActive: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-700/60',
    pillDot: 'bg-amber-600 dark:bg-amber-400',
    label: '6. Sınıf',
  },
  7: {
    badge: 'bg-violet-50 text-violet-900 border-violet-200/90 dark:bg-violet-950/50 dark:text-violet-200 dark:border-violet-800/60',
    pillActive: 'bg-violet-100 text-violet-900 border-violet-300 dark:bg-violet-950/70 dark:text-violet-200 dark:border-violet-700/60',
    pillDot: 'bg-violet-600 dark:bg-violet-400',
    label: '7. Sınıf',
  },
  8: {
    badge: 'bg-emerald-50 text-emerald-900 border-emerald-200/90 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800/60',
    pillActive: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-700/60',
    pillDot: 'bg-emerald-600 dark:bg-emerald-400',
    label: '8. Sınıf (LGS)',
  },
};

export type HomeRecentDocumentsSectionProps = {
  documents: ContentDocument[];
  userGrade?: GradeValue | null;
};

export function HomeRecentDocumentsSection({
  documents: initialDocuments,
  userGrade,
}: HomeRecentDocumentsSectionProps) {
  const contextUser = useHomeUser();
  const [documents, setDocuments] =
    useState<ContentDocument[]>(initialDocuments);
  const [selectedGrade, setSelectedGrade] = useState<HomeGradeFilter>('all');
  const [hasManualSelection, setHasManualSelection] = useState(false);

  useEffect(() => {
    setDocuments(initialDocuments);
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

    const hasDocsForUserGrade = documents.some((doc) =>
      matchesGradeFilter(doc, resolvedUserGrade),
    );
    if (hasDocsForUserGrade) {
      setSelectedGrade(resolvedUserGrade);
    }
  }, [documents, hasManualSelection, resolvedUserGrade]);

  useEffect(() => {
    const handleUpdated = () => {
      void fetchHomeDocuments(16)
        .then((fresh) => {
          if (fresh.length > 0) {
            setDocuments(fresh);
          }
        })
        .catch(() => undefined);
    };

    window.addEventListener(HOME_DOCUMENTS_UPDATED_EVENT, handleUpdated);
    return () =>
      window.removeEventListener(HOME_DOCUMENTS_UPDATED_EVENT, handleUpdated);
  }, []);

  const filteredDocuments = useMemo(() => {
    return documents
      .filter((doc) => !doc.is_admin_only)
      .filter((doc) => matchesGradeFilter(doc, selectedGrade))
      .slice(0, MAX_VISIBLE_CARDS);
  }, [documents, selectedGrade]);

  if (documents.length === 0) {
    return null;
  }

  const allLibraryHref =
    selectedGrade === 'all'
      ? '/icerikler?type=yaprak-test'
      : `/icerikler?type=yaprak-test&grade=${selectedGrade}`;

  return (
    <div
      data-testid="home-recent-documents-section"
      className="rounded-2xl border border-subtle bg-surface-2 p-4 sm:p-7 shadow-sm font-sans"
    >
      {/* Üst Başlık ve Sınıf Filtre Sekmeleri */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-subtle">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-bg border border-subtle px-3 py-1 text-xs font-black text-accent-fg uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-accent-fg" />
            <span>Yeni Yüklenen İçerikler & Çözümlü Testler</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-primary flex items-center gap-2.5">
            <FileSignature className="h-6 w-6 text-sky-600 dark:text-sky-400 shrink-0" />
            <span>Son Eklenen Yaprak Testler ve Çalışma Kağıtları</span>
          </h2>
          <p className="text-xs sm:text-sm text-secondary font-medium">
            Öğrenci föylerini hemen indir veya kırmızı kalem el yazısı öğretmen çözümleriyle adım adım incele.
          </p>
        </div>

        {/* Sınıf Filtre Hapları */}
        <div
          role="tablist"
          aria-label="Sınıf düzeyine göre yeni içerikleri filtrele"
          className="flex flex-wrap items-center gap-1.5 sm:gap-2"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedGrade === 'all'}
            onClick={() => {
              setHasManualSelection(true);
              setSelectedGrade('all');
            }}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border transition-all ${
              selectedGrade === 'all'
                ? 'bg-accent-bg text-accent-fg border-default'
                : 'bg-surface-1 text-secondary border-subtle hover:border-strong'
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
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border transition-all ${
                  isSelected
                    ? style.pillActive
                    : 'bg-surface-1 text-secondary border-subtle hover:border-strong'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${style.pillDot}`}
                />
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

      {/* İçerik Kartları Grid'i */}
      {filteredDocuments.length === 0 ? (
        <div className="py-8 text-center space-y-3">
          <p className="text-sm font-semibold text-secondary">
            Bu sınıf düzeyi için son eklenenler listesinde içerik bulunamadı.
          </p>
          <SafeLink
            href={allLibraryHref}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-bg hover:bg-surface-3 text-accent-fg border border-subtle px-4 py-2.5 text-xs font-bold transition-colors shadow-xs"
          >
            <span>Tüm Kütüphaneyi Aç</span>
            <ArrowRight className="h-4 w-4" />
          </SafeLink>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredDocuments.map((doc) => {
            const primaryGrade = getPrimarySupportedGrade(doc.grade);
            const gradeStyle = primaryGrade ? GRADE_STYLES[primaryGrade] : null;
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
              isNewContent(doc.created_at);

            return (
              <article
                key={doc.id}
                className="group relative flex flex-col justify-between overflow-hidden bg-surface-1 border border-subtle hover:border-strong rounded-2xl shadow-sm p-4 sm:p-5 transition-all"
              >

                <div>
                  {/* Rozetler Satırı */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-black ${
                          gradeStyle
                            ? gradeStyle.badge
                            : 'bg-surface-2 text-secondary border-subtle'
                        }`}
                      >
                        {gradeLabel}
                      </span>

                      <span className="inline-flex items-center rounded-full border border-subtle bg-surface-2 px-2.5 py-0.5 text-xs font-bold text-secondary">
                        {getContentTypeLabel(doc.type)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1">
                      {isFresh && (
                        <span className="inline-flex items-center rounded-full bg-accent-bg text-accent-fg px-2 py-0.5 text-xs font-black uppercase tracking-wide shadow-2xs">
                          Yeni
                        </span>
                      )}

                      {(hasSolutionPdf || hasAnswerKey) && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-teal-300 dark:border-teal-700/60 bg-teal-50 dark:bg-teal-950/70 text-teal-900 dark:text-teal-200 px-2 py-0.5 text-xs font-black">
                          <CheckCircle2 className="h-3 w-3 text-teal-600 dark:text-teal-400" />
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
                    className="block group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors"
                  >
                    <h3 className="font-display text-sm sm:text-base font-bold text-primary line-clamp-2 leading-snug mb-2">
                      {doc.title}
                    </h3>
                  </SafeLink>

                  {/* Kazanım Etiketi */}
                  {outcome && (
                    <div className="mb-2 inline-flex max-w-full items-center gap-1.5 rounded-lg border border-sky-200/90 dark:border-sky-800/60 bg-sky-50/80 dark:bg-sky-950/50 px-2.5 py-1 text-xs font-bold text-sky-900 dark:text-sky-200">
                      <span className="font-black shrink-0">🎯 Kazanım:</span>
                      <span className="truncate">{outcome}</span>
                    </div>
                  )}

                  {/* Açıklama */}
                  {cleanDescription && (
                    <p className="text-xs text-secondary font-medium line-clamp-2 leading-relaxed mb-3">
                      {cleanDescription}
                    </p>
                  )}
                </div>

                {/* Alt Tarih & Hızlı Eylem Butonları */}
                <div className="pt-3 border-t border-subtle/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-tertiary">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                      <span>{formatContentDate(doc.created_at)}</span>
                    </span>
                    <span className="text-secondary font-bold">
                      Uğur Hoca
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <SafeLink
                      href={`/icerikler?id=${doc.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-default bg-accent-bg hover:opacity-90 px-3 py-2 text-xs font-bold text-accent-fg transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5 shrink-0" />
                      <span>İncele</span>
                    </SafeLink>

                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-subtle bg-surface-2 hover:bg-surface-3 px-3 py-2 text-xs font-bold text-primary transition-colors"
                      >
                        <FileText className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
                        <span>Öğrenci PDF</span>
                      </a>
                    )}

                    {doc.solution_url && doc.solution_url !== doc.file_url && (
                      <a
                        href={doc.solution_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent-bg text-accent-fg hover:opacity-90 border border-default px-3 py-2 text-xs font-bold shadow-xs transition-all"
                      >
                        <FileCheck2 className="h-3.5 w-3.5 shrink-0" />
                        <span>Çözüm PDF</span>
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Alt Tümünü Gör Bağlantısı */}
      <div className="mt-5 pt-4 border-t border-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs font-semibold text-secondary">
          Tüm sınıflara ait yaprak testler, çalışma kağıtları ve el yazısı çözümlü öğretmen föyleri kütüphanede.
        </p>
        <SafeLink
          href={allLibraryHref}
          className="inline-flex items-center gap-2 rounded-xl bg-surface-1 hover:bg-surface-3 border border-subtle px-4 py-2 text-xs font-bold text-primary transition-colors shrink-0"
        >
          <span>
            {selectedGrade === 'all'
              ? 'Tüm İçerikleri ve Yaprak Testleri Gör'
              : `${GRADE_STYLES[selectedGrade].label} Tüm Testleri Gör`}
          </span>
          <ArrowRight className="h-4 w-4" />
        </SafeLink>
      </div>
    </div>
  );
}
