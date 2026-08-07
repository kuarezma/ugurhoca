import 'server-only';

import { isAdminEmail } from '@/lib/admin';
import type { AuthSnapshot } from '@/lib/auth-snapshot';
import { getServerAccessToken } from '@/lib/auth-snapshot.server';
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from '@/lib/supabase/server';
import type { GradeValue } from '@/types';

const isGradeValue = (value: unknown): value is GradeValue =>
  value === 'Mezun' || typeof value === 'number';

const normalizeGrade = (value: unknown): GradeValue => {
  if (isGradeValue(value)) {
    return value;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 5;
};

/**
 * Kimliği Supabase JWT'si ile sunucuda doğrular. İstemcinin yazdığı imzasız
 * `ugurhoca_auth_snapshot` çerezine güvenmez; isAdmin dahil tüm alanlar
 * doğrulanmış access token ve profiles kaydından türetilir. Yetki kararı
 * gerektiren her sunucu yolu getServerAuthSnapshot yerine bunu kullanmalıdır.
 */
export const getVerifiedServerUser = async (): Promise<AuthSnapshot | null> => {
  const accessToken = await getServerAccessToken();
  if (!accessToken) {
    return null;
  }

  const supabase = createServerSupabaseClient(accessToken);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user?.id) {
    return null;
  }

  const email = user.email ?? '';
  const service = createServiceRoleClient();
  const { data: profile } = await service
    .from('profiles')
    .select('name, grade')
    .eq('id', user.id)
    .single();

  const metadata = (user.user_metadata ?? {}) as {
    grade?: unknown;
    name?: unknown;
  };
  const name =
    typeof profile?.name === 'string' && profile.name.length > 0
      ? profile.name
      : typeof metadata.name === 'string' && metadata.name.length > 0
        ? metadata.name
        : 'Öğrenci';

  return {
    email,
    grade: normalizeGrade(profile?.grade ?? metadata.grade),
    id: user.id,
    isAdmin: isAdminEmail(email),
    name,
  };
};
