import { NextResponse } from 'next/server';
import { isAuthorizedCronRequest } from '@/lib/cron-auth';
import { sendDueLiveLessonReminders } from '@/features/live-lessons/server/liveLessons';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Yetkisiz istek.' }, { status: 401 });
  }

  const result = await sendDueLiveLessonReminders();
  return NextResponse.json({ ok: true, ...result });
}
