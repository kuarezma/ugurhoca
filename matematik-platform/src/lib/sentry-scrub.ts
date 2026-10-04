/**
 * Sentry olaylarından kimlik bilgilerini temizler (beforeSend /
 * beforeSendTransaction). Sentry'nin HTTP entegrasyonu, sendDefaultPii kapalı
 * olsa bile istek gövdesini `request.data` alanına maskesiz ekler; bu yüzden
 * /api/auth/session'a POST edilen erişim token'ı o istek sırasında oluşan her
 * olayla Sentry'ye giderdi. Burada üç katman uygulanır:
 *  1. /api/auth/* olaylarında istek gövdesi tamamen atılır,
 *  2. hassas adlı alanlar (token, password, cookie, authorization...) maskelenir,
 *  3. serbest metindeki JWT'ler ve `*_token=` / `"*_token":"..."` kalıpları maskelenir.
 */

const FILTERED = '[Filtered]';
const MAX_DEPTH = 12;

const SENSITIVE_KEY =
  /token|password|passwd|secret|authorization|cookie|api[-_]?key|credential/i;
const JWT_PATTERN = /eyJ[\w-]+\.[\w-]+\.[\w-]+/g;
const QUERY_SECRET_PATTERN =
  /((?:access|refresh|id|provider)_token=|password=)[^&#\s"']+/gi;
const JSON_SECRET_PATTERN =
  /("(?:access_token|refresh_token|provider_token|id_token|password)"\s*:\s*")(?:[^"\\]|\\.)*"/gi;
const AUTH_ROUTE_PATTERN = /\/api\/auth\//;

const scrubString = (value: string) =>
  value
    .replace(JWT_PATTERN, FILTERED)
    .replace(QUERY_SECRET_PATTERN, `$1${FILTERED}`)
    .replace(JSON_SECRET_PATTERN, `$1${FILTERED}"`);

const scrubValue = (value: unknown, depth: number): unknown => {
  if (typeof value === 'string') {
    return scrubString(value);
  }

  if (!value || typeof value !== 'object' || depth >= MAX_DEPTH) {
    return value;
  }

  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      value[index] = scrubValue(value[index], depth + 1);
    }
    return value;
  }

  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    record[key] = SENSITIVE_KEY.test(key)
      ? FILTERED
      : scrubValue(record[key], depth + 1);
  }
  return record;
};

type ScrubbableEvent = {
  request?: { url?: string; data?: unknown; cookies?: unknown };
};

export const scrubSentryEvent = <TEvent>(event: TEvent): TEvent => {
  if (!event || typeof event !== 'object') {
    return event;
  }

  const request = (event as ScrubbableEvent).request;
  if (request) {
    delete request.cookies;
    if (typeof request.url === 'string' && AUTH_ROUTE_PATTERN.test(request.url)) {
      delete request.data;
    }
  }

  scrubValue(event, 0);
  return event;
};
