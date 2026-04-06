import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  if (!/disk\.yandex|yadi\.sk/i.test(url)) {
    return NextResponse.json({ href: url });
  }

  try {
    const res = await fetch(
      `https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=${encodeURIComponent(url)}`,
      { cache: 'no-store' }
    );

    const data = await res.json();
    return NextResponse.json({ href: data?.href || url });
  } catch {
    return NextResponse.json({ href: url });
  }
}
