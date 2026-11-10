import type { Dispatch, SetStateAction, RefObject } from 'react';
import { Trophy, ArrowLeft, ChevronRight, WifiOff } from 'lucide-react';
import { QuizQuestionPalette } from '@/features/quizzes/components/QuizQuestionPalette';
import { useQuestionSpeech } from '@/features/quizzes/hooks/useQuestionSpeech';
import { QuestionDrawingOverlay } from '@/features/quizzes/components/QuestionDrawingOverlay';
import { useAccessibilitySettings } from '@/hooks/useAccessibilitySettings';

import { Quiz, QuizQuestion } from '@/types/quiz';
import { getDifficultyColor } from '@/features/quizzes/components/QuizListCard';
import type { AppUser } from '@/types';
import {
  ScratchpadModal,
  QuizShortcutsModal,
  QuizOpticalSheetModal,
  MathGlossaryModal,
} from './lazy';
import { QuizToolbar } from './QuizToolbar';
import { QuizQuestionContent } from './QuizQuestionContent';
type ActiveQuizViewProps = {
  isFocusMode: boolean;
  isOnline: boolean;
  isSmartboardMode: boolean;
  isOpticalDocked: boolean;
  questionCardRef: RefObject<HTMLDivElement | null>;
  isDrawingOverlayActive: boolean;
  setIsDrawingOverlayActive: Dispatch<SetStateAction<boolean>>;
  currentQuestion: number;
  resetQuiz: () => void;
  setIsScratchpadOpen: Dispatch<SetStateAction<boolean>>;
  setIsOpticalDocked: Dispatch<SetStateAction<boolean>>;
  setIsOpticalSheetOpen: Dispatch<SetStateAction<boolean>>;
  setIsGlossaryOpen: Dispatch<SetStateAction<boolean>>;
  setIsSpotMistakeOpen: Dispatch<SetStateAction<boolean>>;
  setIsMathLabOpen: Dispatch<SetStateAction<boolean>>;
  toggleDyslexicMode: () => void;
  isDyslexicMode: boolean;
  setIsSmartboardMode: Dispatch<SetStateAction<boolean>>;
  setIsA11yModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsFocusMode: Dispatch<SetStateAction<boolean>>;
  setIsShortcutsOpen: Dispatch<SetStateAction<boolean>>;
  questionElapsedSeconds: number;
  toggleFlagQuestion: (index: number) => void;
  timeLeft: number | null;
  formatTime: (seconds: number) => string;
  quizQuestions: QuizQuestion[];
  selectedQuiz: Quiz;
  question: QuizQuestion;
  isSpeechSupported: ReturnType<typeof useQuestionSpeech>['isSupported'];
  toggleSpeech: ReturnType<typeof useQuestionSpeech>['toggle'];
  isSpeaking: ReturnType<typeof useQuestionSpeech>['isSpeaking'];
  a11ySettings: ReturnType<typeof useAccessibilitySettings>['settings'];
  selectedAnswer: number | null;
  selectAnswer: (index: number, targetQuestionIndex?: number) => void;
  setConfidenceRatings: Dispatch<
    SetStateAction<Record<number, 'sure' | 'unsure' | 'guess'>>
  >;
  confidenceRatings: Record<number, 'sure' | 'unsure' | 'guess'>;
  isHintLadderOpen: boolean;
  setIsHintLadderOpen: Dispatch<SetStateAction<boolean>>;
  setShowSmartboardSolution: Dispatch<SetStateAction<boolean>>;
  showSmartboardSolution: boolean;
  previousQuestion: () => void;
  nextQuestion: () => void;
  answers: { [key: number]: number };
  flaggedQuestions: Set<number>;
  jumpToQuestion: (index: number) => void;
  maxOptionsCount: number;
  clearAnswer: (targetQuestionIndex?: number) => void;
  user: AppUser;
  handleFinishQuiz: () => void;
  isScratchpadOpen: boolean;
  isShortcutsOpen: boolean;
  isOpticalSheetOpen: boolean;
  isGlossaryOpen: boolean;
  textAnswers?: Record<number, string>;
  setTextAnswers?: Dispatch<SetStateAction<Record<number, string>>>;
  rubricEvaluations?: Record<number, number[]>;
  setRubricEvaluations?: Dispatch<SetStateAction<Record<number, number[]>>>;
};

