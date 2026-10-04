import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockUnsubscribe = vi.fn();
const mockRouter = { push: mockPush, replace: mockReplace };
vi.mock('next/navigation', () => ({ useRouter: () => mockRouter }));

const mockUpdateUser = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
      updateUser: (...args: unknown[]) => mockUpdateUser(...args),
    },
  },
}));

vi.mock('@/components/ConfettiBurst', () => ({
  fireConfetti: vi.fn(),
}));

import { trackRecoverySession } from '@/lib/auth-recovery';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

const recoverySession = { access_token: 'recovery-token', expires_at: 4102444800, user: { id: 'u-1' } } as Session;

import ResetPasswordPage from './ResetPasswordPage';

describe('ResetPasswordPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    trackRecoverySession('SIGNED_OUT', null);
    trackRecoverySession('PASSWORD_RECOVERY', recoverySession);
    mockGetSession.mockResolvedValue({ data: { session: recoverySession }, error: null });
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: mockUnsubscribe } } });
  });

  it('does not display the form without a recovery session and redirects to forgot password', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    render(<ResetPasswordPage />);
    expect(screen.queryByLabelText(/^Yeni Şifre$/i)).not.toBeInTheDocument();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/sifremi-unuttum'));
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it('rejects an ordinary signed-in session even with a forged recovery URL', async () => {
    trackRecoverySession('SIGNED_OUT', null);
    trackRecoverySession('SIGNED_IN', recoverySession);
    window.history.replaceState({}, '', '/sifre-sifirla#type=recovery');
    render(<ResetPasswordPage />);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/sifremi-unuttum'));
    expect(screen.queryByLabelText(/^Yeni Şifre$/i)).not.toBeInTheDocument();
    window.history.replaceState({}, '', '/');
  });

  it('stops password updates if the recovery session expires before submission', async () => {
    render(<ResetPasswordPage />);
    fireEvent.change(await screen.findByLabelText(/^Yeni Şifre$/i), { target: { value: 'strongPass123' } });
    fireEvent.change(screen.getByLabelText(/Yeni Şifre \(Tekrar\)/i), { target: { value: 'strongPass123' } });
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    fireEvent.click(screen.getByRole('button', { name: /Şifreyi Güncelle/i }));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/sifremi-unuttum'));
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it('revokes the form on sign-out and unsubscribes on unmount', async () => {
    const { unmount } = render(<ResetPasswordPage />);
    await screen.findByLabelText(/^Yeni Şifre$/i);
    const callback = mockOnAuthStateChange.mock.calls[0][0] as (event: AuthChangeEvent, session: Session | null) => void;
    const { act } = await import('@testing-library/react');
    act(() => callback('SIGNED_OUT', null));
    expect(screen.queryByLabelText(/^Yeni Şifre$/i)).not.toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith('/sifremi-unuttum');
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('renders new password inputs and submit button', async () => {
    render(<ResetPasswordPage />);
    expect(screen.getByRole('heading', { name: /Yeni Şifre Belirle/i })).toBeInTheDocument();
    expect(await screen.findByLabelText(/^Yeni Şifre$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Yeni Şifre \(Tekrar\)/i)).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    render(<ResetPasswordPage />);
    const passInput = await screen.findByLabelText(/^Yeni Şifre$/i);
    const confirmInput = screen.getByLabelText(/Yeni Şifre \(Tekrar\)/i);

    fireEvent.change(passInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'mismatch456' } });

    const submitBtn = screen.getByRole('button', { name: /Şifreyi Güncelle/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByRole('alert')).toHaveTextContent(/eşleşmiyor/i);
  });

  it('shows a Turkish message for Supabase update errors', async () => {
    mockUpdateUser.mockResolvedValue({ error: { code: 'weak_password', message: 'Weak password' } });
    render(<ResetPasswordPage />);
    fireEvent.change(await screen.findByLabelText(/^Yeni Şifre$/i), { target: { value: 'strongPass123' } });
    fireEvent.change(screen.getByLabelText(/Yeni Şifre \(Tekrar\)/i), { target: { value: 'strongPass123' } });
    fireEvent.click(screen.getByRole('button', { name: /Şifreyi Güncelle/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Şifreniz yeterince güçlü değil.');
  });

  it('calls supabase.auth.updateUser on valid submission', async () => {
    mockUpdateUser.mockResolvedValue({
      data: { user: { id: 'u-1' } },
      error: null,
    });

    render(<ResetPasswordPage />);
    const passInput = await screen.findByLabelText(/^Yeni Şifre$/i);
    const confirmInput = screen.getByLabelText(/Yeni Şifre \(Tekrar\)/i);

    fireEvent.change(passInput, { target: { value: 'strongPass123' } });
    fireEvent.change(confirmInput, { target: { value: 'strongPass123' } });

    const submitBtn = screen.getByRole('button', { name: /Şifreyi Güncelle/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'strongPass123' });
      expect(screen.getByText(/Şifreniz Başarıyla Değiştirildi!/i)).toBeInTheDocument();
    });
  });
});
