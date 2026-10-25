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
    accentBar: string;
    badge: string;
    pillActive: string;
    pillDot: string;
    label: string;
  }
> = {
  5: {
    accentBar: 'from-sky-400 via-sky-500 to-blue-600',
    badge:
      'bg-sky-50 dark:bg-sky-950/70 text-sky-900 dark:text-sky-200 border-sky-300/90 dark:border-sky-700/60',
    pillActive:
      'bg-sky-600 dark:bg-sky-500 text-white dark:text-slate-950 border-sky-600 dark:border-sky-400 shadow-sm shadow-sky-500/20',
    pillDot: 'bg-sky-500',
    label: '5. Sınıf',
  },
  6: {
    accentBar: 'from-amber-400 via-amber-500 to-orange-600',
    badge:
      'bg-amber-50 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border-amber-300/90 dark:border-amber-700/60',
    pillActive:
      'bg-amber-600 dark:bg-amber-500 text-white dark:text-slate-950 border-amber-600 dark:border-amber-400 shadow-sm shadow-amber-500/20',
    pillDot: 'bg-amber-500',
    label: '6. Sınıf',
  },
  7: {
    accentBar: 'from-purple-500 via-indigo-500 to-violet-600',
    badge:
      'bg-purple-50 dark:bg-purple-950/70 text-purple-900 dark:text-purple-200 border-purple-300/90 dark:border-purple-700/60',
    pillActive:
      'bg-purple-600 dark:bg-purple-500 text-white dark:text-slate-950 border-purple-600 dark:border-purple-400 shadow-sm shadow-purple-500/20',
    pillDot: 'bg-purple-500',
    label: '7. Sınıf',
  },
  8: {
    accentBar: 'from-rose-500 via-red-500 to-pink-600',
    badge:
      'bg-rose-50 dark:bg-rose-950/70 text-rose-900 dark:text-rose-200 border-rose-300/90 dark:border-rose-700/60',
    pillActive:
      'bg-rose-600 dark:bg-rose-500 text-white dark:text-slate-950 border-rose-600 dark:border-rose-400 shadow-sm shadow-rose-500/20',
    pillDot: 'bg-rose-500',
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
      className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 p-4 sm:p-7 shadow-sm backdrop-blur-md"
    >
      {/* Üst Başlık ve Sınıf Filtre Sekmeleri */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300/80 dark:border-emerald-700/50 px-3 py-1 text-[11px] font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Yeni Yüklenen İçerikler & Çözümlü Testler</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-black text-primary flex items-center gap-2.5">
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
                ? 'bg-sky-700 dark:bg-sky-400 text-white dark:text-slate-950 border-sky-700 dark:border-sky-400 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-sky-400'
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
                    : 'bg-slate-50 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isSelected ? 'bg-white dark:bg-slate-950' : style.pillDot
                  }`}
                />
                <span>{style.label}</span>
                {isUserGrade && (
                  <span className="ml-0.5 rounded-full bg-black/15 dark:bg-white/20 px-1.5 py-0.2 text-[10px] font-black">
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
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white dark:text-white px-4 py-2.5 text-xs font-bold transition-colors shadow-xs"
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
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-4 sm:p-5 hover:bg-white dark:hover:bg-slate-900 hover:border-sky-400/80 dark:hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/5 hover:-translate-y-1 transition-all duration-200"
              >
                {/* Üst Renkli Sınıf Şeridi */}
                <div
                  className={`
                    absolute inset-x-0 top-0 h-1 bg-gradient-to-r
                    ${gradeStyle ? gradeStyle.accentBar : 'from-sky-500 to-indigo-600'}
                  `}
                />

                <div>
                  {/* Rozetler Satırı */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-black ${
                          gradeStyle
                            ? gradeStyle.badge
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {gradeLabel}
                      </span>

                      <span className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        {getContentTypeLabel(doc.type)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1">
                      {isFresh && (
                        <span className="inline-flex items-center rounded-full bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide shadow-2xs">
                          Yeni
                        </span>
                      )}

                      {(hasSolutionPdf || hasAnswerKey) && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-teal-300 dark:border-teal-700/60 bg-teal-50 dark:bg-teal-950/70 text-teal-900 dark:text-teal-200 px-2 py-0.5 text-[10px] font-black">
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
                    <h3 className="font-display text-sm sm:text-base font-black text-slate-900 dark:text-white line-clamp-2 leading-snug mb-2">
                      {doc.title}
                    </h3>
                  </SafeLink>

                  {/* Kazanım Etiketi */}
                  {outcome && (
                    <div className="mb-2 inline-flex max-w-full items-center gap-1.5 rounded-lg border border-sky-200/90 dark:border-sky-800/60 bg-sky-50/80 dark:bg-sky-950/50 px-2.5 py-1 text-[11px] font-bold text-sky-900 dark:text-sky-200">
                      <span className="font-black shrink-0">🎯 Kazanım:</span>
                      <span className="truncate">{outcome}</span>
                    </div>
                  )}

                  {/* Açıklama */}
                  {cleanDescription && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-2 leading-relaxed mb-3">
                      {cleanDescription}
                    </p>
                  )}
                </div>

                {/* Alt Tarih & Hızlı Eylem Butonları */}
                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                      <span>{formatContentDate(doc.created_at)}</span>
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 font-bold">
                      Uğur Hoca
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <SafeLink
                      href={`/icerikler?id=${doc.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-sky-300 dark:border-sky-700/70 bg-sky-50/90 dark:bg-sky-950/50 hover:bg-sky-600 hover:text-white dark:hover:bg-sky-500 dark:hover:text-slate-950 hover:border-sky-600 px-3 py-2 text-xs font-bold text-sky-900 dark:text-sky-200 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5 shrink-0" />
                      <span>İncele</span>
                    </SafeLink>

                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
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
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white dark:text-white px-3 py-2 text-xs font-bold shadow-xs transition-all"
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
      <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs font-semibold text-secondary">
          Tüm sınıflara ait yaprak testler, çalışma kağıtları ve el yazısı çözümlü öğretmen föyleri kütüphanede.
        </p>
        <SafeLink
          href={allLibraryHref}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 hover:bg-sky-600 hover:text-white dark:hover:bg-sky-500 dark:hover:text-slate-950 border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors shrink-0"
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
