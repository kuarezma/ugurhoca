import type { Dispatch, SetStateAction } from 'react';
import { Volume2, VolumeX, MonitorPlay, MessageCircle } from 'lucide-react';
import { useQuestionSpeech } from '@/features/quizzes/hooks/useQuestionSpeech';
import { useAccessibilitySettings } from '@/hooks/useAccessibilitySettings';

import { Quiz, QuizQuestion } from '@/types/quiz';
import { hasOptionImage, QuestionImage, OptionMedia } from './helpers';
import { MathText, QuestionHintLadder } from './lazy';

type QuizQuestionContentProps = {
  currentQuestion: number;
  isDyslexicMode: boolean;
  isSmartboardMode: boolean;
  question: QuizQuestion;
  isSpeechSupported: ReturnType<typeof useQuestionSpeech>['isSupported'];
  toggleSpeech: ReturnType<typeof useQuestionSpeech>['toggle'];
  isSpeaking: ReturnType<typeof useQuestionSpeech>['isSpeaking'];
  selectedQuiz: Quiz;
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
};

export function QuizQuestionContent({
  currentQuestion,
  isDyslexicMode,
  isSmartboardMode,
  question,
  isSpeechSupported,
  toggleSpeech,
  isSpeaking,
  selectedQuiz,
  a11ySettings,
  selectedAnswer,
  selectAnswer,
  setConfidenceRatings,
  confidenceRatings,
  isHintLadderOpen,
  setIsHintLadderOpen,
  setShowSmartboardSolution,
  showSmartboardSolution,
}: QuizQuestionContentProps) {
  return (
    <div
      key={currentQuestion}
      className={`animate-fade-up ${isDyslexicMode ? 'font-dyslexic accessible-reading-mode' : ''}`}
      role="group"
      aria-label={`Soru ${currentQuestion + 1}`}
    >
      <div className="flex items-start justify-between gap-3 mb-6">
        <MathText
          as="h2"
          className={`flex-1 font-bold text-primary dark:text-primary font-display leading-snug ${
            isSmartboardMode
              ? 'text-2xl sm:text-3xl tracking-wide'
              : 'text-lg sm:text-2xl'
          } ${isDyslexicMode ? 'font-dyslexic accessible-reading-mode' : ''}`}
        >
          {question.question}
        </MathText>

        {isSpeechSupported && (
          <button
            type="button"
            onClick={() => {
              const optionsSpeech = question.options
                ? question.options
                    .map(
                      (opt: string, idx: number) =>
                        `${String.fromCharCode(65 + idx)} şıkkı: ${opt}`,
                    )
                    .join('. ')
                : '';
              toggleSpeech(`${question.question}. ${optionsSpeech}`);
            }}
            title={isSpeaking ? 'Seslendirmeyi durdur' : 'Soruyu sesli dinle'}
            aria-label={
              isSpeaking ? 'Seslendirmeyi durdur' : 'Soruyu sesli dinle'
            }
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all ${
              isSpeaking
                ? 'bg-tone-warn-bg text-tone-warn-fg dark:text-tone-warn-fg border border-tone-warn-border animate-pulse'
                : 'bg-surface-1 dark:bg-surface-1/5 text-secondary dark:text-tertiary hover:text-primary dark:hover:text-primary hover:bg-surface-2 dark:hover:bg-surface-1/10 border border-border-default dark:border-border-default'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="h-4 w-4 text-tone-warn-fg dark:text-tone-warn-fg" />
                <span className="hidden sm:inline">Durdur</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4" />
                <span className="hidden sm:inline">Sesli Oku</span>
              </>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent('open-teacher-chat-with-question', {
                detail: {
                  questionIndex: currentQuestion,
                  questionText: question.question,
                  quizTitle: selectedQuiz.title,
                },
              }),
            );
          }}
          title="Bu soruyu Uğur Hoca'ya sor"
          aria-label="Bu soruyu Uğur Hoca'ya sor"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold bg-tone-info-bg dark:bg-tone-info-bg text-tone-info-fg dark:text-tone-info-fg border border-tone-info-border dark:border-tone-info-border hover:bg-tone-info-bg dark:hover:bg-tone-info-bg transition-all shadow-xs"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Hocama Sor</span>
        </button>
      </div>

      {question.question_image_url ? (
        <QuestionImage
          alt={`Soru ${currentQuestion + 1} görseli`}
          src={question.question_image_url}
        />
      ) : null}

      <div
        className={`space-y-3 ${a11ySettings.spaciousOptions ? 'space-y-5 sm:space-y-6' : ''}`}
        role="radiogroup"
        aria-label="Cevap seçenekleri"
      >
        {question.options.map((option: string, i: number) => {
          const selected = selectedAnswer === i;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => selectAnswer(i)}
              className={`w-full rounded-2xl text-left transition-all duration-200 flex items-center gap-3.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                a11ySettings.touchTarget === 'comfortable_44'
                  ? 'min-h-[4rem] p-4 sm:p-5'
                  : 'min-h-[3.25rem] p-4'
              } ${
                selected
                  ? 'shadow-md scale-[1.01] bg-accent-bg text-primary dark:text-primary'
                  : 'bg-surface-1 hover:bg-surface-2/80 dark:bg-surface-3/60 dark:hover:bg-surface-3/60 text-primary dark:text-tertiary hover:translate-x-0.5 border border-border-default dark:border-border-default shadow-sm'
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-sm ${
                  selected
                    ? 'bg-surface-1/25 text-primary dark:text-primary shadow-sm'
                    : 'bg-surface-2 dark:bg-surface-1/10 text-primary dark:text-tertiary'
                }`}
                aria-hidden="true"
              >
                {String.fromCharCode(65 + i)}
              </span>
              <div
                className={`flex-1 ${
                  a11ySettings.fontSize === 'xlarge'
                    ? 'text-base sm:text-lg'
                    : a11ySettings.fontSize === 'large'
                      ? 'text-sm sm:text-base'
                      : 'text-xs sm:text-sm'
                } ${isDyslexicMode ? 'font-dyslexic accessible-reading-mode' : ''}`}
              >
                <MathText>{option}</MathText>
                {hasOptionImage(question, i) ? (
                  <OptionMedia
                    alt={`Soru ${currentQuestion + 1} şık ${String.fromCharCode(65 + i)} görseli`}
                    src={question.option_image_urls?.[i] || ''}
                  />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {/* Cevaba Güven Derecesi Seçimi (Metakognisyon) */}
      {selectedAnswer !== null && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-surface-2/70 dark:bg-surface-1/5 border border-border-default dark:border-border-default text-xs animate-fade-in">
          <span className="text-tertiary font-medium">
            Cevabından ne kadar eminsin?
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                setConfidenceRatings((prev) => ({
                  ...prev,
                  [currentQuestion]: 'sure',
                }))
              }
              className={`px-3 py-1 rounded-xl font-bold transition ${
                confidenceRatings[currentQuestion] === 'sure'
                  ? 'bg-accent-bg shadow-sm text-primary dark:text-primary'
                  : 'bg-surface-2 dark:bg-surface-1/10 text-secondary dark:text-tertiary hover:bg-surface-3 dark:hover:bg-surface-1/15'
              }`}
            >
              🎯 Eminim
            </button>
            <button
              type="button"
              onClick={() =>
                setConfidenceRatings((prev) => ({
                  ...prev,
                  [currentQuestion]: 'unsure',
                }))
              }
              className={`px-3 py-1 rounded-xl font-bold transition ${
                confidenceRatings[currentQuestion] === 'unsure'
                  ? 'bg-accent-bg shadow-sm text-primary dark:text-primary'
                  : 'bg-surface-2 dark:bg-surface-1/10 text-secondary dark:text-tertiary hover:bg-surface-3 dark:hover:bg-surface-1/15'
              }`}
            >
              🤔 Kararsızım
            </button>
            <button
              type="button"
              onClick={() =>
                setConfidenceRatings((prev) => ({
                  ...prev,
                  [currentQuestion]: 'guess',
                }))
              }
              className={`px-3 py-1 rounded-xl font-bold transition ${
                confidenceRatings[currentQuestion] === 'guess'
                  ? 'bg-accent-bg shadow-sm text-primary dark:text-primary'
                  : 'bg-surface-2 dark:bg-surface-1/10 text-secondary dark:text-tertiary hover:bg-surface-3 dark:hover:bg-surface-1/15'
              }`}
            >
              🎲 Tahmin Ettim
            </button>
          </div>
        </div>
      )}

      {/* Kademeli İpucu Sistemi */}
      <QuestionHintLadder
        question={question}
        questionIndex={currentQuestion}
        isOpen={isHintLadderOpen}
        onToggleOpen={() => setIsHintLadderOpen((prev) => !prev)}
        quizTitle={selectedQuiz?.title}
      />

      {/* Akıllı Tahta / Öğretmen Çözüm Açma Paneli */}
      {isSmartboardMode && (
        <div className="p-4 rounded-2xl bg-tone-warn-bg border border-tone-warn-border text-left animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-tone-warn-fg dark:text-tone-warn-fg flex items-center gap-1.5">
              <MonitorPlay className="w-4 h-4" />
              <span>Akıllı Tahta: Öğretmen Çözüm Paneli</span>
            </span>
            <button
              type="button"
              onClick={() => setShowSmartboardSolution((prev) => !prev)}
              className="px-3 py-1 rounded-xl text-xs font-bold transition bg-accent-bg hover:bg-accent-bg text-primary dark:text-primary shadow-btn-3d-green active:translate-y-1 active:shadow-none"
            >
              {showSmartboardSolution ? 'Çözümü Gizle' : 'Çözümü Tahtada Aç'}
            </button>
          </div>
          {showSmartboardSolution && (
            <div className="mt-3 pt-3 border-t border-tone-warn-border text-sm text-primary dark:text-tertiary space-y-2">
              <div className="font-bold text-tone-success-fg">
                Doğru Cevap: {String.fromCharCode(65 + question.correct_index)}){' '}
                {question.options[question.correct_index]}
              </div>
              {question.explanation && (
                <div className="text-xs sm:text-sm leading-relaxed text-secondary dark:text-tertiary bg-surface-2 dark:bg-surface-0/60 p-3 rounded-xl border border-border-default dark:border-border-default">
                  <MathText>{question.explanation}</MathText>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
