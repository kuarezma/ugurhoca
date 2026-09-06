import { createServiceRoleClient } from '@/lib/supabase/server';
import { createLogger } from '@/lib/logger';

const log = createLogger('streak-reminders');

export async function sendDueStreakReminders() {
  const supabase = createServiceRoleClient();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Dün aktif olan, bugün henüz girmeyen ve serisi en az 2 gün olan öğrencileri bul
  const { data: atRiskProfiles, error: fetchError } = await supabase
    .from('profiles')
    .select('id, current_streak, full_name, email')
    .gte('current_streak', 2)
    .eq('last_active_date', yesterdayStr);

  if (fetchError) {
    log.error('Failed to fetch streak at-risk profiles', fetchError);
    throw fetchError;
  }

  if (!atRiskProfiles || atRiskProfiles.length === 0) {
    return { remindedCount: 0, studentIds: [] };
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Bugün bu öğrencilere zaten streak hatırlatması atılıp atılmadığını kontrol et
  const { data: existingNotifs } = await supabase
    .from('notifications')
    .select('user_id')
    .eq('type', 'streak_reminder')
    .gte('created_at', `${todayStr}T00:00:00Z`);

  const alreadyNotified = new Set((existingNotifs || []).map((n: { user_id: string }) => n.user_id));
  const toRemind = atRiskProfiles.filter((p: { id: string }) => !alreadyNotified.has(p.id));

  if (toRemind.length === 0) {
    return { remindedCount: 0, studentIds: [] };
  }

  const rows = toRemind.map((profile: { id: string; current_streak: number }) => ({
    user_id: profile.id,
    title: '🔥 Serin Bozulmak Üzere!',
    message: `${profile.current_streak} günlük harika çalışma serin bozulmasın! Bugün bir soru çözerek veya formüllere göz atarak serini koru.`,
    type: 'streak_reminder',
    is_read: false,
    metadata: {
      streak: profile.current_streak,
      href: '/testler',
    },
  }));

  const { error: insertError } = await supabase.from('notifications').insert(rows);

  if (insertError) {
    log.error('Failed to insert streak reminders', insertError);
    throw insertError;
  }

  log.info('Streak reminders sent successfully', { count: rows.length });
  return { remindedCount: rows.length, studentIds: toRemind.map((p: { id: string }) => p.id) };
}
