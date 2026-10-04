import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdminPage from './AdminPage';
import type { AdminDashboardData } from '@/features/admin/types';
import {
  loadAdminDashboardData,
  loadAdminLearningActivity,
  loadAdminLiveLessonActivity,
  loadGoogleDriveConnectionStatus,
  loadWorksheetCandidateSourceStatus,
  refreshAdminUsers,
  resolveAdminAuth,
} from '@/features/admin/queries';

const ui = vi.hoisted(() => ({
  router: { push: vi.fn() },
  showToast: vi.fn(),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ui.router }));
vi.mock('next/dynamic', () => ({ default: () => () => null }));
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ showToast: ui.showToast }),
}));
vi.mock('@/components/ThemeToggle', () => ({ ThemeToggle: () => null }));
vi.mock('@/components/ThemeSelectorDropdown', () => ({ ThemeSelectorDropdown: () => null }));
vi.mock('@/features/admin/queries', () => ({
  loadAdminDashboardData: vi.fn(),
  loadAdminLearningActivity: vi.fn(),
  loadAdminLiveLessonActivity: vi.fn(),
  loadGoogleDriveConnectionStatus: vi.fn(),
  loadWorksheetCandidateSourceStatus: vi.fn(),
  refreshAdminUsers: vi.fn(),
  resolveAdminAuth: vi.fn(),
}));

const emptyDashboard: AdminDashboardData = {
  allUsers: [],
  announcements: [],
  annualPlanItems: [],
  adminStatuses: [],
  assignments: [],
  documents: [],
  notifications: [],
  quizResults: [],
  quizzes: [],
  sharedDocs: [],
  studyGoals: [],
  submissions: [],
  worksheetCandidates: [],
  weeklyPlans: [],
  liveLessons: { lessons: [] },
};

describe('Admin initial data flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, '', '/admin');
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    vi.mocked(resolveAdminAuth).mockResolvedValue({
      status: 'ok',
      user: { id: 'admin', name: 'Öğretmen' },
      session: {},
    } as never);
    vi.mocked(loadAdminDashboardData).mockResolvedValue(emptyDashboard);
    vi.mocked(loadAdminLearningActivity).mockResolvedValue({
      activityEvents: [],
      studySessions: [],
    });
    vi.mocked(loadAdminLiveLessonActivity).mockResolvedValue({
      chatMessages: [],
      events: [],
      participants: [],
    });
    vi.mocked(loadGoogleDriveConnectionStatus).mockResolvedValue({
      connected: false,
    });
    vi.mocked(loadWorksheetCandidateSourceStatus).mockResolvedValue({
      configured: false,
      allowedHosts: [],
      sourceUrls: [],
    });
    vi.mocked(refreshAdminUsers).mockResolvedValue([]);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('dashboard tamamlanmadan Drive ve kaynak çağrılarını başlatır; auth state değişimi yeniden yükletmez', async () => {
    const dashboard = Promise.withResolvers<AdminDashboardData>();
    vi.mocked(loadAdminDashboardData).mockReturnValue(dashboard.promise);
    render(<AdminPage />);
    await waitFor(() => {
      expect(loadAdminDashboardData).toHaveBeenCalledOnce();
      expect(loadGoogleDriveConnectionStatus).toHaveBeenCalledOnce();
      expect(loadWorksheetCandidateSourceStatus).toHaveBeenCalledOnce();
    });
    expect(resolveAdminAuth).toHaveBeenCalledOnce();
    expect(loadAdminDashboardData).toHaveBeenCalledWith('admin');
    expect(loadAdminLearningActivity).not.toHaveBeenCalled();
    expect(loadAdminLiveLessonActivity).not.toHaveBeenCalled();
    await act(async () => dashboard.resolve(emptyDashboard));
    expect(loadAdminDashboardData).toHaveBeenCalledOnce();
  });

  it('loads learning and live lesson history only when their tabs open', async () => {
    render(<AdminPage />);
    await waitFor(() => expect(loadAdminDashboardData).toHaveBeenCalledOnce());
    expect(loadAdminLearningActivity).not.toHaveBeenCalled();
    expect(loadAdminLiveLessonActivity).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /Takip Merkezi/ }));
    await waitFor(() => expect(loadAdminLearningActivity).toHaveBeenCalledOnce());
    expect(loadAdminLiveLessonActivity).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /Canlı Dersler/ }));
    await waitFor(() => expect(loadAdminLiveLessonActivity).toHaveBeenCalledOnce());

    fireEvent.click(screen.getByRole('button', { name: /Sınıfım/ }));
    expect(loadAdminLearningActivity).toHaveBeenCalledOnce();
  });

  it('does not start a second activity scan while the first scan is pending', async () => {
    const learning = Promise.withResolvers<{
      activityEvents: [];
      studySessions: [];
    }>();
    vi.mocked(loadAdminLearningActivity).mockReturnValue(learning.promise);
    render(<AdminPage />);
    await waitFor(() => expect(loadAdminDashboardData).toHaveBeenCalledOnce());

    fireEvent.click(screen.getByRole('button', { name: /Takip Merkezi/ }));
    await waitFor(() => expect(loadAdminLearningActivity).toHaveBeenCalledOnce());
    fireEvent.click(screen.getByRole('button', { name: /Sınıfım/ }));
    expect(loadAdminLearningActivity).toHaveBeenCalledOnce();

    await act(async () => learning.resolve({ activityEvents: [], studySessions: [] }));
  });

  it('polling 120 saniyede yeniler; gizli sekmede sorgulamaz ve dönüşte yeniler', async () => {
    vi.useFakeTimers();
    const { unmount } = render(<AdminPage />);
    await act(async () => {
      await Promise.resolve();
    });
    await act(async () => vi.advanceTimersByTimeAsync(30000));
    expect(refreshAdminUsers).not.toHaveBeenCalled();
    await act(async () => vi.advanceTimersByTimeAsync(90000));
    expect(refreshAdminUsers).toHaveBeenCalledOnce();
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    await act(async () => vi.advanceTimersByTimeAsync(120000));
    expect(refreshAdminUsers).toHaveBeenCalledOnce();
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    await act(async () =>
      document.dispatchEvent(new Event('visibilitychange')),
    );
    expect(refreshAdminUsers).toHaveBeenCalledTimes(2);
    unmount();
    await vi.advanceTimersByTimeAsync(120000);
    expect(refreshAdminUsers).toHaveBeenCalledTimes(2);
  });

  it('yetkisiz oturumda katalog, Drive ve polling sorgularını başlatmaz', async () => {
    vi.mocked(resolveAdminAuth).mockResolvedValue({ status: 'unauthorized' });
    render(<AdminPage />);
    await waitFor(() => expect(ui.router.push).toHaveBeenCalledWith('/'));
    expect(loadAdminDashboardData).not.toHaveBeenCalled();
    expect(loadGoogleDriveConnectionStatus).not.toHaveBeenCalled();
    expect(loadWorksheetCandidateSourceStatus).not.toHaveBeenCalled();
    expect(refreshAdminUsers).not.toHaveBeenCalled();
  });
});
