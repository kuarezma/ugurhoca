import type { Dispatch, SetStateAction } from 'react';
import {
  FileText,
  Clock,
  ArrowLeft,
  PenTool,
  Maximize2,
  Minimize2,
  BookOpen,
  Keyboard,
  AlertTriangle,
  Compass,
  MonitorPlay,
  Sliders,
  FileSpreadsheet,
} from 'lucide-react';
import { QuizPacingCoach } from '@/features/quizzes/components/QuizPacingCoach';
import { trackFeatureOpen } from '@/lib/analytics';

type QuizToolbarProps = {
  resetQuiz: () => void;
  setIsDrawingOverlayActive: Dispatch<SetStateAction<boolean>>;
  isDrawingOverlayActive: boolean;
  setIsScratchpadOpen: Dispatch<SetStateAction<boolean>>;
  setIsOpticalDocked: Dispatch<SetStateAction<boolean>>;
  setIsOpticalSheetOpen: Dispatch<SetStateAction<boolean>>;
  isOpticalDocked: boolean;
  setIsGlossaryOpen: Dispatch<SetStateAction<boolean>>;
  setIsSpotMistakeOpen: Dispatch<SetStateAction<boolean>>;
  setIsMathLabOpen: Dispatch<SetStateAction<boolean>>;
  toggleDyslexicMode: () => void;
  isDyslexicMode: boolean;
  setIsSmartboardMode: Dispatch<SetStateAction<boolean>>;
  isSmartboardMode: boolean;
  setIsA11yModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsFocusMode: Dispatch<SetStateAction<boolean>>;
  isFocusMode: boolean;
  setIsShortcutsOpen: Dispatch<SetStateAction<boolean>>;
  currentQuestion: number;
  questionElapsedSeconds: number;
  toggleFlagQuestion: (index: number) => void;
  timeLeft: number | null;
  formatTime: (seconds: number) => string;
};

