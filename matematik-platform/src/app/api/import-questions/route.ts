import { apiError, apiOk } from '@/lib/api-response';
import { quizImportSchema } from '@/lib/route-schemas';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { insertQuizWithQuestions } from '@/features/quizzes/server/importQuiz';

export async function POST(request: Request) {
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
    const supabase = createServiceRoleClient();
    const result = await insertQuizWithQuestions(supabase, parsed.data);

    return apiOk(result);
  } catch (error) {
    console.error('Import error:', error);
    return apiError(
      error instanceof Error ? error.message : 'Sunucu hatası oluştu.',
      500,
      'quiz_import_failed',
    );
  }
}
