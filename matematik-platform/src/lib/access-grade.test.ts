import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  canUserAccessLiveLesson,
  LIVE_LESSON_CLIENT_COLUMNS,
} from '@/features/live-lessons/lib/lesson-access';
import type { LiveLesson } from '@/features/live-lessons/types';
import { normalizeAccessGrade, resolveAccessGrade } from '@/lib/access-grade';

// SQL testi (PGlite / yerel Supabase) ile AYNI vaka tablosu: kural iki motorda
// aynı girdide aynı kararı vermeli. Tablo tek yerde, SQL dosyasında durur.
const sqlTest = readFileSync(
  path.resolve(process.cwd(), 'supabase/tests/live_lesson_rls.sql'),
  'utf8',
);

type GradeCase = {
  grade: string | null;
  metadata?: Record<string, unknown>;
  name: string;
  profile?: unknown;
  sees: string;
  sqlOnly?: boolean;
};

function readGradeCases(): Array<{ n: number; c: GradeCase }> {
  const block = sqlTest.match(
    /-- BEGIN access-grade-cases\n([\s\S]*?)\n-- END access-grade-cases/,
  );
  if (!block) throw new Error('access-grade-cases bloğu bulunamadı');

  return block[1]
    .split('\n')
    .map((line) => line.match(/^\s*\((\d+), '(.*)'\)[,;]$/))
    .filter((match): match is RegExpMatchArray => match !== null)
    .map((match) => ({
      n: Number(match[1]),
      c: JSON.parse(match[2]) as GradeCase,
    }));
}

const gradeLessons = (
  [
    ['G5', '5'],
    ['G6', '6'],
    ['G7', '7'],
    ['G8', '8'],
    ['GM', 'Mezun'],
  ] as const
).map(
  ([title, target_grade]): LiveLesson => ({
    duration_minutes: 60,
    id: title,
    room_id: `room-${title}`,
    starts_at: '',
    status: 'scheduled',
    target_grade,
    title,
  }),
);

describe('resolveAccessGrade — SQL ile ortak vaka tablosu', () => {
  const cases = readGradeCases();

  it('tablo okunur ve SQL tarafındaki satır sayısıyla eşleşir', () => {
    expect(cases.length).toBe(36);
    expect(cases.map(({ n }) => n)).toEqual(cases.map((_, index) => index + 1));
  });

  // JSON.parse ham ondalık temsili kaybeder; bu ret vakaları yalnız SQL’de koşulur.
  it.each(cases.filter(({ c }) => !c.sqlOnly))('vaka $n: $c.name', ({ c }) => {
    // getVerifiedServerUser ile aynı girdi biçimi: profil satırı yoksa
    // profile?.grade undefined; metadata yoksa user_metadata ?? {}.
    const profileGrade = 'profile' in c ? c.profile : undefined;
    const metadataGrade = (c.metadata ?? {}).grade;

    const accessGrade = resolveAccessGrade(profileGrade, metadataGrade);
    expect(accessGrade).toBe(c.grade);

    const sees = gradeLessons
      .filter((lesson) =>
        canUserAccessLiveLesson(lesson, { accessGrade, id: 'case-user' }),
      )
      .map((lesson) => lesson.title)
      .join(',');
    expect(sees).toBe(c.sees);
  });
});

describe('normalizeAccessGrade', () => {
  it('yalnız SQL vakaları ham temsili JS sayısına dönüşünce ayırt edilemez', () => {
    const sqlOnlyCases = readGradeCases().filter(({ c }) => c.sqlOnly);
    expect(sqlOnlyCases.map(({ n }) => n)).toEqual([11, 29]);
    for (const { c } of sqlOnlyCases) {
      expect(c.metadata?.grade).toBe(7);
      expect(normalizeAccessGrade(c.metadata?.grade)).toBe('7');
    }
  });

  it('varsayılan sınıfa düşmez', () => {
    expect(normalizeAccessGrade(undefined)).toBeNull();
    expect(normalizeAccessGrade(null)).toBeNull();
    expect(normalizeAccessGrade(Number.NaN)).toBeNull();
    expect(normalizeAccessGrade(Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe('SQL testindeki istemci kolon listesi', () => {
  it('LIVE_LESSON_CLIENT_COLUMNS ile aynı', () => {
    const occurrences =
      sqlTest.split(`SELECT ${LIVE_LESSON_CLIENT_COLUMNS}\n`).length - 1;
    expect(occurrences).toBe(2);
  });
});
