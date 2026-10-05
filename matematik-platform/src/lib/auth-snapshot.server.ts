import 'server-only';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { hasSupabaseSessionCookie } from '@/lib/supabase/session-cookie';
import {
  AUTH_ACCESS_TOKEN_COOKIE_NAME,
  AUTH_SNAPSHOT_COOKIE_NAME,
  parseAuthSnapshot,
  type AuthSnapshot,
} from '@/lib/auth-snapshot';

export const getServerAuthSnapshot = async () => {
  const cookieStore = await cookies();
  return parseAuthSnapshot(cookieStore.get(AUTH_SNAPSHOT_COOKIE_NAME)?.value);
};

/**
 * İmzasız, istemcinin yazdığı snapshot çerezinden yalnızca UX iskeleti
 * ("giriş yapmış gibi görün" ilk boyaması) üretir. Veri sorgusu veya yetki
 * kararı için kullanılmaz — onlar getVerifiedServerUser()'dan gelir. Çerez
 * sahte olabileceği için admin bayrağı her zaman düşürülür.
 */
export const getServerAuthSkeleton = async (): Promise<AuthSnapshot | null> => {
  const snapshot = await getServerAuthSnapshot();
  return snapshot ? { ...snapshot, isAdmin: false } : null;
};

export const getServerAccessToken = async () => {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anonKey && hasSupabaseSessionCookie(cookieStore.getAll(), url)) {
    const supabase = createServerClient(url, anonKey, {
      cookies: { getAll: () => cookieStore.getAll() },
    });
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) return session.access_token;
  }

  const value = cookieStore.get(AUTH_ACCESS_TOKEN_COOKIE_NAME)?.value;

  if (!value) {
    return null;
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};
