import type { AppUser } from '@/types';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback } from 'react';

import { useRouter } from 'next/navigation';
import { signOutClient } from '@/lib/auth-client';
import { useAdminModalState } from '@/features/admin/hooks/useAdminModalState';
import {
  discoverAdminWorksheetCandidates,
  importAdminAnnualPlan,
  loadAdminQuizQuestions,
} from '@/features/admin/queries';
import type {
  AdminAssignment as Assignment,
  AdminFormState,
  AdminQuiz as Quiz,
  AdminQuizQuestion as QuizQuestion,
  AdminStudentProfileData,
  AdminUser,
  AnnualPlanItem,
  WorksheetCandidateDiscoveryResult,
} from '@/features/admin/types';

type UseAdminNavigationProps = {
  router: ReturnType<typeof useRouter>;
  setQuizQuestions: Dispatch<SetStateAction<QuizQuestion[]>>;
  setSelectedQuiz: ReturnType<typeof useAdminModalState>['setSelectedQuiz'];
  openModal: ReturnType<typeof useAdminModalState>['openModal'];
  setActiveStudentProfileData: Dispatch<
    SetStateAction<AdminStudentProfileData | null>
  >;
  setActiveStudentProfileError: Dispatch<SetStateAction<string | null>>;
  setActiveStudentProfileId: Dispatch<SetStateAction<string | null>>;
  activeStudentProfileId: string | null;
  loadStudentProfile: (studentId: string) => Promise<void>;
  setActiveStudentProfileLoading: Dispatch<SetStateAction<boolean>>;
  loadSubmissions: (assignmentId: string) => Promise<void>;
  openSubmissionsModal: ReturnType<
    typeof useAdminModalState
  >['openSubmissionsModal'];
  loadData: (adminUserId?: string | null) => Promise<void>;
  user: AppUser | null;
};

export function useAdminNavigation({
  router,
  setQuizQuestions,
  setSelectedQuiz,
  openModal,
  setActiveStudentProfileData,
  setActiveStudentProfileError,
  setActiveStudentProfileId,
  activeStudentProfileId,
  loadStudentProfile,
  setActiveStudentProfileLoading,
  loadSubmissions,
  openSubmissionsModal,
  loadData,
  user,
}: UseAdminNavigationProps) {
  const handleLogout = async () => {
    await signOutClient();
    router.push('/');
  };

  const loadQuizQuestions = async (quizId: string) => {
    setQuizQuestions(await loadAdminQuizQuestions(quizId));
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Bilinmiyor';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      timeZone: 'Europe/Istanbul',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const getQuizFormState = (quiz: Quiz): AdminFormState => ({
    description: quiz.description ?? '',
    difficulty: quiz.difficulty,
    grade: quiz.grade,
    is_active: quiz.is_active ?? true,
    time_limit: quiz.time_limit,
    title: quiz.title,
  });

  const lastGradeUpdate =
    typeof window === 'undefined'
      ? null
      : localStorage.getItem('lastGradeUpdate');

  const handleAddQuizQuestion = async (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    await loadQuizQuestions(quiz.id);
    openModal('addQuestion');
  };

  const handleOpenStudentProfile = async (studentProfile: AdminUser) => {
    setActiveStudentProfileData(null);
    setActiveStudentProfileError(null);
    setActiveStudentProfileId(studentProfile.id);

    if (studentProfile.id === activeStudentProfileId) {
      await loadStudentProfile(studentProfile.id);
    }
  };

  const handleCloseStudentProfile = useCallback(() => {
    setActiveStudentProfileId(null);
    setActiveStudentProfileData(null);
    setActiveStudentProfileError(null);
    setActiveStudentProfileLoading(false);
  }, [
    setActiveStudentProfileData,
    setActiveStudentProfileError,
    setActiveStudentProfileId,
    setActiveStudentProfileLoading,
  ]);

  const handleOpenSubmissions = async (assignment: Assignment) => {
    await loadSubmissions(assignment.id);
    openSubmissionsModal(assignment);
  };

  const handleImportAnnualPlan = async (file: File) => {
    const result = await importAdminAnnualPlan(file);
    await loadData(user?.id);
    return result;
  };

  const handleDiscoverWorksheetCandidates = async (
    item: AnnualPlanItem,
  ): Promise<WorksheetCandidateDiscoveryResult> => {
    const result = await discoverAdminWorksheetCandidates(item.id);
    await loadData(user?.id);
    return result;
  };
  return {
    handleLogout,
    formatDate,
    getQuizFormState,
    lastGradeUpdate,
    handleAddQuizQuestion,
    handleOpenStudentProfile,
    handleCloseStudentProfile,
    handleOpenSubmissions,
    handleImportAnnualPlan,
    handleDiscoverWorksheetCandidates,
  };
}
