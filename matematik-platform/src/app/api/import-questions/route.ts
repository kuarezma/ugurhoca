import { apiError, apiOk } from '@/lib/api-response';
import { isAdminEmail } from '@/lib/admin';
import { getServerAccessToken } from '@/lib/auth-snapshot.server';
import { createLogger } from '@/lib/logger';
import { quizImportSchema } from '@/lib/route-schemas';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { insertQuizWithQuestions } from '@/features/quizzes/server/importQuiz';

const log = createLogger('import-questions');

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

export async function POST(request: Request) {
  const auth = await requireAdmin(request);

  if ('error' in auth) {
    return auth.error;
  }

  const body = await request.json().catch(() => null);
  const parsed = quizImportSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      parsed.error.issues[0]?.message || 'Geçersiz test verisi.',
      400,
      'invalid_quiz_payload',
    );
  }

  try {
    const result = await insertQuizWithQuestions(auth.serviceRole, parsed.data);

    return apiOk(result);
  } catch (error) {
    log.error('Quiz import failed', error);
    return apiError('Test içe aktarımı sırasında sunucu hatası oluştu.', 500, 'quiz_import_failed');
  }
}
