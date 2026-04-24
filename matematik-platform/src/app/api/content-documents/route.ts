import { apiError, apiOk } from '@/lib/api-response';
import { isAdminEmail } from '@/lib/admin';
import { createLogger } from '@/lib/logger';
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from '@/lib/supabase/server';
import { buildContentDocumentPersistPayload } from '@/features/content/persistence';
import type { ContentDocument } from '@/types';
import type { ContentFormState } from '@/features/content/types';

const log = createLogger('content-documents');

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : '';

    if (!accessToken) {
      return apiError('Oturum açmanız gerekiyor.', 401, 'missing_session');
    }

    const authSupabase = createServerSupabaseClient(accessToken);
    const {
      data: { user },
      error: userError,
    } = await authSupabase.auth.getUser(accessToken);

    if (userError || !user?.email) {
      return apiError('Oturum açmanız gerekiyor.', 401, 'invalid_session');
    }

    if (!isAdminEmail(user.email)) {
      return apiError('Yetkiniz yok.', 403, 'forbidden');
    }

    const body = (await request.json().catch(() => null)) as {
      document?: ContentFormState;
    } | null;
    const documentPayload = body?.document;

    if (!documentPayload?.type || !documentPayload.title) {
      return apiError('Başlık ve kategori zorunludur.', 400, 'invalid_payload');
    }

    const persistedPayload = buildContentDocumentPersistPayload(documentPayload);
    const adminClient = createServiceRoleClient();
    const { data, error } = await adminClient
      .from('documents')
      .insert([
        {
          ...persistedPayload,
          created_at: new Date().toISOString(),
          downloads: 0,
        },
      ])
      .select()
      .single();

    if (error) {
      log.error('Content document insert failed', error);
      return apiError(error.message, 500, 'content_document_insert_failed');
    }

    return apiOk((data || null) as ContentDocument | null);
  } catch (error) {
    log.error('Content document route failed', error);
    return apiError(
      error instanceof Error ? error.message : 'Sunucu hatası oluştu.',
      500,
      'content_document_failed',
    );
  }
}
