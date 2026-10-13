import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChangePasswordForm from './ChangePasswordForm';

vi.mock('@/lib/supabase/client', () => ({
  supabase: { auth: { getUser: vi.fn(), signInWithPassword: vi.fn(), updateUser: vi.fn() } },
}));

describe('ChangePasswordForm', () => {
  it('mevcut şifre alanı varsayılan olarak gizlidir ve göz düğmesiyle açılıp kapanır', () => {
    render(<ChangePasswordForm />);
    const input = screen.getByLabelText('Mevcut Şifre');
    expect(input).toHaveAttribute('type', 'password');

    fireEvent.click(screen.getByRole('button', { name: 'Mevcut şifreyi göster' }));
    expect(input).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByRole('button', { name: 'Mevcut şifreyi gizle' }));
    expect(input).toHaveAttribute('type', 'password');
  });
});
