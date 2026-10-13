import { requireAdmin } from '@/lib/api-auth';
import { apiOk } from '@/lib/api-response';
import { createLogger } from '@/lib/logger';
import { enforceRateLimit } from '@/lib/rate-limit';
import {
  isPublicWorksheetSourceUrl,
  parseAllowedHosts,
  parseSourceUrls,
} from '@/lib/worksheet-candidate-discovery';

const log = createLogger('admin-worksheet-source-status');

const parseConfiguredAllowedHosts = (raw: string | undefined) =>
  (raw ?? '')
    .split(/[,\n]+/)
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

const isValidHost = (value: string) =>
  /^[a-z0-9.-]+$/i.test(value) &&
  value.includes('.') &&
  !value.includes('..') &&
  isPublicWorksheetSourceUrl(`https://${value.replace(/^\./, '')}`);

const checkSourceUrl = async (sourceUrl: string) => {
  try {
    const response = await fetch(sourceUrl, {
      headers: { 'User-Agent': 'ugurhoca-source-status/1.0' },
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(4_000),
    });

    return {
      ok: response.ok,
      statusCode: response.status,
      url: sourceUrl,
    };
  } catch (error) {
    log.warn('Kaynak URL kontrolü başarısız oldu', { error, url: sourceUrl });
    return {
      message: 'Kaynağa ulaşılamadı.',
      ok: false,
      url: sourceUrl,
    };
  }
};

export async function GET(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.error) {
    return auth.error;
  }

  const limited = await enforceRateLimit(
    'admin-worksheet-source-status',
    auth.user.id,
    { limit: 30, windowSeconds: 60 },
  );
  if (limited) {
    return limited;
  }

  const sourceUrls = parseSourceUrls(process.env.WORKSHEET_CANDIDATE_SOURCE_URLS);
  const validSourceUrls = sourceUrls.filter(isPublicWorksheetSourceUrl);
  const invalidSourceUrls = sourceUrls.filter(
    (sourceUrl) => !isPublicWorksheetSourceUrl(sourceUrl),
  );
  const allowedHosts = parseAllowedHosts(
    process.env.WORKSHEET_CANDIDATE_ALLOWED_HOSTS,
    validSourceUrls,
  );
  const configuredAllowedHosts = parseConfiguredAllowedHosts(
    process.env.WORKSHEET_CANDIDATE_ALLOWED_HOSTS,
  );
  const invalidAllowedHosts = configuredAllowedHosts.filter(
    (host) => !isValidHost(host),
  );
  const shouldCheckLiveSources =
    new URL(request.url).searchParams.get('live') === '1';
  const sourceChecks = shouldCheckLiveSources
    ? await Promise.all(validSourceUrls.map(checkSourceUrl))
    : [];
  const unreachableSourceUrls = sourceChecks
    .filter((check) => !check.ok)
    .map((check) => check.url);
  const hasReachableSource =
    !shouldCheckLiveSources || sourceChecks.some((check) => check.ok);

  return apiOk({
    allowedHosts,
    configured:
      sourceUrls.length > 0 &&
      allowedHosts.length > 0 &&
      invalidAllowedHosts.length === 0 &&
      invalidSourceUrls.length === 0 &&
      hasReachableSource,
    health: {
      allowedHosts: allowedHosts.length,
      invalidSources: invalidSourceUrls.length,
      reachableSources: shouldCheckLiveSources
        ? sourceChecks.filter((check) => check.ok).length
        : undefined,
      totalSources: sourceUrls.length,
      unreachableSources: shouldCheckLiveSources
        ? unreachableSourceUrls.length
        : undefined,
      validSources: validSourceUrls.length,
    },
    invalidAllowedHosts,
    invalidSourceUrls,
    ...(shouldCheckLiveSources ? { sourceChecks, unreachableSourceUrls } : {}),
    sourceUrls,
  });
}
