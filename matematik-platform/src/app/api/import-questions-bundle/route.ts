import { apiError, apiOk } from '@/lib/api-response';
import { parseQuizBundleArchive } from '@/lib/question-import';
import { createLogger } from '@/lib/logger';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { insertQuizBundleWithImages } from '@/features/quizzes/server/importQuiz';

const log = createLogger('import-questions-bundle');

export async function POST(request: Request) {
  try {
    const filePayload = await getBundlePayloadFromRequest(request);
    if (!filePayload) {
      return apiError(
        'ZIP dosyası veya bundle_url gerekli.',
        400,
        'missing_bundle_file',
      );
    }

    const { buffer, fileName, previewOnly } = filePayload;
    const archive = await parseQuizBundleArchive(
      buffer,
      {
        createPreviewUrls: previewOnly,
        fileName,
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

    if (previewOnly) {
      return apiOk({ importResult: archive.importResult });
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

const getBundlePayloadFromRequest = async (
  request: Request,
): Promise<{
  buffer: ArrayBuffer;
  fileName: string;
  previewOnly: boolean;
} | null> => {
  const contentType = request.headers.get('content-type')?.toLowerCase() || '';
  if (contentType.includes('application/json')) {
    const payload = (await request.json().catch(() => null)) as
      | { bundle_url?: unknown; preview?: unknown }
      | null;
    const bundleUrl = typeof payload?.bundle_url === 'string' ? payload.bundle_url.trim() : '';
    if (!bundleUrl) {
      return null;
    }

    const download = await downloadBundleFromUrl(bundleUrl);
    if (!download) {
      return null;
    }

    return {
      buffer: download.buffer,
      fileName: download.fileName,
      previewOnly: payload?.preview === true,
    };
  }

  const formData = await request.formData().catch(() => null);
  const bundleFile = formData?.get('file');
  if (!isBinaryFileLike(bundleFile)) {
    return null;
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
    throw new Error('Yalnızca ZIP bundle dosyası yükleyebilirsiniz.');
  }

  return {
    buffer: await bundleFile.arrayBuffer(),
    fileName: bundleName,
    previewOnly: false,
  };
};

const downloadBundleFromUrl = async (bundleUrl: string) => {
  let parsed: URL;
  try {
    parsed = new URL(bundleUrl);
  } catch {
    throw new Error('Geçerli bir bundle_url girin.');
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('bundle_url yalnızca http/https olabilir.');
  }

  const response = await fetch(bundleUrl, {
    redirect: 'follow',
    headers: {
      'User-Agent': 'ugurhoca-bundle-import/1.0',
    },
  });
  if (!response.ok) {
    throw new Error(`ZIP indirilemedi. HTTP ${response.status}`);
  }

  const contentType = response.headers.get('content-type')?.toLowerCase() || '';
  const bytes = new Uint8Array(await response.arrayBuffer());
  const looksLikeZip =
    contentType.includes('zip') ||
    bundleUrl.toLowerCase().endsWith('.zip') ||
    (bytes.length > 3 &&
      bytes[0] === 0x50 &&
      bytes[1] === 0x4b &&
      bytes[2] === 0x03 &&
      bytes[3] === 0x04);

  if (!looksLikeZip) {
    throw new Error('Verilen link ZIP dosyası döndürmüyor.');
  }

  const fileName = parsed.pathname.split('/').pop() || 'quiz-bundle.zip';
  return {
    buffer: bytes.buffer,
    fileName,
  };
};

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
