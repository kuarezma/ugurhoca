import { afterEach, describe, expect, it, vi } from 'vitest';
import { scrubSentryEvent } from '@/lib/sentry-scrub';

const FAKE_JWT =
  'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLTEiLCJleHAiOjE5OTk5OTk5OTl9.c2lnbmF0dXJlLXZhbHVl';

// Sentry HTTP entegrasyonunun /api/auth/session POST'u sırasında ürettiği olayın biçimi.
const createAuthRouteEvent = () => ({
  event_id: 'abc',
  message: '[api:auth:session] Session token verification failed',
  request: {
    url: 'https://ugurhoca.com/api/auth/session',
    method: 'POST',
    data: JSON.stringify({ access_token: FAKE_JWT }),
    cookies: { ugurhoca_access_token: FAKE_JWT },
    headers: {
      'content-type': 'application/json',
      Cookie: `ugurhoca_access_token=${FAKE_JWT}`,
      authorization: `Bearer ${FAKE_JWT}`,
    },
    query_string: `access_token=${FAKE_JWT}&tab=1`,
  },
  extra: { message: `getUser failed for ${FAKE_JWT}`, body: { access_token: FAKE_JWT } },
  breadcrumbs: [{ category: 'fetch', data: { url: `/x?refresh_token=${FAKE_JWT}` } }],
  exception: { values: [{ type: 'Error', value: `bad token ${FAKE_JWT}` }] },
});

describe('scrubSentryEvent', () => {
  it('removes every trace of the access token from an auth route event', () => {
    const event = scrubSentryEvent(createAuthRouteEvent());
    const serialized = JSON.stringify(event);

    expect(serialized).not.toContain(FAKE_JWT);
    expect(serialized).not.toContain('eyJ');
    expect(event.request).not.toHaveProperty('data');
    expect(event.request).not.toHaveProperty('cookies');
    expect(event.request.headers.Cookie).toBe('[Filtered]');
    expect(event.request.headers.authorization).toBe('[Filtered]');
    expect(event.request.headers['content-type']).toBe('application/json');
    expect(event.request.query_string).toBe('access_token=[Filtered]&tab=1');
    expect(event.request.url).toBe('https://ugurhoca.com/api/auth/session');
  });

  it('masks token fields in request bodies of other routes but keeps the rest', () => {
    const event = scrubSentryEvent({
      request: {
        url: 'https://ugurhoca.com/api/support-message',
        data: '{"message":"merhaba","refresh_token":"opaque-refresh","password":"p@ss"}',
      },
    });

    expect(event.request.data).toBe(
      '{"message":"merhaba","refresh_token":"[Filtered]","password":"[Filtered]"}',
    );
  });

  it('masks sensitive keys in structured data and leaves ordinary values alone', () => {
    const event = scrubSentryEvent({
      extra: { accessToken: 'opaque', nested: [{ client_secret: 'x', grade: 8 }], name: 'Ada' },
    });

    expect(event.extra).toEqual({
      accessToken: '[Filtered]',
      nested: [{ client_secret: '[Filtered]', grade: 8 }],
      name: 'Ada',
    });
  });

  it('tolerates non-object events', () => {
    expect(scrubSentryEvent(null)).toBeNull();
  });
});

describe('Sentry config wiring', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.doUnmock('@sentry/nextjs');
    vi.resetModules();
  });

  it.each([
    ['server', '../../sentry.server.config'],
    ['edge', '../../sentry.edge.config'],
    ['client', '../../sentry.client.config'],
  ])('%s config scrubs events in beforeSend and beforeSendTransaction', async (_name, path) => {
    vi.resetModules();
    vi.stubEnv('SENTRY_DSN', 'https://public@o0.ingest.sentry.io/0');
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://public@o0.ingest.sentry.io/0');
    const init = vi.fn();
    vi.doMock('@sentry/nextjs', () => ({ init }));

    await import(path);

    expect(init).toHaveBeenCalledTimes(1);
    const options = init.mock.calls[0][0] as {
      beforeSend: (event: unknown) => unknown;
      beforeSendTransaction: (event: unknown) => unknown;
    };
    for (const hook of [options.beforeSend, options.beforeSendTransaction]) {
      expect(JSON.stringify(hook(createAuthRouteEvent()))).not.toContain(FAKE_JWT);
    }
  });
});
