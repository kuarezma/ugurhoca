import {
  calculateLgsScore,
  calculateYksScore,
  classifyLgsTarget,
  createInitialLgsInputs,
  createInitialYksInputs,
  resolveYksPreferenceRank,
  yksScoreTypes,
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

  it('calculates LGS net with 3 wrong cancelling 1 correct', () => {
    const inputs = createInitialLgsInputs();
    inputs.turkce = { correct: 12, wrong: 3 };

    const result = calculateLgsScore(inputs);
    const turkce = result.subjectNets.find(
      (subject) => subject.key === 'turkce',
    );

    expect(turkce?.net).toBe(11);
  });

  it('calculates YKS net with 4 wrong cancelling 1 correct', () => {
    const inputs = createInitialYksInputs();
    inputs.tytTurkce = { correct: 20, wrong: 4 };

    const result = calculateYksScore(inputs, 'TYT', 85);

    expect(result.tytNets.tytTurkce).toBe(19);
  });

  it('halves OBP contribution when the student placed last year', () => {
    const inputs = createInitialYksInputs();

    const regular = calculateYksScore(inputs, 'SAY', 80);
    const penalized = calculateYksScore(inputs, 'SAY', 80, true);

    expect(regular.obpContribution).toBe(48);
    expect(penalized.obpContribution).toBe(24);
  });

  it('returns result rows for all YKS score types', () => {
    const result = calculateYksScore(createInitialYksInputs(), 'EA', 85);

    expect(result.rows.map((row) => row.scoreType)).toEqual(yksScoreTypes);
    expect(
      result.rows.every((row) => row.rawScore > 0 && row.placementScore > 0),
    ).toBe(true);
  });

  it('uses manual YKS rank for preference matching when available', () => {
    expect(resolveYksPreferenceRank(125000, undefined)).toBe(125000);
    expect(resolveYksPreferenceRank(125000, 98000)).toBe(98000);
  });

  it('classifies school targets by score delta', () => {
    expect(classifyLgsTarget(420, 435).level).toBe('iddiali');
    expect(classifyLgsTarget(440, 435).level).toBe('dengeli');
    expect(classifyLgsTarget(470, 435).level).toBe('guvenli');
  });
});
