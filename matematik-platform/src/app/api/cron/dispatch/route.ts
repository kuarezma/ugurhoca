import { NextResponse } from 'next/server';
import { isAuthorizedCronRequest } from '@/lib/cron-auth';
import { sendDueAssignmentReminders } from '@/features/assignments/server/assignmentReminders';
import { sendDueLiveLessonReminders } from '@/features/live-lessons/server/liveLessons';
import { scanCurrentWeekWorksheetCandidates } from '@/lib/worksheet-candidate-scan';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { createLogger } from '@/lib/logger';

const log = createLogger('cron-dispatch');

export const runtime = 'nodejs';

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Yetkisiz istek.' }, { status: 401 });
  }

  const url = new URL(request.url);
  const specificJob = url.searchParams.get('job');
  const now = new Date();
  const isMonday = now.getDay() === 1;

  const results: Record<string, unknown> = {};
  const errors: Record<string, string> = {};

  log.info('Cron dispatch started', {
    specificJob,
    dayOfWeek: now.getDay(),
    isMonday,
  });

  // 1. Ödev Hatırlatmaları (Günlük)
  if (!specificJob || specificJob === 'daily' || specificJob === 'assignment-reminders') {
    try {
      results.assignmentReminders = await sendDueAssignmentReminders();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log.error('Cron job failed: assignment-reminders', { error: msg });
      errors.assignmentReminders = msg;
    }
  }

  // 2. Canlı Ders Hatırlatmaları (Günlük)
  if (!specificJob || specificJob === 'daily' || specificJob === 'live-lesson-reminders') {
    try {
      results.liveLessonReminders = await sendDueLiveLessonReminders();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log.error('Cron job failed: live-lesson-reminders', { error: msg });
      errors.liveLessonReminders = msg;
    }
  }

  // 3. Haftalık Çalışma Kâğıdı Aday Taraması (Pazartesi günleri veya haftalık tetiklemede)
  if (
    !specificJob
      ? isMonday
      : specificJob === 'weekly' || specificJob === 'worksheet-candidates'
  ) {
    try {
      results.worksheetCandidates = await scanCurrentWeekWorksheetCandidates(
        createServiceRoleClient(),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log.error('Cron job failed: worksheet-candidates', { error: msg });
      errors.worksheetCandidates = msg;
    }
  }

  // 4. Supabase Free Tier Inactivity Keepalive (Haftalık uykuya geçişi önleme)
  if (!specificJob || specificJob === 'daily' || specificJob === 'supabase-keepalive') {
    try {
      const supabase = createServiceRoleClient();
      const { count, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });

      if (error) throw error;
      results.supabaseKeepalive = { ok: true, count };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log.error('Cron job failed: supabase-keepalive', { error: msg });
      errors.supabaseKeepalive = msg;
    }
  }

  const hasErrors = Object.keys(errors).length > 0;
  log.info('Cron dispatch finished', {
    hasErrors,
    executedJobs: Object.keys(results),
  });

  return NextResponse.json(
    {
      ok: !hasErrors,
      timestamp: now.toISOString(),
      results,
      ...(hasErrors ? { errors } : {}),
    },
    { status: hasErrors ? 207 : 200 },
  );
}
