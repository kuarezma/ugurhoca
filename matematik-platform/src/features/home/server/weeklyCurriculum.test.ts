import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { resolveWeeklyCurriculumForDate } from './weeklyCurriculum';

describe('resolveWeeklyCurriculumForDate', () => {
  it('resolves official 2026-2027 MEB annual plan topics for all 4 grades across autumn and spring weeks', () => {
    const autumn = resolveWeeklyCurriculumForDate(
      new Date('2026-11-10T10:00:00Z'),
    );
    expect(autumn.items).toHaveLength(4);
    expect(autumn.items.map((i) => i.grade)).toEqual([5, 6, 7, 8]);
    expect(autumn.items[0]?.outcomeCode).toBe('MAT.5.1.1');
    expect(autumn.weekLabel).toContain('Kasım');

    const spring = resolveWeeklyCurriculumForDate(
      new Date('2027-04-14T10:00:00Z'),
    );
    expect(spring.items).toHaveLength(4);
    expect(spring.items[0]?.topic).toContain('Kategorik Veri');
    expect(spring.weekLabel).toContain('Nisan');
  });
});
