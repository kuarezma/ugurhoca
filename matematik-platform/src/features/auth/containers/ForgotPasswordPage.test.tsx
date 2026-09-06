import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPasswordPage from './ForgotPasswordPage';

describe('ForgotPasswordPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and input fields', () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByRole('heading', { name: /Şifremi Unuttum/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Ad ve Soyad veya E-posta/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Şifre Sıfırlama Talebi Gönder/i })).toBeInTheDocument();
  });

  it('shows error if submitted with too short identifier', async () => {
    render(<ForgotPasswordPage />);
    const input = screen.getByLabelText(/Ad ve Soyad veya E-posta/i);
    fireEvent.change(input, { target: { value: 'a' } });

    const submitBtn = screen.getByRole('button', { name: /Şifre Sıfırlama Talebi Gönder/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByRole('alert')).toHaveTextContent(/geçerli bir ad soyad/i);
  });

  it('submits identifier and displays success message', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Şifre sıfırlama talebiniz Uğur Hoca\'ya başarıyla iletildi.',
      }),
    } as unknown as Response);

    render(<ForgotPasswordPage />);
    const input = screen.getByLabelText(/Ad ve Soyad veya E-posta/i);
    fireEvent.change(input, { target: { value: 'Ali Yılmaz' } });

    const submitBtn = screen.getByRole('button', { name: /Şifre Sıfırlama Talebi Gönder/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Talebiniz Alındı/i)).toBeInTheDocument();
      expect(screen.getByText(/Şifre sıfırlama talebiniz Uğur Hoca'ya başarıyla iletildi/i)).toBeInTheDocument();
    });
  });
});
