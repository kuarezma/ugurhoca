import { RotateCw, Star, CheckCircle, Volume2, VolumeX } from 'lucide-react';
import MathText from '@/components/MathText';
import type { Flashcard, CardLeitnerState } from './types';
import { LEITNER_INTERVALS } from './flashcardStorage';

type FlashcardViewerProps = {
  currentCard?: Flashcard;
  currentLeitner: CardLeitnerState | null;
  isFlipped: boolean;
  setIsFlipped: (fn: (v: boolean) => boolean) => void;
  isSpeaking: boolean;
  isSpeechSupported: boolean;
  toggleSpeech: (text: string) => void;
  starredCards: Set<string>;
  toggleStarred: (id: string) => void;
  learnedCards: Set<string>;
  toggleLearned: (id: string) => void;
  onLeitnerReview: (
    cardId: string,
    result: 'forgot' | 'hard' | 'known',
  ) => void;
};

export function FlashcardViewer({
  currentCard,
  currentLeitner,
  isFlipped,
  setIsFlipped,
  isSpeaking,
  isSpeechSupported,
  toggleSpeech,
  starredCards,
  toggleStarred,
  learnedCards,
  toggleLearned,
  onLeitnerReview,
}: FlashcardViewerProps) {
  if (!currentCard) {
    return (
      <div className="no-print flex flex-1 flex-col items-center justify-center p-4 sm:p-6 bg-slate-100/40 dark:bg-slate-950/20">
        <div className="text-center py-12">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Bu filtrede gösterilecek kart bulunamadı.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="no-print flex flex-1 flex-col items-center justify-center p-4 sm:p-6 bg-slate-100/40 dark:bg-slate-950/20">
      <div
        role="button"
        tabIndex={0}
        aria-label={currentCard.title}
        onClick={() => setIsFlipped((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsFlipped((prev) => !prev);
          }
        }}
        className="group relative flex min-h-[300px] w-full max-w-lg cursor-pointer flex-col justify-between rounded-3xl border border-slate-200 dark:border-white/15 bg-white p-5 sm:p-6 text-center shadow-lg dark:shadow-2xl transition-all duration-300 hover:border-brand-primary/50 hover:shadow-brand-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary dark:bg-surface-1"
      >
        {/* Üst Bilgi */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="rounded-lg bg-white/10 px-2.5 py-1 font-semibold text-brand-ink">
              {currentCard.subject}
            </span>
            {currentLeitner && (
              <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                Kutu {currentLeitner.box} (
                {LEITNER_INTERVALS[currentLeitner.box]} Gün)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isSpeechSupported && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isFlipped) {
                    toggleSpeech(
                      `${currentCard.title}. ${currentCard.formula}. ${currentCard.tip || ''}`,
                    );
                  } else {
                    toggleSpeech(
                      `${currentCard.title}. ${currentCard.frontText}`,
                    );
                  }
                }}
                className={`p-1.5 rounded-xl transition ${
                  isSpeaking
                    ? 'text-cyan-500 dark:text-cyan-400 bg-cyan-500/20 animate-pulse'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
                title={
                  isSpeaking ? 'Seslendirmeyi durdur' : 'Formülü sesli dinle'
                }
                aria-label={
                  isSpeaking ? 'Seslendirmeyi durdur' : 'Formülü sesli dinle'
                }
              >
                {isSpeaking ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleStarred(currentCard.id);
              }}
              className={`p-1.5 rounded-xl transition ${
                starredCards.has(currentCard.id)
                  ? 'text-amber-500 dark:text-amber-400 bg-amber-500/20 hover:bg-amber-500/30'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
              title={
                starredCards.has(currentCard.id)
                  ? 'Yıldızı kaldır'
                  : 'Kritik formül olarak yıldızla'
              }
              aria-label={
                starredCards.has(currentCard.id) ? 'Yıldızı kaldır' : 'Yıldızla'
              }
            >
              <Star
                className={`h-4 w-4 ${starredCards.has(currentCard.id) ? 'fill-amber-400 text-amber-500 dark:text-amber-400' : ''}`}
              />
            </button>
            <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white">
              <RotateCw className="h-3 w-3" />
              {isFlipped ? 'Ön yüze dön' : 'Cevap için tıkla'}
            </span>
          </div>
        </div>

        {/* Kart Gövdesi */}
        <div className="my-auto py-4">
          {!isFlipped ? (
            <div className="space-y-3">
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                {currentCard.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
                {currentCard.frontText}
              </p>
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in">
              <div className="text-base sm:text-lg font-bold text-amber-700 dark:text-amber-300">
                <MathText>{currentCard.formula}</MathText>
              </div>
              {currentCard.tip && (
                <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-800 dark:text-emerald-200">
                  💡 {currentCard.tip}
                </p>
              )}
              {currentCard.example && (
                <p className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                  Örn: <MathText>{currentCard.example}</MathText>
                </p>
              )}

              {/* Leitner Puanlama Aksiyonları (Arka Yüz) */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10">
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mb-2 font-semibold">
                  Bu formülü ne kadar hatırladın?
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLeitnerReview(currentCard.id, 'forgot');
                    }}
                    className="rounded-xl border border-rose-500/30 bg-rose-500/15 py-1.5 px-2 text-[11px] font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-500/25 transition"
                    title="Kutu 1'e geri dön (1 gün sonra tekrar)"
                  >
                    Unuttum (K1)
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLeitnerReview(currentCard.id, 'hard');
                    }}
                    className="rounded-xl border border-amber-500/30 bg-amber-500/15 py-1.5 px-2 text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 transition"
                    title="Aynı kutuda kal (yarın tekrar)"
                  >
                    Zorlandım
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLeitnerReview(currentCard.id, 'known');
                    }}
                    className="rounded-xl border border-emerald-500/30 bg-emerald-500/15 py-1.5 px-2 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 transition"
                    title="Sonraki kutuya ilerlet"
                  >
                    Biliyorum (+1)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Alt Bilgi */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-white/5 pt-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleLearned(currentCard.id);
            }}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 transition ${
              learnedCards.has(currentCard.id)
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold'
                : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            {learnedCards.has(currentCard.id)
              ? 'Öğrenildi'
              : 'Öğrendim olarak işaretle'}
          </button>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Kartı çevirmek için tıkla
          </span>
        </div>
      </div>
    </div>
  );
}
