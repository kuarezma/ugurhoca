import type { LiveLessonRole } from '@/features/live-lessons/types';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function buildLiveLessonIdentity(userId: string, role: LiveLessonRole): string {
  const prefix = role === 'teacher' ? 'teacher' : 'student';
  return `${prefix}_${userId}`;
}

export function parseLiveLessonIdentity(identity: string): {
  role: LiveLessonRole;
  userId: string;
} | null {
  const [prefix, ...rest] = identity.split('_');
  const userId = rest.join('_');

  if ((prefix !== 'teacher' && prefix !== 'student') || !UUID_RE.test(userId)) {
    return null;
  }

  return {
    role: prefix,
    userId,
  };
}

export function isExpectedLiveLessonIdentity(
  identity: string,
  userId: string,
  role: LiveLessonRole,
) {
  return identity === buildLiveLessonIdentity(userId, role);
}
