import { NextResponse } from 'next/server';
import { isAuthorizedCronRequest } from '@/lib/cron-auth';
import { createLogger } from '@/lib/logger';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { scanCurrentWeekWorksheetCandidates } from '@/lib/worksheet-candidate-scan';

export const runtime = 'nodejs';

const log = createLogger('cron-worksheet-candidates');

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
    log.error('Haftalık test adayı taraması sırasında hata oluştu', error);
    return NextResponse.json(
      {
        error: 'Haftalık test adayı taraması yapılamadı. Lütfen daha sonra tekrar deneyin.',
      },
      { status: 500 },
    );
  }
}
