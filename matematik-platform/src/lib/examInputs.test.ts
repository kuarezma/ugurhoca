import { describe, expect, it } from 'vitest';
import { applyAnswerChange } from './examInputs';

describe('applyAnswerChange', () => {
  it('doğru artınca yanlışı azaltır', () => {
    expect(applyAnswerChange({ correct: 10, wrong: 10 }, 'correct', '15', 20)).toEqual({ correct: 15, wrong: 5 });
  });
  it('yanlış artınca doğruyu azaltır', () => {
    expect(applyAnswerChange({ correct: 10, wrong: 10 }, 'wrong', '15', 20)).toEqual({ correct: 5, wrong: 15 });
  });
  it.each([
    ['', 0], ['abc', 0], [NaN, 0], ['-5', 0], ['25', 20], [7.9, 7], ['7.9', 7],
  ])('%s girdisini %i olarak sınırlar', (raw, expected) => {
    expect(applyAnswerChange({ correct: 0, wrong: 0 }, 'correct', raw, 20).correct).toBe(expected);
  });
  it('toplam sınırı aşmıyorsa diğer alanı korur', () => {
    expect(applyAnswerChange({ correct: 3, wrong: 4 }, 'correct', '5', 20)).toEqual({ correct: 5, wrong: 4 });
  });
});
