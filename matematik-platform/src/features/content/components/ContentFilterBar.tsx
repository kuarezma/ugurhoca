'use client';

import {
  ArrowUpDown,
  BookOpen,
  CheckCircle2,
  FolderTree,
  Grid,
  List,
  Search,
  Star,
  Video,
  X,
} from 'lucide-react';
import { CONTENT_SORT_OPTIONS } from '@/features/content/constants';
import type {
  ContentQuickFilter,
  ContentSortOrder,
} from '@/features/content/types';

export type ContentViewMode = 'grid' | 'list' | 'packs';

type ContentFilterBarProps = {
  isWorksheetBrowser: boolean;
  onClearSearch: () => void;
  onQuickFilterChange: (filter: ContentQuickFilter) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (sort: ContentSortOrder) => void;
  onViewModeChange: (mode: ContentViewMode) => void;
  quickFilter: ContentQuickFilter;
  searchPlaceholder?: string;
  searchTerm: string;
  sortBy: ContentSortOrder;
  totalResults: number;
  viewMode: ContentViewMode;
};

export default function ContentFilterBar({
  isWorksheetBrowser,
  onClearSearch,
  onQuickFilterChange,
  onSearchChange,
  onSortChange,
  onViewModeChange,
  quickFilter,
  searchPlaceholder = 'İçerik ara...',
  searchTerm,
  sortBy,
  totalResults,
  viewMode,
}: ContentFilterBarProps) {
  return (
    <div className="space-y-4">
      <details className="group md:contents">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl border border-default dark:border-white/[0.08] bg-surface-2/80 px-4 py-3 text-sm font-semibold text-primary backdrop-blur-md transition-colors hover:bg-surface-3 md:hidden">
          Filtrele
          <span className="text-xs font-medium text-purple-600 dark:text-purple-400 group-open:hidden">Aç</span>
          <span className="hidden text-xs font-medium text-purple-600 dark:text-purple-400 group-open:inline">Kapat</span>
        </summary>
        <div className="hidden space-y-4 group-open:block md:block">
          {/* Search and Sort row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 group">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary transition-colors group-focus-within:text-purple-500" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full rounded-2xl border border-default dark:border-white/[0.08] bg-surface-2/60 py-3 pl-12 pr-10 text-sm sm:text-base text-primary placeholder:text-secondary backdrop-blur-md transition-all focus:border-purple-500/50 focus:bg-surface-1 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
              {searchTerm && (
                <button
                  onClick={onClearSearch}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-secondary transition-colors hover:bg-surface-3 hover:text-primary"
                  title="Aramayı Temizle"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sort and View Mode */}
            <div className="flex items-center gap-2">
              {!isWorksheetBrowser && (
                <div className="relative flex items-center">
                  <ArrowUpDown className="pointer-events-none absolute left-3.5 h-4 w-4 text-secondary" />
                  <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value as ContentSortOrder)}
                    className="appearance-none rounded-2xl border border-default dark:border-white/[0.08] bg-surface-2/60 py-3 pl-9 pr-8 text-xs sm:text-sm font-semibold text-primary backdrop-blur-md transition-all hover:bg-surface-3 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    {CONTENT_SORT_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id} className="bg-surface-1 text-primary">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* View Mode Switcher */}
              <div className="flex items-center rounded-2xl border border-default dark:border-white/[0.08] bg-surface-2/60 p-1 backdrop-blur-md shadow-xs">
                <button
                  onClick={() => onViewModeChange('grid')}
                  title="Kılavuz Görünümü"
                  className={`rounded-xl p-2 transition-all ${
                    viewMode === 'grid'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25 font-semibold'
                      : 'text-secondary hover:text-primary hover:bg-surface-3/50'
                  }`}
                >
                  <Grid className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={() => onViewModeChange('list')}
                  title="Liste Görünümü"
                  className={`rounded-xl p-2 transition-all ${
                    viewMode === 'list'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25 font-semibold'
                      : 'text-secondary hover:text-primary hover:bg-surface-3/50'
                  }`}
                >
                  <List className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                {!isWorksheetBrowser && (
                  <button
                    onClick={() => onViewModeChange('packs')}
                    title="Konu Paketleri"
                    className={`flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-semibold transition-all ${
                      viewMode === 'packs'
                        ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-md shadow-purple-600/25'
                        : 'text-secondary hover:text-primary hover:bg-surface-3/50'
                    }`}
                  >
                    <FolderTree className="h-4 w-4" />
                    <span className="hidden md:inline">Paketler</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Filters Row */}
          {!isWorksheetBrowser && viewMode !== 'packs' && (
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => onQuickFilterChange('all')}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    quickFilter === 'all'
                      ? 'border border-purple-500/40 bg-purple-500/15 text-purple-700 dark:text-purple-300 shadow-sm shadow-purple-500/20'
                      : 'border border-default dark:border-white/[0.08] bg-surface-2/60 text-secondary hover:bg-surface-3 hover:text-primary'
                  }`}
                >
                  Tümü
                </button>
                <button
                  onClick={() => onQuickFilterChange('favorites')}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    quickFilter === 'favorites'
                      ? 'border border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300 shadow-sm shadow-amber-500/20'
                      : 'border border-default dark:border-white/[0.08] bg-surface-2/60 text-secondary hover:bg-surface-3 hover:text-primary'
                  }`}
                >
                  <Star className="h-3.5 w-3.5 fill-current text-amber-500 dark:text-amber-400" />
                  Favorilerim
                </button>
                <button
                  onClick={() => onQuickFilterChange('completed')}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    quickFilter === 'completed'
                      ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shadow-sm shadow-emerald-500/20'
                      : 'border border-default dark:border-white/[0.08] bg-surface-2/60 text-secondary hover:bg-surface-3 hover:text-primary'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  Çözülenler
                </button>
                <button
                  onClick={() => onQuickFilterChange('with_solution')}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    quickFilter === 'with_solution'
                      ? 'border border-teal-500/40 bg-teal-500/15 text-teal-700 dark:text-teal-300 shadow-sm shadow-teal-500/20'
                      : 'border border-default dark:border-white/[0.08] bg-surface-2/60 text-secondary hover:bg-surface-3 hover:text-primary'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  Çözümlü
                </button>
                <button
                  onClick={() => onQuickFilterChange('with_video')}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    quickFilter === 'with_video'
                      ? 'border border-rose-500/40 bg-rose-500/15 text-rose-700 dark:text-rose-300 shadow-sm shadow-rose-500/20'
                      : 'border border-default dark:border-white/[0.08] bg-surface-2/60 text-secondary hover:bg-surface-3 hover:text-primary'
                  }`}
                >
                  <Video className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                  Videolu
                </button>
              </div>

              <div className="flex items-center gap-1.5 rounded-full border border-default dark:border-white/[0.06] bg-surface-2/50 px-3 py-1 text-xs font-medium text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                <span>{totalResults} içerik bulundu</span>
              </div>
            </div>
          )}
        </div>
      </details>
    </div>
  );
}
