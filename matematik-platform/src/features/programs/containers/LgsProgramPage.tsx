'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  ExternalLink,
  Filter,
  Info,
  MapPin,
  Target,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { ProgramBackLink } from '@/features/programs/components/ProgramBackLink';
import { ProgramMetricCard } from '@/features/programs/components/ProgramMetricCard';
import { ProgramStepTabs } from '@/features/programs/components/ProgramStepTabs';
import { ProgramSubjectInputCard } from '@/features/programs/components/ProgramSubjectInputCard';
import { ProgramWizardHeader } from '@/features/programs/components/ProgramWizardHeader';
import { useLgsSchoolTargets } from '@/features/programs/hooks/useLgsSchoolTargets';
import type {
  LgsSchoolWithHistory,
  ProgramStep,
  ProgramTargetLevel,
} from '@/features/programs/types';
import {
  clampProgramValue,
  formatProgramOptionLabel,
  getProgramLevelBadgeLabel,
  getProgramLevelTone,
} from '@/features/programs/utils';
import {
  calculateLgsScore,
  classifyLgsTarget,
  createInitialLgsInputs,
  lgsSubjects,
  type LgsSubjectKey,
} from '@/lib/examCalculators';

const levelSectionLabels: Record<ProgramTargetLevel, string> = {
  iddiali: 'İddialı Hedef',
  dengeli: 'Dengeli Hedef',
  guvenli: 'Güvenli Hedef',
};

const INITIAL_VISIBLE_SCHOOL_COUNT = 24;

const buildSourceLinkClassName = (_isLight: boolean) =>
  `inline-flex items-center gap-1.5 rounded-xl border border-default dark:border-slate-500 bg-surface-1 px-3 py-2 text-xs font-bold text-primary hover:border-accent transition-colors`;

const getLgsSourceLabel = (sourceUrl: string) =>
  sourceUrl.includes('meb.gov.tr') ? 'MEB kaynağı' : 'Veri kaynağı';

const createInitialVisibleSchoolCounts = (): Record<
  ProgramTargetLevel,
  number
> => ({
  iddiali: INITIAL_VISIBLE_SCHOOL_COUNT,
  dengeli: INITIAL_VISIBLE_SCHOOL_COUNT,
  guvenli: INITIAL_VISIBLE_SCHOOL_COUNT,
});

