import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  signUp: vi.fn(),
  upsert: vi.fn(),
  from: vi.fn(),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/lib/auth-client', () => ({
  clearUserProfileCache: vi.fn(),
  writeAccessTokenCookie: vi.fn(),
  syncCurrentUserSnapshotCookie: vi.fn(),
}));
vi.mock('@/components/ConfettiBurst', () => ({ fireConfetti: vi.fn() }));
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    rpc: mocks.rpc,
    from: mocks.from,
    auth: { signUp: mocks.signUp },
  },
}));
import RegisterPage from './RegisterPage';
const submitRegister = () => {
  fireEvent.change(screen.getByLabelText('Ad ve soyad'), {
    target: { value: 'Ada Öğrenci' },
  });
  fireEvent.change(screen.getByLabelText('Sınıf düzeyi'), {
    target: { value: '8' },
  });
  fireEvent.change(screen.getByLabelText('Şifre'), {
    target: { value: 'password123' },
  });
  fireEvent.change(screen.getByLabelText('Şifre (tekrar)'), {
    target: { value: 'password123' },
  });
  fireEvent.submit(screen.getByLabelText('Ad ve soyad').closest('form')!);
};
describe('register user errors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rpc.mockResolvedValue({ data: null, error: null });
    mocks.from.mockReturnValue({ upsert: mocks.upsert });
    mocks.upsert.mockResolvedValue({ error: null });
  });
  it('does not expose an English signup error', async () => {
    mocks.signUp.mockResolvedValue({
      error: {
        code: 'over_request_rate_limit',
        message: 'Rate limit exceeded',
      },
    });
    render(<RegisterPage />);
    submitRegister();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Çok fazla deneme yapıldı.',
    );
  });
});
