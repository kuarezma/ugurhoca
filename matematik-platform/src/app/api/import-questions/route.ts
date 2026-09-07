import { apiError, apiOk } from '@/lib/api-response';
import { requireAdmin } from '@/lib/api-auth';
import { createLogger } from '@/lib/logger';
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit';
import { quizImportSchema } from '@/lib/route-schemas';
import { insertQuizWithQuestions } from '@/features/quizzes/server/importQuiz';

const log = createLogger('import-questions');

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const limited = await enforceRateLimit('import-questions', clientIp, {
    limit: 10,
    windowSeconds: 60,
  });
  if (limited) {
    return limited;
  }

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
