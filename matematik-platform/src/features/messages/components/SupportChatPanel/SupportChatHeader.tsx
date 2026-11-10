'use client';

import type { RefObject } from 'react';
import Image from 'next/image';
import { ArrowLeft, Search, X } from 'lucide-react';

export type SupportChatHeaderProps = {
  peerDisplayName: string;
  peerSubtitle?: string;
  peerAvatarSrc?: string;
  onBack?: () => void;
  onClose?: () => void;
  appearance: 'navbar' | 'admin';
  isLight?: boolean;
  isSearchOpen: boolean;
  setIsSearchOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
  matchedCount: number;
};

export function SupportChatHeader({
  peerDisplayName,
  peerSubtitle,
  peerAvatarSrc,
  onBack,
  onClose,
  appearance,
  isLight = true,
  isSearchOpen,
  setIsSearchOpen,
  searchQuery,
  setSearchQuery,
  searchInputRef,
  matchedCount,
}: SupportChatHeaderProps) {
  const headerBorder =
    appearance === 'navbar'
      ? isLight
        ? 'border-slate-200'
        : 'border-slate-700/80'
      : 'border-[var(--border)]';

  const headerBg =
    appearance === 'navbar'
      ? isLight
        ? 'bg-white/90 backdrop-blur-md'
        : 'bg-slate-900/90 backdrop-blur-md'
      : 'bg-[var(--bg-elevated)]';

  const titleClass =
    appearance === 'navbar'
      ? isLight
        ? 'text-slate-900'
        : 'text-white'
      : 'text-[var(--text-strong)]';

  const subtitleClass =
    appearance === 'navbar'
      ? isLight
        ? 'text-slate-500'
        : 'text-slate-400'
      : 'text-[var(--text-muted)]';

  return (
    <>
      <div
        className={`flex shrink-0 items-center justify-between border-b px-4 py-3 ${headerBorder} ${headerBg}`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Geri"
              className={`shrink-0 rounded-lg p-1.5 transition-colors ${
                appearance === 'navbar'
                  ? isLight
                    ? 'text-slate-500 hover:bg-slate-100'
                    : 'text-slate-400 hover:bg-white/5'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-muted)]'
              }`}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}

          {/* Profil Avatarı & Çevrim içi Noktası */}
          <div className="relative shrink-0">
            {peerAvatarSrc ? (
              <Image
                src={peerAvatarSrc}
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover border border-white/40 shadow-xs"
              />
            ) : (
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold shadow-sm bg-brand-secondary text-slate-950 dark:text-slate-950"
                aria-hidden
              >
                {(peerDisplayName.trim()[0] || '?').toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500" />
          </div>

          <div className="min-w-0 flex-1">
            <span
              className={`block truncate text-sm font-semibold ${titleClass}`}
            >
              {peerDisplayName}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`block truncate text-[11px] ${subtitleClass}`}>
                {peerSubtitle || 'Çevrim içi • Aktif'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Sohbet İçi Arama Butonu */}
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen((prev) => !prev);
              if (isSearchOpen) setSearchQuery('');
            }}
            aria-label="Sohbette ara"
            title="Sohbette ara"
            className={`rounded-lg p-1.5 transition-colors ${
              isSearchOpen
                ? 'bg-indigo-500/10 text-indigo-500'
                : appearance === 'navbar'
                  ? isLight
                    ? 'text-slate-500 hover:bg-slate-100'
                    : 'text-slate-400 hover:bg-white/5'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-muted)]'
            }`}
          >
            <Search className="h-4 w-4" />
          </button>

          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className={`shrink-0 rounded-lg p-1.5 transition-colors ${
                appearance === 'navbar'
                  ? isLight
                    ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-muted)]'
              }`}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Canlı Arama Çubuğu (Açıksa) */}
      {isSearchOpen && (
        <div
          className={`flex items-center gap-2 border-b px-3 py-2 text-xs transition-all ${
            isLight
              ? 'bg-slate-100/90 border-slate-200'
              : 'bg-slate-800/90 border-slate-700'
          }`}
        >
          <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Mesajlarda ara..."
            className={`w-full bg-transparent text-xs focus:outline-none ${
              isLight
                ? 'text-slate-900 placeholder:text-slate-400'
                : 'text-slate-100 placeholder:text-slate-500'
            }`}
          />
          {searchQuery ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-indigo-500 shrink-0">
                {matchedCount} eşleşme
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
