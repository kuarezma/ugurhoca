import { NextResponse } from 'next/server';
import { sendDueLiveLessonReminders } from '@/features/live-lessons/server/liveLessons';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Yetkisiz istek.' }, { status: 401 });
  }

  const result = await sendDueLiveLessonReminders();
  return NextResponse.json({ ok: true, ...result });
}
