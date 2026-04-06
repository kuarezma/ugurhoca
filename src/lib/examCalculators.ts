export type LgsSubjectKey =
  | 'turkce'
  | 'matematik'
  | 'fen'
  | 'inkilap'
  | 'din'
  | 'ingilizce';

export type LgsSubjectInput = {
  correct: number;
  wrong: number;
};

export type LgsInputs = Record<LgsSubjectKey, LgsSubjectInput>;

export type YksScoreType = 'TYT' | 'SAY' | 'EA' | 'SOZ';

export type YksSubjectKey =
  | 'tytTurkce'
  | 'tytSosyal'
  | 'tytMatematik'
  | 'tytFen'
  | 'aytMatematik'
  | 'aytFen'
  | 'aytEdebiyat'
  | 'aytSosyal';

export type YksInputs = Record<YksSubjectKey, LgsSubjectInput>;

type LgsSubjectMeta = {
  key: LgsSubjectKey;
  label: string;
  questions: number;
  coefficient: number;
};

type YksSubjectMeta = {
  key: YksSubjectKey;
  label: string;
  questions: number;
};

type ScoreAnchor = {
  score: number;
  rank: number;
};

export const lgsSubjects: LgsSubjectMeta[] = [
  { key: 'turkce', label: 'Turkce', questions: 20, coefficient: 4 },
  { key: 'matematik', label: 'Matematik', questions: 20, coefficient: 4 },
  { key: 'fen', label: 'Fen Bilimleri', questions: 20, coefficient: 4 },
  { key: 'inkilap', label: 'T.C. Inkilap', questions: 10, coefficient: 1 },
  { key: 'din', label: 'Din Kulturu', questions: 10, coefficient: 1 },
  { key: 'ingilizce', label: 'Ingilizce', questions: 10, coefficient: 1 },
];

export const yksSubjects: YksSubjectMeta[] = [
  { key: 'tytTurkce', label: 'TYT Turkce', questions: 40 },
  { key: 'tytSosyal', label: 'TYT Sosyal', questions: 20 },
  { key: 'tytMatematik', label: 'TYT Matematik', questions: 40 },
  { key: 'tytFen', label: 'TYT Fen', questions: 20 },
  { key: 'aytMatematik', label: 'AYT Matematik', questions: 40 },
  { key: 'aytFen', label: 'AYT Fen', questions: 40 },
  { key: 'aytEdebiyat', label: 'AYT Edebiyat-Sos1', questions: 40 },
  { key: 'aytSosyal', label: 'AYT Sosyal Bilimler-2', questions: 40 },
];

const yksTytWeights = {
  tytTurkce: 3.4,
  tytSosyal: 3.1,
  tytMatematik: 3.5,
  tytFen: 3.3,
};

const yksAytWeights: Record<YksScoreType, Record<'aytMatematik' | 'aytFen' | 'aytEdebiyat' | 'aytSosyal', number>> = {
  TYT: { aytMatematik: 0, aytFen: 0, aytEdebiyat: 0, aytSosyal: 0 },
  SAY: { aytMatematik: 3.0, aytFen: 2.9, aytEdebiyat: 0.3, aytSosyal: 0.3 },
  EA: { aytMatematik: 2.5, aytFen: 0.3, aytEdebiyat: 2.2, aytSosyal: 1.3 },
  SOZ: { aytMatematik: 0.4, aytFen: 0.2, aytEdebiyat: 2.7, aytSosyal: 2.3 },
};

