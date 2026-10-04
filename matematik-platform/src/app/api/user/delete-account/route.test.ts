import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: vi.fn().mockResolvedValue(null),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

type DeleteResult = { error: { message: string } | null };

const calls: string[] = [];
const tableResults = new Map<string, DeleteResult>();
const mockGetUser = vi.fn();
const mockDeleteUser = vi.fn();

const deleteBuilder = (table: string) => ({
  delete: () => ({
    eq: () => {
      calls.push(table);
      return Promise.resolve(tableResults.get(table) ?? { error: null });
    },
  }),
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: (_url: string, key: string) =>
    key === 'service-key'
      ? {
          from: deleteBuilder,
          auth: {
            admin: {
              deleteUser: (id: string) => {
                calls.push('auth.users');
                return mockDeleteUser(id);
              },
            },
          },
        }
      : { auth: { getUser: mockGetUser }, from: deleteBuilder },
}));

import { POST } from './route';

const request = () =>
  new Request('https://ugurhoca.com/api/user/delete-account', {
    method: 'POST',
    headers: { authorization: 'Bearer user-token' },
  });

describe('POST /api/user/delete-account', () => {
  beforeEach(() => {
    calls.length = 0;
    tableResults.clear();
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-key');
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    mockDeleteUser.mockResolvedValue({ error: null });
  });

  it('bağımlı tabloları, sonra profili, en son auth hesabını siler', async () => {
    const res = await POST(request());

    expect(res.status).toBe(200);
    expect(calls.at(-2)).toBe('profiles');
    expect(calls.at(-1)).toBe('auth.users');
    expect(calls.indexOf('profiles')).toBe(calls.length - 2);
    expect(calls).toEqual(expect.arrayContaining(['user_mistakes', 'student_group_members']));
  });

  it('bağımlı bir tablo başarısız olursa profil ve auth hesabı silinmez', async () => {
    tableResults.set('user_mistakes', {
      error: { message: "Could not find the table 'public.user_mistakes'" },
    });

    const res = await POST(request());

    expect(res.status).toBe(500);
    expect(calls).not.toContain('profiles');
    expect(calls).not.toContain('auth.users');
    expect(mockDeleteUser).not.toHaveBeenCalled();
  });

  it('profil silinemezse auth hesabı silinmez', async () => {
    tableResults.set('profiles', { error: { message: 'permission denied' } });

    const res = await POST(request());

    expect(res.status).toBe(500);
    expect(calls).toContain('profiles');
    expect(mockDeleteUser).not.toHaveBeenCalled();
  });

  it('token yoksa hiçbir şey silmeden 401 döner', async () => {
    const res = await POST(
      new Request('https://ugurhoca.com/api/user/delete-account', { method: 'POST' }),
    );

    expect(res.status).toBe(401);
    expect(calls).toEqual([]);
  });
});
