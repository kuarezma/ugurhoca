import {
  calculateLgsScore,
  calculateYksScore,
  classifyLgsTarget,
  createInitialLgsInputs,
  createInitialYksInputs,
} from '@/lib/examCalculators';

describe('examCalculators', () => {
  it('calculates a baseline LGS score from empty inputs', () => {
    const result = calculateLgsScore(createInitialLgsInputs());

    expect(result.totalNet).toBe(0);
    expect(result.estimatedScore).toBe(100);
    expect(result.estimatedPercentile).toBe(99.99);
  });

  it('calculates a YKS score and rank from populated inputs', () => {
    const inputs = createInitialYksInputs();
    inputs.tytMatematik = { correct: 30, wrong: 6 };
    inputs.tytTurkce = { correct: 28, wrong: 4 };
    inputs.aytMatematik = { correct: 24, wrong: 4 };
    inputs.aytFen = { correct: 18, wrong: 6 };

    const result = calculateYksScore(inputs, 'SAY', 85);

    expect(result.estimatedScore).toBeGreaterThan(100);
    expect(result.estimatedRank).toBeGreaterThan(0);
    expect(result.obpContribution).toBe(51);
  });

  it('classifies school targets by score delta', () => {
    expect(classifyLgsTarget(420, 435).level).toBe('iddiali');
    expect(classifyLgsTarget(440, 435).level).toBe('dengeli');
    expect(classifyLgsTarget(470, 435).level).toBe('guvenli');
  });
});
