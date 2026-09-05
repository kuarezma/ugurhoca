import { NextResponse } from 'next/server';
import { isAuthorizedCronRequest } from '@/lib/cron-auth';
import { sendDueAssignmentReminders } from '@/features/assignments/server/assignmentReminders';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Yetkisiz istek.' }, { status: 401 });
  }

  const result = await sendDueAssignmentReminders();
  return NextResponse.json({ ok: true, ...result });
}
