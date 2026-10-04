import { act, fireEvent, render, screen } from '@testing-library/react';
import { ToastProvider } from '@/components/Toast';
import { supabase } from '@/lib/supabase/client';
import type { AppUser, Submission } from '@/types';
import AssignmentsPage from './AssignmentsPage';

const { router } = vi.hoisted(() => ({ router: { push: vi.fn() } }));
vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('next/dynamic', async () => {
  const { AssignmentSubmissionModal } =
    await import('../components/AssignmentSubmissionModal');
  return {
    default: vi
      .fn()
      .mockReturnValueOnce(AssignmentSubmissionModal)
      .mockReturnValueOnce(() => null),
  };
});
vi.mock('@/components/ThemeProvider', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
}));
vi.mock('@/lib/auth-client', () => ({
  requireClientSession: vi.fn().mockResolvedValue({
    user: { id: 'student', email: 'student@example.com' },
  }),
}));
vi.mock('@/lib/supabase/client', () => ({
  supabase: { from: vi.fn(), storage: { from: vi.fn() } },
}));

const user: AppUser = {
  id: 'student',
  name: 'Öğrenci',
  email: 'student@example.com',
  grade: 8,
};
let rows: Submission[];
let payloads: Record<string, unknown>[];
let migrated: boolean;
let insertError: { code: string; message: string } | null;
let lookupError: { message: string } | null;
const storage = {
  upload: vi.fn(),
  remove: vi.fn(),
  getPublicUrl: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({
    toFake: [
      'Date',
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
    ],
  });
  vi.setSystemTime(new Date('2026-10-04T12:00:00Z'));
  rows = [];
  payloads = [];
  migrated = false;
  insertError = null;
  lookupError = null;
  storage.upload.mockResolvedValue({ error: null });
  storage.remove.mockResolvedValue({ error: null });
  storage.getPublicUrl.mockReturnValue({
    data: { publicUrl: 'https://example.com/homework.pdf' },
  });
  vi.mocked(supabase.storage.from).mockReturnValue(storage as never);
  vi.mocked(supabase.from).mockImplementation((table) => {
    if (table === 'profiles')
      return {
        select: () => ({
          eq: () => ({ single: async () => ({ data: user, error: null }) }),
        }),
      } as never;
    const write = (values: Record<string, unknown>[]) => {
      const value = values[0];
      payloads.push(value);
      const existing = rows.find(
        (row) =>
          row.assignment_id === value.assignment_id &&
          row.student_id === value.student_id,
      );
      const error =
        insertError ??
        (!migrated && 'late' in value
          ? { code: '42703', message: 'late column is missing' }
          : migrated && existing
            ? { code: '23505', message: 'duplicate delivery' }
            : null);
      const data = error
        ? null
        : ({ id: `submission-${rows.length + 1}`, ...value } as Submission);
      if (data) rows.push(data);
      return { select: () => ({ single: async () => ({ data, error }) }) };
    };
    const filters: Record<string, string> = {};
    const reader = {
      eq: vi.fn((column: string, value: string) => {
        filters[column] = value;
        return reader;
      }),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(async () => ({
        data:
          rows.find(
            (row) =>
              row.assignment_id === filters.assignment_id &&
              row.student_id === filters.student_id,
          ) ?? null,
        error: lookupError,
      })),
    };
    return {
      insert: write,
      upsert: () => {
        throw new Error('upsert requires a UNIQUE constraint (42P10)');
      },
      select: () => reader,
    } as never;
  });
});
afterEach(() => vi.useRealTimers());

async function openUpload(dueDate: string | null) {
  const view = render(
    <AssignmentsPage
      initialUser={user}
      isHydrated
      initialAssignments={[
        { id: 'assignment', title: 'Matematik ödevi', due_date: dueDate },
      ]}
    />,
    { wrapper: ToastProvider },
  );
  await act(async () => {});
  fireEvent.click(screen.getByRole('button', { name: 'Ödev teslim et' }));
  const input = view.container.querySelector('input[type="file"]')!;
  const upload = async () => {
    await act(async () => {
      fireEvent.change(input, {
        target: {
          files: [
            new File(['pdf'], 'homework.pdf', { type: 'application/pdf' }),
          ],
        },
      });
    });
  };
  return { upload };
}

