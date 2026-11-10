import React from 'react';
import { ChevronRight, Filter } from 'lucide-react';
import type {
  ProgramLocationScope,
  ProgramTargetLevel,
} from '@/features/programs/types';
import { formatProgramOptionLabel } from '@/features/programs/utils';

interface YksStepPreferenceFiltersProps {
  query: string;
  setQuery: (val: string) => void;
  level: 'all' | 'lisans' | 'onlisans';
  setLevel: (val: 'all' | 'lisans' | 'onlisans') => void;
  locationScope: ProgramLocationScope;
  setLocationScope: (val: ProgramLocationScope) => void;
  city: string;
  setCity: (val: string) => void;
  cities: string[];
  universityType: string;
  setUniversityType: (val: string) => void;
  universityTypes: string[];
  teachingType: string;
  setTeachingType: (val: string) => void;
  teachingTypes: string[];
  language: string;
  setLanguage: (val: string) => void;
  languages: string[];
  scholarship: 'all' | 'none' | 'partial' | 'full';
  setScholarship: (val: 'all' | 'none' | 'partial' | 'full') => void;
  preferredLevel: 'all' | ProgramTargetLevel;
  setPreferredLevel: (val: 'all' | ProgramTargetLevel) => void;
  evaluatedCount: number;
  domesticCityCount: number;
  internationalLocationCount: number;
  universityCount: number;
  totalProgramCount: number;
  onPrev: () => void;
  onNext: () => void;
}

export function YksStepPreferenceFilters({
  query,
  setQuery,
  level,
  setLevel,
  locationScope,
  setLocationScope,
  city,
  setCity,
  cities,
  universityType,
  setUniversityType,
  universityTypes,
  teachingType,
  setTeachingType,
  teachingTypes,
  language,
  setLanguage,
  languages,
  scholarship,
  setScholarship,
  preferredLevel,
  setPreferredLevel,
  evaluatedCount,
  domesticCityCount,
  internationalLocationCount,
  universityCount,
  totalProgramCount,
  onPrev,
  onNext,
}: YksStepPreferenceFiltersProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-default bg-surface-1 p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-accent-fg" />
          <h2 className="text-lg font-bold text-primary">
            Üniversite Tercih Filtreleri
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Üniversite veya bölüm ara"
            className="w-full rounded-xl border border-default dark:border-slate-400 bg-surface-0 px-3 py-2 text-sm font-semibold text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />

          <select
            value={level}
            onChange={(event) =>
              setLevel(event.target.value as 'all' | 'lisans' | 'onlisans')
            }
            className="w-full rounded-xl border border-default dark:border-slate-400 bg-surface-0 px-3 py-2 text-sm font-semibold text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
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
            className="w-full rounded-xl border border-default dark:border-slate-400 bg-surface-0 px-3 py-2 text-sm font-semibold text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="all">Tüm Konumlar</option>
            <option value="domestic">Türkiye</option>
            <option value="international">Yurt Dışı</option>
          </select>

          <select
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="w-full rounded-xl border border-default dark:border-slate-400 bg-surface-0 px-3 py-2 text-sm font-semibold text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
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
            className="w-full rounded-xl border border-default dark:border-slate-400 bg-surface-0 px-3 py-2 text-sm font-semibold text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
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
            className="w-full rounded-xl border border-default dark:border-slate-400 bg-surface-0 px-3 py-2 text-sm font-semibold text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
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
            className="w-full rounded-xl border border-default dark:border-slate-400 bg-surface-0 px-3 py-2 text-sm font-semibold text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
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
            onChange={(event) =>
              setScholarship(
                event.target.value as 'all' | 'none' | 'partial' | 'full',
              )
            }
            className="w-full rounded-xl border border-default dark:border-slate-400 bg-surface-0 px-3 py-2 text-sm font-semibold text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="all">Burs Durumu (Hepsi)</option>
            <option value="none">Burssuz</option>
            <option value="partial">Kısmi Burs</option>
            <option value="full">Tam Burs</option>
          </select>

          <select
            value={preferredLevel}
            onChange={(event) =>
              setPreferredLevel(
                event.target.value as 'all' | ProgramTargetLevel,
              )
            }
            className="w-full rounded-xl border border-default dark:border-slate-400 bg-surface-0 px-3 py-2 text-sm font-semibold text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="all">Hedef Seviyesi (Hepsi)</option>
            <option value="iddiali">İddialı</option>
            <option value="dengeli">Dengeli</option>
            <option value="guvenli">Güvenli</option>
          </select>
        </div>

        <div className="mt-4 rounded-2xl border border-default bg-surface-2 p-3 text-sm text-secondary">
          Filtreye uygun program sayısı:{' '}
          <span className="font-bold text-primary">{evaluatedCount}</span>
        </div>

        <div className="mt-3 rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 p-3 text-sm text-indigo-900 dark:text-indigo-200">
          Veritabanı kapsamı:{' '}
          <span className="font-bold text-primary">
            {domesticCityCount} Türkiye şehri
          </span>
          ,{' '}
          <span className="font-bold text-primary">
            {internationalLocationCount} yurt dışı konumu
          </span>
          ,{' '}
          <span className="font-bold text-primary">
            {universityCount} üniversite
          </span>
          ,{' '}
          <span className="font-bold text-primary">
            {totalProgramCount} program
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onPrev}
            className="rounded-xl border border-default dark:border-slate-400 bg-surface-1 px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-2 transition"
          >
            Geri Dön
          </button>
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 rounded-xl border border-purple-600/80 dark:border-purple-300/80 px-4 py-2 text-sm font-bold transition hover:scale-[1.01] active:scale-[0.99] bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
          >
            Önerileri Göster
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
