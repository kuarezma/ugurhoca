export const LGS_TARGET_PRESETS = [
  { name: 'Galatasaray Lisesi', score: 498.0 },
  { name: 'Ankara Fen Lisesi', score: 494.5 },
  { name: 'İzmir Fen Lisesi', score: 491.2 },
  { name: 'Kabataş Erkek Lisesi', score: 489.0 },
  { name: 'Kadıköy Anadolu Lisesi', score: 476.5 },
  { name: 'Nitelikli Fen Lisesi', score: 460.0 },
  { name: 'Köklü Anadolu Lisesi', score: 420.0 },
];

export const YKS_TARGET_PRESETS = [
  { name: 'Tıp Fakültesi (Devlet)', score: 490.0, type: 'SAY' as const },
  { name: 'Mühendislik (İTÜ / ODTÜ)', score: 455.0, type: 'SAY' as const },
  { name: 'Hukuk Fakültesi (Ankara / İst)', score: 425.0, type: 'EA' as const },
  { name: 'İktisat / İşletme (Boğaziçi)', score: 440.0, type: 'EA' as const },
  { name: 'Mimarlık / Temel Bilimler', score: 390.0, type: 'SAY' as const },
  { name: 'Eğitim Fakültesi (Öğretmenlik)', score: 360.0, type: 'EA' as const },
];

export type LgsResultData = {
  score: number;
  totalNet: number;
  totalCorrect: number;
  totalWrong: number;
  estimatedPercentile: string;
  targetBand: string;
};

export type LgsGapAnalysis = {
  targetScore: number;
  diff: number;
  isReached: boolean;
  mathNeeded: number;
  fenNeeded: number;
};

export type YksGapAnalysis = {
  targetScore: number;
  diff: number;
  isReached: boolean;
  aytMathNeeded: number;
};
