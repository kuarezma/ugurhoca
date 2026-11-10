'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import { ProgramBackLink } from '@/features/programs/components/ProgramBackLink';
import { ProgramStepTabs } from '@/features/programs/components/ProgramStepTabs';
import { ProgramWizardHeader } from '@/features/programs/components/ProgramWizardHeader';
import { useYksProgramTargets } from '@/features/programs/hooks/useYksProgramTargets';
import type {
  ProgramLocationScope,
  ProgramTargetLevel,
} from '@/features/programs/types';
import {
  isInternationalProgramLocation,
  matchesProgramLocationScope,
} from '@/features/programs/utils';
import {
  calculateYksScore,
  classifyYksTarget,
  createInitialYksInputs,
  resolveYksPreferenceRank,
  yksSubjects,
  type YksScoreType,
  type YksSubjectKey,
} from '@/lib/examCalculators';
import { applyAnswerChange } from '@/lib/examInputs';
import { normalizeObp, steps } from './YksProgramPage/helpers';
import type { EvaluatedYksProgram } from './YksProgramPage/YksProgramCard';
import { YksStepPreferenceFilters } from './YksProgramPage/YksStepPreferenceFilters';
import { YksStepProgramRecommendations } from './YksProgramPage/YksStepProgramRecommendations';
import { YksStepScoreCalculation } from './YksProgramPage/YksStepScoreCalculation';

