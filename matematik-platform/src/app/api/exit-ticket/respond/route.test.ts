import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';
import { POST } from './route';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit';

vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: vi.fn(),
  getClientIp: vi.fn(),
}));

const validBody = {
  code: '123456',
  studentKey: 'student-key',
  studentName: 'Deneme Öğrenci',
  questionIndex: 0,
  selectedIndex: 2,
};

function makeRequest(body: Record<string, unknown> = validBody) {
  return new Request('http://localhost/api/exit-ticket/respond', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/exit-ticket/respond', () => {
  const single = vi.fn();
  const eq = vi.fn();
  const select = vi.fn();
  const upsert = vi.fn();
  const from = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getClientIp).mockReturnValue('127.0.0.1');
    vi.mocked(enforceRateLimit).mockResolvedValue(null);
    single.mockResolvedValue({
      data: { id: 'session-1', status: 'active' },
      error: null,
    });
    eq.mockReturnValue({ single });
    select.mockReturnValue({ eq });
    upsert.mockResolvedValue({ error: null });
    from.mockImplementation((table: string) => {
      if (table === 'exit_ticket_sessions') return { select };
      if (table === 'exit_ticket_responses') return { upsert };
      throw new Error(`Beklenmeyen tablo: ${table}`);
    });
    vi.mocked(createServiceRoleClient).mockReturnValue({
      from,
    } as unknown as ReturnType<typeof createServiceRoleClient>);
  });

  it('aktif oturumda yanıtı kaydeder ve ok: true döndürür', async () => {
    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(select).toHaveBeenCalledWith('id, status');
    expect(eq).toHaveBeenCalledWith('code', validBody.code);
    expect(upsert).toHaveBeenCalledExactlyOnceWith(
      {
        session_id: 'session-1',
        student_key: validBody.studentKey,
        student_name: validBody.studentName,
        question_index: validBody.questionIndex,
        selected_index: validBody.selectedIndex,
        answered_at: expect.any(String),
      },
      { onConflict: 'session_id,student_key,question_index' },
    );
  });

  it.each([
    ['code', undefined, 'Geçersiz katılım kodu.'],
    ['code', '   ', 'Geçersiz katılım kodu.'],
    ['code', '12345', 'Geçersiz katılım kodu.'],
    ['code', '1234567', 'Geçersiz katılım kodu.'],
    ['studentKey', undefined, 'Geçersiz öğrenci anahtarı.'],
    ['studentKey', '   ', 'Geçersiz öğrenci anahtarı.'],
    ['studentKey', 'a'.repeat(65), 'Geçersiz öğrenci anahtarı.'],
    [
      'studentName',
      undefined,
      'Öğrenci adı 1 ile 60 karakter arasında olmalıdır.',
    ],
    ['studentName', '   ', 'Öğrenci adı 1 ile 60 karakter arasında olmalıdır.'],
    [
      'studentName',
      'a'.repeat(61),
      'Öğrenci adı 1 ile 60 karakter arasında olmalıdır.',
    ],
    ...[undefined, '0', -1, 21, 0.5].map((value) => [
      'questionIndex',
      value,
      'Geçersiz soru indeksi.',
    ]),
    ...[undefined, '0', -1, 6, 0.5].map((value) => [
      'selectedIndex',
      value,
      'Geçersiz seçenek indeksi.',
    ]),
  ])(
    '%s alanındaki geçersiz %j değerini reddeder',
    async (field, value, error) => {
      const response = await POST(
        makeRequest({ ...validBody, [String(field)]: value }),
      );

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error });
      expect(createServiceRoleClient).not.toHaveBeenCalled();
      expect(upsert).not.toHaveBeenCalled();
    },
  );

  it.each([
    { data: null, error: null },
    { data: null, error: { message: 'Bulunamadı' } },
  ])('oturum bulunamazsa 404 döndürür: %j', async (result) => {
    single.mockResolvedValue(result);

    const response = await POST(makeRequest());

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'Oturum bulunamadı.' });
    expect(from).not.toHaveBeenCalledWith('exit_ticket_responses');
    expect(upsert).not.toHaveBeenCalled();
  });

  it.each(['active', 'in_progress'])(
    '%j durumundaki aktif oturum için yanıtı başarıyla kaydeder',
    async (status) => {
      single.mockResolvedValue({
        data: { id: 'session-1', status },
        error: null,
      });

      const response = await POST(makeRequest());

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ ok: true });
      expect(from).toHaveBeenCalledWith('exit_ticket_responses');
      expect(upsert).toHaveBeenCalledTimes(1);
    },
  );

  it.each(['lobby', 'completed', 'cancelled', null, undefined])(
    'aktif veya devam ediyor olmayan %j durumunda yanıt kaydetmeden 400 döndürür',
    async (status) => {
      single.mockResolvedValue({
        data: { id: 'session-1', status },
        error: null,
      });

      const response = await POST(makeRequest());

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: 'Oturum aktif değil.' });
      expect(from).not.toHaveBeenCalledWith('exit_ticket_responses');
      expect(upsert).not.toHaveBeenCalled();
    },
  );

  it('hız sınırı yanıtını gövdeyi okumadan ve veritabanına erişmeden döndürür', async () => {
    const limited = new NextResponse(null, { status: 429 });
    vi.mocked(enforceRateLimit).mockResolvedValue(limited);
    const request = makeRequest();
    const json = vi.spyOn(request, 'json');

    expect(await POST(request)).toBe(limited);
    expect(getClientIp).toHaveBeenCalledWith(request);
    expect(enforceRateLimit).toHaveBeenCalledWith(
      'exit-ticket-respond',
      '127.0.0.1',
      {
        limit: 60,
        windowSeconds: 60,
      },
    );
    expect(json).not.toHaveBeenCalled();
    expect(createServiceRoleClient).not.toHaveBeenCalled();
  });

  it('bozuk JSON gövdesini 400 ile reddeder', async () => {
    const request = new Request('http://localhost/api/exit-ticket/respond', {
      method: 'POST',
      body: '{',
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Geçersiz istek gövdesi.' });
    expect(createServiceRoleClient).not.toHaveBeenCalled();
  });

  it('kayıt hatasında 500 döndürür', async () => {
    upsert.mockResolvedValue({ error: { message: 'Kayıt başarısız' } });

    const response = await POST(makeRequest());

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Yanıt kaydedilemedi.' });
  });
});
