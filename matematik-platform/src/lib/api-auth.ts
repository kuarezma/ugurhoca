import 'server-only';

import { apiError } from '@/lib/api-response';
import { isAdminEmail } from '@/lib/admin';
import { getServerAccessToken } from '@/lib/auth-snapshot.server';
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from '@/lib/supabase/server';

/**
 * Aynı ~25 satırlık blok sekiz farklı admin API rotasında ayrı ayrı kopyalanmıştı
 * (bkz. denetim bulgusu M-01) — yetki mantığındaki bir düzeltme sekiz yerde ayrı
 * ayrı yapılmak zorundaydı. Artık tek kaynak burası.
 */
export async function getBearerOrCookieAccessToken(
  request: Request,
): Promise<string> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return (await getServerAccessToken()) ?? '';
  }

  return authHeader.slice(7).trim();
}

export async function requireAdmin(request: Request) {
  const accessToken = await getBearerOrCookieAccessToken(request);

  if (!accessToken) {
    return {
      error: apiError('Oturum açmanız gerekiyor.', 401, 'missing_access_token'),
    } as const;
  }

  const supabase = createServerSupabaseClient(accessToken);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user?.id) {
    return {
      error: apiError('Oturum açmanız gerekiyor.', 401, 'invalid_session'),
    } as const;
  }

  if (!isAdminEmail(user.email)) {
    return {
      error: apiError('Bu işlem için yetkiniz yok.', 403, 'not_admin'),
    } as const;
  }

  return { serviceRole: createServiceRoleClient(), user } as const;
}
