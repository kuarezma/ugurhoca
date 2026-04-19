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
import { useYksProgramTargets } from '@/features/programs/hooks/useYksProgramTargets';
import type {
  ProgramLocationScope,
  ProgramStep,
  ProgramTargetLevel,
} from '@/features/programs/types';
import {
  clampProgramValue,
  formatProgramOptionLabel,
  getProgramLevelBadgeLabel,
  getProgramLevelTone,
  isInternationalProgramLocation,
  matchesProgramLocationScope,
} from '@/features/programs/utils';
import {
  calculateYksScore,
  classifyYksTarget,
  createInitialYksInputs,
  formatRank,
  yksSubjects,
  type YksScoreType,
  type YksSubjectKey,
} from '@/lib/examCalculators';

const levelSectionLabels: Record<ProgramTargetLevel, string> = {
  iddiali: 'İddialı Hedefler',
  dengeli: 'Dengeli Hedefler',
  guvenli: 'Güvenli Hedefler',
};

export default function YksWizardPage() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const { dataYear, error, loading, programs } = useYksProgramTargets();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [inputs, setInputs] = useState(createInitialYksInputs());
  const [scoreType, setScoreType] = useState<YksScoreType>('SAY');
  const [obp, setObp] = useState(85);
  const [manualRank, setManualRank] = useState('');

  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<'all' | 'lisans' | 'onlisans'>('all');
  const [locationScope, setLocationScope] = useState<ProgramLocationScope>('all');
  const [city, setCity] = useState('all');
  const [universityType, setUniversityType] = useState('all');
  const [teachingType, setTeachingType] = useState('all');
  const [language, setLanguage] = useState('all');
  const [scholarship, setScholarship] = useState<'all' | 'none' | 'partial' | 'full'>('all');
  const [preferredLevel, setPreferredLevel] = useState<'all' | ProgramTargetLevel>('all');

  const yksResult = useMemo(() => calculateYksScore(inputs, scoreType, obp), [inputs, scoreType, obp]);

  const normalizedManualRank = useMemo(() => {
    const numeric = Number.parseInt(manualRank, 10);
    return Number.isNaN(numeric) || numeric <= 0 ? undefined : numeric;
  }, [manualRank]);

  const activeRank = normalizedManualRank || yksResult.estimatedRank;

  const cities = useMemo(
    () =>
      Array.from(
        new Set(
          programs
            .map((program) => program.city)
            .filter((programCity) => matchesProgramLocationScope(programCity, locationScope)),
        ),
      ).sort((a, b) => a.localeCompare(b, 'tr')),
    [locationScope, programs],
  );

  const domesticCityCount = useMemo(
    () => new Set(programs.map((program) => program.city).filter((programCity) => !isInternationalProgramLocation(programCity))).size,
    [programs],
  );

  const internationalLocationCount = useMemo(
    () => new Set(programs.map((program) => program.city).filter((programCity) => isInternationalProgramLocation(programCity))).size,
    [programs],
  );

  const universityCount = useMemo(
    () => new Set(programs.map((program) => program.university_name)).size,
    [programs]
  );

  const universityTypes = useMemo(
    () => Array.from(new Set(programs.map((program) => program.university_type))).sort((a, b) => a.localeCompare(b, 'tr')),
    [programs]
  );

  const teachingTypes = useMemo(
    () => Array.from(new Set(programs.map((program) => program.teaching_type).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, 'tr')),
    [programs]
  );

  const languages = useMemo(
    () => Array.from(new Set(programs.map((program) => program.instruction_language).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, 'tr')),
    [programs]
  );

  const evaluatedPrograms = useMemo(() => {
    const loweredQuery = query.trim().toLocaleLowerCase('tr');

    const filtered = programs.filter((program) => {
      if (program.score_type !== scoreType) return false;
      if (level !== 'all' && program.level !== level) return false;
      if (!matchesProgramLocationScope(program.city, locationScope)) return false;
      if (city !== 'all' && program.city !== city) return false;
      if (universityType !== 'all' && program.university_type !== universityType) return false;
      if (teachingType !== 'all' && program.teaching_type !== teachingType) return false;
      if (language !== 'all' && program.instruction_language !== language) return false;

      if (scholarship !== 'all') {
        const rate = Number(program.scholarship_rate || 0);
        if (scholarship === 'none' && rate !== 0) return false;
        if (scholarship === 'partial' && !(rate > 0 && rate < 100)) return false;
        if (scholarship === 'full' && rate !== 100) return false;
      }

      if (loweredQuery) {
        const joined = `${program.university_name} ${program.program_name} ${program.city} ${program.faculty_or_school || ''}`.toLocaleLowerCase('tr');
        if (!joined.includes(loweredQuery)) return false;
      }

      return true;
    });

    const withLevels = filtered.map((program) => {
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
      preferredLevel === 'all' ? withLevels : withLevels.filter((program) => program.targetLevel === preferredLevel);

    const order: Record<ProgramTargetLevel, number> = { iddiali: 0, dengeli: 1, guvenli: 2 };

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
      iddiali: evaluatedPrograms.filter((program) => program.targetLevel === 'iddiali'),
      dengeli: evaluatedPrograms.filter((program) => program.targetLevel === 'dengeli'),
      guvenli: evaluatedPrograms.filter((program) => program.targetLevel === 'guvenli'),
    }),
    [evaluatedPrograms]
  );

  const updateSubjectInput = (subjectKey: YksSubjectKey, field: 'correct' | 'wrong', rawValue: string) => {
    const meta = yksSubjects.find((subject) => subject.key === subjectKey);
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
    { id: 2 as const, title: 'Tercih Filtreleri' },
    { id: 3 as const, title: 'Program Önerileri' },
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
            badgeClassName="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-400"
            badgeLabel="YKS Tercih Sihirbazı"
            dataYear={dataYear}
            dataYearNote={dataYear < 2026 ? 'En güncel tam tercih verisi kullanılıyor.' : undefined}
            description="TYT / SAY / EA / SÖZ puan tahmini yapılır. Sonra gerçek veritabanındaki üniversiteler filtrelenerek hedef seviyene uygun seçenekler listelenir. Sonuçlar kaydedilmez."
            isLight={isLight}
            title="YKS Puan Hesaplama ve Üniversite Tercih Sihirbazı"
          />

          <ProgramStepTabs
            activeStep={step}
            activeStepClassName="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-400 text-white border-transparent shadow-lg"
            inactiveStepClassName={
              isLight
                ? 'bg-white border-slate-200 text-slate-700 hover:border-fuchsia-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:border-fuchsia-400/50'
            }
            onStepChange={setStep}
            steps={steps}
          />

          {step === 1 && (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {yksSubjects.map((subject) => {
                  const value = inputs[subject.key];

                  return (
                    <div
                      key={subject.key}
                      className={`rounded-2xl border p-4 ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}
                    >
                      <div className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{subject.label}</div>
                      <div className={`mt-1 text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{subject.questions} soru</div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div>
                          <label
                            htmlFor={`yks-${subject.key}-correct`}
                            className={`mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}
                          >
                            Doğru
                          </label>
                          <input
                            id={`yks-${subject.key}-correct`}
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
                          <label
                            htmlFor={`yks-${subject.key}-wrong`}
                            className={`mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}
                          >
                            Yanlış
                          </label>
                          <input
                            id={`yks-${subject.key}-wrong`}
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

              <div className="grid gap-3 sm:grid-cols-3">
                <div className={`rounded-2xl border p-4 ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}>
                  <label
                    htmlFor="yks-score-type"
                    className={`mb-1 block text-[11px] font-bold uppercase tracking-[0.18em] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}
                  >
                    Puan Türü
                  </label>
                  <select
                    id="yks-score-type"
                    value={scoreType}
                    onChange={(event) => setScoreType(event.target.value as YksScoreType)}
                    className={`w-full rounded-xl border px-3 py-2 text-sm font-semibold ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900/70 border-white/10 text-white'
                    }`}
                  >
                    <option value="TYT">TYT</option>
                    <option value="SAY">SAY</option>
                    <option value="EA">EA</option>
                    <option value="SOZ">SÖZ</option>
                  </select>
                </div>

                <div className={`rounded-2xl border p-4 ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}>
                  <label
                    htmlFor="yks-obp"
                    className={`mb-1 block text-[11px] font-bold uppercase tracking-[0.18em] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}
                  >
                    OBP (50-100)
                  </label>
                  <input
                    id="yks-obp"
                    type="number"
                    min={50}
                    max={100}
                    value={obp}
                    onChange={(event) =>
                      setObp(clampProgramValue(Number(event.target.value) || 50, 50, 100))
                    }
                    className={`w-full rounded-xl border px-3 py-2 text-sm font-semibold ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900/70 border-white/10 text-white'
                    }`}
                  />
                </div>

                <div className={`rounded-2xl border p-4 ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}>
                  <label
                    htmlFor="yks-manual-rank"
                    className={`mb-1 block text-[11px] font-bold uppercase tracking-[0.18em] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}
                  >
                    Manuel Sıralama (Opsiyonel)
                  </label>
                  <input
                    id="yks-manual-rank"
                    type="number"
                    min={1}
                    value={manualRank}
                    onChange={(event) => setManualRank(event.target.value)}
                    placeholder={formatRank(yksResult.estimatedRank)}
                    className={`w-full rounded-xl border px-3 py-2 text-sm font-semibold ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900/70 border-white/10 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className={`rounded-3xl border p-5 ${isLight ? 'light-soft-panel' : 'bg-white/5 border-white/10'}`}>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <div className={`text-[11px] font-bold uppercase tracking-[0.18em] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Tahmini Puan ({scoreType})
                    </div>
                    <div className={`mt-1 text-3xl font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>{yksResult.estimatedScore}</div>
                  </div>
                  <div>
                    <div className={`text-[11px] font-bold uppercase tracking-[0.18em] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Tahmini Sıralama
                    </div>
                    <div className={`mt-1 text-3xl font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>{formatRank(activeRank)}</div>
                  </div>
                  <div>
                    <div className={`text-[11px] font-bold uppercase tracking-[0.18em] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      OBP Katkısı
                    </div>
                    <div className={`mt-1 text-3xl font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>{yksResult.obpContribution}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-400 px-4 py-2 text-sm font-bold text-white shadow-lg"
                >
                  Tercih Filtrelerine Geç
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={`rounded-3xl border p-5 ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}>
              <div className="mb-4 flex items-center gap-2">
                <Filter className={`h-5 w-5 ${isLight ? 'text-fuchsia-600' : 'text-fuchsia-300'}`} />
                <h2 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Üniversite Tercih Filtreleri</h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Üniversite veya bölüm ara"
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900/70 border-white/10 text-white'
                  }`}
                />

                <select
                  value={level}
                  onChange={(event) => setLevel(event.target.value as 'all' | 'lisans' | 'onlisans')}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900/70 border-white/10 text-white'
                  }`}
                >
                  <option value="all">Lisans + Ön Lisans</option>
                  <option value="lisans">Lisans</option>
                  <option value="onlisans">Ön Lisans</option>
                </select>

                <select
                  value={locationScope}
                  onChange={(event) => {
                    setLocationScope(event.target.value as ProgramLocationScope);
                    setCity('all');
                  }}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900/70 border-white/10 text-white'
                  }`}
                >
                  <option value="all">Tüm Konumlar</option>
                  <option value="domestic">Türkiye</option>
                  <option value="international">Yurt Dışı</option>
                </select>

                <select
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900/70 border-white/10 text-white'
                  }`}
                >
                  <option value="all">Tüm Şehirler</option>
                  {cities.map((item) => (
                    <option key={item} value={item}>
                      {formatProgramOptionLabel(item)}
                    </option>
                  ))}
                </select>

                <select
                  value={universityType}
                  onChange={(event) => setUniversityType(event.target.value)}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900/70 border-white/10 text-white'
                  }`}
                >
                  <option value="all">Tüm Üniversite Tipleri</option>
                  {universityTypes.map((item) => (
                    <option key={item} value={item}>
                      {formatProgramOptionLabel(item)}
                    </option>
                  ))}
                </select>

                <select
                  value={teachingType}
                  onChange={(event) => setTeachingType(event.target.value)}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900/70 border-white/10 text-white'
                  }`}
                >
                  <option value="all">Tüm Öğretim Türleri</option>
                  {teachingTypes.map((item) => (
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
                  <option value="all">Tüm Diller</option>
                  {languages.map((item) => (
                    <option key={item} value={item}>
                      {formatProgramOptionLabel(item)}
                    </option>
                  ))}
                </select>

                <select
                  value={scholarship}
                  onChange={(event) => setScholarship(event.target.value as 'all' | 'none' | 'partial' | 'full')}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900/70 border-white/10 text-white'
                  }`}
                >
                  <option value="all">Burs Durumu (Hepsi)</option>
                  <option value="none">Ücretli / Burs Yok</option>
                  <option value="partial">Kısmi Burs</option>
                  <option value="full">Tam Burs</option>
                </select>

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
                  <option value="iddiali">İddialı</option>
                  <option value="dengeli">Dengeli</option>
                  <option value="guvenli">Güvenli</option>
                </select>
              </div>

              <div className={`mt-4 rounded-2xl border p-3 text-sm ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-slate-300'}`}>
                Filtreye uygun program sayısı: <span className="font-bold">{evaluatedPrograms.length}</span>
              </div>

              <div className={`mt-3 rounded-2xl border p-3 text-sm ${isLight ? 'bg-fuchsia-50 border-fuchsia-100 text-slate-700' : 'bg-fuchsia-500/10 border-fuchsia-400/20 text-slate-200'}`}>
                Veritabanı kapsamı: <span className="font-bold">{domesticCityCount} Türkiye şehri</span>,{' '}
                <span className="font-bold">{internationalLocationCount} yurt dışı konumu</span>,{' '}
                <span className="font-bold">{universityCount} üniversite</span>,{' '}
                <span className="font-bold">{programs.length} program</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                    isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-slate-200'
                  }`}
                >
                  Geri Dön
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-400 px-4 py-2 text-sm font-bold text-white shadow-lg"
                >
                  Önerileri Göster
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className={`rounded-3xl border p-4 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className={`text-[11px] font-bold uppercase tracking-[0.18em] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Tahmini Puan / Sıralama
                    </div>
                    <div className={`text-2xl font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>
                      {yksResult.estimatedScore} / {formatRank(activeRank)}
                    </div>
                  </div>
                  <div className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    Filtreye uygun toplam program: <span className="font-bold">{evaluatedPrograms.length}</span>
                  </div>
                </div>
              </div>

              {loading && <div className={`rounded-3xl border p-5 text-sm ${isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-white/5 border-white/10 text-slate-300'}`}>Program verileri yükleniyor...</div>}
              {!loading && error && (
                <div className={`rounded-3xl border p-5 text-sm ${isLight ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-rose-500/10 border-rose-500/30 text-rose-200'}`}>
                  {error}
                </div>
              )}

              {!loading && !error && !evaluatedPrograms.length && (
                <div className={`rounded-3xl border p-6 ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}>
                  <p className={isLight ? 'text-slate-700' : 'text-slate-200'}>Seçilen filtrelere uygun program bulunamadı.</p>
                </div>
              )}

              {!loading && !error && evaluatedPrograms.length > 0 &&
                (preferredLevel === 'all'
                  ? (['iddiali', 'dengeli', 'guvenli'] as ProgramTargetLevel[])
                  : [preferredLevel]
                ).map((targetLevel) => {
                  const items = grouped[targetLevel];
                  if (!items?.length) return null;

                  const levelTone = getProgramLevelTone(targetLevel, isLight);

                  return (
                    <section key={targetLevel} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {levelSectionLabels[targetLevel]}
                        </h2>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${levelTone.badge}`}>
                          {items.length} program
                        </span>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        {items.map((program) => {
                          const tone = getProgramLevelTone(program.targetLevel, isLight);

                          return (
                            <article
                              key={program.id}
                              className={`rounded-2xl border p-4 ${tone.card}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className={`text-sm font-black sm:text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                    {program.university_name}
                                  </h3>
                                  <p className={`mt-1 text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>{program.program_name}</p>
                                  <p className={`mt-1 inline-flex items-center gap-1 text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                                    <MapPin className="h-3.5 w-3.5" />
                                    {formatProgramOptionLabel(program.city)}
                                  </p>
                                </div>

                                <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${tone.badge}`}>
                                  {getProgramLevelBadgeLabel(program.targetLevel)}
                                </span>
                              </div>

                              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:text-sm">
                                <div className={`rounded-xl border px-3 py-2 ${isLight ? 'bg-white/80 border-white/70' : 'bg-black/20 border-white/10'}`}>
                                  <div className={isLight ? 'text-slate-500' : 'text-slate-400'}>Taban Sıralama</div>
                                  <div className={`font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{formatRank(program.base_rank)}</div>
                                </div>
                                <div className={`rounded-xl border px-3 py-2 ${isLight ? 'bg-white/80 border-white/70' : 'bg-black/20 border-white/10'}`}>
                                  <div className={isLight ? 'text-slate-500' : 'text-slate-400'}>Taban Puan</div>
                                  <div className={`font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{program.base_score ? program.base_score.toFixed(2) : '-'}</div>
                                </div>
                              </div>

                              <div className={`mt-3 flex flex-wrap gap-2 text-[11px] ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                                <span className={`rounded-full px-2 py-1 ${isLight ? 'bg-white/80' : 'bg-white/10'}`}>{program.score_type}</span>
                                <span className={`rounded-full px-2 py-1 ${isLight ? 'bg-white/80' : 'bg-white/10'}`}>{program.level === 'lisans' ? 'Lisans' : 'Ön Lisans'}</span>
                                <span className={`rounded-full px-2 py-1 ${isLight ? 'bg-white/80' : 'bg-white/10'}`}>{formatProgramOptionLabel(program.university_type)}</span>
                                <span className={`rounded-full px-2 py-1 ${isLight ? 'bg-white/80' : 'bg-white/10'}`}>
                                  Burs: %{program.scholarship_rate || 0}
                                </span>
                                {program.quota_total ? (
                                  <span className={`rounded-full px-2 py-1 ${isLight ? 'bg-white/80' : 'bg-white/10'}`}>Kontenjan: {program.quota_total}</span>
                                ) : null}
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
                    Bu araç sonuç kaydetmez. Öneriler anlık puan/sıralama ve filtrelere göre üretilir. Resmi tercih öncesi
                    mutlaka ÖSYM kılavuzu ve YÖK Atlas verilerini tekrar kontrol et.
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
                  Filtreleri Düzenle
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-400 px-4 py-2 text-sm font-bold text-white"
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
