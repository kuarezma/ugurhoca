import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

vi.mock('@/lib/cron-auth', () => ({
  isAuthorizedCronRequest: vi.fn(),
}));

vi.mock('@/features/assignments/server/assignmentReminders', () => ({
  sendDueAssignmentReminders: vi.fn(),
}));

vi.mock('@/features/live-lessons/server/liveLessons', () => ({
  sendDueLiveLessonReminders: vi.fn(),
}));

vi.mock('@/lib/worksheet-candidate-scan', () => ({
  scanCurrentWeekWorksheetCandidates: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({ count: 42, error: null }),
    }),
  }),
}));

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));

import { isAuthorizedCronRequest } from '@/lib/cron-auth';
import { sendDueAssignmentReminders } from '@/features/assignments/server/assignmentReminders';
import { sendDueLiveLessonReminders } from '@/features/live-lessons/server/liveLessons';
import { scanCurrentWeekWorksheetCandidates } from '@/lib/worksheet-candidate-scan';

describe('Cron Dispatch Route (/api/cron/dispatch)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('unauthorized isteklerde 401 döner', async () => {
    vi.mocked(isAuthorizedCronRequest).mockReturnValue(false);

    const req = new Request('https://ugurhoca.com/api/cron/dispatch');
    const res = await GET(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Yetkisiz istek.');
  });

  it('yetkili günlük istekte ödev ve canlı ders hatırlatıcılarını çalıştırır', async () => {
    vi.mocked(isAuthorizedCronRequest).mockReturnValue(true);
    vi.mocked(sendDueAssignmentReminders).mockResolvedValue({
      assignmentCount: 3,
      sentCount: 2,
      notifiedStudentIds: ['stu-1', 'stu-2'],
    });
    vi.mocked(sendDueLiveLessonReminders).mockResolvedValue({
      sent: 1,
    });

    const req = new Request('https://ugurhoca.com/api/cron/dispatch?job=daily');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(sendDueAssignmentReminders).toHaveBeenCalledTimes(1);
    expect(sendDueLiveLessonReminders).toHaveBeenCalledTimes(1);
    expect(scanCurrentWeekWorksheetCandidates).not.toHaveBeenCalled();
    expect(data.results.assignmentReminders).toEqual({
      assignmentCount: 3,
      sentCount: 2,
      notifiedStudentIds: ['stu-1', 'stu-2'],
    });
  });

  it('job=weekly parametresinde haftalık çalışma kâğıdı aday taramasını çalıştırır', async () => {
    vi.mocked(isAuthorizedCronRequest).mockReturnValue(true);
    vi.mocked(scanCurrentWeekWorksheetCandidates).mockResolvedValue({
      candidatesCreated: 5,
      weekNumber: 12,
    } as never);

    const req = new Request('https://ugurhoca.com/api/cron/dispatch?job=weekly');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(scanCurrentWeekWorksheetCandidates).toHaveBeenCalledTimes(1);
    expect(sendDueAssignmentReminders).not.toHaveBeenCalled();
    expect(sendDueLiveLessonReminders).not.toHaveBeenCalled();
    expect(data.results.worksheetCandidates).toEqual({
      candidatesCreated: 5,
      weekNumber: 12,
    });
  });

  it('job=supabase-keepalive parametresinde veritabanı uyandırma sorgusunu çalıştırır', async () => {
    vi.mocked(isAuthorizedCronRequest).mockReturnValue(true);

    const req = new Request('https://ugurhoca.com/api/cron/dispatch?job=supabase-keepalive');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.results.supabaseKeepalive).toEqual({
      ok: true,
      count: 42,
    });
  });
});
