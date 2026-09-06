import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendDueStreakReminders } from './streakReminders';

const mockInsert = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: () => ({
    from: mockFrom,
  }),
}));

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));

describe('sendDueStreakReminders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('risk altındaki öğrencileri tespit edip hatırlatma bildirimi oluşturur', async () => {
    const mockProfiles = [
      { id: 'student-1', current_streak: 5, full_name: 'Ahmet', email: 'ahmet@example.com' },
      { id: 'student-2', current_streak: 3, full_name: 'Zeynep', email: 'zeynep@example.com' },
    ];

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            gte: () => ({
              eq: vi.fn().mockResolvedValue({ data: mockProfiles, error: null }),
            }),
          }),
        };
      }
      if (table === 'notifications') {
        return {
          select: () => ({
            eq: () => ({
              gte: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
          insert: mockInsert.mockResolvedValue({ error: null }),
        };
      }
      return {};
    });

    const result = await sendDueStreakReminders();

    expect(result.remindedCount).toBe(2);
    expect(result.studentIds).toEqual(['student-1', 'student-2']);
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockInsert.mock.calls[0][0][0].title).toBe('🔥 Serin Bozulmak Üzere!');
  });

  it('öğrenciye bugün zaten bildirim gitmişse tekrar bildirim göndermez (idempotent)', async () => {
    const mockProfiles = [
      { id: 'student-1', current_streak: 5, full_name: 'Ahmet', email: 'ahmet@example.com' },
    ];

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            gte: () => ({
              eq: vi.fn().mockResolvedValue({ data: mockProfiles, error: null }),
            }),
          }),
        };
      }
      if (table === 'notifications') {
        return {
          select: () => ({
            eq: () => ({
              gte: vi.fn().mockResolvedValue({
                data: [{ user_id: 'student-1' }],
                error: null,
              }),
            }),
          }),
          insert: mockInsert,
        };
      }
      return {};
    });

    const result = await sendDueStreakReminders();

    expect(result.remindedCount).toBe(0);
    expect(mockInsert).not.toHaveBeenCalled();
  });
});
