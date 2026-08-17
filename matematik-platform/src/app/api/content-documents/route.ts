import { apiError, apiOk } from '@/lib/api-response';
import { isAdminEmail } from '@/lib/admin';
import { createLogger } from '@/lib/logger';
import {
  contentDocumentCreateSchema,
  contentDocumentMetricUpdateSchema,
} from '@/lib/route-schemas';
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from '@/lib/supabase/server';
import { buildContentDocumentPersistPayload } from '@/features/content/persistence';
import type { ContentDocument } from '@/types';

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

    const body = await request.json().catch(() => null);
    const parsed = contentDocumentCreateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Başlık ve kategori zorunludur.', 400, 'invalid_payload');
    }
    const documentPayload = parsed.data.document;

    const persistedPayload = buildContentDocumentPersistPayload(documentPayload);
    const adminClient = createServiceRoleClient();
    const { data, error } = await adminClient
      .from('documents')
      .insert([
        {
          ...persistedPayload,
          created_at: new Date().toISOString(),
          downloads: 0,
          views: 0,
        },
      ])
      .select()
      .single();

    if (error) {
      log.error('Content document insert failed', error);
      return apiError(
        'İçerik kaydedilemedi.',
        500,
        'content_document_insert_failed',
      );
    }

    return apiOk((data || null) as ContentDocument | null);
  } catch (error) {
    log.error('Content document route failed', error);
    return apiError('Sunucu hatası oluştu.', 500, 'content_document_failed');
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = contentDocumentMetricUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Geçersiz istek parametreleri.', 400, 'invalid_payload');
    }

    const { document_id, metric } = parsed.data;
    const adminClient = createServiceRoleClient();

    const { data: doc, error: fetchError } = await adminClient
      .from('documents')
      .select(metric)
      .eq('id', document_id)
      .single();

    if (fetchError || !doc) {
      return apiError('Doküman bulunamadı.', 404, 'document_not_found');
    }

    const currentVal = (doc as Record<string, number | null | undefined>)[metric] ?? 0;
    const nextVal = (typeof currentVal === 'number' ? currentVal : 0) + 1;

    const { error: updateError } = await adminClient
      .from('documents')
      .update({ [metric]: nextVal })
      .eq('id', document_id);

    if (updateError) {
      log.error('Metric update failed', updateError);
      return apiError('Sayaç güncellenemedi.', 500, 'metric_update_failed');
    }

    return apiOk({ document_id, [metric]: nextVal });
  } catch (error) {
    log.error('Document metric PATCH route failed', error);
    return apiError('Sunucu hatası oluştu.', 500, 'metric_route_failed');
  }
}