it.each([false, true])(
  'inserts without client late before/after migration (migrated=%s)',
  async (schemaMigrated) => {
    migrated = schemaMigrated;
    const { upload } = await openUpload('2026-10-04T11:59:59Z');
    await upload();
    expect(rows).toHaveLength(1);
    expect(payloads[0]).not.toHaveProperty('late');
    expect(payloads[0].submitted_at).toBe('2026-10-04T12:00:00.000Z');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });
    expect(screen.getByText('Ödev başarıyla yüklendi.')).toBeInTheDocument();
  },
);

it.each([false, true])(
  'blocks a second delivery before uploading and preserves review (migrated=%s)',
  async (schemaMigrated) => {
    migrated = schemaMigrated;
    const { upload } = await openUpload(null);
    await upload();
    rows[0].status = 'reviewed';
    rows[0].grade = 90;
    await upload();
    expect(rows).toHaveLength(1);
    expect(payloads).toHaveLength(1);
    expect(storage.upload).toHaveBeenCalledTimes(1);
    expect(rows[0]).toMatchObject({ status: 'reviewed', grade: 90 });
    expect(
      screen.getByText('Bu ödevi zaten teslim ettin.'),
    ).toBeInTheDocument();
  },
);

it('finds an existing legacy delivery even with duplicate rows and skips all writes', async () => {
  rows = [1, 2].map(
    (id) =>
      ({
        id: `legacy-${id}`,
        assignment_id: 'assignment',
        student_id: user.id,
      }) as Submission,
  );
  const { upload } = await openUpload(null);
  await upload();
  expect(payloads).toHaveLength(0);
  expect(storage.upload).not.toHaveBeenCalled();
  expect(screen.getByText('Bu ödevi zaten teslim ettin.')).toBeInTheDocument();
});

it('handles a concurrent 23505 as already submitted and removes only the losing upload', async () => {
  migrated = true;
  storage.upload.mockImplementation(async () => {
    rows.push({
      id: 'winner',
      assignment_id: 'assignment',
      student_id: user.id,
      status: 'reviewed',
      grade: 90,
    } as Submission);
    return { error: null };
  });
  const { upload } = await openUpload(null);
  await upload();
  expect(rows).toHaveLength(1);
  expect(storage.remove).toHaveBeenCalledWith([
    storage.upload.mock.calls[0][0],
  ]);
  expect(storage.upload.mock.calls[0][0]).toMatch(
    /^student\/assignment_[\da-f-]+\.pdf$/,
  );
  expect(screen.getByText('Bu ödevi zaten teslim ettin.')).toBeInTheDocument();
  expect(
    screen.queryByText('Ödev başarıyla yüklendi.'),
  ).not.toBeInTheDocument();
});

it('does not upload when the preflight lookup fails', async () => {
  lookupError = { message: 'Teslim okunamadı' };
  const { upload } = await openUpload(null);
  await upload();
  expect(storage.upload).not.toHaveBeenCalled();
  expect(payloads).toHaveLength(0);
  expect(
    screen.getByText(/Ödev yüklenirken bir hata oluştu/),
  ).toBeInTheDocument();
});

it('reports a non-duplicate insert error without claiming delivery', async () => {
  insertError = { code: '42501', message: 'İzin yok' };
  const { upload } = await openUpload(null);
  await upload();
  expect(rows).toHaveLength(0);
  expect(
    screen.getByText(/Ödev yüklenirken bir hata oluştu/),
  ).toBeInTheDocument();
  expect(
    screen.queryByText('Bu ödevi zaten teslim ettin.'),
  ).not.toBeInTheDocument();
});

it('prevents simultaneous local upload callbacks before React updates', async () => {
  const { upload } = await openUpload(null);
  await Promise.all([upload(), upload()]);
  expect(storage.upload).toHaveBeenCalledTimes(1);
  expect(payloads).toHaveLength(1);
});
