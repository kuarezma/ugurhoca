import { act, renderHook } from '@testing-library/react';
import { supabase } from '@/lib/supabase/client';
import type { InitialProfileDashboardData } from '@/features/profile/types';
import type { DashboardNotification } from '@/types/dashboard';
import { useProfileDashboardData } from './useProfileDashboardData';

vi.mock('@/lib/supabase/client', () => ({
  supabase: { from: vi.fn(), channel: vi.fn(), removeChannel: vi.fn() },
}));

const notification = (id: string): DashboardNotification => ({
  id,
  user_id: 'student',
  title: 'Bildirim',
  message: '',
  type: 'general',
  is_read: false,
  created_at: '2026-10-04T12:00:00Z',
});
const initialData: InitialProfileDashboardData = {
  user: {
    id: 'student',
    name: 'Öğrenci',
    email: 'student@example.com',
    grade: 8,
    isAdmin: false,
  },
  isHydrated: true,
  notifications: [notification('old')],
  assignments: [],
  availableQuizzes: [],
  badges: [],
  goal: null,
  progressRows: [],
  quizResults: [],
  sharedDocs: [],
  studySessions: [],
  submissions: [],
  weeklyPlans: [],
  weeklyWorksheet: null,
};

let receiveNotification: (payload: { new: DashboardNotification }) => void;
let finish: (response: { error: null | { message: string } }) => void;
let updateIds: ReturnType<typeof vi.fn>;
const router = { push: vi.fn() };

beforeEach(() => {
  vi.clearAllMocks();
  updateIds = vi.fn().mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  vi.mocked(supabase.from).mockReturnValue({
    update: vi.fn().mockReturnValue({ in: updateIds }),
  } as never);
  vi.mocked(supabase.channel).mockImplementation(() => {
    const channel = {
      on: vi.fn().mockImplementation((_event, filter, callback) => {
        if (filter.table === 'notifications' && filter.event === 'INSERT')
          receiveNotification = callback;
        return channel;
      }),
      subscribe: vi.fn().mockReturnThis(),
    };
    return channel as never;
  });
});

it('does not mark a notification arriving during the request as read', async () => {
  const { result } = renderHook(() =>
    useProfileDashboardData(router, initialData),
  );
  let request: Promise<void>;
  act(() => {
    request = result.current.markAllAsRead();
  });
  act(() => {
    receiveNotification({ new: notification('new') });
  });
  await act(async () => {
    finish({ error: null });
    await request;
  });
  expect(
    result.current.notifications.find((item) => item.id === 'old')?.is_read,
  ).toBe(true);
  expect(
    result.current.notifications.find((item) => item.id === 'new')?.is_read,
  ).toBe(false);
});

it('coalesces repeated clicks for the same unread notifications', async () => {
  const { result } = renderHook(() =>
    useProfileDashboardData(router, initialData),
  );
  let request: Promise<void>;
  act(() => {
    request = result.current.markAllAsRead();
    void result.current.markAllAsRead();
  });
  expect(updateIds).toHaveBeenCalledTimes(1);
  await act(async () => {
    finish({ error: null });
    await request;
  });
});

it('keeps unread notifications on failure and allows a retry', async () => {
  const { result } = renderHook(() =>
    useProfileDashboardData(router, initialData),
  );
  let request: Promise<void>;
  act(() => {
    request = result.current.markAllAsRead();
  });
  await act(async () => {
    finish({ error: { message: 'Network error' } });
    await request;
  });
  expect(result.current.notifications[0].is_read).toBe(false);
  act(() => {
    request = result.current.markAllAsRead();
  });
  await act(async () => {
    finish({ error: null });
    await request;
  });
  expect(result.current.notifications[0].is_read).toBe(true);
});
