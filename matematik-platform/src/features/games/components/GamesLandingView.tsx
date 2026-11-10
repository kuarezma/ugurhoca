'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Trophy,
  Volume2,
  VolumeX,
  Sparkles,
  Search,
  GraduationCap,
  RotateCcw,
} from 'lucide-react';
import { SafeLink as Link } from '@/components/SafeLink';
import { useGameSoundMute } from '@/features/games/hooks/useGameSoundMute';
import type { AppUser } from '@/types';
import {
  FloatingParticles,
  GameCard,
  games,
} from '@/features/games/components/gameLibrary';
import { GamesLeaderboard } from '@/features/games/components/GamesLeaderboard';
import type { LeaderboardPeriod } from '@/features/games/queries';
import type { GameDefinition, LeaderboardRow } from '@/features/games/types';

type GamesLandingViewProps = {
  leaderboard: LeaderboardRow[];
  leaderboardPeriod: LeaderboardPeriod;
  onLeaderboardPeriodChange: (period: LeaderboardPeriod) => void;
  onSelectGame: (game: GameDefinition) => void;
  totalScore: number;
  user: AppUser;
};

export function GamesLandingView({
  leaderboard,
  leaderboardPeriod,
  onLeaderboardPeriodChange,
  onSelectGame,
  totalScore,
  user,
}: GamesLandingViewProps) {
  const profileHref = user.isAdmin ? '/admin' : '/profil';
  const { isMuted, toggleMute } = useGameSoundMute();

  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      if (selectedGrade !== 'all') {
        if (game.grades && !game.grades.includes(selectedGrade)) {
          return false;
        }
        if (!game.grades && !game.grade.includes(String(selectedGrade))) {
          return false;
        }
      }
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchTitle = game.title.toLowerCase().includes(q);
        const matchDesc = game.description.toLowerCase().includes(q);
        const matchOutcomes = (game.outcomes || []).some((o) =>
          o.toLowerCase().includes(q),
        );
        if (!matchTitle && !matchDesc && !matchOutcomes) return false;
      }
      return true;
    });
  }, [selectedGrade, searchQuery]);

  return (
    <main className="oyunlar-page page-surface min-h-screen pb-20 relative">
      {/* Ambient Glow Mesh */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl" />
        <div className="absolute top-48 -right-32 h-96 w-96 rounded-full bg-cyan-500/10 dark:bg-cyan-500/5 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-96 w-96 rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-3xl" />
      </div>

      <FloatingParticles />

      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-default bg-surface-1/90 backdrop-blur-xl py-3 sm:py-4 px-4 sm:px-6 pt-[max(0.75rem,env(safe-area-inset-top))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        <div className="container mx-auto flex justify-between items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-2xl border-2 border-[#58cc02] bg-[#d7ffb8] p-0.5 shadow-[0_3px_0_#46a302]">
              <Image
                src="/ugur.jpeg"
                alt="Uğur Hoca"
                width={44}
                height={44}
                priority
                className="h-full w-full rounded-xl object-cover"
              />
            </div>
            <span className="font-display text-base sm:text-xl font-bold text-primary truncate">
              Uğur Hoca Matematik
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={toggleMute}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-default bg-surface-2 hover:bg-overlay-2 text-primary transition-colors text-xs"
              aria-label={isMuted ? 'Oyun sesini aç' : 'Oyun sesini kapat'}
              title={
                isMuted
                  ? 'Ses Kapalı (Açmak için tıkla)'
                  : 'Ses Açık (Kapatmak için tıkla)'
              }
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-accent-danger-ink shrink-0" />
                  <span className="hidden sm:inline text-accent-danger-ink font-semibold">
                    Sessiz
                  </span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-accent-success-ink shrink-0" />
                  <span className="hidden sm:inline text-accent-success-ink font-semibold">
                    Ses Açık
                  </span>
                </>
              )}
            </button>

            <Link
              href={profileHref}
              className="text-secondary hover:text-primary flex items-center gap-1.5 text-xs sm:text-base shrink-0 font-medium"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{user.isAdmin ? 'Admin Panel' : 'Profil'}</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-[calc(4.5rem+env(safe-area-inset-top))] sm:pt-24 px-4 sm:px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center max-w-2xl mx-auto"
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-950/40 px-3.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 backdrop-blur-md shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>
                {games.length} Eğlenceli Matematik Oyunu · Puan Topla & Yarış
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-primary font-display mb-2">
              Matematik Oyun Dünyası
            </h1>
            <p className="text-sm sm:text-base text-secondary">
              Hızlı işlem, geometri dedektifliği ve zihin açıcı strateji
              oyunlarıyla matematiği eğlenerek keşfet.
            </p>
          </motion.div>

          {/* Sınıf Filtresi & Arama Çubuğu */}
          <div className="max-w-5xl mx-auto mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Sınıf Seçici */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                {[
                  { value: 'all' as const, label: 'Tümü' },
                  { value: 5, label: '5. Sınıf' },
                  { value: 6, label: '6. Sınıf' },
                  { value: 7, label: '7. Sınıf' },
                  { value: 8, label: '8. Sınıf' },
                ].map((item) => {
                  const isSelected = selectedGrade === item.value;
                  return (
                    <button
                      key={String(item.value)}
                      type="button"
                      onClick={() => setSelectedGrade(item.value)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shadow-xs ${
                        isSelected
                          ? 'bg-accent-bg text-accent-fg border border-accent-fg/30'
                          : 'bg-surface-1 border border-border-default text-secondary hover:bg-surface-2 hover:text-primary'
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Arama Alanı */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Oyun veya MEB konusu ara..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-1 border border-border-default text-primary placeholder:text-tertiary text-xs focus:outline-none focus:ring-2 focus:ring-accent-fg transition"
                />
              </div>
            </div>

            {/* Arama / Filtre Durumu */}
            {(selectedGrade !== 'all' || searchQuery.trim().length > 0) && (
              <div className="flex items-center justify-between text-xs text-secondary px-1">
                <span>
                  <strong>{filteredGames.length}</strong> oyun bulundu
                  {selectedGrade !== 'all' ? ` (${selectedGrade}. Sınıf)` : ''}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGrade('all');
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center gap-1 text-accent-fg font-bold hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Filtreleri Temizle</span>
                </button>
              </div>
            )}
          </div>

          {filteredGames.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {filteredGames.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GameCard game={game} onClick={() => onSelectGame(game)} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-3xl bg-surface-1 border border-border-default max-w-md mx-auto space-y-3">
              <p className="text-sm font-semibold text-secondary">
                Aramana uygun matematik oyunu bulunamadı.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedGrade('all');
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-2 border border-border-default text-xs font-bold text-primary hover:bg-surface-3 transition"
              >
                <span>Tüm Oyunları Göster</span>
              </button>
            </div>
          )}

          <GamesLeaderboard
            leaderboard={leaderboard}
            period={leaderboardPeriod}
            onPeriodChange={onLeaderboardPeriodChange}
          />

          {totalScore > 0 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-8 rounded-3xl p-8 text-center max-w-sm mx-auto border border-default bg-surface-1 shadow-sm"
            >
              <Trophy className="w-12 h-12 mx-auto mb-3 text-amber-500" />
              <h3 className="text-lg font-bold text-secondary mb-1">
                Oturum Puanın
              </h3>
              <p className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent">
                {totalScore}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
