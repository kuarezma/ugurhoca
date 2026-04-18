import { NextResponse } from 'next/server';

import { resolveYandexPublicDownloadUrl } from '@/lib/yandex-public-download';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  const href = await resolveYandexPublicDownloadUrl(url);
  return NextResponse.json({ href });
}
