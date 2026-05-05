import { apiError, apiOk } from '@/lib/api-response';
import { isAdminEmail } from '@/lib/admin';
import { getServerAccessToken } from '@/lib/auth-snapshot.server';
import { parseQuizBundleArchive } from '@/lib/question-import';
import { createLogger } from '@/lib/logger';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { insertQuizBundleWithImages } from '@/features/quizzes/server/importQuiz';
import { isIP } from 'node:net';

const log = createLogger('import-questions-bundle');
const BUNDLE_FETCH_TIMEOUT_MS = 8_000;
const MAX_BUNDLE_BYTES = 20 * 1024 * 1024;
const DEFAULT_BUNDLE_ALLOWED_HOSTS = [
  'drive.google.com',
  'docs.google.com',
  '.googleusercontent.com',
  'disk.yandex.com',
  'yadi.sk',
];

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

    const result = await insertQuizBundleWithImages(auth.serviceRole, archive);

    return apiOk(result);
  } catch (error) {
    log.error('Quiz bundle import failed', error);
    if (error instanceof Error && isBundleInputError(error.message)) {
      return apiError(error.message, 400, 'invalid_bundle_payload');
    }
    return apiError('Bundle içe aktarımı sırasında sunucu hatası oluştu.', 500, 'quiz_bundle_import_failed');
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
  if (!isAllowedRemoteHost(parsed.hostname, getAllowedBundleHosts())) {
    throw new Error('bundle_url hostu izinli değil.');
  }
  if (isPrivateOrLocalHost(parsed.hostname)) {
    throw new Error('bundle_url yerel veya özel ağ adresi olamaz.');
  }

  const response = await fetch(bundleUrl, {
    redirect: 'follow',
    signal: AbortSignal.timeout(BUNDLE_FETCH_TIMEOUT_MS),
    headers: {
      'User-Agent': 'ugurhoca-bundle-import/1.0',
    },
  });
  if (!response.ok) {
    throw new Error(`ZIP indirilemedi. HTTP ${response.status}`);
  }

  const contentLength = Number(response.headers.get('content-length') ?? '0');
  if (Number.isFinite(contentLength) && contentLength > MAX_BUNDLE_BYTES) {
    throw new Error('ZIP dosyası çok büyük.');
  }

  const contentType = response.headers.get('content-type')?.toLowerCase() || '';
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > MAX_BUNDLE_BYTES) {
    throw new Error('ZIP dosyası çok büyük.');
  }
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
  message.includes('Eksik görsel') ||
  message.includes('izinli değil') ||
  message.includes('özel ağ') ||
  message.includes('çok büyük');

const parseAllowlist = (raw: string | undefined) =>
  (raw ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

const getAllowedBundleHosts = () => {
  const configured = parseAllowlist(process.env.BUNDLE_IMPORT_ALLOWED_HOSTS);
  return configured.length > 0 ? configured : DEFAULT_BUNDLE_ALLOWED_HOSTS;
};

const isAllowedRemoteHost = (host: string, allowlist: string[]) => {
  const lowerHost = host.toLowerCase();
  return allowlist.some((entry) => {
    const normalized = entry.trim().toLowerCase();
    if (!normalized) return false;
    if (normalized.startsWith('.')) {
      return lowerHost.endsWith(normalized);
    }
    return lowerHost === normalized || lowerHost.endsWith(`.${normalized}`);
  });
};

const isPrivateOrLocalHost = (host: string) => {
  const lowerHost = host.toLowerCase();
  if (lowerHost === 'localhost' || lowerHost.endsWith('.local')) {
    return true;
  }

  const ipKind = isIP(lowerHost);
  if (ipKind === 4) {
    return (
      lowerHost.startsWith('10.') ||
      lowerHost.startsWith('127.') ||
      lowerHost.startsWith('192.168.') ||
      lowerHost.startsWith('169.254.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(lowerHost)
    );
  }
  if (ipKind === 6) {
    return lowerHost === '::1' || lowerHost.startsWith('fc') || lowerHost.startsWith('fd');
  }
  return false;
};

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
