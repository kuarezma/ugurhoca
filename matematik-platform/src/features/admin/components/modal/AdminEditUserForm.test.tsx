import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminEditUserForm from './AdminEditUserForm';
import type { AdminUser, AdminFormState } from '@/features/admin/types';

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'fake-admin-token' } },
      }),
    },
  },
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('AdminEditUserForm', () => {
  const dummyUser: AdminUser = {
    id: 'stu-123',
    name: 'Ali Veli',
    email: 'ali_veli@ugurhoca.local',
    grade: 8,
    role: 'student',
    created_at: '2026-01-01T00:00:00Z',
  };

  const dummyFormData: AdminFormState = {
    name: 'Ali Veli',
    grade: 8,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('şifre sıfırlama arayüzünü ve rastgele şifre üreticiyi görüntüler', () => {
    render(
      <AdminEditUserForm
        editingUser={dummyUser}
        formData={dummyFormData}
        isSubmitting={false}
        onSubmit={vi.fn()}
        updateFormData={vi.fn()}
      />,
    );

    expect(screen.getByText(/Şifre Sıfırlama/i)).toBeInTheDocument();
    expect(screen.getByText('Rastgele Şifre Üret')).toBeInTheDocument();

    const randomBtn = screen.getByText('Rastgele Şifre Üret');
    fireEvent.click(randomBtn);

    const passwordInput = screen.getByPlaceholderText(/Yeni şifre/i) as HTMLInputElement;
    expect(passwordInput.value.length).toBe(8);
  });

  it('şifre sıfırlama isteğini başarıyla gönderir ve sonucu gösterir', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(
      <AdminEditUserForm
        editingUser={dummyUser}
        formData={dummyFormData}
        isSubmitting={false}
        onSubmit={vi.fn()}
        updateFormData={vi.fn()}
      />,
    );

    const passwordInput = screen.getByPlaceholderText(/Yeni şifre/i);
    fireEvent.change(passwordInput, { target: { value: 'yeniSifre123' } });

    const submitBtn = screen.getByText('Şifreyi Güncelle');
    expect(submitBtn).toBeEnabled();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin-reset-password',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            student_id: 'stu-123',
            new_password: 'yeniSifre123',
          }),
        }),
      );
      expect(screen.getByText(/Şifre başarıyla güncellendi/i)).toBeInTheDocument();
    });
  });
});
