import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Heart,
  Layers,
  Sparkles,
} from 'lucide-react';
import { buildDocumentSlug } from '@/lib/document-slug';
import { SITE_URL } from '@/lib/site-metadata';
import { formatIstanbulDate } from '@/lib/date-format';
import {
  getContentPrimaryGradeBadgeTone,
  getContentTypeLabel,
} from '@/features/content/constants';
import {
  getContentPrimaryGradeLabel,
  getDriveId,
  getYouTubeId,
} from '@/features/content/utils';
import {
  getWorksheetGradeValue,
  getWorksheetOutcomeLabel,
  parseWorksheetMetadata,
} from '@/features/content/worksheet';
import { Chip } from '@/components/ui/Chip';
import type { ContentDocument } from '@/types';

type ContentDetailViewProps = {
  doc: ContentDocument;
  relatedDocuments: ContentDocument[];
};

export function ContentDetailView({
  doc,
  relatedDocuments,
}: ContentDetailViewProps) {
  const primaryGrade = getWorksheetGradeValue(doc.grade);
  const gradeLabel = getContentPrimaryGradeLabel(doc);
  const gradeBadgeTone = getContentPrimaryGradeBadgeTone(doc);
  const typeLabel = getContentTypeLabel(doc.type);
  const worksheetMeta = parseWorksheetMetadata(doc.description);
  const cleanDescription = worksheetMeta.cleanDescription?.trim();
  const outcomeLabel =
    doc.type === 'yaprak-test' ? getWorksheetOutcomeLabel(doc) : null;
  const canonicalUrl = `${SITE_URL}/icerikler/${buildDocumentSlug(doc)}`;
  const driveId = doc.file_url ? getDriveId(doc.file_url) : null;
  const youtubeId = doc.video_url ? getYouTubeId(doc.video_url) : null;
  const isPdf =
    typeof doc.file_url === 'string' &&
    (doc.file_url.toLowerCase().includes('.pdf') ||
      doc.file_url.includes('application/pdf'));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: doc.title,
    description: cleanDescription || doc.title,
    educationalLevel: primaryGrade ? `${primaryGrade}. Sınıf` : 'Tüm Kademeler',
    learningResourceType: typeLabel,
    inLanguage: 'tr-TR',
    isAccessibleForFree: true,
    author: {
      '@type': 'Person',
      name: 'Uğur YAŞAYAN',
    },
    datePublished: doc.created_at,
    url: canonicalUrl,
  };

  return (
    <div className="min-h-screen bg-canvas text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="border-b border-subtle bg-surface-1/60 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 sm:py-6">
          <nav aria-label="Gezinme" className="mb-4">
            <ol className="flex flex-wrap items-center gap-2 text-xs font-semibold text-secondary">
              <li>
                <Link href="/" className="transition-colors hover:text-accent">
                  Ana Sayfa
                </Link>
              </li>
              <li aria-hidden="true" className="text-tertiary">
                /
              </li>
              <li>
                <Link
                  href="/icerikler"
                  className="transition-colors hover:text-accent"
                >
                  İçerikler
                </Link>
              </li>
              {primaryGrade && (
                <>
                  <li aria-hidden="true" className="text-tertiary">
                    /
                  </li>
                  <li>
                    <Link
                      href={`/icerikler?grade=${primaryGrade}`}
                      className="transition-colors hover:text-accent"
                    >
                      {gradeLabel}
                    </Link>
                  </li>
                </>
              )}
              <li aria-hidden="true" className="text-tertiary">
                /
              </li>
              <li className="font-bold text-primary truncate max-w-[200px] sm:max-w-[320px]">
                {doc.title}
              </li>
            </ol>
          </nav>

          <Link
            href="/icerikler"
            className="inline-flex items-center gap-2 text-xs font-bold text-secondary hover:text-primary transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Tüm Kütüphaneye Dön
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Chip
              tone={gradeBadgeTone}
              className="rounded-full px-3 py-1 text-xs font-black"
            >
              {gradeLabel}
            </Chip>
            <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-bold text-secondary border border-subtle">
              {typeLabel}
            </span>
            {doc.isNew && (
              <span className="rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 px-3 py-1 text-xs font-black border border-emerald-500/30">
                Yeni
              </span>
            )}
            {(doc.solution_url || doc.answer_key_text) && (
              <span className="rounded-full bg-cyan-500/15 text-cyan-800 dark:text-cyan-200 px-3 py-1 text-xs font-black border border-cyan-500/30">
                Çözümlü
              </span>
            )}
          </div>

          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-primary leading-tight mb-4">
            {doc.title}
          </h1>

          {outcomeLabel && (
            <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-xl border border-sky-400/40 bg-sky-500/10 px-3.5 py-2 text-xs font-bold text-sky-950 dark:text-sky-100">
              <span className="shrink-0 font-black text-sky-900 dark:text-sky-300">
                🎯 MEB Kazanımı:
              </span>
              <span className="truncate">{outcomeLabel}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-secondary pt-3 border-t border-subtle">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-accent" />
              <span>{doc.author || 'Uğur YAŞAYAN'}</span>
            </div>
            <span className="hidden sm:inline" aria-hidden="true">
              •
            </span>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-accent" />
              <span>
                {formatIstanbulDate(
                  doc.created_at || new Date().toISOString(),
                  {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  },
                )}
              </span>
            </div>
            <span className="hidden sm:inline" aria-hidden="true">
              •
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5 text-accent" />
                {doc.views || 0} görüntülenme
              </span>
              <span className="flex items-center gap-1">
                <Download className="h-3.5 w-3.5 text-accent" />
                {doc.downloads || 0} indirme
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5 text-rose-500" />
                {doc.likes || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Mobil Hızlı İşlemler Çubuğu */}
            {(doc.file_url || doc.solution_url) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 lg:hidden">
                {doc.file_url && (
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-brand px-4 py-3 text-xs sm:text-sm font-bold text-on-brand transition-all hover:opacity-95 shadow-md shadow-accent/10 hover:-translate-y-0.5 active:translate-y-0.5"
                  >
                    <Download className="h-4 w-4" />
                    Dokümanı İndir (PDF)
                  </a>
                )}
                {doc.solution_url && (
                  <a
                    href={doc.solution_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-400/50 bg-emerald-500/10 px-4 py-3 text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200 transition-all hover:bg-emerald-500/20"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Çözüm PDF&apos;ini Aç
                  </a>
                )}
              </div>
            )}

            {cleanDescription && (
              <div className="rounded-3xl border border-subtle bg-surface-1 p-6 shadow-sm">
                <h2 className="font-display text-base font-bold text-primary mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  İçerik Hakkında
                </h2>
                <p className="text-secondary text-sm leading-relaxed whitespace-pre-line font-medium">
                  {cleanDescription}
                </p>
              </div>
            )}

            <div className="rounded-3xl border border-subtle bg-surface-1 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between border-b border-subtle px-5 py-3.5 bg-surface-2/40">
                <span className="text-xs font-bold text-secondary flex items-center gap-2">
                  <FileText className="h-4 w-4 text-accent" />
                  Doküman Önizlemesi
                </span>
                <Link
                  href={`/icerikler?id=${doc.id}`}
                  className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
                >
                  Kütüphanede Aç
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="min-h-[420px] sm:min-h-[540px] bg-surface-2/30 flex items-center justify-center">
                {doc.type === 'ders-videolari' && youtubeId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    className="h-full min-h-[420px] sm:min-h-[540px] w-full"
                    title={doc.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : isPdf ? (
                  <iframe
                    src={doc.file_url!}
                    className="h-full min-h-[420px] sm:min-h-[540px] w-full border-0"
                    title={doc.title}
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  />
                ) : driveId ? (
                  <iframe
                    src={`https://drive.google.com/file/d/${driveId}/preview`}
                    className="h-full min-h-[420px] sm:min-h-[540px] w-full border-0"
                    title={doc.title}
                    allow="autoplay"
                  />
                ) : (
                  <div className="p-8 text-center">
                    <FileText className="mx-auto h-16 w-16 text-tertiary mb-3" />
                    <p className="text-sm font-semibold text-secondary mb-4">
                      Bu içerik doğrudan tarayıcıda önizlenemiyor.
                    </p>
                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl bg-accent-brand px-5 py-2.5 text-xs font-bold text-on-brand transition-transform hover:-translate-y-0.5"
                      >
                        <Download className="h-4 w-4" />
                        Dosyayı İndir
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-subtle bg-surface-1 p-6 shadow-sm sticky top-6">
              <h2 className="font-display text-base font-bold text-primary mb-4">
                Hızlı İşlemler
              </h2>

              <div className="space-y-3">
                {doc.file_url && (
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-brand px-4 py-3 text-xs sm:text-sm font-bold text-on-brand transition-all hover:opacity-95 shadow-md shadow-accent/10 hover:-translate-y-0.5 active:translate-y-0.5"
                  >
                    <Download className="h-4 w-4" />
                    Dokümanı İndir (PDF)
                  </a>
                )}

                {doc.solution_url && (
                  <a
                    href={doc.solution_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-400/50 bg-emerald-500/10 px-4 py-3 text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200 transition-all hover:bg-emerald-500/20"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Çözüm PDF&apos;ini Aç
                  </a>
                )}

                <Link
                  href={`/icerikler?id=${doc.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-subtle bg-surface-2 px-4 py-3 text-xs sm:text-sm font-bold text-primary transition-all hover:bg-surface-3"
                >
                  <Layers className="h-4 w-4 text-accent" />
                  Kütüphanede Etkileşimli Aç
                </Link>

                <p className="text-[11px] text-tertiary text-center pt-2 leading-relaxed">
                  İşlem tahtası, cevap anahtarı ve tamamlandı işaretleme
                  özellikleri için kütüphane görünümünü kullanabilirsiniz.
                </p>
              </div>

              {primaryGrade && (
                <div className="mt-6 pt-5 border-t border-subtle">
                  <h3 className="text-xs font-bold text-primary mb-3">
                    {gradeLabel} Koleksiyonu
                  </h3>
                  <Link
                    href={`/icerikler?grade=${primaryGrade}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
                  >
                    Bu sınıftaki tüm içerikleri gör
                    <ArrowLeft className="h-3 w-3 rotate-180" />
                  </Link>
                </div>
              )}
            </div>

            {relatedDocuments.length > 0 && (
              <div className="rounded-3xl border border-subtle bg-surface-1 p-6 shadow-sm">
                <h2 className="font-display text-sm font-bold text-primary mb-4">
                  Benzer Çalışma Föyleri
                </h2>
                <div className="space-y-3">
                  {relatedDocuments.map((item) => (
                    <Link
                      key={item.id}
                      href={`/icerikler/${buildDocumentSlug(item)}`}
                      className="block rounded-2xl border border-subtle bg-surface-2/40 p-3 transition-all hover:border-default hover:bg-surface-2"
                    >
                      <h3 className="text-xs font-bold text-primary truncate mb-1">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-tertiary font-medium">
                        <span>{getContentTypeLabel(item.type)}</span>
                        <span>•</span>
                        <span>{item.downloads || 0} indirme</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
