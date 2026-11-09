import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock('server-only', () => ({}));

const {
  mockVerifyPersistToken,
  mockReadBearerToken,
  mockIsValidRoomId,
  mockEnforceRateLimit,
  mockSupabaseFrom,
} = vi.hoisted(() => ({
  mockVerifyPersistToken: vi.fn(),
  mockReadBearerToken: vi.fn(),
  mockIsValidRoomId: vi.fn(),
  mockEnforceRateLimit: vi.fn(),
  mockSupabaseFrom: vi.fn(),
}));

vi.mock('@/features/live-lessons/lib/lesson-auth', () => ({
  verifyPersistToken: mockVerifyPersistToken,
  readBearerToken: mockReadBearerToken,
  isValidRoomId: mockIsValidRoomId,
}));

vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: mockEnforceRateLimit,
}));

vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: vi.fn(() => ({
    from: mockSupabaseFrom,
  })),
}));

import { POST } from './route';

describe('POST /api/lessons/persist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnforceRateLimit.mockResolvedValue(null);
    mockReadBearerToken.mockImplementation((header: string | null) => {
      if (!header || !header.startsWith('Bearer ')) return null;
      return header.slice(7).trim();
    });
    mockIsValidRoomId.mockReturnValue(true);
  });

  it('kayıt tokeni eksik veya geçersiz olduğunda 401 döner', async () => {
    mockVerifyPersistToken.mockReturnValue(null);

    const request = new Request('https://ugurhoca.com/api/lessons/persist', {
      method: 'POST',
      headers: { authorization: 'Bearer invalid-persist-token' },
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Geçersiz kayıt tokeni.');
  });

  it('rate limit aşıldığında 429 döner', async () => {
    mockVerifyPersistToken.mockReturnValue({
      roomId: 'room-101',
      identity: 'teacher_1',
      role: 'teacher',
    });
    mockEnforceRateLimit.mockResolvedValue(
      NextResponse.json({ error: 'Çok fazla istek.' }, { status: 429 }),
    );

    const request = new Request('https://ugurhoca.com/api/lessons/persist', {
      method: 'POST',
      headers: { authorization: 'Bearer valid-token' },
    });

    const response = await POST(request);

    expect(response.status).toBe(429);
  });

  it('istek gövdesi eksik veya geçersiz olduğunda 400 döner', async () => {
    mockVerifyPersistToken.mockReturnValue({
      roomId: 'room-101',
      identity: 'teacher_1',
      role: 'teacher',
    });

    const request = new Request('https://ugurhoca.com/api/lessons/persist', {
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
      body: 'invalid-json',
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Geçersiz olay verisi.');
  });

  it('gövdedeki roomId token ile eşleşmediğinde 400 döner', async () => {
    mockVerifyPersistToken.mockReturnValue({
      roomId: 'room-101',
      identity: 'teacher_1',
      role: 'teacher',
    });

    const request = new Request('https://ugurhoca.com/api/lessons/persist', {
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomId: 'mismatched-room',
        event: 'whiteboard_draw',
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Geçersiz olay verisi.');
  });

  it('olay türü (event) eksikse 400 döner', async () => {
    mockVerifyPersistToken.mockReturnValue({
      roomId: 'room-101',
      identity: 'teacher_1',
      role: 'teacher',
    });

    const request = new Request('https://ugurhoca.com/api/lessons/persist', {
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomId: 'room-101',
        event: '',
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Geçersiz olay verisi.');
  });

  it('veritabanında ders bulunamadığında 404 döner', async () => {
    mockVerifyPersistToken.mockReturnValue({
      roomId: 'room-101',
      identity: 'teacher_1',
      role: 'teacher',
    });

    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi
            .fn()
            .mockResolvedValue({ data: null, error: { message: 'Not found' } }),
        }),
      }),
    });

    const request = new Request('https://ugurhoca.com/api/lessons/persist', {
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomId: 'room-101',
        event: 'whiteboard_draw',
        payload: { x: 10, y: 20 },
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Ders bulunamadı.');
  });

  it('başarılı olay kaydında olayı veritabanına ekler ve 200 döner', async () => {
    mockVerifyPersistToken.mockReturnValue({
      roomId: 'room-101',
      identity: 'teacher_1',
      role: 'teacher',
    });

    const insertMock = vi.fn().mockResolvedValue({ error: null });

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'live_lessons') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi
                .fn()
                .mockResolvedValue({
                  data: { id: 'lesson-uuid-42' },
                  error: null,
                }),
            }),
          }),
        };
      }
      if (table === 'live_lesson_events') {
        return { insert: insertMock };
      }
      return {};
    });

    const request = new Request('https://ugurhoca.com/api/lessons/persist', {
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomId: 'room-101',
        event: 'whiteboard_draw',
        payload: { path: [1, 2, 3] },
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.ok).toBe(true);

    expect(insertMock).toHaveBeenCalledWith({
      event_type: 'whiteboard_draw',
      lesson_id: 'lesson-uuid-42',
      payload: {
        path: [1, 2, 3],
        identity: 'teacher_1',
        role: 'teacher',
      },
    });
  });
});
