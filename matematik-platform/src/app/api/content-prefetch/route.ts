import { apiError, apiOk } from '@/lib/api-response';
import { createLogger } from '@/lib/logger';
import { CONTENT_PAGE_SIZE } from '@/features/content/constants';
import {
  getInitialContentGradeFilter,
  loadInitialContentDocuments,
} from '@/features/content/server';
import type { ContentPrefetchPayload } from '@/features/content/types';

const log = createLogger('content-prefetch');

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
    log.error('İçerik ön yükleme sırasında hata oluştu', error);
    return apiError(
      'İçerik ön hazırlığı yüklenemedi. Lütfen daha sonra tekrar deneyin.',
      500,
      'content_prefetch_failed',
    );
  }
}
