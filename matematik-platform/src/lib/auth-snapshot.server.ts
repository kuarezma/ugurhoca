import 'server-only';

import { cookies } from 'next/headers';
import {
  AUTH_ACCESS_TOKEN_COOKIE_NAME,
  AUTH_SNAPSHOT_COOKIE_NAME,
  parseAuthSnapshot,
} from '@/lib/auth-snapshot';

export const getServerAuthSnapshot = async () => {
  const cookieStore = await cookies();
  return parseAuthSnapshot(cookieStore.get(AUTH_SNAPSHOT_COOKIE_NAME)?.value);
};

export const getServerAccessToken = async () => {
  const cookieStore = await cookies();
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
