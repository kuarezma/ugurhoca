import type { AppUser } from '@/types';

import { useToast } from '@/components/Toast';
import { useAdminModalState } from '@/features/admin/hooks/useAdminModalState';
import {
  addStudentAdminNote,
  upsertStudentAdminStatus,
} from '@/features/admin/queries';
import type {
  AdminFormState,
  AdminQuiz as Quiz,
  AdminUser,
  StudentAdminStatus,
} from '@/features/admin/types';
import { promptAdminAction } from '@/features/admin/components/AdminActionDialog';

type GetAdminTrackingActionsProps = {
  loadData: (adminUserId?: string | null) => Promise<void>;
  user: AppUser | null;
  activeStudentProfileId: string | null;
  loadStudentProfile: (studentId: string) => Promise<void>;
  showToast: ReturnType<typeof useToast>['showToast'];
  adminStatuses: StudentAdminStatus[];
  openEditQuiz: ReturnType<typeof useAdminModalState>['openEditQuiz'];
  getQuizFormState: (quiz: Quiz) => AdminFormState;
};

export function getAdminTrackingActions({
  loadData,
  user,
  activeStudentProfileId,
  loadStudentProfile,
  showToast,
  adminStatuses,
  openEditQuiz,
  getQuizFormState,
}: GetAdminTrackingActionsProps) {
  const refreshAfterStudentTrackingChange = async (studentId: string) => {
    await loadData(user?.id);
    if (activeStudentProfileId === studentId) {
      await loadStudentProfile(studentId);
    }
  };

  const handleUpdateStudentStatus = async (
    student: AdminUser,
    status: StudentAdminStatus['status'],
    labels?: string[],
    isLabelUpdate = false,
  ) => {
    if (!user) return;

    try {
      // Hızlı etiket eklemek mevcut takip tarihini değiştirmemeli.
      const followUpAt = isLabelUpdate
        ? (adminStatuses.find((entry) => entry.student_id === student.id)
            ?.follow_up_at ?? null)
        : status === 'normal'
          ? null
          : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

      await upsertStudentAdminStatus({
        adminId: user.id,
        followUpAt,
        labels:
          labels ??
          (status === 'risk'
            ? ['risk']
            : status === 'watch'
              ? ['takipte']
              : []),
        status,
        studentId: student.id,
      });
      showToast('success', 'Takip durumu güncellendi.');
      await refreshAfterStudentTrackingChange(student.id);
    } catch (error) {
      showToast(
        'error',
        error instanceof Error ? error.message : 'Takip durumu kaydedilemedi.',
      );
      // Etiket formu hatada taslağı koruyabilsin; diğer çağrıların davranışı sürer.
      if (isLabelUpdate) throw error;
    }
  };

  const handleAddStudentAdminNote = async (student: AdminUser) => {
    if (!user) return;
    const bodyPrompt = await promptAdminAction(
      `${student.name || 'Öğrenci'} için admin notu`,
    );
    const body = bodyPrompt?.trim() || '';

    if (!body) return;

    try {
      await addStudentAdminNote({
        authorId: user.id,
        body,
        studentId: student.id,
      });
      showToast('success', 'Admin notu kaydedildi.');
      await refreshAfterStudentTrackingChange(student.id);
    } catch (error) {
      showToast(
        'error',
        error instanceof Error ? error.message : 'Admin notu kaydedilemedi.',
      );
    }
  };

  const handleEditQuiz = (quiz: Quiz) => {
    openEditQuiz(quiz, getQuizFormState(quiz));
  };
  return {
    handleUpdateStudentStatus,
    handleAddStudentAdminNote,
    handleEditQuiz,
  };
}
