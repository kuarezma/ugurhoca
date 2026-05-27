import { describe, expect, it } from 'vitest';
import {
  buildLiveLessonIdentity,
  isExpectedLiveLessonIdentity,
  parseLiveLessonIdentity,
} from '@/features/live-lessons/lib/participant-identity';

const userId = 'a9862dcf-93c8-4927-8e0a-9c48c7dc3d49';

describe('live lesson participant identity', () => {
  it('uses the full user id for stable permission checks', () => {
    expect(buildLiveLessonIdentity(userId, 'student')).toBe(`student_${userId}`);
    expect(buildLiveLessonIdentity(userId, 'teacher')).toBe(`teacher_${userId}`);
  });

  it('parses valid identities and rejects truncated ids', () => {
    expect(parseLiveLessonIdentity(`student_${userId}`)).toEqual({
      role: 'student',
      userId,
    });
    expect(parseLiveLessonIdentity(`student_${userId.slice(0, 24)}`)).toBeNull();
  });

  it('matches role and user id exactly', () => {
    expect(isExpectedLiveLessonIdentity(`student_${userId}`, userId, 'student')).toBe(true);
    expect(isExpectedLiveLessonIdentity(`teacher_${userId}`, userId, 'student')).toBe(false);
  });
});
