import type { Dispatch, SetStateAction } from 'react';
import { SafeLink as Link } from '@/components/SafeLink';
import {
  FileText,
  Trophy,
  Play,
  RotateCcw,
  Zap,
  Target,
  BookOpen,
  Timer,
  HardDrive,
  Sparkles,
} from 'lucide-react';
import { type QuizDraft } from '@/features/quizzes/lib/quizDraftStorage';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Quiz } from '@/types/quiz';
import { QuizListCard } from '@/features/quizzes/components/QuizListCard';
import type { AppUser } from '@/types';

type QuizCatalogProps = {
  error: string | null;
  setIsPacingStrategyModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsLeagueModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsMistakeNotebookOpen: Dispatch<SetStateAction<boolean>>;
  setIsOfflinePackageModalOpen: Dispatch<SetStateAction<boolean>>;
  activeDraft: QuizDraft | null;
  handleResumeDraft: (draft: QuizDraft) => Promise<void>;
  handleDiscardDraft: (quizId: string) => void;
  pendingMistakesCount: number;
  handleStartAdaptiveQuiz: (count?: number) => void;
  loading: boolean;
  visibleQuizzes: Quiz[];
  user: AppUser;
  startQuiz: (quiz: Quiz) => Promise<void>;
  handleOpenWorksheetPreview: (quiz: Quiz) => Promise<void>;
};

