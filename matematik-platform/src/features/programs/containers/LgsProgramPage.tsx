'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Filter,
  Info,
  MapPin,
  Target,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { ProgramBackLink } from '@/features/programs/components/ProgramBackLink';
import { ProgramStepTabs } from '@/features/programs/components/ProgramStepTabs';
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
  iddiali: 'Iddiali Hedef',
  dengeli: 'Dengeli Hedef',
  guvenli: 'Guvenli Hedef',
};

export default function LgsWizardPage() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const { dataYear, error, historyYears, loading, schools } = useLgsSchoolTargets();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [inputs, setInputs] = useState(createInitialLgsInputs());

  const [query, setQuery] = useState('');
  const [province, setProvince] = useState('all');
  const [district, setDistrict] = useState('all');
  const [schoolType, setSchoolType] = useState('all');
  const [language, setLanguage] = useState('all');
  const [boarding, setBoarding] = useState<'all' | 'yes' | 'no'>('all');
  const [preferredLevel, setPreferredLevel] = useState<'all' | ProgramTargetLevel>('all');

  const lgsResult = useMemo(() => calculateLgsScore(inputs), [inputs]);
  const orderedHistoryYears = useMemo(
    () => [...historyYears].sort((left, right) => left - right),
    [historyYears],
  );

  const groupedSchools = useMemo<LgsSchoolWithHistory[]>(() => {
    const grouped = new Map<string, typeof schools>();

    for (const row of schools) {
      const key = `${row.school_name}::${row.province}::${row.district}`;
      const current = grouped.get(key) || [];
      current.push(row);
      grouped.set(key, current);
    }

    return [...grouped.values()]
      .map((rows) => {
        const sortedRows = [...rows].sort((a, b) => b.year - a.year);
        const history = sortedRows
          .map((row) => ({
            year: row.year,
            base_score: row.base_score,
            national_percentile: row.national_percentile,
            quota_total: row.quota_total,
            source_url: row.source_url,
          }));

        const latestRow = sortedRows.find((row) => row.year === dataYear) || sortedRows[0];

        if (!latestRow) {
          return null;
        }

        return {
          district: latestRow.district,
          history,
          instruction_language: latestRow.instruction_language,
          latest_year: latestRow.year,
          placement_mode: latestRow.placement_mode,
          prep_class: latestRow.prep_class,
          province: latestRow.province,
          quota_total: latestRow.quota_total,
          school_name: latestRow.school_name,
          school_type: latestRow.school_type,
          source_url: latestRow.source_url,
          source_year: latestRow.source_year,
          base_score: latestRow.base_score,
          boarding: latestRow.boarding,
          id: latestRow.id,
          national_percentile: latestRow.national_percentile,
        };
      })
      .filter((school): school is LgsSchoolWithHistory => school !== null)
      .sort((a, b) => b.base_score - a.base_score);
  }, [dataYear, schools]);

  const provinces = useMemo(
    () => Array.from(new Set(groupedSchools.map((school) => school.province))).sort((a, b) => a.localeCompare(b, 'tr')),
    [groupedSchools]
  );

  const totalDistrictCount = useMemo(
    () => new Set(groupedSchools.map((school) => `${school.province}::${school.district}`)).size,
    [groupedSchools]
  );

  const districts = useMemo(() => {
    const filtered = province === 'all' ? groupedSchools : groupedSchools.filter((school) => school.province === province);
    return Array.from(new Set(filtered.map((school) => school.district))).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [groupedSchools, province]);

  const schoolTypes = useMemo(
    () => Array.from(new Set(groupedSchools.map((school) => school.school_type))).sort((a, b) => a.localeCompare(b, 'tr')),
    [groupedSchools]
  );

  const hasBoardingData = useMemo(
    () => groupedSchools.some((school) => school.boarding),
    [groupedSchools],
  );

  const languages = useMemo(
    () => Array.from(new Set(groupedSchools.map((school) => school.instruction_language).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'tr')),
    [groupedSchools]
  );

  const evaluatedSchools = useMemo(() => {
    const loweredQuery = query.trim().toLocaleLowerCase('tr');

    const filtered = groupedSchools.filter((school) => {
      if (province !== 'all' && school.province !== province) return false;
      if (district !== 'all' && school.district !== district) return false;
      if (schoolType !== 'all' && school.school_type !== schoolType) return false;
      if (language !== 'all' && school.instruction_language !== language) return false;
      if (hasBoardingData) {
        if (boarding === 'yes' && !school.boarding) return false;
        if (boarding === 'no' && school.boarding) return false;
      }

      if (loweredQuery) {
        const joined = `${school.school_name} ${school.province} ${school.district} ${school.school_type}`.toLocaleLowerCase('tr');
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
      preferredLevel === 'all' ? withLevels : withLevels.filter((school) => school.level === preferredLevel);

    const levelOrder: Record<ProgramTargetLevel, number> = { iddiali: 0, dengeli: 1, guvenli: 2 };

    return targetFiltered.sort((a, b) => {
      const levelDiff = levelOrder[a.level] - levelOrder[b.level];
      if (levelDiff !== 0) return levelDiff;
      return Math.abs(a.delta) - Math.abs(b.delta);
    });
  }, [boarding, district, groupedSchools, hasBoardingData, language, lgsResult.estimatedScore, preferredLevel, province, query, schoolType]);

  const grouped = useMemo(
    () => ({
      iddiali: evaluatedSchools.filter((school) => school.level === 'iddiali'),
      dengeli: evaluatedSchools.filter((school) => school.level === 'dengeli'),
      guvenli: evaluatedSchools.filter((school) => school.level === 'guvenli'),
    }),
    [evaluatedSchools]
  );

  const updateSubjectInput = (subjectKey: LgsSubjectKey, field: 'correct' | 'wrong', rawValue: string) => {
    const meta = lgsSubjects.find((subject) => subject.key === subjectKey);
    if (!meta) return;

    const parsed = Number.parseInt(rawValue || '0', 10);
    const value = Number.isNaN(parsed) ? 0 : parsed;

    setInputs((prev) => {
      const current = prev[subjectKey];
      const next = { ...current };

      if (field === 'correct') {
        next.correct = clampProgramValue(value, 0, meta.questions);
        next.wrong = clampProgramValue(next.wrong, 0, meta.questions - next.correct);
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
    { id: 3 as const, title: 'Lise Onerileri' },
  ];

  return (
    <main className="programlar-page min-h-screen gradient-bg px-4 pb-12 pt-16 sm:px-6 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <ProgramBackLink isLight={isLight} />

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl border p-5 sm:p-7 ${isLight ? 'light-section' : 'glass border-white/10'}`}
        >
          <ProgramWizardHeader
            badgeClassName="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"
            badgeLabel="LGS 2026 Sihirbazi"
            dataYear={dataYear}
            dataYearNote={dataYear < 2026 ? 'En guncel tam yerlestirme verisi kullaniliyor.' : undefined}
            description="13 Haziran 2026 baz alinarak tahmini LGS puani hesaplanir. Ardindan gercek veritabanindaki hedef lise verilerine gore iddiali, dengeli ve guvenli secenekler listelenir."
            isLight={isLight}
            title="LGS Puan Hesaplama ve Lise Hedef Belirleme"
          />

          <ProgramStepTabs
            activeStep={step}
            activeStepClassName="bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white border-transparent shadow-lg"
            inactiveStepClassName={
              isLight
                ? 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:border-indigo-400/50'
            }
            onStepChange={setStep}
            steps={steps}
          />

          {step === 1 && (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {lgsSubjects.map((subject) => {
                  const value = inputs[subject.key];

                  return (
                    <div
                      key={subject.key}
                      className={`rounded-2xl border p-4 ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}
                    >
                      <div className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{subject.label}</div>
                      <div className={`mt-1 text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {subject.questions} soru - katsayi {subject.coefficient}
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div>
                          <label className={`mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            Dogru
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={subject.questions}
                            value={value.correct}
                            onChange={(event) => updateSubjectInput(subject.key, 'correct', event.target.value)}
                            className={`w-full rounded-xl border px-3 py-2 text-sm font-semibold ${
                              isLight
                                ? 'bg-slate-50 border-slate-200 text-slate-900'
                                : 'bg-slate-900/70 border-white/10 text-white'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            Yanlis
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={subject.questions - value.correct}
                            value={value.wrong}
                            onChange={(event) => updateSubjectInput(subject.key, 'wrong', event.target.value)}
                            className={`w-full rounded-xl border px-3 py-2 text-sm font-semibold ${
                              isLight
                                ? 'bg-slate-50 border-slate-200 text-slate-900'
                                : 'bg-slate-900/70 border-white/10 text-white'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={`rounded-3xl border p-5 ${isLight ? 'light-soft-panel' : 'bg-white/5 border-white/10'}`}>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <div className={`text-[11px] font-bold uppercase tracking-[0.18em] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Tahmini Puan
                    </div>
                    <div className={`mt-1 text-3xl font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>{lgsResult.estimatedScore}</div>
                  </div>
                  <div>
                    <div className={`text-[11px] font-bold uppercase tracking-[0.18em] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Toplam Net
                    </div>
                    <div className={`mt-1 text-3xl font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>{lgsResult.totalNet}</div>
                  </div>
                  <div>
                    <div className={`text-[11px] font-bold uppercase tracking-[0.18em] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Tahmini Yuzdelik
                    </div>
                    <div className={`mt-1 text-3xl font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>%{lgsResult.estimatedPercentile}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 px-4 py-2 text-sm font-bold text-white shadow-lg"
                >
                  Hedef Filtrelerine Gec
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className={`rounded-3xl border p-5 ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}>
                <div className="mb-4 flex items-center gap-2">
                  <Filter className={`h-5 w-5 ${isLight ? 'text-indigo-600' : 'text-indigo-300'}`} />
                  <h2 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Lise Tercih Filtreleri</h2>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Okul adi veya il ara"
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900/70 border-white/10 text-white'
                    }`}
                  />

                  <select
                    value={province}
                    onChange={(event) => {
                      setProvince(event.target.value);
                      setDistrict('all');
                    }}
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900/70 border-white/10 text-white'
                    }`}
                  >
                    <option value="all">Tum Iller</option>
                    {provinces.map((item) => (
                      <option key={item} value={item}>
                        {formatProgramOptionLabel(item)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={district}
                    onChange={(event) => setDistrict(event.target.value)}
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900/70 border-white/10 text-white'
                    }`}
                  >
                    <option value="all">Tum Ilceler</option>
                    {districts.map((item) => (
                      <option key={item} value={item}>
                        {formatProgramOptionLabel(item)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={schoolType}
                    onChange={(event) => setSchoolType(event.target.value)}
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900/70 border-white/10 text-white'
                    }`}
                  >
                    <option value="all">Tum Okul Turleri</option>
                    {schoolTypes.map((item) => (
                      <option key={item} value={item}>
                        {formatProgramOptionLabel(item)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900/70 border-white/10 text-white'
                    }`}
                  >
                    <option value="all">Tum Diller</option>
                    {languages.map((item) => (
                      <option key={item} value={item}>
                        {formatProgramOptionLabel(item)}
                      </option>
                    ))}
                  </select>

                  {hasBoardingData ? (
                    <select
                      value={boarding}
                      onChange={(event) => setBoarding(event.target.value as 'all' | 'yes' | 'no')}
                      className={`rounded-xl border px-3 py-2 text-sm ${
                        isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900/70 border-white/10 text-white'
                      }`}
                    >
                      <option value="all">Pansiyon Durumu (Hepsi)</option>
                      <option value="yes">Pansiyonlu</option>
                      <option value="no">Pansiyonsuz</option>
                    </select>
                  ) : null}

                  <select
                    value={preferredLevel}
                    onChange={(event) =>
                      setPreferredLevel(event.target.value as 'all' | ProgramTargetLevel)
                    }
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900/70 border-white/10 text-white'
                    }`}
                  >
                    <option value="all">Hedef Seviyesi (Hepsi)</option>
                    <option value="iddiali">Iddiali</option>
                    <option value="dengeli">Dengeli</option>
                    <option value="guvenli">Guvenli</option>
                  </select>
                </div>

                <div className={`mt-4 rounded-2xl border p-3 text-sm ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-slate-300'}`}>
                  Filtreye uygun okul sayisi: <span className="font-bold">{evaluatedSchools.length}</span>
                </div>

                <div className={`mt-3 rounded-2xl border p-3 text-sm ${isLight ? 'bg-indigo-50 border-indigo-100 text-slate-700' : 'bg-indigo-500/10 border-indigo-400/20 text-slate-200'}`}>
                  Veritabani kapsami: <span className="font-bold">{provinces.length} il</span>,{' '}
                  <span className="font-bold">{totalDistrictCount} ilce</span>,{' '}
                  <span className="font-bold">{groupedSchools.length} okul</span>
                  {orderedHistoryYears.length ? (
                    <>
                      , <span className="font-bold">{orderedHistoryYears.length} yil trendi</span> ({orderedHistoryYears.join(', ')})
                    </>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                      isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-slate-200'
                    }`}
                  >
                    Geri Don
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 px-4 py-2 text-sm font-bold text-white shadow-lg"
                  >
                    Onerileri Goster
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className={`rounded-3xl border p-4 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className={`text-[11px] font-bold uppercase tracking-[0.18em] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      LGS Tahmini Puan
                    </div>
                    <div className={`text-2xl font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>{lgsResult.estimatedScore}</div>
                  </div>
                  <div className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    Filtreye uygun toplam okul: <span className="font-bold">{evaluatedSchools.length}</span>
                  </div>
                </div>
              </div>

              {loading && <div className={`rounded-3xl border p-5 text-sm ${isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-white/5 border-white/10 text-slate-300'}`}>Okul verileri yukleniyor...</div>}
              {!loading && error && (
                <div className={`rounded-3xl border p-5 text-sm ${isLight ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-rose-500/10 border-rose-500/30 text-rose-200'}`}>
                  {error}
                </div>
              )}

              {!loading && !error && !evaluatedSchools.length && (
                <div className={`rounded-3xl border p-6 ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}>
                  <p className={isLight ? 'text-slate-700' : 'text-slate-200'}>Secilen filtrelere uygun okul bulunamadi.</p>
                </div>
              )}

              {!loading && !error && evaluatedSchools.length > 0 &&
                (preferredLevel === 'all'
                  ? (['iddiali', 'dengeli', 'guvenli'] as ProgramTargetLevel[])
                  : [preferredLevel]
                ).map((level) => {
                  const items = grouped[level];
                  if (!items?.length) return null;

                  const levelTone = getProgramLevelTone(level, isLight);

                  return (
                    <section key={level} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {levelSectionLabels[level]}
                        </h2>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${levelTone.badge}`}>
                          {items.length} okul
                        </span>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        {items.map((school) => {
                          const tone = getProgramLevelTone(school.level, isLight);

                          return (
                            <article
                              key={school.id}
                              className={`rounded-2xl border p-4 ${tone.card}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className={`text-sm font-black sm:text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>{school.school_name}</h3>
                                  <p className={`mt-1 inline-flex items-center gap-1 text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                                    <MapPin className="h-3.5 w-3.5" />
                                    {formatProgramOptionLabel(school.province)} / {formatProgramOptionLabel(school.district)}
                                  </p>
                                </div>
                                <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${tone.badge}`}>
                                  {getProgramLevelBadgeLabel(school.level)}
                                </span>
                              </div>

                              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:text-sm">
                                <div className={`rounded-xl border px-3 py-2 ${isLight ? 'bg-white/80 border-white/70' : 'bg-black/20 border-white/10'}`}>
                                  <div className={isLight ? 'text-slate-500' : 'text-slate-400'}>Taban Puan</div>
                                  <div className={`font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{school.baseScore.toFixed(2)}</div>
                                </div>
                                <div className={`rounded-xl border px-3 py-2 ${isLight ? 'bg-white/80 border-white/70' : 'bg-black/20 border-white/10'}`}>
                                  <div className={isLight ? 'text-slate-500' : 'text-slate-400'}>Puan Farki</div>
                                  <div className={`font-black ${school.delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {school.delta >= 0 ? '+' : ''}
                                    {school.delta.toFixed(2)}
                                  </div>
                                </div>
                                <div className={`rounded-xl border px-3 py-2 ${isLight ? 'bg-white/80 border-white/70' : 'bg-black/20 border-white/10'}`}>
                                  <div className={isLight ? 'text-slate-500' : 'text-slate-400'}>Son Yuzdelik</div>
                                  <div className={`font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                    {school.national_percentile !== null ? `%${school.national_percentile.toFixed(2)}` : '-'}
                                  </div>
                                </div>
                                <div className={`rounded-xl border px-3 py-2 ${isLight ? 'bg-white/80 border-white/70' : 'bg-black/20 border-white/10'}`}>
                                  <div className={isLight ? 'text-slate-500' : 'text-slate-400'}>Baz Yil</div>
                                  <div className={`font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{school.latest_year}</div>
                                </div>
                              </div>

                              <div className={`mt-3 flex flex-wrap gap-2 text-[11px] ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                                <span className={`rounded-full px-2 py-1 ${isLight ? 'bg-white/80' : 'bg-white/10'}`}>{formatProgramOptionLabel(school.school_type)}</span>
                                <span className={`rounded-full px-2 py-1 ${isLight ? 'bg-white/80' : 'bg-white/10'}`}>{formatProgramOptionLabel(school.instruction_language)}</span>
                                {hasBoardingData && school.boarding ? (
                                  <span className={`rounded-full px-2 py-1 ${isLight ? 'bg-white/80' : 'bg-white/10'}`}>
                                    Pansiyonlu
                                  </span>
                                ) : null}
                                {school.quota_total ? (
                                  <span className={`rounded-full px-2 py-1 ${isLight ? 'bg-white/80' : 'bg-white/10'}`}>Kontenjan: {school.quota_total}</span>
                                ) : null}
                              </div>

                              <div className={`mt-4 rounded-2xl border p-3 ${isLight ? 'bg-white/70 border-white/80' : 'bg-black/10 border-white/10'}`}>
                                <div className={`mb-2 text-[11px] font-bold uppercase tracking-[0.16em] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                  Son 5 Yil Yuzdelik ve Taban Puan
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                  {orderedHistoryYears.map((year) => {
                                    const point = school.history.find((entry) => entry.year === year);

                                    return (
                                      <div
                                        key={year}
                                        className={`rounded-xl border px-2 py-2 text-[10px] sm:px-3 sm:text-[11px] ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-slate-200'}`}
                                      >
                                        <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{year}</div>
                                        <div className="mt-1">Puan: {point ? point.base_score.toFixed(2) : '-'}</div>
                                        <div>
                                          Yuzdelik: {point && point.national_percentile !== null ? `%${point.national_percentile.toFixed(2)}` : '-'}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}

              <div className={`rounded-2xl border p-3 text-xs ${isLight ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200'}`}>
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    Bu ekran sonuc kaydetmez. Oneriler sadece anlik puanin ve secilen filtrelere gore olusturulur. Resmi
                    tercihlerinde guncel MEB kilavuzunu mutlaka kontrol et.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                    isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-slate-200'
                  }`}
                >
                  Filtreleri Duzenle
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 px-4 py-2 text-sm font-bold text-white"
                >
                  Netleri Guncelle
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
