'use client';

import { useCallback, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Gamepad2, ShieldCheck, X } from 'lucide-react';
import { GamesLandingView } from '@/features/games/components/GamesLandingView';
import { SelectedGameView } from '@/features/games/components/SelectedGameView';
import { useGamesPageData } from '@/features/games/hooks/useGamesPageData';
import type { GameDefinition } from '@/features/games/types';
import { Skeleton } from '@/components/ui/Skeleton';

const GAME_SCORE_MULTIPLIER = 10;

function GameAliasModal({
  error,
  onClose,
  onSubmit,
  saving,
}: {
  error: string | null;
  onClose: () => void;
  onSubmit: (alias: string) => Promise<boolean>;
  saving: boolean;
}) {
  const [alias, setAlias] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = await onSubmit(alias);
    if (success) {
      setAlias('');
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/85 px-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Rumuz penceresini kapat"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Oyun rumuzunu seç</h2>
            <p className="text-xs text-slate-400">
              Liderlik tablosunda gerçek adın görünmez.
            </p>
          </div>
        </div>
        <label className="block">
          <span className="sr-only">Oyun rumuzu</span>
          <input
            value={alias}
            onChange={(event) => setAlias(event.target.value)}
            minLength={3}
            maxLength={16}
            placeholder="Örn: SayıUstası"
            className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
          />
        </label>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          3-16 karakter. E-posta, telefon, link veya gerçek ad kullanılmaz.
        </p>
        {error ? <p className="mt-3 text-xs text-red-300">{error}</p> : null}
        <button
          type="submit"
          disabled={saving || alias.trim().length < 3}
          className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Kaydediliyor...' : 'Rumuzu Kaydet'}
        </button>
      </form>
    </div>
  );
}

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState<GameDefinition | null>(null);
  const [aliasModalDismissed, setAliasModalDismissed] = useState(false);
  const router = useRouter();
  const {
    aliasError,
    aliasSaving,
    gameAlias,
    leaderboard,
    leaderboardPeriod,
    loading,
    recordScore,
    setLeaderboardPeriod,
    submitAlias,
    totalScore,
    user,
  } = useGamesPageData(router);

  const handleScore = useCallback(
    async (score: number) => {
      await recordScore(score, selectedGame);
    },
    [recordScore, selectedGame],
  );

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-20">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-8 flex items-center gap-3" aria-hidden="true">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/20 text-brand-primary-soft">
              <Gamepad2 className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-2">
              <Skeleton className="h-7 w-60" />
              <Skeleton className="h-4 w-80" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-full" rounded="lg" />
            ))}
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            Oyunlar yükleniyor
          </p>
        </div>
      </div>
    );
  }

  if (selectedGame) {
    return (
      <>
        <SelectedGameView
          game={selectedGame}
          onBack={() => setSelectedGame(null)}
          onScore={handleScore}
          scoreMultiplier={GAME_SCORE_MULTIPLIER}
          totalScore={totalScore}
        />
        {!gameAlias && !aliasModalDismissed && (
          <GameAliasModal
            error={aliasError}
            onClose={() => setAliasModalDismissed(true)}
            onSubmit={submitAlias}
            saving={aliasSaving}
          />
        )}
      </>
    );
  }

  return (
    <>
      <GamesLandingView
        leaderboard={leaderboard}
        leaderboardPeriod={leaderboardPeriod}
        onLeaderboardPeriodChange={setLeaderboardPeriod}
        onSelectGame={setSelectedGame}
        totalScore={totalScore}
        user={user}
      />
      {!gameAlias && !aliasModalDismissed && (
        <GameAliasModal
          error={aliasError}
          onClose={() => setAliasModalDismissed(true)}
          onSubmit={submitAlias}
          saving={aliasSaving}
        />
      )}
    </>
  );
}
