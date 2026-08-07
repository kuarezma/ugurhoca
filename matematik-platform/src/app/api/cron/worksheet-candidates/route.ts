import { NextResponse } from 'next/server';
import { isAuthorizedCronRequest } from '@/lib/cron-auth';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { scanCurrentWeekWorksheetCandidates } from '@/lib/worksheet-candidate-scan';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Yetkisiz istek.' }, { status: 401 });
  }

  try {
    const result = await scanCurrentWeekWorksheetCandidates(
      createServiceRoleClient(),
    );
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Haftalık test adayı taraması yapılamadı.',
      },
      { status: 500 },
    );
  }
}