export function QuizCatalog({
  error,
  setIsPacingStrategyModalOpen,
  setIsLeagueModalOpen,
  setIsMistakeNotebookOpen,
  setIsOfflinePackageModalOpen,
  activeDraft,
  handleResumeDraft,
  handleDiscardDraft,
  pendingMistakesCount,
  handleStartAdaptiveQuiz,
  loading,
  visibleQuizzes,
  user,
  startQuiz,
  handleOpenWorksheetPreview,
}: QuizCatalogProps) {
  return (
    <div className="pt-[calc(4.5rem+env(safe-area-inset-top))] sm:pt-24 px-4 sm:px-6">
      <div className="container mx-auto">
        {error && (
          <div className="mb-6 rounded-2xl border border-tone-danger-border bg-tone-danger-bg px-4 py-3 text-sm text-tone-danger-fg dark:text-tone-danger-fg">
            {error}
          </div>
        )}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-up">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-tone-info-border bg-tone-info-bg dark:bg-tone-info-bg px-3.5 py-1 text-xs font-bold text-tone-info-fg dark:text-tone-info-fg backdrop-blur-md shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-tone-info-fg dark:text-tone-info-fg" />
              <span>MEB & LGS Kazanım Testleri · Anlık Analiz & Telafi</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-primary font-display mb-2">
              Online Testler & Denemeler
            </h1>
            <p className="text-sm sm:text-base text-secondary">
              Konu testleri ve denemelerle kendini dene; çözümlerle pekiştir.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsPacingStrategyModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-tone-info-border bg-tone-info-bg hover:bg-tone-info-bg px-4 py-2.5 text-xs sm:text-sm font-bold text-tone-info-fg dark:text-tone-info-fg shadow-md transition-all active:scale-95"
            >
              <Timer className="w-4 h-4 text-tone-info-fg dark:text-tone-info-fg" />
              <span>Süre Simülatörü</span>
            </button>
            <button
              type="button"
              onClick={() => setIsLeagueModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-tone-danger-border bg-tone-danger-bg hover:bg-tone-danger-bg px-4 py-2.5 text-xs sm:text-sm font-bold text-tone-danger-fg dark:text-tone-danger-fg shadow-md transition-all active:scale-95"
            >
              <Trophy className="w-4 h-4 text-tone-danger-fg dark:text-tone-danger-fg" />
              <span>Deneme Ligi</span>
            </button>
            <button
              type="button"
              onClick={() => setIsMistakeNotebookOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-tone-warn-border bg-tone-warn-bg hover:bg-tone-warn-bg px-4 py-2.5 text-xs sm:text-sm font-bold text-tone-warn-fg dark:text-tone-warn-fg shadow-md transition-all active:scale-95"
            >
              <BookOpen className="w-4 h-4 text-tone-warn-fg dark:text-tone-warn-fg" />
              <span>Akıllı Hata Defterim</span>
            </button>
            <button
              type="button"
              onClick={() => setIsOfflinePackageModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-tone-success-border bg-tone-success-bg hover:bg-tone-success-bg px-4 py-2.5 text-xs sm:text-sm font-bold text-tone-success-fg dark:text-tone-success-fg shadow-md transition-all active:scale-95"
            >
              <HardDrive className="w-4 h-4 text-tone-success-fg dark:text-tone-success-fg" />
              <span>Çevrimdışı Setler</span>
            </button>
          </div>
        </div>

        {/* Yarım Kalan Sınav Taslağı Kurtarma Banner'ı */}
        {activeDraft && (
          <div className="mb-8 rounded-3xl border border-tone-warn-border p-5 sm:p-6 backdrop-blur-xl shadow-2xl animate-fade-in bg-accent-bg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-tone-warn-bg text-tone-warn-fg dark:text-tone-warn-fg border border-tone-warn-border shadow-md">
                  <RotateCcw className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-primary dark:text-primary font-display">
                      Yarım Kalan Sınavınız Bulundu
                    </h2>
                    <span className="rounded-full bg-tone-warn-bg px-2.5 py-0.5 text-xs font-extrabold text-tone-warn-fg dark:text-tone-warn-fg border border-tone-warn-border">
                      Kesinti Koruması Aktif
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-primary dark:text-tertiary mt-1 max-w-xl">
                    <strong>{activeDraft.quizTitle}</strong> sınavında{' '}
                    {activeDraft.currentQuestion + 1}. soruda kalmıştınız (
                    {Object.keys(activeDraft.answers).length} cevap işaretli).
                    Kalan süreniz ve işaretleriniz korundu.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleResumeDraft(activeDraft)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition active:scale-95 bg-accent-bg hover:bg-accent-bg text-primary dark:text-primary shadow-btn-3d-green active:translate-y-1 active:shadow-none"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Kaldığım Yerden Devam Et</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDiscardDraft(activeDraft.quizId)}
                  className="inline-flex items-center justify-center rounded-xl border border-border-default dark:border-border-default bg-surface-1/70 dark:bg-surface-1/5 hover:bg-surface-1 dark:hover:bg-surface-1/10 px-3.5 py-2.5 text-xs font-semibold text-primary dark:text-tertiary hover:text-primary dark:hover:text-primary transition"
                >
                  Taslağı Sil
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Akıllı Telafi Testi Kartı */}
        {pendingMistakesCount > 0 && (
          <div className="mb-8 rounded-3xl border border-tone-warn-border p-5 sm:p-6 backdrop-blur-xl shadow-xl animate-fade-up bg-accent-bg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-tone-warn-bg to-tone-danger-bg text-primary dark:text-primary shadow-lg shadow-none">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-primary dark:text-primary font-display">
                      Kişisel Akıllı Telafi Testi Hazır!
                    </h2>
                    <span className="rounded-full bg-tone-warn-bg px-2.5 py-0.5 text-xs font-extrabold text-tone-warn-fg dark:text-tone-warn-fg">
                      {pendingMistakesCount} Hatalı Soru
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-primary dark:text-tertiary mt-1 max-w-xl">
                    Hata defterinde biriken zayıf kazanımlarını kapatmak için
                    kişiselleştirilmiş telafi oturumuna hemen başla.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStartAdaptiveQuiz(5)}
                  className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold hover:brightness-110 active:scale-95 transition bg-accent-bg hover:bg-accent-bg text-primary dark:text-primary shadow-btn-3d-green active:translate-y-1 active:shadow-none"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>5 Soruluk Hızlı Telafi</span>
                </button>
                {pendingMistakesCount >= 10 && (
                  <button
                    type="button"
                    onClick={() => handleStartAdaptiveQuiz(10)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-tone-warn-border dark:border-border-default bg-tone-warn-bg dark:bg-surface-1/10 px-4 py-2.5 text-xs font-bold text-primary dark:text-primary hover:bg-tone-warn-bg dark:hover:bg-surface-1/15 active:scale-95 transition"
                  >
                    <Zap className="h-3.5 w-3.5 text-tone-warn-fg dark:text-tone-warn-fg" />
                    <span>10 Soruluk Kapsamlı</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsMistakeNotebookOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-tone-warn-border bg-tone-warn-bg px-3 py-2.5 text-xs font-semibold text-tone-warn-fg dark:text-tone-warn-fg hover:bg-tone-warn-bg transition"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Hata Defterini İncele</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <>
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="bg-surface-1 rounded-2xl overflow-hidden"
                  aria-hidden="true"
                >
                  <Skeleton className="h-2 w-full" rounded="sm" />
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-14 w-14" rounded="lg" />
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-10 w-full" rounded="lg" />
                  </div>
                </div>
              ))}
              <span className="sr-only" aria-live="polite">
                Testler yükleniyor
              </span>
            </>
          ) : visibleQuizzes.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                tone="soft"
                icon={<FileText className="h-10 w-10" aria-hidden="true" />}
                title={
                  user.isAdmin
                    ? 'Henüz aktif test bulunamadı'
                    : `${user.grade}. sınıf için aktif test yok`
                }
                description={
                  user.isAdmin
                    ? 'Admin panelinden yeni bir test oluşturabilir veya mevcut bir testi yayınlayabilirsin.'
                    : 'Uğur Hoca yeni testler hazırlıyor. Bu arada içerikler bölümünden konuları tekrar edebilirsin.'
                }
                action={
                  <Link
                    href="/icerikler"
                    className="inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-border-strong bg-accent-bg hover:bg-accent-bg text-primary dark:text-primary shadow-btn-3d-green active:translate-y-1 active:shadow-none"
                  >
                    İçeriklere git
                  </Link>
                }
              />
            </div>
          ) : (
            visibleQuizzes.map((quiz, index) => (
              <QuizListCard
                key={quiz.id}
                quiz={quiz}
                index={index}
                onStart={startQuiz}
                onWorksheetPreview={handleOpenWorksheetPreview}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
