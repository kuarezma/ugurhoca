import { afterEach, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cleanupExpiredNotifications } from './notificationRetention';

afterEach(() => vi.useRealTimers());

it('removes only selected notification types older than 180 days', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-05T12:00:00.000Z'));

  const lt = vi.fn().mockResolvedValue({ error: null });
  const inTypes = vi.fn().mockReturnValue({ lt });
  const remove = vi.fn().mockReturnValue({ in: inTypes });
  const from = vi.fn().mockReturnValue({ delete: remove });

  await cleanupExpiredNotifications({ from } as unknown as SupabaseClient);

  expect(from).toHaveBeenCalledWith('notifications');
  expect(inTypes).toHaveBeenCalledWith('type', [
    'message',
    'moderation',
    'report',
  ]);
  expect(lt).toHaveBeenCalledWith('created_at', '2026-04-08T12:00:00.000Z');
});

it('reports database errors to the cron dispatcher', async () => {
  const failure = new Error('delete failed');
  const from = vi.fn().mockReturnValue({
    delete: () => ({
      in: () => ({ lt: () => Promise.resolve({ error: failure }) }),
    }),
  });

  await expect(
    cleanupExpiredNotifications({ from } as unknown as SupabaseClient),
  ).rejects.toBe(failure);
});
