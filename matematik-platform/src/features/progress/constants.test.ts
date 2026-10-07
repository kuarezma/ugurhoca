import { describe, expect, it } from 'vitest';
import {
  GRADE_TOPIC_OPTIONS,
  normalizeProgressTopics,
  resolveTopicName,
  getTopicsForGrade,
} from '@/features/progress/constants';

describe('progress topic constants', () => {
  it('returns fifth grade topics by default', () => {
    expect(getTopicsForGrade(undefined)).toEqual(GRADE_TOPIC_OPTIONS['5']);
  });

  it('returns the matching topic list for a numeric grade', () => {
    expect(getTopicsForGrade(8)).toEqual(GRADE_TOPIC_OPTIONS['8']);
  });

  it('returns the twelfth grade topic list for twelfth grade', () => {
    expect(getTopicsForGrade(12)).toEqual(GRADE_TOPIC_OPTIONS['12']);
  });

  it('maps mezun users to the twelfth grade topic list', () => {
    expect(getTopicsForGrade('Mezun')).toEqual(GRADE_TOPIC_OPTIONS['12']);
    expect(getTopicsForGrade(0)).toEqual(GRADE_TOPIC_OPTIONS['12']);
  });

  it('returns a defensive copy of the topic list', () => {
    const topics = getTopicsForGrade(5);
    topics.pop();

    expect(getTopicsForGrade(5)).toEqual(GRADE_TOPIC_OPTIONS['5']);
  });
});

it('keeps unmatched legacy topics, isolates aliases by grade and uses maximum mastery', () => {
  expect(resolveTopicName(8, 'OLASILIK')).toBe(
    'Basit Olayların Olma Olasılığı',
  );
  expect(resolveTopicName(7, 'Olasılık')).toBe('Teorik Olasılık');
  expect(resolveTopicName(12, 'Olasılık')).toBe('Olasılık');
  expect(
    normalizeProgressTopics(
      [
        { topic: 'Olasılık', mastery_level: 90 },
        { topic: 'Basit Olayların Olma Olasılığı', mastery_level: 30 },
        { topic: 'Eski özel konu', mastery_level: 50 },
      ],
      8,
    ),
  ).toEqual([
    { topic: 'Basit Olayların Olma Olasılığı', mastery_level: 90 },
    { topic: 'Eski özel konu', mastery_level: 50 },
  ]);
  expect(
    ['5', '6', '7', '8'].map((grade) => getTopicsForGrade(grade).length),
  ).toEqual([16, 20, 21, 12]);
});
