import { apiError, apiOk } from '@/lib/api-response';
import { isAdminEmail } from '@/lib/admin';
import { getServerAccessToken } from '@/lib/auth-snapshot.server';
import {
  parseAllowedHosts,
  parseSourceUrls,
} from '@/lib/worksheet-candidate-discovery';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const getAccessToken = async (request: Request) => {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return (await getServerAccessToken()) ?? '';
  }

  return authHeader.slice(7).trim();
};

const parseConfiguredAllowedHosts = (raw: string | undefined) =>
  (raw ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

const isValidHost = (value: string) =>
  /^[a-z0-9.-]+$/i.test(value) && value.includes('.') && !value.includes('..');

export async function GET(request: Request) {
  const accessToken = await getAccessToken(request);

  if (!accessToken) {
    return apiError('Oturum açmanız gerekiyor.', 401, 'missing_access_token');
  }

  const supabase = createServerSupabaseClient(accessToken);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user?.id) {
    return apiError('Oturum açmanız gerekiyor.', 401, 'invalid_session');
  }

  if (!isAdminEmail(user.email)) {
    return apiError('Bu işlem için yetkiniz yok.', 403, 'not_admin');
  }

  const sourceUrls = parseSourceUrls(process.env.WORKSHEET_CANDIDATE_SOURCE_URLS);
  const invalidSourceUrls = sourceUrls.filter((sourceUrl) => {
    try {
      const url = new URL(sourceUrl);
      return !['http:', 'https:'].includes(url.protocol);
    } catch {
      return true;
    }
  });
  const allowedHosts = parseAllowedHosts(
    process.env.WORKSHEET_CANDIDATE_ALLOWED_HOSTS,
    sourceUrls,
  );
  const configuredAllowedHosts = parseConfiguredAllowedHosts(
    process.env.WORKSHEET_CANDIDATE_ALLOWED_HOSTS,
  );
  const invalidAllowedHosts = configuredAllowedHosts.filter(
    (host) => !isValidHost(host),
  );

  return apiOk({
    allowedHosts,
    configured:
      sourceUrls.length > 0 &&
      allowedHosts.length > 0 &&
      invalidAllowedHosts.length === 0 &&
      invalidSourceUrls.length === 0,
    invalidAllowedHosts,
    invalidSourceUrls,
    sourceUrls,
  });
}
