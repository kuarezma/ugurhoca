import dynamic from 'next/dynamic';

export const ScratchpadModal = dynamic(
  () => import('@/components/ScratchpadModal'),
  { ssr: false },
);

export const QuizMistakeReviewModal = dynamic(
  () =>
    import('@/features/quizzes/components/QuizMistakeReviewModal').then(
      (m) => ({
        default: m.QuizMistakeReviewModal,
      }),
    ),
  { ssr: false },
);

export const MistakeNotebookModal = dynamic(
  () =>
    import('@/features/quizzes/components/MistakeNotebookModal').then((m) => ({
      default: m.MistakeNotebookModal,
    })),
  { ssr: false },
);

export const QuizShortcutsModal = dynamic(
  () =>
    import('@/features/quizzes/components/QuizShortcutsModal').then((m) => ({
      default: m.QuizShortcutsModal,
    })),
  { ssr: false },
);

export const SpotTheMistakeModal = dynamic(
  () =>
    import('@/features/quizzes/components/SpotTheMistakeModal').then((m) => ({
      default: m.SpotTheMistakeModal,
    })),
  { ssr: false },
);

export const InteractiveMathLabModal = dynamic(
  () =>
    import('@/features/programs/components/InteractiveMathLabModal').then(
      (m) => ({
        default: m.InteractiveMathLabModal,
      }),
    ),
  { ssr: false },
);

export const AccessibilitySettingsModal = dynamic(
  () =>
    import('@/components/AccessibilitySettingsModal').then((m) => ({
      default: m.AccessibilitySettingsModal,
    })),
  { ssr: false },
);

export const PrintableWorksheetModal = dynamic(
  () =>
    import('@/features/quizzes/components/PrintableWorksheetModal').then(
      (m) => ({
        default: m.PrintableWorksheetModal,
      }),
    ),
  { ssr: false },
);

export const OfflineStudyPackageModal = dynamic(
  () =>
    import('@/features/quizzes/components/OfflineStudyPackageModal').then(
      (m) => ({
        default: m.OfflineStudyPackageModal,
      }),
    ),
  { ssr: false },
);

export const LearningOutcomeAnalysisModal = dynamic(
  () =>
    import('@/features/quizzes/components/LearningOutcomeAnalysisModal').then(
      (m) => ({
        default: m.LearningOutcomeAnalysisModal,
      }),
    ),
  { ssr: false },
);

export const QuizOpticalSheetModal = dynamic(
  () =>
    import('@/features/quizzes/components/QuizOpticalSheetModal').then((m) => ({
      default: m.QuizOpticalSheetModal,
    })),
  { ssr: false },
);

export const WeeklyMockLeagueModal = dynamic(
  () =>
    import('@/features/quizzes/components/WeeklyMockLeagueModal').then((m) => ({
      default: m.WeeklyMockLeagueModal,
    })),
  { ssr: false },
);

export const MathGlossaryModal = dynamic(
  () =>
    import('@/features/programs/components/MathGlossaryModal').then((m) => ({
      default: m.MathGlossaryModal,
    })),
  { ssr: false },
);

export const ExamPacingStrategyModal = dynamic(
  () =>
    import('@/features/quizzes/components/ExamPacingStrategyModal').then(
      (m) => ({
        default: m.ExamPacingStrategyModal,
      }),
    ),
  { ssr: false },
);

export const MathText = dynamic(() => import('@/components/MathText'));

export const QuestionHintLadder = dynamic(() =>
  import('@/features/quizzes/components/QuestionHintLadder').then(
    (m) => m.QuestionHintLadder,
  ),
);

export const QuizResultsView = dynamic(() =>
  import('@/features/quizzes/components/QuizResultsView').then(
    (m) => m.QuizResultsView,
  ),
);
