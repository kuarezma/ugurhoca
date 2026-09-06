import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
}));

const mockUpdateUser = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      updateUser: (...args: unknown[]) => mockUpdateUser(...args),
    },
  },
}));

vi.mock('@/components/ConfettiBurst', () => ({
  fireConfetti: vi.fn(),
}));

import ResetPasswordPage from './ResetPasswordPage';

describe('ResetPasswordPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders new password inputs and submit button', () => {
    render(<ResetPasswordPage />);
    expect(screen.getByRole('heading', { name: /Yeni Şifre Belirle/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Yeni Şifre$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Yeni Şifre \(Tekrar\)/i)).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    render(<ResetPasswordPage />);
    const passInput = screen.getByLabelText(/^Yeni Şifre$/i);
    const confirmInput = screen.getByLabelText(/Yeni Şifre \(Tekrar\)/i);

    fireEvent.change(passInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'mismatch456' } });

    const submitBtn = screen.getByRole('button', { name: /Şifreyi Güncelle/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByRole('alert')).toHaveTextContent(/eşleşmiyor/i);
  });

  it('calls supabase.auth.updateUser on valid submission', async () => {
    mockUpdateUser.mockResolvedValue({
      data: { user: { id: 'u-1' } },
      error: null,
    });

    render(<ResetPasswordPage />);
    const passInput = screen.getByLabelText(/^Yeni Şifre$/i);
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
