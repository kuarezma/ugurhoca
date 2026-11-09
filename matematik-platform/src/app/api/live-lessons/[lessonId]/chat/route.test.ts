import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from './route';
import type { VerifiedServerUser } from '@/lib/auth-verify.server';

const { mockGetUser, mockFrom, mockInsert } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
  mockInsert: vi.fn(),
}));

vi.mock('@/lib/auth-verify.server', () => ({
  getVerifiedServerUser: mockGetUser,
}));
vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: () => ({ from: mockFrom }),
}));
vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: vi.fn().mockResolvedValue(null),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const admin: VerifiedServerUser = {
  accessGrade: null,
  email: 'admin@ugurhoca.com',
  grade: 5,
  id: 'admin',
  isAdmin: true,
  name: 'Öğretmen',
};
const student: VerifiedServerUser = {
  ...admin,
  accessGrade: '8',
  email: 'ogrenci@example.com',
  grade: 8,
  id: 'student',
  isAdmin: false,
  name: 'Öğrenci',
};

let targetGrade: string;
let messages: unknown[] = [];

beforeEach(() => {
  vi.clearAllMocks();
  messages = [];
  mockFrom.mockImplementation((table: string) => {
    if (table === 'live_lessons') {
      return {
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: {
                id: 'lesson',
                status: 'active',
                target_grade: targetGrade,
              },
            }),
          }),
        }),
      };
    }
    return {
      select: () => ({
        eq: () => ({
          order: () => ({ limit: async () => ({ data: messages }) }),
        }),
      }),
      insert: mockInsert.mockImplementation((payload: unknown) => ({
        select: () => ({
          single: async () => ({ data: payload, error: null }),
        }),
      })),
    };
  });
});

const request = (method: 'GET' | 'POST') =>
  new Request('http://localhost/api/live-lessons/lesson/chat', {
    method,
    ...(method === 'POST'
      ? { body: JSON.stringify({ message: 'Merhaba' }) }
      : {}),
  });
const context = () => ({ params: Promise.resolve({ lessonId: 'lesson' }) });

describe.each(['5', '7'])('%s. sınıf sohbeti', (grade) => {
  it.each(['GET', 'POST'] as const)(
    'sınıfsız admin %s için 200 alır',
    async (method) => {
      targetGrade = grade;
      mockGetUser.mockResolvedValue(admin);
      const response = await (method === 'GET' ? GET : POST)(
        request(method),
        context(),
      );
      expect(response.status).toBe(200);
      if (method === 'POST') {
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            lesson_id: 'lesson',
            role: 'teacher',
            user_id: admin.id,
          }),
        );
      } else {
        expect(await response.json()).toEqual({ messages: [] });
      }
    },
  );

  it.each(['GET', 'POST'] as const)(
    'erişimsiz öğrenci %s için 403 alır',
    async (method) => {
      targetGrade = grade;
      // İstemciden gelen isAdmin alanı öğretmen yetkisi veremez.
      mockGetUser.mockResolvedValue({ ...student, isAdmin: true });
      const response = await (method === 'GET' ? GET : POST)(
        request(method),
        context(),
      );
      expect(response.status).toBe(403);
      expect(mockFrom).not.toHaveBeenCalledWith('live_lesson_chat_messages');
      expect(mockInsert).not.toHaveBeenCalled();
    },
  );
});

describe('Sohbette ad gizliliği', () => {
  const rows = [
    { id: 'a', user_id: 'student', user_name: 'Ada Gerçek', role: 'student' },
    { id: 'b', user_id: 'other', user_name: 'Bora Gerçek', role: 'student' },
    { id: 't', user_id: 'admin', user_name: 'Uğur Öğretmen', role: 'teacher' },
  ];

  it('öğrenci kendi adını ve öğretmeni görür; diğer öğrencinin adı ve kimliği maskelenir', async () => {
    targetGrade = '8';
    messages = rows;
    mockGetUser.mockResolvedValue(student);
    const response = await GET(request('GET'), context());
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(await response.json()).toEqual({
      messages: [
        rows[0],
        { ...rows[1], user_name: 'Öğrenci', user_id: null },
        rows[2],
      ],
    });
  });

  it('admin tüm gerçek adları ve kimlikleri görür', async () => {
    targetGrade = '8';
    messages = rows;
    mockGetUser.mockResolvedValue(admin);
    const response = await GET(request('GET'), context());
    expect(await response.json()).toEqual({ messages: rows });
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  });

  it.each([student, admin])(
    'POST kendi gerçek adını korur ve önbelleğe alınmaz ($id)',
    async (viewer) => {
      targetGrade = '8';
      mockGetUser.mockResolvedValue(viewer);
      const response = await POST(request('POST'), context());
      expect((await response.json()).message).toMatchObject({
        user_id: viewer.id,
        user_name: viewer.name,
      });
      expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    },
  );
});
