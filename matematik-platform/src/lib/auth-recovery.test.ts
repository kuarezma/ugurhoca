import { describe, expect, it, beforeEach, vi } from 'vitest';
import type { Session } from '@supabase/supabase-js';
import { isRecoverySession, trackRecoverySession } from './auth-recovery';
const session = {
  access_token: 'token',
  expires_at: 4102444800,
  user: { id: 'u-1' },
} as Session;
describe('recovery session scope', () => {
  beforeEach(() => trackRecoverySession('SIGNED_OUT', null));
  it('only accepts a session from PASSWORD_RECOVERY', () => {
    expect(isRecoverySession(session)).toBe(false);
    trackRecoverySession('PASSWORD_RECOVERY', session);
    expect(isRecoverySession(session)).toBe(true);
    expect(isRecoverySession({ ...session, access_token: 'other' })).toBe(
      false,
    );
    expect(isRecoverySession({ ...session, expires_at: 1 })).toBe(false);
    trackRecoverySession('SIGNED_IN', {
      ...session,
      access_token: 'ordinary-login',
    });
    expect(isRecoverySession(session)).toBe(false);
  });
  it('keeps a verified recovery session after a page reload, without persisting credentials', async () => {
    const jwt = `header.${btoa(JSON.stringify({ session_id: 'recovery-session-id' }))}.signature`;
    const verified = { ...session, access_token: jwt };
    trackRecoverySession('PASSWORD_RECOVERY', verified);
    vi.resetModules();
    const reloaded = await import('./auth-recovery');
    expect(reloaded.isRecoverySession(verified)).toBe(true);
    expect(sessionStorage.getItem('ugurhoca_recovery_scope')).not.toContain(
      jwt,
    );
    const other = {
      ...verified,
      access_token: `header.${btoa(JSON.stringify({ session_id: 'ordinary-session-id' }))}.signature`,
    };
    reloaded.trackRecoverySession('SIGNED_IN', other);
    expect(reloaded.isRecoverySession(other)).toBe(false);
  });

  it('keeps recovery scope when the SDK repeats SIGNED_IN for the same session', () => {
    trackRecoverySession('PASSWORD_RECOVERY', session);
    trackRecoverySession('SIGNED_IN', session);
    expect(isRecoverySession(session)).toBe(true);
  });

  it('keeps the recovery scope after refreshing the same user and clears on sign-out', () => {
    trackRecoverySession('PASSWORD_RECOVERY', session);
    const refreshed = { ...session, access_token: 'refreshed' };
    trackRecoverySession('TOKEN_REFRESHED', refreshed);
    expect(isRecoverySession(refreshed)).toBe(true);
    trackRecoverySession('SIGNED_OUT', null);
    expect(isRecoverySession(refreshed)).toBe(false);
  });
});
