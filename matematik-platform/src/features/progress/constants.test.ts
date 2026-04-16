import { describe, expect, it } from 'vitest';
import {
  GRADE_TOPIC_OPTIONS,
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
  });

  it('returns a defensive copy of the topic list', () => {
    const topics = getTopicsForGrade(5);
    topics.pop();

    expect(getTopicsForGrade(5)).toEqual(GRADE_TOPIC_OPTIONS['5']);
  });
});