export default function YksWizardPage() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const { dataYear, error, loading, programs } = useYksProgramTargets();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [inputs, setInputs] = useState(createInitialYksInputs());
  const [scoreType, setScoreType] = useState<YksScoreType>('SAY');
  const [obpInput, setObpInput] = useState('85');
  const [placedLastYear, setPlacedLastYear] = useState(false);
  const [manualRank, setManualRank] = useState('');

  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<'all' | 'lisans' | 'onlisans'>('all');
  const [locationScope, setLocationScope] =
    useState<ProgramLocationScope>('all');
  const [city, setCity] = useState('all');
  const [universityType, setUniversityType] = useState('all');
  const [teachingType, setTeachingType] = useState('all');
  const [language, setLanguage] = useState('all');
  const [scholarship, setScholarship] = useState<
    'all' | 'none' | 'partial' | 'full'
  >('all');
  const [preferredLevel, setPreferredLevel] = useState<
    'all' | ProgramTargetLevel
  >('all');

  const obp = useMemo(() => normalizeObp(obpInput), [obpInput]);

  const yksResult = useMemo(
    () => calculateYksScore(inputs, scoreType, obp, placedLastYear),
    [inputs, scoreType, obp, placedLastYear],
  );

  const normalizedManualRank = useMemo(() => {
    const numeric = Number.parseInt(manualRank, 10);
    return Number.isNaN(numeric) || numeric <= 0 ? undefined : numeric;
  }, [manualRank]);

  const activeRank = resolveYksPreferenceRank(
    yksResult.estimatedRank,
    normalizedManualRank,
  );

  const subjectsByKey = useMemo(
    () => new Map(yksSubjects.map((subject) => [subject.key, subject])),
    [],
  );

  const cities = useMemo(
    () =>
      Array.from(
        new Set(
          programs
            .map((program) => program.city)
            .filter((programCity) =>
              matchesProgramLocationScope(programCity, locationScope),
            ),
        ),
      ).sort((a, b) => a.localeCompare(b, 'tr')),
    [locationScope, programs],
  );

  const domesticCityCount = useMemo(
    () =>
      new Set(
        programs
          .map((program) => program.city)
          .filter(
            (programCity) => !isInternationalProgramLocation(programCity),
          ),
      ).size,
    [programs],
  );

  const internationalLocationCount = useMemo(
    () =>
      new Set(
        programs
          .map((program) => program.city)
          .filter((programCity) => isInternationalProgramLocation(programCity)),
      ).size,
    [programs],
  );

  const universityCount = useMemo(
    () => new Set(programs.map((program) => program.university_name)).size,
    [programs],
  );

  const universityTypes = useMemo(
    () =>
      Array.from(
        new Set(programs.map((program) => program.university_type)),
      ).sort((a, b) => a.localeCompare(b, 'tr')),
    [programs],
  );

  const teachingTypes = useMemo(
    () =>
      Array.from(
        new Set(
          programs
            .map((program) => program.teaching_type)
            .filter(Boolean) as string[],
        ),
      ).sort((a, b) => a.localeCompare(b, 'tr')),
    [programs],
  );

  const languages = useMemo(
    () =>
      Array.from(
        new Set(
          programs
            .map((program) => program.instruction_language)
            .filter(Boolean) as string[],
        ),
      ).sort((a, b) => a.localeCompare(b, 'tr')),
    [programs],
  );

  const evaluatedPrograms = useMemo(() => {
    const loweredQuery = query.trim().toLocaleLowerCase('tr');

    const filtered = programs.filter((program) => {
      if (program.score_type !== scoreType) return false;
      if (level !== 'all' && program.level !== level) return false;
      if (!matchesProgramLocationScope(program.city, locationScope))
        return false;
      if (city !== 'all' && program.city !== city) return false;
      if (
        universityType !== 'all' &&
        program.university_type !== universityType
      )
        return false;
      if (teachingType !== 'all' && program.teaching_type !== teachingType)
        return false;
      if (language !== 'all' && program.instruction_language !== language)
        return false;

      if (scholarship !== 'all') {
        const rate = Number(program.scholarship_rate || 0);
        if (scholarship === 'none' && rate !== 0) return false;
        if (scholarship === 'partial' && !(rate > 0 && rate < 100))
          return false;
        if (scholarship === 'full' && rate !== 100) return false;
      }

      if (loweredQuery) {
        const joined =
          `${program.university_name} ${program.program_name} ${program.city} ${program.faculty_or_school || ''}`.toLocaleLowerCase(
            'tr',
          );
        if (!joined.includes(loweredQuery)) return false;
      }

      return true;
    });

    const withLevels: EvaluatedYksProgram[] = filtered.map((program) => {
      const levelData = classifyYksTarget({
        userScore: yksResult.estimatedScore,
        userRank: activeRank,
        baseScore: program.base_score,
        baseRank: program.base_rank,
      });

      return {
        ...program,
        targetLevel: levelData.level,
      };
    });

    const targetFiltered =
      preferredLevel === 'all'
        ? withLevels
        : withLevels.filter(
            (program) => program.targetLevel === preferredLevel,
          );

    const order: Record<ProgramTargetLevel, number> = {
      iddiali: 0,
      dengeli: 1,
      guvenli: 2,
    };

    return targetFiltered.sort((a, b) => {
      const levelDiff = order[a.targetLevel] - order[b.targetLevel];
      if (levelDiff !== 0) return levelDiff;

      if (a.base_rank && b.base_rank) {
        return a.base_rank - b.base_rank;
      }

      return Number((b.base_score || 0) - (a.base_score || 0));
    });
  }, [
    activeRank,
    city,
    language,
    level,
    locationScope,
    preferredLevel,
    programs,
    query,
    scholarship,
    scoreType,
    teachingType,
    universityType,
    yksResult.estimatedScore,
  ]);

  const grouped = useMemo(
    () => ({
      iddiali: evaluatedPrograms.filter(
        (program) => program.targetLevel === 'iddiali',
      ),
      dengeli: evaluatedPrograms.filter(
        (program) => program.targetLevel === 'dengeli',
      ),
      guvenli: evaluatedPrograms.filter(
        (program) => program.targetLevel === 'guvenli',
      ),
    }),
    [evaluatedPrograms],
  );

  const updateSubjectInput = (
    subjectKey: YksSubjectKey,
    field: 'correct' | 'wrong',
    rawValue: string,
  ) => {
    const meta = yksSubjects.find((subject) => subject.key === subjectKey);
    if (!meta) return;

    setInputs((prev) => ({
      ...prev,
      [subjectKey]: applyAnswerChange(
        prev[subjectKey],
        field,
        rawValue,
        meta.questions,
      ),
    }));
  };

  return (
    <main className="programlar-page min-h-screen gradient-bg px-4 pb-12 pt-16 sm:px-6 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <ProgramBackLink isLight={isLight} />

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-default bg-surface-1 p-5 shadow-sm sm:p-7"
        >
          <ProgramWizardHeader
            badgeClassName="text-white bg-violet-700"
            badgeLabel="YKS Tercih Sihirbazı"
            dataYear={dataYear}
            dataYearNote={
              dataYear < 2026
                ? 'En güncel tam tercih verisi kullanılıyor.'
                : undefined
            }
            description="TYT / SAY / EA / SÖZ puan tahmini yapılır. Sonra gerçek veritabanındaki üniversiteler filtrelenerek hedef seviyene uygun seçenekler listelenir. Sonuçlar kaydedilmez."
            isLight={isLight}
            title="YKS Puan Hesaplama ve Üniversite Tercih Sihirbazı"
          />

          <ProgramStepTabs
            activeStep={step}
            activeStepClassName="bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
            inactiveStepClassName="border border-default dark:border-slate-400 bg-surface-1 text-secondary hover:text-primary hover:border-accent"
            onStepChange={setStep}
            steps={steps}
          />

          {step === 1 && (
            <YksStepScoreCalculation
              obpInput={obpInput}
              setObpInput={setObpInput}
              scoreType={scoreType}
              setScoreType={setScoreType}
              placedLastYear={placedLastYear}
              setPlacedLastYear={setPlacedLastYear}
              manualRank={manualRank}
              setManualRank={setManualRank}
              inputs={inputs}
              updateSubjectInput={updateSubjectInput}
              subjectsByKey={subjectsByKey}
              yksResult={yksResult}
              activeRank={activeRank}
              isLight={isLight}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <YksStepPreferenceFilters
              query={query}
              setQuery={setQuery}
              level={level}
              setLevel={setLevel}
              locationScope={locationScope}
              setLocationScope={setLocationScope}
              city={city}
              setCity={setCity}
              cities={cities}
              universityType={universityType}
              setUniversityType={setUniversityType}
              universityTypes={universityTypes}
              teachingType={teachingType}
              setTeachingType={setTeachingType}
              teachingTypes={teachingTypes}
              language={language}
              setLanguage={setLanguage}
              languages={languages}
              scholarship={scholarship}
              setScholarship={setScholarship}
              preferredLevel={preferredLevel}
              setPreferredLevel={setPreferredLevel}
              evaluatedCount={evaluatedPrograms.length}
              domesticCityCount={domesticCityCount}
              internationalLocationCount={internationalLocationCount}
              universityCount={universityCount}
              totalProgramCount={programs.length}
              onPrev={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}

          {step === 3 && (
            <YksStepProgramRecommendations
              estimatedScore={yksResult.estimatedScore}
              activeRank={activeRank}
              evaluatedPrograms={evaluatedPrograms}
              loading={loading}
              error={error}
              preferredLevel={preferredLevel}
              grouped={grouped}
              isLight={isLight}
              onEditFilters={() => setStep(2)}
              onUpdateNets={() => setStep(1)}
            />
          )}
        </motion.section>
      </div>
    </main>
  );
}
