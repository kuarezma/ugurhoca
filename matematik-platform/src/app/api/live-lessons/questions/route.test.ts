import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, PATCH } from './route';
import { requireAdmin, getBearerOrCookieAccessToken } from '@/lib/api-auth';
import { isAdminEmail } from '@/lib/admin';
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from '@/lib/supabase/server';
import { enforceRateLimit } from '@/lib/rate-limit';

type ServerSupabase = ReturnType<typeof createServerSupabaseClient>;
type ServiceRole = ReturnType<typeof createServiceRoleClient>;
type RequireAdminResult = Awaited<ReturnType<typeof requireAdmin>>;

vi.mock('@/lib/api-auth', () => ({
  requireAdmin: vi.fn(),
  getBearerOrCookieAccessToken: vi.fn(),
}));

vi.mock('@/lib/admin', () => ({
  isAdminEmail: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(),
  createServiceRoleClient: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: vi.fn().mockResolvedValue(null),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}));

describe('/api/live-lessons/questions Rotaları', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(enforceRateLimit).mockResolvedValue(null);
  });

  describe('GET /api/live-lessons/questions', () => {
    it('giriş yapmamış kullanıcı için 401 döner', async () => {
      vi.mocked(getBearerOrCookieAccessToken).mockResolvedValue('');

      const req = new Request(
        'http://localhost:3000/api/live-lessons/questions',
      );
      const res = await GET(req);

      expect(res.status).toBe(401);
    });

    it('öğrenci isteğinde yalnızca kendi soruları döner (Öğrenci İzolasyonu)', async () => {
      vi.mocked(getBearerOrCookieAccessToken).mockResolvedValue(
        'student-token',
      );
      vi.mocked(createServerSupabaseClient).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'student-uuid-1', email: 'ogrenci@okul.com' } },
            error: null,
          }),
        },
      } as unknown as ServerSupabase);
      vi.mocked(isAdminEmail).mockReturnValue(false);

      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      // Öğrencinin kendi sorusu döner
      const ownQuestions = [
        {
          id: 'q-1',
          student_id: 'student-uuid-1',
          student_name: 'Öğrenci 1',
          topic: 'Kareköklü Sayılar',
          question_text: 'Kök dışına çıkarma nasıl yapılıyor?',
          status: 'pending',
        },
      ];

      mockEq.mockResolvedValue({ data: ownQuestions, error: null });

      vi.mocked(createServiceRoleClient).mockReturnValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            order: mockOrder,
          }),
        }),
      } as unknown as ServiceRole);

      const req = new Request(
        'http://localhost:3000/api/live-lessons/questions',
      );
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.isAdmin).toBe(false);
      expect(json.questions).toHaveLength(1);
      expect(mockEq).toHaveBeenCalledWith('student_id', 'student-uuid-1');
    });

    it('öğretmen/admin isteğinde tüm sorular döner', async () => {
      vi.mocked(getBearerOrCookieAccessToken).mockResolvedValue('admin-token');
      vi.mocked(createServerSupabaseClient).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'admin-uuid', email: 'ugur@example.com' } },
            error: null,
          }),
        },
      } as unknown as ServerSupabase);
      vi.mocked(isAdminEmail).mockReturnValue(true);

      const allQuestions = [
        { id: 'q-1', student_name: 'Öğrenci 1', topic: 'Kareköklü' },
        { id: 'q-2', student_name: 'Öğrenci 2', topic: 'Üslü' },
      ];

      const mockOrder = vi
        .fn()
        .mockResolvedValue({ data: allQuestions, error: null });

      vi.mocked(createServiceRoleClient).mockReturnValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            order: mockOrder,
          }),
        }),
      } as unknown as ServiceRole);

      const req = new Request(
        'http://localhost:3000/api/live-lessons/questions',
      );
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.isAdmin).toBe(true);
      expect(json.questions).toHaveLength(2);
    });
  });

  describe('POST /api/live-lessons/questions', () => {
    it('öğrenci soru gönderdiğinde başarıyla eklenir', async () => {
      vi.mocked(getBearerOrCookieAccessToken).mockResolvedValue(
        'student-token',
      );
      vi.mocked(createServerSupabaseClient).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'student-uuid-1', email: 'ogrenci@okul.com' } },
            error: null,
          }),
        },
      } as unknown as ServerSupabase);

      const mockInserted = {
        id: 'q-new',
        student_id: 'student-uuid-1',
        student_name: 'Ali Can',
        topic: 'Çarpanlar',
        difficulty: 'Orta',
        question_text: 'EBOB ve EKOK formülleri nelerdir?',
        status: 'pending',
      };

      vi.mocked(createServiceRoleClient).mockReturnValue({
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi
                .fn()
                .mockResolvedValue({ data: mockInserted, error: null }),
            }),
          }),
        }),
      } as unknown as ServiceRole);

      const req = new Request(
        'http://localhost:3000/api/live-lessons/questions',
        {
          method: 'POST',
          body: JSON.stringify({
            student_name: 'Ali Can',
            topic: 'Çarpanlar',
            difficulty: 'Orta',
            question_text: 'EBOB ve EKOK formülleri nelerdir?',
          }),
        },
      );

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.question.id).toBe('q-new');
      expect(json.question.student_id).toBe('student-uuid-1');
    });
  });

  describe('PATCH /api/live-lessons/questions', () => {
    it('admin olmayan istek 403 döner', async () => {
      vi.mocked(requireAdmin).mockResolvedValue({
        error: new Response(JSON.stringify({ error: 'Yetkisiz' }), {
          status: 403,
        }),
      } as unknown as RequireAdminResult);

      const req = new Request(
        'http://localhost:3000/api/live-lessons/questions',
        {
          method: 'PATCH',
          body: JSON.stringify({ id: 'q-1', status: 'projected' }),
        },
      );

      const res = await PATCH(req);
      expect(res).toBeDefined();
      expect(res!.status).toBe(403);
    });

    it('admin soru durumunu projected veya resolved olarak güncelleyebilir', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      vi.mocked(requireAdmin).mockResolvedValue({
        serviceRole: {
          from: vi.fn().mockReturnValue({
            update: mockUpdate,
          }),
        },
        user: { id: 'admin-1', email: 'ugur@example.com' },
      } as unknown as RequireAdminResult);

      const req = new Request(
        'http://localhost:3000/api/live-lessons/questions',
        {
          method: 'PATCH',
          body: JSON.stringify({ id: 'q-1', status: 'projected' }),
        },
      );

      const res = await PATCH(req);
      expect(res).toBeDefined();
      const json = await res!.json();

      expect(res!.status).toBe(200);
      expect(json.ok).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'projected' });
    });
  });
});
