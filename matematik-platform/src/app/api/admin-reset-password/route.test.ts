import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

vi.mock('@/lib/admin', () => ({
  isAdminEmail: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));

const mockGetUser = vi.fn();
const mockUpdateUserById = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
  createServiceRoleClient: () => ({
    auth: {
      admin: {
        updateUserById: mockUpdateUserById,
      },
    },
  }),
}));

import { isAdminEmail } from '@/lib/admin';

describe('Admin Reset Password Route (/api/admin-reset-password)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('token yoksa 401 döner', async () => {
    const req = new Request('https://ugurhoca.com/api/admin-reset-password', {
      method: 'POST',
      body: JSON.stringify({ student_id: 'stu-1', new_password: 'newpassword123' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('admin olmayan kullanıcıda 403 döner', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { email: 'student@ugurhoca.local', id: 'usr-1' } },
      error: null,
    });
    vi.mocked(isAdminEmail).mockReturnValue(false);

    const req = new Request('https://ugurhoca.com/api/admin-reset-password', {
      method: 'POST',
      headers: { authorization: 'Bearer valid-token' },
      body: JSON.stringify({ student_id: 'stu-1', new_password: 'newpassword123' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it('admin geçerli şifre gönderdiğinde şifreyi başarıyla sıfırlar', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { email: 'admin@ugurhoca.com', id: 'admin-1' } },
      error: null,
    });
    vi.mocked(isAdminEmail).mockReturnValue(true);
    mockUpdateUserById.mockResolvedValue({
      data: { user: { id: 'stu-1' } },
      error: null,
    });

    const req = new Request('https://ugurhoca.com/api/admin-reset-password', {
      method: 'POST',
      headers: { authorization: 'Bearer valid-token' },
      body: JSON.stringify({ student_id: 'stu-1', new_password: 'newpassword123' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(mockUpdateUserById).toHaveBeenCalledWith('stu-1', {
      password: 'newpassword123',
    });
  });

  it('şifre 6 karakterden kısa ise 400 döner', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { email: 'admin@ugurhoca.com', id: 'admin-1' } },
      error: null,
    });
    vi.mocked(isAdminEmail).mockReturnValue(true);

    const req = new Request('https://ugurhoca.com/api/admin-reset-password', {
      method: 'POST',
      headers: { authorization: 'Bearer valid-token' },
      body: JSON.stringify({ student_id: 'stu-1', new_password: '123' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(mockUpdateUserById).not.toHaveBeenCalled();
  });
});
