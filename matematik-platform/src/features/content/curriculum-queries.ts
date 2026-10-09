import { supabase } from '@/lib/supabase/client';
import {
  CURRICULUM_DOCUMENT_TYPES,
  type CurriculumDocument,
} from './curriculum-coverage';
import type { ContentDocument } from '@/types';
import { runContentRead } from './read-timeout';

const PAGE_SIZE = 250;

// Sabit sıralı sayfalama: Supabase satır sınırı kapsam raporunu eksik bırakmasın.
async function loadCurriculumDocuments<T extends CurriculumDocument>(
  fields: string,
  grade?: number,
) {
  return runContentRead(async (signal) => {
    const documents: T[] = [];
    for (let from = 0; ; from += PAGE_SIZE) {
      let query = supabase
        .from('documents')
        .select(fields)
        .abortSignal(signal)
        .in('type', CURRICULUM_DOCUMENT_TYPES);
      if (grade !== undefined) query = query.contains('grade', [grade]);
      const { data, error } = await query
        .order('id', { ascending: true })
        .range(from, from + PAGE_SIZE - 1);
      if (error)
        throw new Error('İçerik kapsamı yüklenemedi. Yeniden deneyin.');
      if (!data) throw new Error('İçerik kapsamı alınamadı.');
      documents.push(...(data as unknown as T[]));
      if (data.length < PAGE_SIZE) return documents;
    }
  });
}

export const loadCurriculumCoverageDocuments = () =>
  loadCurriculumDocuments<CurriculumDocument>(
    'id, grade, type, title, description',
  );

export const loadCurriculumGradeDocuments = (grade: number) =>
  loadCurriculumDocuments<ContentDocument>('*', grade);
