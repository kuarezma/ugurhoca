import { revalidatePath, revalidateTag } from 'next/cache';
import { getBearerOrCookieAccessToken } from '@/lib/api-auth';
import { apiError, apiOk } from '@/lib/api-response';
import { isAdminEmail } from '@/lib/admin';
import { createLogger } from '@/lib/logger';
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit';
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

    revalidateTag('content-documents', { expire: 0 });
    revalidatePath('/icerikler');
    return apiOk((data || null) as ContentDocument | null);
  } catch (error) {
    log.error('Content document route failed', error);
    return apiError('Sunucu hatası oluştu.', 500, 'content_document_failed');
  }
}

// Aynı IP'nin aynı belgedeki tüm sayaç artışları (görüntüleme + indirme +
// beğeni) tek pencerede sayılır; normal gezinme bunun çok altında kalır.
const METRIC_RATE_LIMIT = { limit: 10, windowSeconds: 600 } as const;

export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = contentDocumentMetricUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Geçersiz istek parametreleri.', 400, 'invalid_payload');
    }

    const { document_id, metric } = parsed.data;

    const limited = await enforceRateLimit(
      'content-document-metric',
      `${getClientIp(request)}:${document_id}`,
      METRIC_RATE_LIMIT,
    );
    if (limited) {
      return limited;
    }

    // Beğeni kullanıcı başına tekil tutulmuyor (bunu sağlayan tablo yok);
    // en azından anonim şişirmeyi kapatmak için doğrulanmış oturum şart.
    // Görüntüleme/indirme anonim de sayılır; token'a bakılmaz (süresi dolmuş
    // bir çerez token'ı sayımı bozmasın).
    if (metric === 'likes') {
      const accessToken = await getBearerOrCookieAccessToken(request);
      if (!accessToken) {
        return apiError('Oturum açmanız gerekiyor.', 401, 'missing_session');
      }
      const {
        data: { user },
        error: userError,
      } = await createServerSupabaseClient(accessToken).auth.getUser(accessToken);
      if (userError || !user?.id) {
        return apiError('Oturum açmanız gerekiyor.', 401, 'invalid_session');
      }
    }

    // EXECUTE yalnız service_role'de (PostgREST'ten doğrudan çağrı rate
    // limit'i atlamasın). Bu istemci yalnız bu dar RPC için kullanılır.
    const { data: nextVal, error: rpcError } = await createServiceRoleClient().rpc(
      'increment_document_counter',
      { counter: metric, doc_id: document_id },
    );

    if (rpcError) {
      log.error('Metric update failed', rpcError);
      return apiError('Sayaç güncellenemedi.', 500, 'metric_update_failed');
    }

    if (typeof nextVal !== 'number') {
      return apiError('Doküman bulunamadı.', 404, 'document_not_found');
    }

    return apiOk({ document_id, [metric]: nextVal });
  } catch (error) {
    log.error('Document metric PATCH route failed', error);
    return apiError('Sunucu hatası oluştu.', 500, 'metric_route_failed');
  }
}
