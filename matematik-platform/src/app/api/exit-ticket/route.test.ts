import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { POST as respondPOST } from './respond/route';
import { requireAdmin } from '@/lib/api-auth';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { enforceRateLimit } from '@/lib/rate-limit';

type RequireAdminResult = Awaited<ReturnType<typeof requireAdmin>>;
type ServiceRoleClient = ReturnType<typeof createServiceRoleClient>;

vi.mock('@/lib/api-auth', () => ({
  requireAdmin: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: vi.fn().mockResolvedValue(null),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}));

describe('/api/exit-ticket Rotaları', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(enforceRateLimit).mockResolvedValue(null);
  });

  describe('GET /api/exit-ticket', () => {
    it('öğrenci isteğinde öğrenci isimleri KESİNLİKLE sızmamalıdır (Öğrenci İzolasyonu)', async () => {
      // Admin değil
      vi.mocked(requireAdmin).mockResolvedValue({
        error: new Response(JSON.stringify({ error: 'Yetkisiz' }), {
          status: 401,
        }),
      } as unknown as RequireAdminResult);

      const mockSession = {
        id: 'sess-123',
        code: '123456',
        title: 'Çarpanlar ve Katlar Çıkış Bileti',
        grade: 8,
        status: 'in_progress',
        current_question_index: 0,
        show_distribution: true,
        questions: [
          {
            id: 'q1',
            prompt: 'Soru 1',
            options: ['A', 'B', 'C', 'D'],
            correctIndex: 1,
          },
        ],
        created_at: new Date().toISOString(),
      };

      const mockResponses = [
        { question_index: 0, selected_index: 1 },
        { question_index: 0, selected_index: 1 },
        { question_index: 0, selected_index: 2 },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockImplementation((field: string) => {
            if (field === 'code') {
              return {
                single: vi
                  .fn()
                  .mockResolvedValue({ data: mockSession, error: null }),
              };
            }
            if (field === 'session_id') {
              return Promise.resolve({ data: mockResponses, error: null });
            }
            return {
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
            };
          }),
        }),
      });

      vi.mocked(createServiceRoleClient).mockReturnValue({
        from: mockFrom,
      } as unknown as ServiceRoleClient);

      const request = new Request(
        'http://localhost:3000/api/exit-ticket?code=123456',
      );
      const res = await GET(request);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.isAdmin).toBe(false);
      expect(json.code).toBe('123456');
      expect(json.totalResponses).toBe(3);
      expect(json.optionCounts).toEqual([0, 2, 1, 0]);

      // KRİTİK GÜVENLİK KONTROLÜ: Öğrenci isimleri veya bireysel yanıtlar asla dönmemeli
      expect(json).not.toHaveProperty('responses');
      expect(json).not.toHaveProperty('student_name');
      expect(json).not.toHaveProperty('studentName');
      const responseStr = JSON.stringify(json);
      expect(responseStr).not.toContain('student_name');
      expect(responseStr).not.toContain('studentName');
    });

    it('öğretmen/admin isteğinde oturum ve tüm öğrenci yanıtları döner', async () => {
      const mockSession = {
        id: 'sess-123',
        code: '123456',
        title: 'Çarpanlar ve Katlar Çıkış Bileti',
        grade: 8,
        status: 'in_progress',
        current_question_index: 0,
        show_distribution: true,
        questions: [
          {
            id: 'q1',
            prompt: 'Soru 1',
            options: ['A', 'B', 'C', 'D'],
            correctIndex: 1,
          },
        ],
        created_at: new Date().toISOString(),
      };

      const mockResponses = [
        {
          id: 'resp-1',
          session_id: 'sess-123',
          student_name: 'Ahmet Yılmaz',
          question_index: 0,
          selected_index: 1,
          answered_at: new Date().toISOString(),
        },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockImplementation((field: string) => {
            if (field === 'code') {
              return {
                single: vi
                  .fn()
                  .mockResolvedValue({ data: mockSession, error: null }),
              };
            }
            if (field === 'session_id') {
              return Promise.resolve({ data: mockResponses, error: null });
            }
            return {
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
            };
          }),
        }),
      });

      vi.mocked(requireAdmin).mockResolvedValue({
        serviceRole: { from: mockFrom },
        user: { id: 'admin-1', email: 'ugur@example.com' },
      } as unknown as RequireAdminResult);

      const request = new Request(
        'http://localhost:3000/api/exit-ticket?code=123456',
        {
          headers: { authorization: 'Bearer admin-token' },
        },
      );
      const res = await GET(request);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.isAdmin).toBe(true);
      expect(json.session.responses).toHaveLength(1);
      expect(json.session.responses[0].studentName).toBe('Ahmet Yılmaz');
    });
  });

  describe('POST /api/exit-ticket (Oturum Oluşturma)', () => {
    it('admin yetkisi yoksa 401/403 döner', async () => {
      vi.mocked(requireAdmin).mockResolvedValue({
        error: new Response(JSON.stringify({ error: 'Yetkisiz' }), {
          status: 403,
        }),
      } as unknown as RequireAdminResult);

      const request = new Request('http://localhost:3000/api/exit-ticket', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test', grade: 8 }),
      });
      const res = await POST(request);
      expect(res).toBeDefined();
      expect(res!.status).toBe(403);
    });

    it('admin başarılı oturum oluşturduğunda 6 haneli kodlu oturumu döner', async () => {
      const mockCreatedSession = {
        id: 'sess-new',
        code: '654321',
        title: 'Üslü İfadeler',
        grade: 8,
        status: 'lobby',
        current_question_index: 0,
        show_distribution: false,
        questions: [],
        created_at: new Date().toISOString(),
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi
              .fn()
              .mockResolvedValue({ data: mockCreatedSession, error: null }),
          }),
        }),
      });

      vi.mocked(requireAdmin).mockResolvedValue({
        serviceRole: { from: mockFrom },
        user: { id: 'admin-1', email: 'ugur@example.com' },
      } as unknown as RequireAdminResult);

      const request = new Request('http://localhost:3000/api/exit-ticket', {
        method: 'POST',
        headers: { authorization: 'Bearer admin-token' },
        body: JSON.stringify({
          title: 'Üslü İfadeler',
          grade: 8,
          questions: [],
        }),
      });
      const res = await POST(request);
      expect(res).toBeDefined();
      const json = await res!.json();

      expect(res!.status).toBe(200);
      expect(json.session.code).toBe('654321');
      expect(json.session.title).toBe('Üslü İfadeler');
    });
  });

  describe('POST /api/exit-ticket/respond (Öğrenci Yanıtı Gönderme)', () => {
    it('geçerli yanıtı upsert eder ve ok: true döner', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'sess-123', status: 'in_progress' },
              error: null,
            }),
          }),
        }),
        upsert: vi.fn().mockResolvedValue({ error: null }),
      });

      vi.mocked(createServiceRoleClient).mockReturnValue({
        from: mockFrom,
      } as unknown as ServiceRoleClient);

      const request = new Request(
        'http://localhost:3000/api/exit-ticket/respond',
        {
          method: 'POST',
          body: JSON.stringify({
            code: '123456',
            studentKey: 'key_abc123',
            studentName: 'Zeynep Kaya',
            questionIndex: 0,
            selectedIndex: 2,
          }),
        },
      );

      const res = await respondPOST(request);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.ok).toBe(true);
    });
  });
});