export function ActiveQuizView({
  isFocusMode,
  isOnline,
  isSmartboardMode,
  isOpticalDocked,
  questionCardRef,
  isDrawingOverlayActive,
  setIsDrawingOverlayActive,
  currentQuestion,
  resetQuiz,
  setIsScratchpadOpen,
  setIsOpticalDocked,
  setIsOpticalSheetOpen,
  setIsGlossaryOpen,
  setIsSpotMistakeOpen,
  setIsMathLabOpen,
  toggleDyslexicMode,
  isDyslexicMode,
  setIsSmartboardMode,
  setIsA11yModalOpen,
  setIsFocusMode,
  setIsShortcutsOpen,
  questionElapsedSeconds,
  toggleFlagQuestion,
  timeLeft,
  formatTime,
  quizQuestions,
  selectedQuiz,
  question,
  isSpeechSupported,
  toggleSpeech,
  isSpeaking,
  a11ySettings,
  selectedAnswer,
  selectAnswer,
  setConfidenceRatings,
  confidenceRatings,
  isHintLadderOpen,
  setIsHintLadderOpen,
  setShowSmartboardSolution,
  showSmartboardSolution,
  previousQuestion,
  nextQuestion,
  answers,
  flaggedQuestions,
  jumpToQuestion,
  maxOptionsCount,
  clearAnswer,
  user,
  handleFinishQuiz,
  isScratchpadOpen,
  isShortcutsOpen,
  isOpticalSheetOpen,
  isGlossaryOpen,
  textAnswers = {},
  setTextAnswers,
  rubricEvaluations = {},
  setRubricEvaluations,
}: ActiveQuizViewProps) {
  const isCurrentAnswered =
    selectedAnswer !== null ||
    (textAnswers[currentQuestion] !== undefined &&
      textAnswers[currentQuestion].trim().length > 0);
  return (
    <main
      className={`page-surface testler-page min-h-screen gradient-bg flex flex-col items-center justify-center p-3 sm:p-6 transition-all ${
        isFocusMode ? 'bg-surface-0 p-2 sm:p-4' : ''
      }`}
    >
      {/* Çevrimdışı Güvence Şeridi */}
      {!isOnline && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-tone-warn-border bg-tone-warn-bg px-4 py-1.5 text-xs font-semibold text-tone-warn-fg shadow-xl backdrop-blur-md">
          <WifiOff className="h-3.5 w-3.5" />
          <span>
            Çevrimdışı Mod: İşaretlemeleriniz cihazınızda güvende tutuluyor.
          </span>
        </div>
      )}

      <div
        className={`w-full relative z-10 animate-fade-up ${
          isSmartboardMode
            ? 'max-w-6xl'
            : isOpticalDocked
              ? 'max-w-6xl'
              : isFocusMode
                ? 'max-w-4xl'
                : 'max-w-3xl'
        }`}
      >
        <div
          className={
            isOpticalDocked ? 'flex flex-col lg:flex-row gap-6 items-start' : ''
          }
        >
          <div
            ref={questionCardRef}
            className={`flex-1 w-full bg-surface-1 rounded-3xl p-5 sm:p-8 space-y-6 relative ${
              isSmartboardMode
                ? 'border-tone-warn-border bg-surface-0/98 shadow-2xl p-6 sm:p-10'
                : isFocusMode
                  ? 'border-border-default shadow-2xl bg-surface-0/95'
                  : ''
            }`}
          >
            {/* Soru Üzerine Çizim Katmanı */}
            <QuestionDrawingOverlay
              isActive={isDrawingOverlayActive}
              onClose={() => setIsDrawingOverlayActive(false)}
              questionIndex={currentQuestion}
              containerRef={questionCardRef}
            />

            {/* Üst Eylem ve Zamanlayıcı Çubuğu */}
            <QuizToolbar
              resetQuiz={resetQuiz}
              setIsDrawingOverlayActive={setIsDrawingOverlayActive}
              isDrawingOverlayActive={isDrawingOverlayActive}
              setIsScratchpadOpen={setIsScratchpadOpen}
              setIsOpticalDocked={setIsOpticalDocked}
              setIsOpticalSheetOpen={setIsOpticalSheetOpen}
              isOpticalDocked={isOpticalDocked}
              setIsGlossaryOpen={setIsGlossaryOpen}
              setIsSpotMistakeOpen={setIsSpotMistakeOpen}
              setIsMathLabOpen={setIsMathLabOpen}
              toggleDyslexicMode={toggleDyslexicMode}
              isDyslexicMode={isDyslexicMode}
              setIsSmartboardMode={setIsSmartboardMode}
              isSmartboardMode={isSmartboardMode}
              setIsA11yModalOpen={setIsA11yModalOpen}
              setIsFocusMode={setIsFocusMode}
              isFocusMode={isFocusMode}
              setIsShortcutsOpen={setIsShortcutsOpen}
              currentQuestion={currentQuestion}
              questionElapsedSeconds={questionElapsedSeconds}
              toggleFlagQuestion={toggleFlagQuestion}
              timeLeft={timeLeft}
              formatTime={formatTime}
            />

            {/* İlerleme Çubuğu */}
            <div>
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="text-tone-info-fg dark:text-tone-info-fg font-semibold">
                  Soru {currentQuestion + 1} / {quizQuestions.length}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full bg-gradient-to-r ${getDifficultyColor(
                    selectedQuiz.difficulty,
                  )} text-primary font-semibold text-[11px]`}
                >
                  {selectedQuiz.difficulty}
                </span>
              </div>

              <div className="h-2 bg-surface-2 dark:bg-surface-3 rounded-full overflow-hidden border border-border-default dark:border-border-default">
                <div
                  className="h-full transition-all duration-300 ease-out bg-accent-bg"
                  style={{
                    width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Soru Gövdesi */}
            <QuizQuestionContent
              currentQuestion={currentQuestion}
              isDyslexicMode={isDyslexicMode}
              isSmartboardMode={isSmartboardMode}
              question={question}
              isSpeechSupported={isSpeechSupported}
              toggleSpeech={toggleSpeech}
              isSpeaking={isSpeaking}
              selectedQuiz={selectedQuiz}
              a11ySettings={a11ySettings}
              selectedAnswer={selectedAnswer}
              selectAnswer={selectAnswer}
              setConfidenceRatings={setConfidenceRatings}
              confidenceRatings={confidenceRatings}
              isHintLadderOpen={isHintLadderOpen}
              setIsHintLadderOpen={setIsHintLadderOpen}
              setShowSmartboardSolution={setShowSmartboardSolution}
              showSmartboardSolution={showSmartboardSolution}
              textAnswers={textAnswers}
              onTextAnswerChange={(text, qIdx) => {
                const targetIdx = qIdx !== undefined ? qIdx : currentQuestion;
                setTextAnswers?.((prev) => ({ ...prev, [targetIdx]: text }));
              }}
              rubricEvaluations={rubricEvaluations}
              onToggleRubric={(rIdx, qIdx) => {
                const targetIdx = qIdx !== undefined ? qIdx : currentQuestion;
                setRubricEvaluations?.((prev) => {
                  const current = prev[targetIdx] || [];
                  const next = current.includes(rIdx)
                    ? current.filter((x) => x !== rIdx)
                    : [...current, rIdx];
                  return { ...prev, [targetIdx]: next };
                });
              }}
              onOpenScratchpad={() => setIsScratchpadOpen(true)}
            />

            {/* İleri / Geri Butonları */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[auto_1fr] pt-2">
              <button
                type="button"
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border-default dark:border-border-default bg-surface-1 dark:bg-surface-1/5 px-5 text-sm font-semibold text-primary dark:text-tertiary transition-colors hover:bg-surface-2 dark:hover:bg-surface-1/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-border-strong disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Önceki
              </button>
              <button
                type="button"
                onClick={nextQuestion}
                disabled={!isCurrentAnswered}
                className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                  selectedAnswer !== null
                    ? 'hover:-translate-y-0.5 bg-accent-bg hover:bg-accent-bg text-primary dark:text-primary shadow-btn-3d-green active:translate-y-1 active:shadow-none'
                    : 'bg-surface-2 dark:bg-surface-3/60 text-tertiary dark:text-secondary border border-border-default dark:border-transparent cursor-not-allowed'
                }`}
              >
                {currentQuestion < quizQuestions.length - 1 ? (
                  <>
                    Sonraki soru
                    <ChevronRight className="w-5 h-5" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    Testi bitir
                    <Trophy className="w-5 h-5" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>

            {/* Soru Navigasyon Haritası */}
            <div className="pt-4 border-t border-border-default">
              <QuizQuestionPalette
                totalQuestions={quizQuestions.length}
                currentIndex={currentQuestion}
                answers={answers}
                flaggedQuestions={flaggedQuestions}
                onSelectQuestion={jumpToQuestion}
                onToggleFlag={toggleFlagQuestion}
              />
            </div>
          </div>

          {/* Sabitlenmiş Yan Optik Form (Bölünmüş Ekran - Masaüstü) */}
          {isOpticalDocked && (
            <div className="w-full lg:w-80 shrink-0 hidden lg:block">
              <QuizOpticalSheetModal
                isOpen={true}
                onClose={() => setIsOpticalDocked(false)}
                totalQuestions={quizQuestions.length}
                currentIndex={currentQuestion}
                answers={answers}
                flaggedQuestions={flaggedQuestions}
                optionsCount={maxOptionsCount}
                isDocked={true}
                onToggleDock={() => {
                  setIsOpticalDocked(false);
                  setIsOpticalSheetOpen(true);
                }}
                onSelectQuestion={jumpToQuestion}
                onSelectAnswer={(qIdx, optIdx) => {
                  selectAnswer(optIdx, qIdx);
                }}
                onClearAnswer={clearAnswer}
                quizTitle={selectedQuiz?.title}
                studentName={user?.name || 'Öğrenci'}
                onSubmit={handleFinishQuiz}
              />
            </div>
          )}
        </div>
      </div>

      {/* Karalama Tahtası Modalı */}
      <ScratchpadModal
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
        title={`Soru ${currentQuestion + 1} — Karalama & İşlem Tahtası`}
        questionContext={
          question
            ? {
                questionText: question.question,
                options: question.options,
                imageUrl: question.question_image_url,
              }
            : undefined
        }
      />

      {/* Klavye Kısayolları Modalı */}
      <QuizShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Optik Form Modalı (Docked değilken açılır) */}
      {!isOpticalDocked && (
        <QuizOpticalSheetModal
          isOpen={isOpticalSheetOpen}
          onClose={() => setIsOpticalSheetOpen(false)}
          totalQuestions={quizQuestions.length}
          currentIndex={currentQuestion}
          answers={answers}
          flaggedQuestions={flaggedQuestions}
          optionsCount={maxOptionsCount}
          isDocked={false}
          onToggleDock={() => {
            setIsOpticalSheetOpen(false);
            setIsOpticalDocked(true);
          }}
          onSelectQuestion={jumpToQuestion}
          onSelectAnswer={(qIdx, optIdx) => {
            selectAnswer(optIdx, qIdx);
          }}
          onClearAnswer={clearAnswer}
          quizTitle={selectedQuiz?.title}
          studentName={user?.name || 'Öğrenci'}
          onSubmit={handleFinishQuiz}
        />
      )}

      {/* Matematik Kavram Sözlüğü Modalı */}
      <MathGlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />
    </main>
  );
}
