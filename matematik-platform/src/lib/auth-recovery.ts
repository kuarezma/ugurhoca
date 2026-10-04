import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

// Form yalnız SDK'nin doğruladığı recovery akışında açılır; URL parametresi yetmez.
const STORAGE_KEY = 'ugurhoca_recovery_scope';
let recovery: {
  userId: string;
  accessToken: string;
  sessionId: string | null;
} | null = null;

function getSessionId(session: Session): string | null {
  try {
    const payload = session.access_token.split('.')[1];
    const claims = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
    );
    return typeof claims.session_id === 'string' ? claims.session_id : null;
  } catch {
    return null;
  }
}

function persistRecoveryScope() {
  if (typeof window === 'undefined') return;
  try {
    // Yenilemede aynı oturumu tanı; access/refresh token veya parola saklama.
    if (recovery?.sessionId) {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          userId: recovery.userId,
          sessionId: recovery.sessionId,
        }),
      );
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Depolama kapalıysa mevcut sayfadaki recovery akışı çalışmaya devam eder.
  }
}

function restoreRecoveryScope(session: Session) {
  if (recovery || typeof window === 'undefined') return;
  try {
    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null');
    const sessionId = getSessionId(session);
    if (
      sessionId &&
      stored?.sessionId === sessionId &&
      stored?.userId === session.user.id
    ) {
      recovery = {
        userId: session.user.id,
        accessToken: session.access_token,
        sessionId,
      };
    }
  } catch {
    // Bozuk veya erişilemeyen kayıt recovery kanıtı değildir.
  }
}

export function trackRecoverySession(
  event: AuthChangeEvent,
  session: Session | null,
) {
  if (event === 'PASSWORD_RECOVERY' && session) {
    recovery = {
      userId: session.user.id,
      accessToken: session.access_token,
      sessionId: getSessionId(session),
    };
    persistRecoveryScope();
  } else if (
    event === 'TOKEN_REFRESHED' &&
    session &&
    recovery?.userId === session.user.id
  ) {
    recovery.accessToken = session.access_token;
  } else if (
    event === 'SIGNED_OUT' ||
    (event === 'SIGNED_IN' && !isRecoverySession(session)) ||
    event === 'USER_UPDATED'
  ) {
    recovery = null;
    persistRecoveryScope();
  }
}

export function isRecoverySession(session: Session | null): boolean {
  if (session) restoreRecoveryScope(session);
  return Boolean(
    session &&
    recovery &&
    session.user.id === recovery.userId &&
    session.access_token === recovery.accessToken &&
    session.expires_at &&
    session.expires_at > Date.now() / 1000,
  );
}
