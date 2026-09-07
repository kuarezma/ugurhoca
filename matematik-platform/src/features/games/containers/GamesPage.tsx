'use client';

import { useCallback, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Gamepad2, ShieldCheck, X } from 'lucide-react';
import { GamesLandingView } from '@/features/games/components/GamesLandingView';
import { SelectedGameView } from '@/features/games/components/SelectedGameView';
import { useGamesPageData } from '@/features/games/hooks/useGamesPageData';
import type { GameDefinition } from '@/features/games/types';
import { Skeleton } from '@/components/ui/Skeleton';

const GAME_SCORE_MULTIPLIER = 1;

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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-scrim px-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm rounded-3xl border border-default bg-surface-1 p-5 shadow-2xl text-primary"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Rumuz penceresini kapat"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-xl text-secondary transition hover:bg-overlay-2 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-hairline bg-accent-success-tint text-accent-success-ink">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary">Oyun rumuzunu seç</h2>
            <p className="text-xs text-secondary">
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
            className="h-11 w-full rounded-xl border border-default bg-surface-0 px-3 text-sm text-primary outline-none placeholder:text-tertiary focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </label>
        <p className="mt-2 text-xs leading-relaxed text-secondary">
          3-16 karakter. E-posta, telefon, link veya gerçek ad kullanılmaz.
        </p>
        {error ? <p className="mt-3 text-xs text-accent-danger-ink font-semibold">{error}</p> : null}
        <button
          type="submit"
          disabled={saving || alias.trim().length < 3}
          className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 shadow"
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
