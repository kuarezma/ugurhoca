import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  getSession: vi.fn(),
  rpc: vi.fn(),
  signIn: vi.fn(),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('@/lib/auth-client', () => ({
  getClientSession: mocks.getSession,
  clearUserProfileCache: vi.fn(),
  writeAccessTokenCookie: vi.fn(),
  syncCurrentUserSnapshotCookie: vi.fn(),
}));
vi.mock('@/lib/supabase/client', () => ({
  supabase: { rpc: mocks.rpc, auth: { signInWithPassword: mocks.signIn } },
}));
import LoginPage from './LoginPage';
describe('login redirect and errors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue(null);
    window.history.replaceState({}, '', '/giris');
  });
  it.each([
    String.raw`/\evil.com`,
    '/%5Cevil.com',
    '//evil.com',
    '/%255Cevil.com',
  ])('rejects %s for an already signed-in user', async (target) => {
    window.history.replaceState(
      {},
      '',
      `/giris?redirect=${encodeURIComponent(target)}`,
    );
    mocks.getSession.mockResolvedValue({ access_token: 'token' });
    render(<LoginPage />);
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith('/'));
  });
  it('preserves a safe local target after password login', async () => {
    window.history.replaceState(
      {},
      '',
      '/giris?redirect=%2Ficerikler%3Fgrade%3D8',
    );
    mocks.rpc.mockResolvedValue({
      data: [{ email: 'ada@ugurhoca.local' }],
      error: null,
    });
    mocks.signIn.mockResolvedValue({
      data: { session: { access_token: 'token' } },
      error: null,
    });
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText('Ad ve soyad'), {
      target: { value: 'Ada Öğrenci' },
    });
    fireEvent.change(screen.getByLabelText('Şifre'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Giriş yap' }));
    await waitFor(() =>
      expect(mocks.push).toHaveBeenCalledWith('/icerikler?grade=8'),
    );
  });
  it('hides unknown Supabase errors in Turkish', async () => {
    mocks.rpc.mockResolvedValue({
      error: { message: 'internal server detail' },
    });
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText('Ad ve soyad'), {
      target: { value: 'Ada Öğrenci' },
    });
    fireEvent.change(screen.getByLabelText('Şifre'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Giriş yap' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'İşlem tamamlanamadı. Lütfen tekrar deneyin.',
    );
  });
});
