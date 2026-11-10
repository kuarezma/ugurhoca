import type { AppUser } from '@/types';
import type { Dispatch, SetStateAction } from 'react';

import { useToast } from '@/components/Toast';
import { broadcastHomeDocumentsUpdated } from '@/features/home/home-documents-events';
import {
  approveAdminWorksheetCandidate,
  disconnectGoogleDriveConnection,
  loadGoogleDriveAuthUrl,
  scanCurrentWeekWorksheetCandidates,
  updateWorksheetCandidateStatus,
} from '@/features/admin/queries';
import type {
  GoogleDriveConnectionStatus,
  WorksheetCandidate,
  WorksheetCandidateStatus,
  WorksheetCandidateWeekScanResult,
} from '@/features/admin/types';

type GetAdminWorksheetActionsProps = {
  user: AppUser | null;
  setWorksheetCandidates: Dispatch<SetStateAction<WorksheetCandidate[]>>;
  showToast: ReturnType<typeof useToast>['showToast'];
  loadData: (adminUserId?: string | null) => Promise<void>;
  setIsGoogleDriveBusy: Dispatch<SetStateAction<boolean>>;
  setGoogleDriveConnection: Dispatch<
    SetStateAction<GoogleDriveConnectionStatus | null>
  >;
  setIsWeekScanRunning: Dispatch<SetStateAction<boolean>>;
  setLastWeekScanResult: Dispatch<
    SetStateAction<WorksheetCandidateWeekScanResult | null>
  >;
};

export function getAdminWorksheetActions({
  user,
  setWorksheetCandidates,
  showToast,
  loadData,
  setIsGoogleDriveBusy,
  setGoogleDriveConnection,
  setIsWeekScanRunning,
  setLastWeekScanResult,
}: GetAdminWorksheetActionsProps) {
  const handleUpdateWorksheetCandidateStatus = async (
    candidate: WorksheetCandidate,
    status: Extract<WorksheetCandidateStatus, 'pending' | 'rejected'>,
    rejectionReason?: string | null,
  ) => {
    if (!user) return;

    try {
      const updatedCandidate = await updateWorksheetCandidateStatus({
        candidateId: candidate.id,
        rejectionReason,
        reviewedBy: user.id,
        status,
      });
      setWorksheetCandidates((currentCandidates) =>
        currentCandidates.map((currentCandidate) =>
          currentCandidate.id === updatedCandidate.id
            ? updatedCandidate
            : currentCandidate,
        ),
      );
      showToast(
        'success',
        status === 'rejected'
          ? 'Aday test reddedildi.'
          : 'Aday test tekrar beklemeye alındı.',
      );
    } catch (error) {
      showToast(
        'error',
        error instanceof Error
          ? error.message
          : 'Aday test durumu güncellenemedi.',
      );
    }
  };

  const handleApproveWorksheetCandidate = async (
    candidate: WorksheetCandidate,
  ) => {
    try {
      const result = await approveAdminWorksheetCandidate(candidate.id);
      showToast(
        result.notificationWarning ? 'warning' : 'success',
        result.notificationWarning
          ? result.notificationWarning
          : result.notifiedStudents > 0
            ? `Aday test yayınlandı. ${result.notifiedStudents} öğrenciye bildirim gönderildi.`
            : 'Aday test yayınlandı. Bu sınıfta bildirim gönderilecek öğrenci bulunamadı.',
      );
      await loadData(user?.id);
      broadcastHomeDocumentsUpdated();
    } catch (error) {
      showToast(
        'error',
        error instanceof Error ? error.message : 'Aday test yayınlanamadı.',
      );
    }
  };

  const handleConnectGoogleDrive = async () => {
    setIsGoogleDriveBusy(true);
    try {
      const { url } = await loadGoogleDriveAuthUrl();
      window.location.href = url;
    } catch (error) {
      showToast(
        'error',
        error instanceof Error
          ? error.message
          : 'Google Drive bağlantısı başlatılamadı.',
      );
      setIsGoogleDriveBusy(false);
    }
  };

  const handleDisconnectGoogleDrive = async () => {
    setIsGoogleDriveBusy(true);
    try {
      const status = await disconnectGoogleDriveConnection();
      setGoogleDriveConnection(status);
      showToast('success', 'Google Drive bağlantısı kesildi.');
    } catch (error) {
      showToast(
        'error',
        error instanceof Error
          ? error.message
          : 'Google Drive bağlantısı kesilemedi.',
      );
    } finally {
      setIsGoogleDriveBusy(false);
    }
  };

  const handleScanCurrentWeekCandidates = async () => {
    setIsWeekScanRunning(true);
    try {
      const result = await scanCurrentWeekWorksheetCandidates();
      setLastWeekScanResult(result);
      await loadData(user?.id);
      showToast(
        result.inserted > 0 ? 'success' : 'info',
        result.inserted > 0
          ? `${result.inserted} yeni test adayı bulundu.`
          : 'Bu hafta için yeni test adayı bulunamadı.',
      );
    } catch (error) {
      showToast(
        'error',
        error instanceof Error
          ? error.message
          : 'Bu hafta taraması yapılamadı.',
      );
    } finally {
      setIsWeekScanRunning(false);
    }
  };
  return {
    handleUpdateWorksheetCandidateStatus,
    handleApproveWorksheetCandidate,
    handleConnectGoogleDrive,
    handleDisconnectGoogleDrive,
    handleScanCurrentWeekCandidates,
  };
}
