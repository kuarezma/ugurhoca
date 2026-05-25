import { apiError, apiOk } from '@/lib/api-response';
import { isAdminEmail } from '@/lib/admin';
import { getServerAccessToken } from '@/lib/auth-snapshot.server';
import { parseAnnualPlanFile } from '@/lib/annual-plan-import';
import { createLogger } from '@/lib/logger';
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from '@/lib/supabase/server';

const log = createLogger('admin-annual-plan-import');
const MAX_PLAN_FILE_BYTES = 5 * 1024 * 1024;

const getAccessToken = async (request: Request) => {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return (await getServerAccessToken()) ?? '';
  }

  return authHeader.slice(7).trim();
};

const requireAdmin = async (request: Request) => {
  const accessToken = await getAccessToken(request);

  if (!accessToken) {
    return {
      error: apiError('Oturum açmanız gerekiyor.', 401, 'missing_access_token'),
    };
  }

  const supabase = createServerSupabaseClient(accessToken);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user?.id) {
    return { error: apiError('Oturum açmanız gerekiyor.', 401, 'invalid_session') };
  }

  if (!isAdminEmail(user.email)) {
    return { error: apiError('Bu işlem için yetkiniz yok.', 403, 'not_admin') };
  }

  return { serviceRole: createServiceRoleClient() };
};

type BinaryFileLike = {
  arrayBuffer: () => Promise<ArrayBuffer>;
  name?: string;
  size?: number;
};

const isBinaryFileLike = (value: unknown): value is BinaryFileLike =>
  Boolean(
    value &&
      typeof value === 'object' &&
      'arrayBuffer' in value &&
      typeof value.arrayBuffer === 'function',
  );

export async function POST(request: Request) {
  const auth = await requireAdmin(request);

  if ('error' in auth) {
    return auth.error;
  }

  try {
    const formData = await request.formData().catch(() => null);
    const file = formData?.get('file');

    if (!isBinaryFileLike(file)) {
      return apiError('CSV, XLSX veya DOCX yıllık plan dosyası gerekli.', 400, 'missing_plan_file');
    }

    if (typeof file.size === 'number' && file.size > MAX_PLAN_FILE_BYTES) {
      return apiError('Yıllık plan dosyası en fazla 5 MB olabilir.', 400, 'plan_file_too_large');
    }

    const fileName = typeof file.name === 'string' ? file.name : 'yillik-plan.csv';
    const parsed = await parseAnnualPlanFile(await file.arrayBuffer(), fileName);

    if (parsed.errors.length > 0) {
      return apiError(parsed.errors[0].message, 400, 'invalid_annual_plan_file');
    }

    if (parsed.rows.length === 0) {
      return apiError('İçe aktarılacak geçerli yıllık plan satırı bulunamadı.', 400, 'empty_annual_plan_file');
    }

    const { data, error } = await auth.serviceRole
      .from('annual_plan_items')
      .upsert(parsed.rows, {
        ignoreDuplicates: true,
        onConflict: 'grade,week_start,learning_outcome',
      })
      .select('*');

    if (error) {
      log.error('Annual plan upsert failed', error);
      return apiError('Yıllık plan kaydedilemedi.', 500, 'annual_plan_insert_failed');
    }

    const insertedRows = data || [];
    return apiOk({
      inserted: insertedRows.length,
      items: insertedRows,
      skipped: parsed.skippedDuplicates + Math.max(0, parsed.rows.length - insertedRows.length),
      total: parsed.rows.length + parsed.skippedDuplicates,
    });
  } catch (error) {
    log.error('Annual plan import failed', error);
    return apiError('Yıllık plan içe aktarımı sırasında sunucu hatası oluştu.', 500, 'annual_plan_import_failed');
  }
}
