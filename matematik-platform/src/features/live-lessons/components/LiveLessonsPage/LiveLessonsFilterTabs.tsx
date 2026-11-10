import React from 'react';
import { Calendar, History, Search } from 'lucide-react';
import { GRADE_FILTERS } from './helpers';

interface LiveLessonsFilterTabsProps {
  activeTab: 'upcoming' | 'past';
  setActiveTab: (tab: 'upcoming' | 'past') => void;
  upcomingCount: number;
  pastCount: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedGrade: string;
  setSelectedGrade: (g: string) => void;
}

export function LiveLessonsFilterTabs({
  activeTab,
  setActiveTab,
  upcomingCount,
  pastCount,
  searchQuery,
  setSearchQuery,
  selectedGrade,
  setSelectedGrade,
}: LiveLessonsFilterTabsProps) {
  return (
    <section className="mt-10 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Sekme Butonları */}
        <div className="flex items-center rounded-2xl border border-border bg-card p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'upcoming'
                ? 'bg-brand-primary shadow-sm text-slate-950 dark:text-slate-950'
                : 'text-foreground/70 hover:text-foreground'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Yaklaşan Dersler</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                activeTab === 'upcoming'
                  ? 'bg-white/20 text-slate-950 dark:text-slate-950'
                  : 'bg-foreground/10 text-foreground/70'
              }`}
            >
              {upcomingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('past')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'past'
                ? 'bg-brand-primary shadow-sm text-slate-950 dark:text-slate-950'
                : 'text-foreground/70 hover:text-foreground'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Geçmiş Dersler</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                activeTab === 'past'
                  ? 'bg-white/20 text-slate-950 dark:text-slate-950'
                  : 'bg-foreground/10 text-foreground/70'
              }`}
            >
              {pastCount}
            </span>
          </button>
        </div>

        {/* Arama Kutusu */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-foreground/40" />
          <input
            type="search"
            placeholder="Ders ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-border bg-card pl-9 pr-4 py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
      </div>

      {/* Sınıf Filtresi Çipleri */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {GRADE_FILTERS.map((f) => {
          const isSelected = selectedGrade === f.value;
          return (
            <button
              type="button"
              key={f.value}
              onClick={() => setSelectedGrade(f.value)}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-foreground text-background font-bold shadow-sm'
                  : 'border border-border bg-card text-foreground/70 hover:bg-foreground/5 hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
