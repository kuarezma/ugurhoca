import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  getSession: vi.fn(),
  rpc: vi.fn(),
  signIn: vi.fn(),
  writeToken: vi.fn(),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('@/lib/auth-client', () => ({
  getClientSession: mocks.getSession,
  clearUserProfileCache: vi.fn(),
  writeAccessTokenCookie: mocks.writeToken,
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
    mocks.writeToken.mockResolvedValue(true);
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
  it('waits for the HttpOnly session cookie before redirecting after login', async () => {
    let finishSync: (ok: boolean) => void = () => undefined;
    mocks.writeToken.mockReturnValueOnce(
      new Promise<boolean>((resolve) => {
        finishSync = resolve;
      }),
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
    await waitFor(() => expect(mocks.writeToken).toHaveBeenCalledWith('token'));
    expect(mocks.push).not.toHaveBeenCalled();
    finishSync(true);
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith('/profil'));
  });
  it('stays on the login page with a Turkish message when the session cookie cannot be written', async () => {
    mocks.writeToken.mockResolvedValue(false);
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
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Oturum başlatılamadı, lütfen birkaç saniye sonra tekrar deneyin.',
    );
    expect(mocks.push).not.toHaveBeenCalled();
  });
  it('does not bounce an already signed-in user when the session cookie cannot be written', async () => {
    mocks.getSession.mockResolvedValue({ access_token: 'token' });
    mocks.writeToken.mockResolvedValue(false);
    render(<LoginPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Oturum başlatılamadı, lütfen birkaç saniye sonra tekrar deneyin.',
    );
    expect(mocks.push).not.toHaveBeenCalled();
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
