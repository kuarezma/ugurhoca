import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasSupabasePublicEnv } from '@/lib/env.server';
import { createCachedPublicSupabaseClient } from '@/lib/supabase/server';
import {
  buildDocumentSlug,
  extractDocumentIdFromSlug,
} from '@/lib/document-slug';
import { createPageMetadata } from '@/lib/site-metadata';
import { getContentTypeLabel } from '@/features/content/constants';
import { getContentPrimaryGradeLabel } from '@/features/content/utils';
import {
  getWorksheetGradeValue,
  parseWorksheetMetadata,
} from '@/features/content/worksheet';
import { ContentDetailView } from '@/features/content/components/ContentDetailView';
import type { ContentDocument } from '@/types';

export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
};

async function fetchPublicDocument(
  slug: string,
): Promise<ContentDocument | null> {
  const id = extractDocumentIdFromSlug(slug);
  if (!id || !hasSupabasePublicEnv()) {
    return null;
  }

  try {
    const supabase = createCachedPublicSupabaseClient('content-documents');
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data || data.is_admin_only) {
      return null;
    }

    return data as ContentDocument;
  } catch {
    return null;
  }
}

async function fetchRelatedDocuments(
  grade: unknown,
  currentDocId: string,
): Promise<ContentDocument[]> {
  if (!hasSupabasePublicEnv() || !grade) {
    return [];
  }

  try {
    const supabase = createCachedPublicSupabaseClient('content-documents');
    const { data } = await supabase
      .from('documents')
      .select(
        'id, title, grade, type, created_at, description, views, downloads',
      )
      .eq('is_admin_only', false)
      .neq('id', currentDocId)
      .contains('grade', [grade])
      .order('created_at', { ascending: false })
      .limit(4);

    return (data || []) as ContentDocument[];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = await fetchPublicDocument(slug);

  if (!doc) {
    return createPageMetadata({
      title: 'İçerik Bulunamadı',
      description: 'Aradığınız doküman mevcut değil veya yayından kaldırılmış.',
      path: '/icerikler',
      noIndex: true,
    });
  }

  const worksheetMeta = parseWorksheetMetadata(doc.description);
  const gradeLabel = getContentPrimaryGradeLabel(doc);
  const typeLabel = getContentTypeLabel(doc.type);
  const cleanDescription =
    worksheetMeta.cleanDescription?.trim() ||
    `${gradeLabel} matematik ${typeLabel.toLowerCase()} dokümanı ve çalışma föyü.`;

  const canonicalSlug = buildDocumentSlug(doc);

  return createPageMetadata({
    title: doc.title,
    description: cleanDescription,
    path: `/icerikler/${canonicalSlug}`,
  });
}

export default async function ContentDetailPage({ params }: Props) {
  const { slug } = await params;
  const doc = await fetchPublicDocument(slug);

  if (!doc) {
    notFound();
  }

  const primaryGrade = getWorksheetGradeValue(doc.grade);
  const relatedDocuments = primaryGrade
    ? await fetchRelatedDocuments(primaryGrade, doc.id)
    : [];

  return <ContentDetailView doc={doc} relatedDocuments={relatedDocuments} />;
}