const yksRankAnchors: Record<YksScoreType, ScoreAnchor[]> = {
  TYT: [
    { score: 520, rank: 5000 },
    { score: 480, rank: 45000 },
    { score: 440, rank: 160000 },
    { score: 400, rank: 420000 },
    { score: 360, rank: 860000 },
    { score: 320, rank: 1450000 },
    { score: 280, rank: 2200000 },
  ],
  SAY: [
    { score: 560, rank: 1000 },
    { score: 530, rank: 10000 },
    { score: 500, rank: 50000 },
    { score: 470, rank: 140000 },
    { score: 440, rank: 300000 },
    { score: 410, rank: 560000 },
    { score: 380, rank: 950000 },
    { score: 350, rank: 1550000 },
  ],
  EA: [
    { score: 560, rank: 1200 },
    { score: 530, rank: 12000 },
    { score: 500, rank: 60000 },
    { score: 470, rank: 180000 },
    { score: 440, rank: 360000 },
    { score: 410, rank: 680000 },
    { score: 380, rank: 1150000 },
    { score: 350, rank: 1820000 },
  ],
  SOZ: [
    { score: 540, rank: 2500 },
    { score: 510, rank: 25000 },
    { score: 480, rank: 90000 },
    { score: 450, rank: 240000 },
    { score: 420, rank: 470000 },
    { score: 390, rank: 820000 },
    { score: 360, rank: 1300000 },
    { score: 330, rank: 1950000 },
  ],
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function net(correct: number, wrong: number, wrongDivisor: number) {
  return Number(clamp(correct - wrong / wrongDivisor, 0, 100).toFixed(2));
}

function interpolateRank(score: number, anchors: ScoreAnchor[]) {
  if (score >= anchors[0].score) return anchors[0].rank;
  if (score <= anchors[anchors.length - 1].score) return anchors[anchors.length - 1].rank;

  for (let i = 0; i < anchors.length - 1; i += 1) {
    const current = anchors[i];
    const next = anchors[i + 1];

    if (score <= current.score && score >= next.score) {
      const ratio = (score - next.score) / (current.score - next.score);
      return Math.round(next.rank + ratio * (current.rank - next.rank));
    }
  }

  return anchors[anchors.length - 1].rank;
}

export function createInitialLgsInputs(): LgsInputs {
  return {
    turkce: { correct: 0, wrong: 0 },
    matematik: { correct: 0, wrong: 0 },
    fen: { correct: 0, wrong: 0 },
    inkilap: { correct: 0, wrong: 0 },
    din: { correct: 0, wrong: 0 },
    ingilizce: { correct: 0, wrong: 0 },
  };
}

export function createInitialYksInputs(): YksInputs {
  return {
    tytTurkce: { correct: 0, wrong: 0 },
    tytSosyal: { correct: 0, wrong: 0 },
    tytMatematik: { correct: 0, wrong: 0 },
    tytFen: { correct: 0, wrong: 0 },
    aytMatematik: { correct: 0, wrong: 0 },
    aytFen: { correct: 0, wrong: 0 },
    aytEdebiyat: { correct: 0, wrong: 0 },
    aytSosyal: { correct: 0, wrong: 0 },
  };
}

export function calculateLgsScore(inputs: LgsInputs) {
  const subjectNets = lgsSubjects.map((subject) => {
    const value = inputs[subject.key];
    const resultNet = net(value.correct, value.wrong, 3);
    const weighted = Number((resultNet * subject.coefficient).toFixed(2));

    return {
      ...subject,
      net: resultNet,
      weighted,
    };
  });

  const weightedNet = Number(subjectNets.reduce((sum, subject) => sum + subject.weighted, 0).toFixed(2));
  const totalNet = Number(subjectNets.reduce((sum, subject) => sum + subject.net, 0).toFixed(2));
  const maxWeightedNet = lgsSubjects.reduce((sum, subject) => sum + subject.questions * subject.coefficient, 0);
  const estimatedScore = Number(clamp(100 + (weightedNet / maxWeightedNet) * 400, 100, 500).toFixed(2));
  const estimatedPercentile = Number(clamp(100 - ((estimatedScore - 100) / 400) * 100, 0.01, 99.99).toFixed(2));

  return {
    subjectNets,
    weightedNet,
    totalNet,
    estimatedScore,
    estimatedPercentile,
  };
}

export function calculateYksScore(inputs: YksInputs, scoreType: YksScoreType, obp: number) {
  const tytNets = {
    tytTurkce: net(inputs.tytTurkce.correct, inputs.tytTurkce.wrong, 4),
    tytSosyal: net(inputs.tytSosyal.correct, inputs.tytSosyal.wrong, 4),
    tytMatematik: net(inputs.tytMatematik.correct, inputs.tytMatematik.wrong, 4),
    tytFen: net(inputs.tytFen.correct, inputs.tytFen.wrong, 4),
  };

  const aytNets = {
    aytMatematik: net(inputs.aytMatematik.correct, inputs.aytMatematik.wrong, 4),
    aytFen: net(inputs.aytFen.correct, inputs.aytFen.wrong, 4),
    aytEdebiyat: net(inputs.aytEdebiyat.correct, inputs.aytEdebiyat.wrong, 4),
    aytSosyal: net(inputs.aytSosyal.correct, inputs.aytSosyal.wrong, 4),
  };

  const tytRaw = Number(
    (
      tytNets.tytTurkce * yksTytWeights.tytTurkce +
      tytNets.tytSosyal * yksTytWeights.tytSosyal +
      tytNets.tytMatematik * yksTytWeights.tytMatematik +
      tytNets.tytFen * yksTytWeights.tytFen
    ).toFixed(2)
  );

  const aytWeight = yksAytWeights[scoreType];
  const aytRaw = Number(
    (
      aytNets.aytMatematik * aytWeight.aytMatematik +
      aytNets.aytFen * aytWeight.aytFen +
      aytNets.aytEdebiyat * aytWeight.aytEdebiyat +
      aytNets.aytSosyal * aytWeight.aytSosyal
    ).toFixed(2)
  );

  const safeObp = clamp(obp, 50, 100);
  const obpContribution = Number((safeObp * 0.6).toFixed(2));
  const estimatedScore = Number(clamp(100 + tytRaw * 1.25 + aytRaw * 1.45 + obpContribution, 100, 560).toFixed(2));
  const estimatedRank = interpolateRank(estimatedScore, yksRankAnchors[scoreType]);

  return {
    tytNets,
    aytNets,
    tytRaw,
    aytRaw,
    obpContribution,
    estimatedScore,
    estimatedRank,
  };
}

export function classifyLgsTarget(userScore: number, schoolBaseScore: number) {
  const delta = Number((userScore - schoolBaseScore).toFixed(2));

  if (delta < -8) {
    return { level: 'iddiali' as const, delta };
  }

  if (delta <= 10) {
    return { level: 'dengeli' as const, delta };
  }

  return { level: 'guvenli' as const, delta };
}

export function classifyYksTarget(params: {
  userScore: number;
  userRank?: number;
  baseScore?: number | null;
  baseRank?: number | null;
}) {
  const { userScore, userRank, baseScore, baseRank } = params;

  if (userRank && baseRank && baseRank > 0) {
    const ratio = userRank / baseRank;

    if (ratio > 1.08) return { level: 'iddiali' as const, ratio };
    if (ratio >= 0.92) return { level: 'dengeli' as const, ratio };
    return { level: 'guvenli' as const, ratio };
  }

  if (!baseScore) {
    return { level: 'dengeli' as const, delta: null };
  }

  const delta = Number((userScore - baseScore).toFixed(2));

  if (delta < -12) return { level: 'iddiali' as const, delta };
  if (delta <= 15) return { level: 'dengeli' as const, delta };
  return { level: 'guvenli' as const, delta };
}

export function formatRank(rank?: number | null) {
  if (!rank || Number.isNaN(rank)) return '-';
  return rank.toLocaleString('tr-TR');
}
