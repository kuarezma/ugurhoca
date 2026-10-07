import { describe, expect, it } from 'vitest';
import {
  calculateAdventureTopics,
  getAdventureStars,
} from './adventure-progress';
import { ADVENTURE_CURRICULUM } from './AdventureCurriculumData';
import { GRADE_TOPIC_OPTIONS } from '@/features/progress/constants';

describe('adventure curriculum and progress', () => {
  it.each(Object.keys(GRADE_TOPIC_OPTIONS))(
    'uses all canonical topics in order for grade %s',
    (grade) => {
      expect(ADVENTURE_CURRICULUM[grade].map((topic) => topic.title)).toEqual(
        GRADE_TOPIC_OPTIONS[grade],
      );
    },
  );
  it.each([
    [0, 0],
    [29, 0],
    [30, 1],
    [59, 1],
    [60, 2],
    [84, 2],
    [85, 3],
    [100, 3],
  ])('mastery %i earns %i stars', (mastery, stars) => {
    expect(getAdventureStars(mastery)).toBe(stars);
  });
  it('completes at 70, chooses first incomplete and keeps later units open', () => {
    const topics = calculateAdventureTopics(ADVENTURE_CURRICULUM['8'], [
      { topic: 'Çarpanlar ve Katlar', mastery_level: 70 },
      { topic: 'Üslü İfadeler', mastery_level: 69 },
      { topic: 'Kareköklü İfadeler', mastery_level: 85 },
    ]);
    expect(topics.slice(0, 4).map((topic) => topic.status)).toEqual([
      'completed',
      'active',
      'completed',
      'open',
    ]);
    expect(topics[0].stars).toBe(2);
    expect(topics[2].stars).toBe(3);
    expect(topics.filter((topic) => topic.status === 'active')).toHaveLength(1);
  });
  it('handles absent, null, out-of-range and fully complete progress', () => {
    expect(
      calculateAdventureTopics([{ title: 'A' }, { title: 'B' }], []).map(
        (topic) => topic.status,
      ),
    ).toEqual(['active', 'open']);
    expect(
      calculateAdventureTopics(
        [{ title: 'A' }],
        [{ topic: 'A', mastery_level: null }],
      )[0].stars,
    ).toBe(0);
    expect(
      calculateAdventureTopics(
        [{ title: 'A' }],
        [{ topic: 'A', mastery_level: 120 }],
      )[0],
    ).toMatchObject({ mastery: 100, status: 'completed', stars: 3 });
    expect(calculateAdventureTopics([], [])).toEqual([]);
  });
});
