// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/cron-auth', () => ({
  isAuthorizedCronRequest: vi.fn(),
}));

vi.mock('@/features/assignments/server/assignmentReminders', () => ({
  sendDueAssignmentReminders: vi.fn(),
}));

import { isAuthorizedCronRequest } from '@/lib/cron-auth';
import { sendDueAssignmentReminders } from '@/features/assignments/server/assignmentReminders';
import { GET } from './route';

describe('GET /api/cron/assignment-reminders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cron yetkisi yoksa 401 döner', async () => {
    vi.mocked(isAuthorizedCronRequest).mockReturnValueOnce(false);

    const req = new Request(
      'https://ugurhoca.com/api/cron/assignment-reminders',
    );
    const res = await GET(req);
    expect(res).toBeDefined();
    if (!res) throw new Error('Response is undefined');

    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('Yetkisiz istek.');
    expect(sendDueAssignmentReminders).not.toHaveBeenCalled();
  });

  it('yetkili cron isteğinde hatırlatmaları gönderir ve 200 döner', async () => {
    vi.mocked(isAuthorizedCronRequest).mockReturnValueOnce(true);
    vi.mocked(sendDueAssignmentReminders).mockResolvedValueOnce({
      assignmentCount: 2,
      sentCount: 3,
      notifiedStudentIds: ['stu-1', 'stu-2'],
    });

    const req = new Request(
      'https://ugurhoca.com/api/cron/assignment-reminders',
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
      assignmentCount: number;
      sentCount: number;
      notifiedStudentIds: string[];
    };
    expect(body.ok).toBe(true);
    expect(body.assignmentCount).toBe(2);
    expect(body.sentCount).toBe(3);
    expect(body.notifiedStudentIds).toEqual(['stu-1', 'stu-2']);
    expect(sendDueAssignmentReminders).toHaveBeenCalledTimes(1);
  });
});
