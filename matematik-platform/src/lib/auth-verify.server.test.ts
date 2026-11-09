import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

const {
  mockGetServerAccessToken,
  mockGetUser,
  mockCreateServerSupabaseClient,
  mockCreateServiceRoleClient,
  mockFrom,
} = vi.hoisted(() => {
  const mockGetUserFn = vi.fn();
  const mockFromFn = vi.fn();
  return {
    mockGetServerAccessToken: vi.fn(),
    mockGetUser: mockGetUserFn,
    mockCreateServerSupabaseClient: vi.fn(() => ({
      auth: { getUser: mockGetUserFn },
    })),
    mockFrom: mockFromFn,
    mockCreateServiceRoleClient: vi.fn(() => ({
      from: mockFromFn,
    })),
  };
});

vi.mock('@/lib/auth-snapshot.server', () => ({
  getServerAccessToken: mockGetServerAccessToken,
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: mockCreateServerSupabaseClient,
  createServiceRoleClient: mockCreateServiceRoleClient,
}));

import { getVerifiedServerUser } from './auth-verify.server';

describe('getVerifiedServerUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('access token bulunamadığında null döner', async () => {
    mockGetServerAccessToken.mockResolvedValue(null);

    const result = await getVerifiedServerUser();

    expect(result).toBeNull();
    expect(mockCreateServerSupabaseClient).not.toHaveBeenCalled();
  });

  it('Supabase auth.getUser hata döndüğünde null döner', async () => {
    mockGetServerAccessToken.mockResolvedValue('invalid-token');
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Invalid JWT token'),
    });

    const result = await getVerifiedServerUser();

    expect(result).toBeNull();
  });

  it('kullanıcı kimliği (user.id) eksik olduğunda null döner', async () => {
    mockGetServerAccessToken.mockResolvedValue('partial-token');
    mockGetUser.mockResolvedValue({
      data: { user: { email: 'test@example.com' } },
      error: null,
    });

    const result = await getVerifiedServerUser();

    expect(result).toBeNull();
  });

  it('geçerli öğrenci oturumunda profil verilerini ve yetki sınıfını çözümler', async () => {
    mockGetServerAccessToken.mockResolvedValue('valid-student-token');
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'student-uuid-1',
          email: 'ogrenci@example.com',
          user_metadata: {},
        },
      },
      error: null,
    });

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { name: 'Ahmet Yılmaz', grade: '7' },
            error: null,
          }),
        }),
      }),
    });

    const result = await getVerifiedServerUser();

    expect(result).not.toBeNull();
    expect(result).toEqual({
      accessGrade: '7',
      email: 'ogrenci@example.com',
      grade: 7,
      id: 'student-uuid-1',
      isAdmin: false,
      name: 'Ahmet Yılmaz',
    });
  });

  it('admin e-postası için isAdmin bayrağını true olarak işaretler', async () => {
    mockGetServerAccessToken.mockResolvedValue('admin-token');
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'admin-uuid-1',
          email: 'admin@ugurhoca.com',
          user_metadata: { name: 'Uğur Hoca' },
        },
      },
      error: null,
    });

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { name: 'Uğur YAŞAYAN', grade: null },
            error: null,
          }),
        }),
      }),
    });

    const result = await getVerifiedServerUser();

    expect(result).not.toBeNull();
    expect(result?.isAdmin).toBe(true);
    expect(result?.email).toBe('admin@ugurhoca.com');
    expect(result?.name).toBe('Uğur YAŞAYAN');
  });

  it('profil bulunamadığında user_metadata alanlarını fallback olarak kullanır', async () => {
    mockGetServerAccessToken.mockResolvedValue('meta-token');
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'student-uuid-2',
          email: 'ayse@example.com',
          user_metadata: { name: 'Ayşe Kaya', grade: '8' },
        },
      },
      error: null,
    });

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Not found' },
          }),
        }),
      }),
    });

    const result = await getVerifiedServerUser();

    expect(result).not.toBeNull();
    expect(result?.name).toBe('Ayşe Kaya');
    expect(result?.grade).toBe(8);
    expect(result?.accessGrade).toBe('8');
    expect(result?.isAdmin).toBe(false);
  });

  it('profil ve metadata boşsa varsayılan Öğrenci adını kullanır', async () => {
    mockGetServerAccessToken.mockResolvedValue('empty-token');
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'student-uuid-3',
          email: '',
          user_metadata: null,
        },
      },
      error: null,
    });

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      }),
    });

    const result = await getVerifiedServerUser();

    expect(result).not.toBeNull();
    expect(result?.name).toBe('Öğrenci');
    expect(result?.accessGrade).toBeNull();
    expect(result?.grade).toBe(5);
    expect(result?.isAdmin).toBe(false);
  });
});
