import type { SupabaseClient } from '@supabase/supabase-js';

const RETENTION_DAYS = 180;

export async function cleanupExpiredNotifications(
  supabase: SupabaseClient,
): Promise<void> {
  const cutoffIso = new Date(
    Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { error } = await supabase
    .from('notifications')
    .delete()
    .in('type', ['message', 'moderation', 'report'])
    .lt('created_at', cutoffIso);

  if (error) throw error;
}
