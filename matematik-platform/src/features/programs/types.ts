import type {
  YksScoreType,
  YksSubjectKey,
  LgsSubjectKey,
} from '@/lib/examCalculators';

export type ProgramTargetLevel = 'iddiali' | 'dengeli' | 'guvenli';
export type ProgramLocationScope = 'all' | 'domestic' | 'international';

export type ProgramStepId = 1 | 2 | 3;

export type ProgramStep = {
  id: ProgramStepId;
  title: string;
};

export type YksProgramTarget = {
  id: string;
  year: number;
  program_code: string;
  university_name: string;
  university_type: string;
  faculty_or_school: string | null;
  program_name: string;
  level: 'lisans' | 'onlisans';
  city: string;
  score_type: YksScoreType;
  teaching_type: string | null;
  scholarship_rate: number | null;
  instruction_language: string | null;
  quota_total: number | null;
  base_rank: number | null;
  base_score: number | null;
  source_url_osym: string | null;
  source_url_yokatlas: string | null;
};

export type EvaluatedYksProgramTarget = YksProgramTarget & {
  targetLevel: ProgramTargetLevel;
};

export type LgsSchoolTarget = {
  id: string;
  year: number;
  school_name: string;
  province: string;
  district: string;
  school_type: string;
  placement_mode: string;
  instruction_language: string;
  boarding: boolean;
  prep_class: boolean;
  base_score: number;
  national_percentile: number | null;
  quota_total: number | null;
  source_url: string | null;
  source_year: number | null;
};

export type LgsSchoolHistoryPoint = {
  year: number;
  base_score: number;
  national_percentile: number | null;
  quota_total: number | null;
  source_url: string | null;
};

export type LgsSchoolWithHistory = Omit<
  LgsSchoolTarget,
  'year' | 'base_score' | 'national_percentile' | 'quota_total' | 'source_url' | 'source_year'
> & {
  latest_year: number;
  base_score: number;
  national_percentile: number | null;
  quota_total: number | null;
  source_url: string | null;
  source_year: number | null;
  history: LgsSchoolHistoryPoint[];
};

export type EvaluatedLgsSchoolTarget = LgsSchoolWithHistory & {
  level: ProgramTargetLevel;
  delta: number;
  baseScore: number;
};

export type LgsSchoolPageData = {
  dataYear: number;
  error: string;
  historyYears: number[];
  schools: LgsSchoolWithHistory[];
};

export type ProgramLevelTone = {
  darkBadge: string;
  darkCard: string;
  lightBadge: string;
  lightCard: string;
};

export type YksSubjectField = {
  field: 'correct' | 'wrong';
  subjectKey: YksSubjectKey;
};

export type LgsSubjectField = {
  field: 'correct' | 'wrong';
  subjectKey: LgsSubjectKey;
};
