import { apiError, apiOk } from '@/lib/api-response';
import { CONTENT_PAGE_SIZE } from '@/features/content/constants';
import {
  getInitialContentGradeFilter,
  loadInitialContentDocuments,
} from '@/features/content/server';
import type { ContentPrefetchPayload } from '@/features/content/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get('type');
    const type =
      typeof typeParam === 'string' && typeParam.length > 0 ? typeParam : 'all';
    const grade = await getInitialContentGradeFilter();
    const { count, documents } = await loadInitialContentDocuments(
      1,
      CONTENT_PAGE_SIZE,
      grade,
      type,
    );

    return apiOk<ContentPrefetchPayload>({
      count,
      documents,
      grade,
      type,
    });
  } catch (error) {
    return apiError(
      error instanceof Error
        ? error.message
        : 'Icerik on hazirligi yuklenemedi.',
      500,
      'content_prefetch_failed',
    );
  }
}
