import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  clearSignedOutMarker: vi.fn(),
  clearSnapshot: vi.fn(),
  listener: null as null | ((event: string, session: unknown) => void),
  writeToken: vi.fn(),
}));

vi.mock('@/lib/auth-client', () => ({
  clearClientAuthSnapshotCookie: mocks.clearSnapshot,
  clearSignedOutMarker: mocks.clearSignedOutMarker,
  clearUserProfileCache: vi.fn(),
  syncCurrentUserSnapshotCookie: vi.fn(),
  writeAccessTokenCookie: mocks.writeToken,
}));

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: (listener: (event: string, session: unknown) => void) => {
        mocks.listener = listener;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      },
    },
  },
}));

import AuthCookieSync from './AuthCookieSync';

describe('AuthCookieSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listener = null;
  });

  it('lifts the signed-out marker only on a real SIGNED_IN event, before syncing the token', () => {
    render(<AuthCookieSync />);
    const session = { access_token: 'token-1' };

    mocks.listener?.('INITIAL_SESSION', session);
    mocks.listener?.('TOKEN_REFRESHED', session);
    expect(mocks.clearSignedOutMarker).not.toHaveBeenCalled();

    mocks.listener?.('SIGNED_IN', session);
    expect(mocks.clearSignedOutMarker).toHaveBeenCalledTimes(1);
    expect(mocks.clearSignedOutMarker.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.writeToken.mock.invocationCallOrder.at(-1) ?? 0,
    );
  });

  it('clears client auth state on SIGNED_OUT', () => {
    render(<AuthCookieSync />);
    mocks.listener?.('SIGNED_OUT', null);
    expect(mocks.clearSnapshot).toHaveBeenCalledTimes(1);
    expect(mocks.clearSignedOutMarker).not.toHaveBeenCalled();
  });
});
