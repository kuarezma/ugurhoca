// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/cron-auth', () => ({
  isAuthorizedCronRequest: vi.fn(),
}));

vi.mock('@/features/live-lessons/server/liveLessons', () => ({
  sendDueLiveLessonReminders: vi.fn(),
}));

import { isAuthorizedCronRequest } from '@/lib/cron-auth';
import { sendDueLiveLessonReminders } from '@/features/live-lessons/server/liveLessons';
import { GET } from './route';

describe('GET /api/cron/live-lesson-reminders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cron yetkisi yoksa 401 döner', async () => {
    vi.mocked(isAuthorizedCronRequest).mockReturnValueOnce(false);

    const req = new Request(
      'https://ugurhoca.com/api/cron/live-lesson-reminders',
    );
    const res = await GET(req);
    expect(res).toBeDefined();
    if (!res) throw new Error('Response is undefined');

    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('Yetkisiz istek.');
    expect(sendDueLiveLessonReminders).not.toHaveBeenCalled();
  });

  it('yetkili cron isteğinde canlı ders hatırlatmalarını gönderir ve 200 döner', async () => {
    vi.mocked(isAuthorizedCronRequest).mockReturnValueOnce(true);
    vi.mocked(sendDueLiveLessonReminders).mockResolvedValueOnce({
      sent: 2,
    });

    const req = new Request(
      'https://ugurhoca.com/api/cron/live-lesson-reminders',
      {
        headers: { authorization: 'Bearer cron-secret-key' },
      },
    );
    const res = await GET(req);
    expect(res).toBeDefined();
    if (!res) throw new Error('Response is undefined');

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      ok: boolean;
      sent: number;
    };
    expect(body.ok).toBe(true);
    expect(body.sent).toBe(2);
    expect(sendDueLiveLessonReminders).toHaveBeenCalledTimes(1);
  });
});
