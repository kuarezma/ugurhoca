import { apiError, apiOk } from '@/lib/api-response';
import { parseQuizBundleArchive } from '@/lib/question-import';
import { createLogger } from '@/lib/logger';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { insertQuizBundleWithImages } from '@/features/quizzes/server/importQuiz';

const log = createLogger('import-questions-bundle');

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  const bundleFile = formData?.get('file');

  if (!isBinaryFileLike(bundleFile)) {
    return apiError('ZIP dosyası gerekli.', 400, 'missing_bundle_file');
  }

  const bundleName =
    typeof bundleFile.name === 'string'
      ? bundleFile.name
      : 'quiz-bundle.zip';
  const bundleType =
    typeof bundleFile.type === 'string'
      ? bundleFile.type
      : '';

  if (
    !bundleName.toLowerCase().endsWith('.zip') &&
    !bundleType.includes('zip')
  ) {
    return apiError(
      'Yalnızca ZIP bundle dosyası yükleyebilirsiniz.',
      400,
      'invalid_bundle_file',
    );
  }

  try {
    const archive = await parseQuizBundleArchive(
      await bundleFile.arrayBuffer(),
      {
        fileName: bundleName,
      },
    );

    if (archive.importResult.valid.length === 0) {
      return apiError(
        archive.importResult.errors[0]?.message ||
          'İçe aktarılabilir soru bulunamadı.',
        400,
        'invalid_bundle_payload',
      );
    }

    const supabase = createServiceRoleClient();
    const result = await insertQuizBundleWithImages(supabase, archive);

    return apiOk(result);
  } catch (error) {
    log.error('Quiz bundle import failed', error);
    if (error instanceof Error && isBundleInputError(error.message)) {
      return apiError(error.message, 400, 'invalid_bundle_payload');
    }
    return apiError(
      error instanceof Error ? error.message : 'Sunucu hatası oluştu.',
      500,
      'quiz_bundle_import_failed',
    );
  }
}

const isBundleInputError = (message: string) =>
  message.includes('quiz.json') ||
  message.includes('İçe aktarılabilir soru bulunamadı') ||
  message.includes('4 şıklı') ||
  message.includes('geçerli JSON') ||
  message.includes('Görsel bulunamadı') ||
  message.includes('Eksik görsel');

type BinaryFileLike = {
  arrayBuffer: () => Promise<ArrayBuffer>;
  name?: string;
  type?: string;
};

const isBinaryFileLike = (value: unknown): value is BinaryFileLike =>
  typeof value === 'object' &&
  value !== null &&
  'arrayBuffer' in value &&
  typeof value.arrayBuffer === 'function';
