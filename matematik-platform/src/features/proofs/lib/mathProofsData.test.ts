import { describe, it, expect, beforeEach } from 'vitest';
import {
  MATH_PROOFS_COLLECTION,
  getCompletedProofIds,
  toggleProofCompleted,
} from './mathProofsData';

describe('mathProofsData', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('ispat koleksiyonunun temel teoremleri içerdiğini doğrular', () => {
    expect(MATH_PROOFS_COLLECTION.length).toBeGreaterThanOrEqual(4);
    const pythagoras = MATH_PROOFS_COLLECTION.find((p) => p.id === 'proof-pythagoras');
    expect(pythagoras).toBeDefined();
    expect(pythagoras?.steps.length).toBeGreaterThan(2);
  });

  it('ispat tamamlandı durumunu toggle eder', () => {
    expect(getCompletedProofIds()).toEqual([]);

    const state1 = toggleProofCompleted('proof-pythagoras');
    expect(state1).toBe(true);
    expect(getCompletedProofIds()).toContain('proof-pythagoras');

    const state2 = toggleProofCompleted('proof-pythagoras');
    expect(state2).toBe(false);
    expect(getCompletedProofIds()).not.toContain('proof-pythagoras');
  });
});