export default function LgsWizardPage() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const { dataYear, error, historyYears, loading, schools } =
    useLgsSchoolTargets();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [inputs, setInputs] = useState(createInitialLgsInputs());

  const [query, setQuery] = useState('');
  const [province, setProvince] = useState('all');
  const [district, setDistrict] = useState('all');
  const [schoolType, setSchoolType] = useState('all');
  const [language, setLanguage] = useState('all');
  const [boarding, setBoarding] = useState<'all' | 'yes' | 'no'>('all');
  const [preferredLevel, setPreferredLevel] = useState<
    'all' | ProgramTargetLevel
  >('all');
  const [visibleSchoolCounts, setVisibleSchoolCounts] = useState<
    Record<ProgramTargetLevel, number>
  >(createInitialVisibleSchoolCounts());

  const lgsResult = useMemo(() => calculateLgsScore(inputs), [inputs]);
  const lgsNetsBySubject = useMemo(
    () =>
      new Map(
        lgsResult.subjectNets.map((subject) => [subject.key, subject.net]),
      ),
    [lgsResult.subjectNets],
  );
  const orderedHistoryYears = useMemo(
    () => [...historyYears].sort((left, right) => left - right),
    [historyYears],
  );

  const groupedSchools = useMemo<LgsSchoolWithHistory[]>(
    () => schools,
    [schools],
  );

  const provinces = useMemo(
    () =>
      Array.from(new Set(groupedSchools.map((school) => school.province))).sort(
        (a, b) => a.localeCompare(b, 'tr'),
      ),
    [groupedSchools],
  );

  const totalDistrictCount = useMemo(
    () =>
      new Set(
        groupedSchools.map(
          (school) => `${school.province}::${school.district}`,
        ),
      ).size,
    [groupedSchools],
  );

  const districts = useMemo(() => {
    const filtered =
      province === 'all'
        ? groupedSchools
        : groupedSchools.filter((school) => school.province === province);
    return Array.from(new Set(filtered.map((school) => school.district))).sort(
      (a, b) => a.localeCompare(b, 'tr'),
    );
  }, [groupedSchools, province]);

  const schoolTypes = useMemo(
    () =>
      Array.from(
        new Set(groupedSchools.map((school) => school.school_type)),
      ).sort((a, b) => a.localeCompare(b, 'tr')),
    [groupedSchools],
  );

  const hasBoardingData = useMemo(
    () => groupedSchools.some((school) => school.boarding),
    [groupedSchools],
  );

  const languages = useMemo(
    () =>
      Array.from(
        new Set(
          groupedSchools
            .map((school) => school.instruction_language)
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b, 'tr')),
    [groupedSchools],
  );

  const evaluatedSchools = useMemo(() => {
    const loweredQuery = query.trim().toLocaleLowerCase('tr');

    const filtered = groupedSchools.filter((school) => {
      if (province !== 'all' && school.province !== province) return false;
      if (district !== 'all' && school.district !== district) return false;
      if (schoolType !== 'all' && school.school_type !== schoolType)
        return false;
      if (language !== 'all' && school.instruction_language !== language)
        return false;
      if (hasBoardingData) {
        if (boarding === 'yes' && !school.boarding) return false;
        if (boarding === 'no' && school.boarding) return false;
      }

      if (loweredQuery) {
        const joined =
          `${school.school_name} ${school.province} ${school.district} ${school.school_type}`.toLocaleLowerCase(
            'tr',
          );
        if (!joined.includes(loweredQuery)) return false;
      }

      return true;
    });

    const withLevels = filtered.map((school) => {
      const baseScore = Number(school.base_score || 0);
      const levelData = classifyLgsTarget(lgsResult.estimatedScore, baseScore);

      return {
        ...school,
        baseScore,
        level: levelData.level,
        delta: levelData.delta,
      };
    });

    const targetFiltered =
      preferredLevel === 'all'
        ? withLevels
        : withLevels.filter((school) => school.level === preferredLevel);

    const levelOrder: Record<ProgramTargetLevel, number> = {
      iddiali: 0,
      dengeli: 1,
      guvenli: 2,
    };

    return targetFiltered.sort((a, b) => {
      const levelDiff = levelOrder[a.level] - levelOrder[b.level];
      if (levelDiff !== 0) return levelDiff;
      return Math.abs(a.delta) - Math.abs(b.delta);
    });
  }, [
    boarding,
    district,
    groupedSchools,
    hasBoardingData,
    language,
    lgsResult.estimatedScore,
    preferredLevel,
    province,
    query,
    schoolType,
  ]);

  const grouped = useMemo(
    () => ({
      iddiali: evaluatedSchools.filter((school) => school.level === 'iddiali'),
      dengeli: evaluatedSchools.filter((school) => school.level === 'dengeli'),
      guvenli: evaluatedSchools.filter((school) => school.level === 'guvenli'),
    }),
    [evaluatedSchools],
  );

  useEffect(() => {
    setVisibleSchoolCounts(createInitialVisibleSchoolCounts());
  }, [
    boarding,
    dataYear,
    district,
    language,
    preferredLevel,
    province,
    query,
    schoolType,
    schools.length,
  ]);

  const showMoreSchools = (level: ProgramTargetLevel) => {
    setVisibleSchoolCounts((prev) => ({
      ...prev,
      [level]: prev[level] + INITIAL_VISIBLE_SCHOOL_COUNT,
    }));
  };

  const updateSubjectInput = (
    subjectKey: LgsSubjectKey,
    field: 'correct' | 'wrong',
    rawValue: string,
  ) => {
    const meta = lgsSubjects.find((subject) => subject.key === subjectKey);
    if (!meta) return;

    const parsed = Number.parseInt(rawValue || '0', 10);
    const value = Number.isNaN(parsed) ? 0 : parsed;

    setInputs((prev) => {
      const current = prev[subjectKey];
      const next = { ...current };

      if (field === 'correct') {
        next.correct = clampProgramValue(value, 0, meta.questions);
        next.wrong = clampProgramValue(
          next.wrong,
          0,
          meta.questions - next.correct,
        );
      } else {
        next.wrong = clampProgramValue(value, 0, meta.questions - next.correct);
      }

      return {
        ...prev,
        [subjectKey]: next,
      };
    });
  };

  const steps: ProgramStep[] = [
    { id: 1 as const, title: 'Puan Hesapla' },
    { id: 2 as const, title: 'Hedef Filtreleri' },
    { id: 3 as const, title: 'Lise Önerileri' },
  ];

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
            badgeClassName="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white"
            badgeLabel="LGS 2026 Sihirbazı"
            dataYear={dataYear}
            dataYearNote={
              dataYear < 2026
                ? 'En güncel tam yerleştirme verisi kullanılıyor.'
                : undefined
            }
            description="13 Haziran 2026 baz alınarak tahmini LGS puanı hesaplanır. Ardından gerçek veritabanındaki hedef lise verilerine göre iddialı, dengeli ve güvenli seçenekler listelenir."
            isLight={isLight}
            title="LGS Puan Hesaplama ve Lise Hedef Belirleme"
          />

          <ProgramStepTabs
            activeStep={step}
            activeStepClassName="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white border-blue-500 dark:border-blue-400 shadow-lg"
            inactiveStepClassName="border border-default dark:border-slate-500 bg-surface-1 text-secondary hover:text-primary hover:border-accent"
            onStepChange={setStep}
            steps={steps}
          />

          {step === 1 && (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {lgsSubjects.map((subject) => {
                  const value = inputs[subject.key];

                  return (
                    <ProgramSubjectInputCard
                      key={subject.key}
                      accentClassName="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"
                      helperText={`${subject.questions} soru · katsayı ${subject.coefficient}`}
                      idPrefix="lgs"
                      isLight={isLight}
                      maxQuestions={subject.questions}
                      net={lgsNetsBySubject.get(subject.key)}
                      onChange={(field, rawValue) =>
                        updateSubjectInput(subject.key, field, rawValue)
                      }
                      subjectKey={subject.key}
                      title={subject.label}
                      value={value}
                    />
                  );
                })}
              </div>

              <div className="rounded-3xl border border-default bg-surface-2 p-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <ProgramMetricCard
                    isLight={isLight}
                    label="Tahmini Puan"
                    tone="cyan"
                    value={lgsResult.estimatedScore}
                  />
                  <ProgramMetricCard
                    isLight={isLight}
                    label="Toplam Net"
                    tone="indigo"
                    value={lgsResult.totalNet}
                  />
                  <ProgramMetricCard
                    isLight={isLight}
                    label="Tahmini Yüzdelik"
                    tone="emerald"
                    value={`%${lgsResult.estimatedPercentile}`}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-blue-400/80 dark:border-blue-300/80 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:scale-[1.01] active:scale-[0.99]"
                >
                  Hedef Filtrelerine Geç
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="rounded-3xl border border-default bg-surface-1 p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Filter className="h-5 w-5 text-accent-fg" />
                  <h2 className="text-lg font-bold text-primary">
                    Lise Tercih Filtreleri
                  </h2>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Okul adı veya il ara"
                    className="w-full rounded-xl border border-default dark:border-slate-500 bg-surface-0 px-3 py-2 text-sm font-semibold text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />

                  <select
                    value={province}
                    onChange={(event) => {
                      setProvince(event.target.value);
                      setDistrict('all');
                    }}
                    className="w-full rounded-xl border border-default dark:border-slate-500 bg-surface-0 px-3 py-2 text-sm font-semibold text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="all">Tüm İller</option>
                    {provinces.map((item) => (
                      <option key={item} value={item}>
                        {formatProgramOptionLabel(item)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={district}
                    onChange={(event) => setDistrict(event.target.value)}
                    className="w-full rounded-xl border border-default dark:border-slate-500 bg-surface-0 px-3 py-2 text-sm font-semibold text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="all">Tüm İlçeler</option>
                    {districts.map((item) => (
                      <option key={item} value={item}>
                        {formatProgramOptionLabel(item)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={schoolType}
                    onChange={(event) => setSchoolType(event.target.value)}
                    className="w-full rounded-xl border border-default dark:border-slate-500 bg-surface-0 px-3 py-2 text-sm font-semibold text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="all">Tüm Okul Türleri</option>
                    {schoolTypes.map((item) => (
                      <option key={item} value={item}>
                        {formatProgramOptionLabel(item)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    className="w-full rounded-xl border border-default dark:border-slate-500 bg-surface-0 px-3 py-2 text-sm font-semibold text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="all">Tüm Diller</option>
                    {languages.map((item) => (
                      <option key={item} value={item}>
                        {formatProgramOptionLabel(item)}
                      </option>
                    ))}
                  </select>

                  {hasBoardingData ? (
                    <select
                      value={boarding}
                      onChange={(event) =>
                        setBoarding(event.target.value as 'all' | 'yes' | 'no')
                      }
                      className="w-full rounded-xl border border-default dark:border-slate-500 bg-surface-0 px-3 py-2 text-sm font-semibold text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                    >
                      <option value="all">Pansiyon Durumu (Hepsi)</option>
                      <option value="yes">Pansiyonlu</option>
                      <option value="no">Pansiyonsuz</option>
                    </select>
                  ) : null}

                  <select
                    value={preferredLevel}
                    onChange={(event) =>
                      setPreferredLevel(
                        event.target.value as 'all' | ProgramTargetLevel,
                      )
                    }
                    className="w-full rounded-xl border border-default dark:border-slate-500 bg-surface-0 px-3 py-2 text-sm font-semibold text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="all">Hedef Seviyesi (Hepsi)</option>
                    <option value="iddiali">İddialı</option>
                    <option value="dengeli">Dengeli</option>
                    <option value="guvenli">Güvenli</option>
                  </select>
                </div>

                <div className="mt-4 rounded-2xl border border-default bg-surface-2 p-3 text-sm text-secondary">
                  Filtreye uygun okul sayısı:{' '}
                  <span className="font-bold text-primary">{evaluatedSchools.length}</span>
                </div>

                {error ? (
                  <div className="mt-3 rounded-2xl border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-3 text-sm text-rose-800 dark:text-rose-200">
                    {error}
                  </div>
                ) : null}

                <div className="mt-3 rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 p-3 text-sm text-indigo-900 dark:text-indigo-200">
                  Veritabanı kapsamı:{' '}
                  <span className="font-bold text-primary">{provinces.length} il</span>,{' '}
                  <span className="font-bold text-primary">{totalDistrictCount} ilçe</span>,{' '}
                  <span className="font-bold text-primary">
                    {groupedSchools.length} okul
                  </span>
                  {orderedHistoryYears.length ? (
                    <>
                      ,{' '}
                      <span className="font-bold text-primary">
                        {orderedHistoryYears.length} yıl trendi
                      </span>{' '}
                      ({orderedHistoryYears.join(', ')})
                    </>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-xl border border-default dark:border-slate-500 bg-surface-1 px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-2 transition"
                  >
                    Geri Dön
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 rounded-xl border border-blue-400/80 dark:border-blue-300/80 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Önerileri Göster
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-3xl border border-default bg-surface-2 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
                      LGS Tahmini Puan
                    </div>
                    <div className="text-2xl font-black tabular-nums text-primary">
                      {lgsResult.estimatedScore.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-sm text-secondary">
                    Filtreye uygun toplam okul:{' '}
                    <span className="font-bold text-primary">{evaluatedSchools.length}</span>
                  </div>
                </div>
              </div>

              {loading && (
                <div className="rounded-3xl border border-default bg-surface-1 p-5 text-sm text-secondary">
                  Okul verileri yükleniyor...
                </div>
              )}
              {!loading && error && (
                <div className="rounded-3xl border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-5 text-sm text-rose-800 dark:text-rose-200">
                  {error}
                </div>
              )}

              {!loading && !error && !evaluatedSchools.length && (
                <div className="rounded-3xl border border-default bg-surface-1 p-6">
                  <p className="text-secondary">
                    Seçilen filtrelere uygun okul bulunamadı.
                  </p>
                </div>
              )}

              {!loading &&
                !error &&
                evaluatedSchools.length > 0 &&
                (preferredLevel === 'all'
                  ? (['iddiali', 'dengeli', 'guvenli'] as ProgramTargetLevel[])
                  : [preferredLevel]
                ).map((level) => {
                  const items = grouped[level];
                  if (!items?.length) return null;
                  const visibleItems = items.slice(
                    0,
                    visibleSchoolCounts[level],
                  );

                  const levelTone = getProgramLevelTone(level, isLight);

                  return (
                    <section key={level} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-primary">
                          {levelSectionLabels[level]}
                        </h2>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${levelTone.badge}`}
                        >
                          {items.length} okul
                        </span>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        {visibleItems.map((school) => {
                          const tone = getProgramLevelTone(
                            school.level,
                            isLight,
                          );

                          return (
                            <article
                              key={school.id}
                              className={`rounded-2xl border p-4 ${tone.card}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="text-sm font-black text-primary sm:text-base">
                                    {school.school_name}
                                  </h3>
                                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-secondary">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {formatProgramOptionLabel(
                                      school.province,
                                    )}{' '}
                                    /{' '}
                                    {formatProgramOptionLabel(school.district)}
                                  </p>
                                </div>
                                <span
                                  className={`rounded-full px-2 py-1 text-[11px] font-bold ${tone.badge}`}
                                >
                                  {getProgramLevelBadgeLabel(school.level)}
                                </span>
                              </div>

                              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:text-sm">
                                <div className="rounded-xl border border-default dark:border-slate-500 bg-surface-1 px-3 py-2">
                                  <div className="text-secondary">
                                    Taban Puan
                                  </div>
                                  <div className="font-black tabular-nums text-primary">
                                    {school.baseScore.toFixed(2)}
                                  </div>
                                </div>
                                <div className="rounded-xl border border-default dark:border-slate-500 bg-surface-1 px-3 py-2">
                                  <div className="text-secondary">
                                    Puan Farkı
                                  </div>
                                  <div
                                    className={`font-black tabular-nums ${school.delta >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}
                                  >
                                    {school.delta >= 0 ? '+' : ''}
                                    {school.delta.toFixed(2)}
                                  </div>
                                </div>
                                <div className="rounded-xl border border-default dark:border-slate-500 bg-surface-1 px-3 py-2">
                                  <div className="text-secondary">
                                    Son Yüzdelik
                                  </div>
                                  <div className="font-black tabular-nums text-primary">
                                    {school.national_percentile !== null
                                      ? `%${school.national_percentile.toFixed(2)}`
                                      : '-'}
                                  </div>
                                </div>
                                <div className="rounded-xl border border-default dark:border-slate-500 bg-surface-1 px-3 py-2">
                                  <div className="text-secondary">
                                    Baz Yıl
                                  </div>
                                  <div className="font-black text-primary">
                                    {school.latest_year}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-secondary">
                                <span className="rounded-full border border-default dark:border-slate-500 bg-surface-1 px-2.5 py-0.5 font-medium">
                                  {formatProgramOptionLabel(school.school_type)}
                                </span>
                                <span className="rounded-full border border-default dark:border-slate-500 bg-surface-1 px-2.5 py-0.5 font-medium">
                                  {formatProgramOptionLabel(
                                    school.instruction_language,
                                  )}
                                </span>
                                {hasBoardingData && school.boarding ? (
                                  <span className="rounded-full border border-default dark:border-slate-500 bg-surface-1 px-2.5 py-0.5 font-medium">
                                    Pansiyonlu
                                  </span>
                                ) : null}
                                {school.quota_total ? (
                                  <span className="rounded-full border border-default dark:border-slate-500 bg-surface-1 px-2.5 py-0.5 font-medium">
                                    Kontenjan: {school.quota_total}
                                  </span>
                                ) : null}
                              </div>

                              <div className="mt-4 rounded-2xl border border-default bg-surface-2 p-3">
                                <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-secondary">
                                  {orderedHistoryYears.join(', ')} Yüzdelik ve
                                  Taban Puan
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                  {orderedHistoryYears.map((year) => {
                                    const point = school.history.find(
                                      (entry) => entry.year === year,
                                    );

                                    return (
                                      <div
                                        key={year}
                                        className="rounded-xl border border-default dark:border-slate-500 bg-surface-1 px-2 py-2 text-[10px] tabular-nums sm:px-3 sm:text-[11px] text-secondary"
                                      >
                                        <div className="font-bold text-primary">
                                          {year}
                                        </div>
                                        <div className="mt-1">
                                          Puan:{' '}
                                          {point
                                            ? point.base_score.toFixed(2)
                                            : '-'}
                                        </div>
                                        <div>
                                          Yüzdelik:{' '}
                                          {point &&
                                          point.national_percentile !== null
                                            ? `%${point.national_percentile.toFixed(2)}`
                                            : '-'}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {school.source_url ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <a
                                    href={school.source_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={buildSourceLinkClassName(
                                      isLight,
                                    )}
                                  >
                                    {getLgsSourceLabel(school.source_url)}
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                </div>
                              ) : null}
                            </article>
                          );
                        })}
                      </div>

                      {items.length > visibleItems.length ? (
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={() => showMoreSchools(level)}
                            className="rounded-xl border border-default dark:border-slate-500 bg-surface-1 px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-2 transition"
                          >
                            Daha Fazla Göster ({visibleItems.length}/
                            {items.length})
                          </button>
                        </div>
                      ) : null}
                    </section>
                  );
                })}

              <div className="rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 p-3 text-xs text-indigo-900 dark:text-indigo-200">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    Bu ekran sonuç kaydetmez. Öneriler sadece anlık puanın ve
                    seçilen filtrelere göre oluşturulur. Resmi tercihlerinde
                    güncel MEB kılavuzunu mutlaka kontrol et.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-xl border border-default dark:border-slate-500 bg-surface-1 px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-2 transition"
                >
                  Filtreleri Düzenle
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-400/80 dark:border-blue-300/80 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:scale-[1.01] active:scale-[0.99]"
                >
                  Netleri Güncelle
                  <Target className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </motion.section>
      </div>
    </main>
  );
}
