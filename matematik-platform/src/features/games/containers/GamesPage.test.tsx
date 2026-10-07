import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import GamesPage from './GamesPage';
import { ToastProvider } from '@/components/Toast';
import { supabase } from '@/lib/supabase/client';

const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('@/lib/auth-client', () => ({
  getCurrentUserProfile: vi
    .fn()
    .mockResolvedValue({ profile: { id: 'student-1', name: 'Öğrenci' } }),
}));
vi.mock('@/lib/supabase/client', () => ({
  supabase: { rpc: vi.fn(), from: vi.fn() },
}));

beforeEach(() => {
  vi.clearAllMocks();
  window.history.replaceState(null, '', '/oyunlar');
  vi.mocked(supabase.from).mockReturnValue({
    select: () => ({
      eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
    }),
  } as never);
  vi.mocked(supabase.rpc).mockResolvedValue({ data: [], error: null } as never);
});
afterEach(cleanup);

it('notifies the user when a deep-linked game does not exist', async () => {
  window.history.replaceState(null, '', '/oyunlar?id=99999');
  render(
    <ToastProvider>
      <GamesPage />
    </ToastProvider>,
  );
  expect(
    await screen.findByText(
      'Bağlantıdaki oyun bulunamadı. Oyun listesinden bir oyun seçebilirsin.',
    ),
  ).toBeInTheDocument();
});

it('explains that scores are waiting when the alias modal is dismissed', async () => {
  render(
    <ToastProvider>
      <GamesPage />
    </ToastProvider>,
  );
  fireEvent.click(
    await screen.findByRole('button', { name: 'Rumuz penceresini kapat' }),
  );
  expect(
    await screen.findByText(
      'Skorların rumuz seçene kadar bu sayfada bekletilecek. Sayfadan ayrılmadan rumuzunu kaydet.',
    ),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Rumuz seç' }));
  expect(
    screen.getByRole('button', { name: 'Rumuz penceresini kapat' }),
  ).toBeInTheDocument();
});


// A valid adventure link opens that game rather than the generic game list.
it('opens the game named by an adventure deep link', async () => {
  window.history.replaceState(null, '', '/oyunlar?id=8');
  render(<ToastProvider><GamesPage /></ToastProvider>);
  expect(await screen.findByRole('heading', { name: 'Denklem Avcısı' })).toBeInTheDocument();
});
