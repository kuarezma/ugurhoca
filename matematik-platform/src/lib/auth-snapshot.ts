import type { GradeValue } from '@/types';

export const AUTH_SNAPSHOT_COOKIE_NAME = 'ugurhoca_auth_snapshot';
export const AUTH_ACCESS_TOKEN_COOKIE_NAME = 'ugurhoca_access_token';

export type AuthSnapshot = {
  email: string;
  grade: GradeValue;
  id: string;
  isAdmin: boolean;
  name: string;
};

const isGradeValue = (value: unknown): value is GradeValue =>
  value === 'Mezun' || typeof value === 'number';

export const serializeAuthSnapshot = (snapshot: AuthSnapshot) =>
  encodeURIComponent(JSON.stringify(snapshot));

export const parseAuthSnapshot = (value: string | undefined) => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<AuthSnapshot>;

    if (
      typeof parsed?.id !== 'string' ||
      typeof parsed?.email !== 'string' ||
      typeof parsed?.isAdmin !== 'boolean' ||
      !isGradeValue(parsed?.grade)
    ) {
      return null;
    }

    return {
      ...parsed,
      name:
        typeof parsed.name === 'string' && parsed.name.length > 0
          ? parsed.name
          : 'Öğrenci',
    } as AuthSnapshot;
  } catch {
    return null;
  }
};
