import { useState } from 'react';
import { act, renderHook, screen } from '@testing-library/react';
import { ToastProvider } from '@/components/Toast';
import { supabase } from '@/lib/supabase/client';
import type { AdminAssignment } from '@/features/admin/types';
import { useAdminListActions } from './useAdminListActions';

const { deleteRequest } = vi.hoisted(() => ({ deleteRequest: vi.fn() }));
vi.mock('@/lib/supabase/client', () => ({ supabase: { from: vi.fn() } }));

const items: AdminAssignment[] = [
  { id: 'first', title: 'Birinci' },
  { id: 'middle', title: 'İkinci' },
  { id: 'last', title: 'Üçüncü' },
];

function useActions() {
  const [assignments, setAssignments] = useState(items);
  const actions = useAdminListActions({
    assignments,
    setAssignments,
    allUsers: [],
    announcements: [],
    documents: [],
    sharedDocs: [],
    quizzes: [],
    loadData: vi.fn(),
    setAnnouncements: vi.fn(),
    setDocuments: vi.fn(),
    setIsSubmitting: vi.fn(),
    setAllUsers: vi.fn(),
    setPdfStudentsLoading: vi.fn(),
    setQuizzes: vi.fn(),
    setSharedDocs: vi.fn(),
  });
  return { ...actions, assignments, setAssignments };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(supabase.from).mockReturnValue({
    delete: () => ({ eq: deleteRequest }),
  } as never);
  vi.spyOn(window, 'confirm').mockReturnValue(true);
});
afterEach(() => vi.restoreAllMocks());

it('restores the deleted item at its original position and shows an error on failure', async () => {
  deleteRequest.mockResolvedValue({
    error: { message: 'Silinemedi' },
  } as never);
  const { result } = renderHook(useActions, { wrapper: ToastProvider });
  await act(async () => {
    await result.current.deleteItem('assignment', 'middle');
  });
  expect(result.current.assignments).toEqual(items);
  expect(screen.getByRole('alert')).toHaveTextContent('İçerik silinemedi.');
});

it('rolls back a rejected request without overwriting an unrelated list update', async () => {
  let reject!: (error: Error) => void;
  deleteRequest.mockReturnValue(
    new Promise((_resolve, rejectRequest) => {
      reject = rejectRequest;
    }) as never,
  );
  const { result } = renderHook(useActions, { wrapper: ToastProvider });
  let request!: Promise<void>;
  act(() => {
    request = result.current.deleteItem('assignment', 'middle');
  });
  expect(result.current.assignments.map((item) => item.id)).toEqual([
    'first',
    'last',
  ]);
  act(() => {
    result.current.setAssignments((current) => [
      ...current,
      { id: 'new', title: 'Yeni' },
    ]);
  });
  await act(async () => {
    reject(new Error('Network error'));
    await request;
  });
  expect(result.current.assignments.map((item) => item.id)).toEqual([
    'first',
    'middle',
    'last',
    'new',
  ]);
});

it('keeps a successful deletion and does not issue two pending deletes for the same item', async () => {
  let finish!: (result: { error: null }) => void;
  deleteRequest.mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    }) as never,
  );
  const { result } = renderHook(useActions, { wrapper: ToastProvider });
  let request!: Promise<void>;
  act(() => {
    request = result.current.deleteItem('assignment', 'middle');
    void result.current.deleteItem('assignment', 'middle');
  });
  expect(deleteRequest).toHaveBeenCalledTimes(1);
  await act(async () => {
    finish({ error: null });
    await request;
  });
  expect(result.current.assignments.map((item) => item.id)).toEqual([
    'first',
    'last',
  ]);
});

it('leaves the list unchanged when deletion is not confirmed', async () => {
  vi.spyOn(window, 'confirm').mockReturnValue(false);
  const { result } = renderHook(useActions, { wrapper: ToastProvider });
  await act(async () => {
    await result.current.deleteItem('assignment', 'middle');
  });
  expect(result.current.assignments).toEqual(items);
  expect(deleteRequest).not.toHaveBeenCalled();
});
