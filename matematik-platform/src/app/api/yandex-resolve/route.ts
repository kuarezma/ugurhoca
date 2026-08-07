import { NextResponse } from 'next/server';

import { enforceRateLimit, getClientIp } from '@/lib/rate-limit';
import { resolveYandexPublicDownloadUrl } from '@/lib/yandex-public-download';

export async function GET(request: Request) {
  const limited = await enforceRateLimit('yandex-resolve', getClientIp(request), {
    limit: 20,
    windowSeconds: 60,
  });
  if (limited) {
    return limited;
  }

  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  const href = await resolveYandexPublicDownloadUrl(url);
  return NextResponse.json({ href });
}