export function QuizToolbar({
  resetQuiz,
  setIsDrawingOverlayActive,
  isDrawingOverlayActive,
  setIsScratchpadOpen,
  setIsOpticalDocked,
  setIsOpticalSheetOpen,
  isOpticalDocked,
  setIsGlossaryOpen,
  setIsSpotMistakeOpen,
  setIsMathLabOpen,
  toggleDyslexicMode,
  isDyslexicMode,
  setIsSmartboardMode,
  isSmartboardMode,
  setIsA11yModalOpen,
  setIsFocusMode,
  isFocusMode,
  setIsShortcutsOpen,
  currentQuestion,
  questionElapsedSeconds,
  toggleFlagQuestion,
  timeLeft,
  formatTime,
}: QuizToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default pb-4">
      <button
        onClick={resetQuiz}
        className="text-secondary dark:text-tertiary hover:text-primary dark:hover:text-primary flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Testten Çık
      </button>

      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {/* Soru Üzerine Çizim Modu Butonu */}
        <button
          type="button"
          onClick={() => setIsDrawingOverlayActive((prev) => !prev)}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
            isDrawingOverlayActive
              ? 'border-accent-fg bg-accent-bg text-tone-success-fg dark:text-accent-fg shadow-sm'
              : 'border-border-default dark:border-border-default bg-surface-1 dark:bg-surface-1/5 text-primary dark:text-tertiary hover:bg-surface-2 dark:hover:bg-surface-1/10'
          }`}
          title="Soru kartı üzerine doğrudan çizim ve not alma katmanını aç/kapat"
          aria-label="Soruya Çiz"
        >
          <PenTool className="h-3.5 w-3.5 text-tone-info-fg dark:text-tone-info-fg" />
          <span className="hidden sm:inline">Soruya Çiz</span>
        </button>

        {/* Karalama Tahtası Butonu */}
        <button
          type="button"
          onClick={() => {
            setIsScratchpadOpen(true);
            void trackFeatureOpen('scratchpad');
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-tone-warn-border dark:border-border-default bg-tone-warn-bg dark:bg-surface-1/5 px-3 py-1.5 text-xs font-bold text-tone-warn-fg dark:text-tone-warn-fg transition hover:bg-tone-warn-bg dark:hover:bg-surface-1/10 hover:text-tone-warn-fg dark:hover:text-tone-warn-fg"
          title="Karalama ve işlem tahtasını aç (K)"
        >
          <PenTool className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Karalama</span>
        </button>

        {/* Optik Form Butonu */}
        <button
          type="button"
          onClick={() => {
            void trackFeatureOpen('optical_sheet');
            if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
              setIsOpticalDocked((prev) => !prev);
            } else {
              setIsOpticalSheetOpen(true);
            }
          }}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
            isOpticalDocked
              ? 'border-accent-fg bg-accent-bg text-tone-success-fg dark:text-accent-fg'
              : 'border-tone-warn-border dark:border-tone-warn-border bg-tone-warn-bg dark:bg-tone-warn-bg text-tone-warn-fg dark:text-tone-warn-fg hover:bg-tone-warn-bg hover:text-tone-warn-fg'
          }`}
          title="LGS / YKS dijital optik form simülasyonunu aç / sabitle (O)"
        >
          <FileText className="h-3.5 w-3.5 text-tone-warn-fg dark:text-tone-warn-fg" />
          <span>{isOpticalDocked ? 'Optik Sabit' : 'Optik Form'}</span>
        </button>

        {/* Matematik Kavram Sözlüğü Butonu */}
        <button
          type="button"
          onClick={() => {
            setIsGlossaryOpen(true);
            void trackFeatureOpen('math_glossary');
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-tone-info-border dark:border-tone-info-border bg-tone-info-bg dark:bg-tone-info-bg px-3 py-1.5 text-xs font-bold text-tone-info-fg dark:text-tone-info-fg transition hover:bg-tone-info-bg dark:hover:bg-tone-info-bg"
          title="Matematik Kavramlar ve Terimler Rehberini Aç (Shift + K)"
        >
          <BookOpen className="h-3.5 w-3.5 text-tone-info-fg dark:text-tone-info-fg" />
          <span className="hidden sm:inline">Kavramlar</span>
        </button>

        {/* Hatayı Bul Etkinlik Butonu */}
        <button
          type="button"
          onClick={() => {
            setIsSpotMistakeOpen(true);
            void trackFeatureOpen('spot_the_mistake');
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-tone-danger-border dark:border-tone-danger-border bg-tone-danger-bg dark:bg-tone-danger-bg px-3 py-1.5 text-xs font-bold text-tone-danger-fg dark:text-tone-danger-fg transition hover:bg-tone-danger-bg dark:hover:bg-tone-danger-bg"
          title="Öğrenci çözümlerinde ilk hatalı adımı bulma etkinliği"
        >
          <AlertTriangle className="h-3.5 w-3.5 text-tone-danger-fg dark:text-tone-danger-fg" />
          <span className="hidden sm:inline">Hatayı Bul</span>
        </button>

        {/* Etkileşimli Matematik Lab Butonu */}
        <button
          type="button"
          onClick={() => {
            setIsMathLabOpen(true);
            void trackFeatureOpen('interactive_math_lab');
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-tone-info-border dark:border-tone-info-border bg-tone-info-bg dark:bg-tone-info-bg px-3 py-1.5 text-xs font-bold text-tone-info-fg dark:text-tone-info-fg transition hover:bg-tone-info-bg dark:hover:bg-tone-info-bg"
          title="Dinamik geometri ve etkileşimli deney laboratuvarı"
        >
          <Compass className="h-3.5 w-3.5 text-tone-info-fg dark:text-tone-info-fg" />
          <span className="hidden sm:inline">Matematik Lab</span>
        </button>

        {/* Rahat Okuma / Disleksi Modu Butonu */}
        <button
          type="button"
          onClick={toggleDyslexicMode}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
            isDyslexicMode
              ? 'border-accent-fg bg-accent-bg text-tone-success-fg dark:text-accent-fg shadow-sm'
              : 'border-border-default dark:border-border-default bg-surface-1 dark:bg-surface-1/5 text-primary dark:text-tertiary hover:bg-surface-2 dark:hover:bg-surface-1/10'
          }`}
          title={
            isDyslexicMode
              ? 'Normal yazı tipine dön'
              : 'Disleksi dostu rahat okuma modunu aç (D)'
          }
          aria-pressed={isDyslexicMode}
        >
          <BookOpen className="h-3.5 w-3.5 text-tone-success-fg dark:text-tone-success-fg" />
          <span className="hidden sm:inline">
            {isDyslexicMode ? 'Rahat Okuma Açık' : 'Rahat Okuma'}
          </span>
        </button>

        {/* Akıllı Tahta / Sunum Modu Butonu */}
        <button
          type="button"
          onClick={() => setIsSmartboardMode((prev) => !prev)}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
            isSmartboardMode
              ? 'border-accent-fg bg-accent-bg text-accent-fg shadow-md'
              : 'border-border-default dark:border-border-default bg-surface-1 dark:bg-surface-1/5 text-primary dark:text-tertiary hover:bg-surface-2 dark:hover:bg-surface-1/10'
          }`}
          title={
            isSmartboardMode
              ? 'Standart görünüme dön'
              : 'Sınıf akıllı tahta projeksiyon modunu aç'
          }
          aria-pressed={isSmartboardMode}
        >
          <MonitorPlay className="h-3.5 w-3.5 text-tone-warn-fg dark:text-tone-warn-fg" />
          <span className="hidden sm:inline">
            {isSmartboardMode ? 'Tahta Modu Açık' : 'Akıllı Tahta'}
          </span>
        </button>

        {/* Görünüm & Erişilebilirlik Butonu */}
        <button
          type="button"
          onClick={() => setIsA11yModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border-default dark:border-border-default bg-surface-1 dark:bg-surface-1/5 text-primary dark:text-tertiary hover:bg-surface-2 dark:hover:bg-surface-1/10 px-3 py-1.5 text-xs font-bold transition"
          title="Yazı boyutu, dokunma alanı ve animasyon ayarları (WCAG 2.2)"
        >
          <Sliders className="h-3.5 w-3.5 text-tone-info-fg" />
          <span className="hidden sm:inline">Görünüm & Erişilebilirlik</span>
        </button>

        {/* Odak Modu Butonu */}
        <button
          type="button"
          onClick={() => setIsFocusMode((prev) => !prev)}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
            isFocusMode
              ? 'border-accent-fg bg-accent-bg text-accent-fg'
              : 'border-border-default dark:border-border-default bg-surface-1 dark:bg-surface-1/5 text-primary dark:text-tertiary hover:bg-surface-2 dark:hover:bg-surface-1/10 hover:text-primary dark:hover:text-primary'
          }`}
          title={
            isFocusMode ? 'Normal görünüme dön' : 'Tam odaklanma modunu aç'
          }
        >
          {isFocusMode ? (
            <>
              <Minimize2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Odak Modundan Çık</span>
            </>
          ) : (
            <>
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Odak Modu</span>
            </>
          )}
        </button>

        {/* Kısayollar Butonu */}
        <button
          type="button"
          onClick={() => setIsShortcutsOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border-default dark:border-border-default bg-surface-1 dark:bg-surface-1/5 px-3 py-1.5 text-xs font-bold text-primary dark:text-tertiary hover:bg-surface-2 dark:hover:bg-surface-1/10 hover:text-primary dark:hover:text-primary transition"
          title="Klavye Kısayolları (?)"
          aria-label="Klavye kısayollarını göster"
        >
          <Keyboard className="h-3.5 w-3.5 text-tone-info-fg dark:text-tone-info-fg" />
          <span className="hidden sm:inline">Kısayollar</span>
          <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-tone-info-bg dark:bg-surface-1/10 text-tone-info-fg dark:text-tone-info-fg">
            ?
          </span>
        </button>

        {/* Hızlı Optik Kodlama Butonu */}
        <button
          type="button"
          onClick={() => setIsOpticalSheetOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-tone-warn-border dark:border-tone-warn-border bg-tone-warn-bg dark:bg-tone-warn-bg px-3 py-1.5 text-xs font-bold text-tone-warn-fg dark:text-tone-warn-fg hover:bg-tone-warn-bg dark:hover:bg-tone-warn-bg transition shadow-xs"
          title="Optik Formu Aç (Hızlı İşaretleme)"
          aria-label="Optik Formu Aç"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-tone-warn-fg dark:text-tone-warn-fg" />
          <span className="hidden sm:inline">Optik Form</span>
        </button>

        {/* LGS / Sınav Tempo Koçu (Canlı) */}
        <QuizPacingCoach
          mode="live"
          currentQuestionIndex={currentQuestion}
          questionElapsedSeconds={questionElapsedSeconds}
          onFlagCurrentQuestion={() => toggleFlagQuestion(currentQuestion)}
        />

        {/* Süre */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            timeLeft !== null && timeLeft <= 30
              ? 'bg-tone-danger-bg text-tone-danger-fg dark:text-tone-danger-fg animate-pulse border border-tone-danger-border'
              : 'bg-surface-1 dark:bg-surface-3/80 text-primary dark:text-tertiary border border-border-default dark:border-border-default'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{timeLeft !== null ? formatTime(timeLeft) : ''}</span>
        </div>
      </div>
    </div>
  );
}
