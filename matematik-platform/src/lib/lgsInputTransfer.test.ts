import { describe, expect, it } from 'vitest';
import { calculateLgsScore, createInitialLgsInputs } from './examCalculators';
import { parseLgsInputs, serializeLgsInputs } from './lgsInputTransfer';

describe('LGS input transfer', () => {
  it('preserves subject answers and the calculated score', () => {
    const inputs = createInitialLgsInputs();
    inputs.turkce = { correct: 15, wrong: 2 };
    const restored = parseLgsInputs(
      new URLSearchParams(serializeLgsInputs(inputs)),
    );
    expect(restored).toEqual(inputs);
    expect(calculateLgsScore(restored!).estimatedScore).toBe(
      calculateLgsScore(inputs).estimatedScore,
    );
  });
  it('rejects missing, invalid and impossible values', () => {
    const params = new URLSearchParams(
      serializeLgsInputs(createInitialLgsInputs()),
    );
    params.set('turkce_d', '21');
    expect(parseLgsInputs(params)).toBeNull();
    params.set('turkce_d', '-1');
    expect(parseLgsInputs(params)).toBeNull();
    params.delete('turkce_d');
    expect(parseLgsInputs(params)).toBeNull();
  });
});
