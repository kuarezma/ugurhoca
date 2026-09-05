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
      {/* Search and Sort row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-800/60 py-3 pl-12 pr-10 text-sm sm:text-base text-white placeholder-slate-400 transition-all focus:border-cyan-400/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          />
          {searchTerm && (
            <button
              onClick={onClearSearch}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
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
              <ArrowUpDown className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as ContentSortOrder)}
                className="appearance-none rounded-2xl border border-white/10 bg-slate-800/60 py-3 pl-9 pr-8 text-xs sm:text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800 focus:border-cyan-400/50 focus:outline-none"
              >
                {CONTENT_SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* View Mode Switcher */}
          <div className="flex items-center rounded-2xl border border-white/10 bg-slate-800/60 p-1 backdrop-blur-md">
            <button
              onClick={() => onViewModeChange('grid')}
              title="Kılavuz Görünümü"
              className={`rounded-xl p-2 transition-all ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              title="Liste Görünümü"
              className={`rounded-xl p-2 transition-all ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
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
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
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
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => onQuickFilterChange('all')}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                quickFilter === 'all'
                  ? 'border border-cyan-400/40 bg-cyan-500/20 text-cyan-300'
                  : 'border border-white/5 bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => onQuickFilterChange('favorites')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                quickFilter === 'favorites'
                  ? 'border border-amber-400/40 bg-amber-500/20 text-amber-300'
                  : 'border border-white/5 bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
              Favorilerim
            </button>
            <button
              onClick={() => onQuickFilterChange('completed')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                quickFilter === 'completed'
                  ? 'border border-emerald-400/40 bg-emerald-500/20 text-emerald-300'
                  : 'border border-white/5 bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Çözülenler
            </button>
            <button
              onClick={() => onQuickFilterChange('with_solution')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                quickFilter === 'with_solution'
                  ? 'border border-green-400/40 bg-green-500/20 text-green-300'
                  : 'border border-white/5 bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 text-green-400" />
              Çözümlü
            </button>
            <button
              onClick={() => onQuickFilterChange('with_video')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                quickFilter === 'with_video'
                  ? 'border border-red-400/40 bg-red-500/20 text-red-300'
                  : 'border border-white/5 bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Video className="h-3.5 w-3.5 text-red-400" />
              Videolu
            </button>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            {totalResults} içerik bulundu
          </span>
        </div>
      )}
    </div>
  );
}
