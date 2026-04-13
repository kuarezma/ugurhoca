import { NextResponse } from 'next/server';
import { getGoogleDriveThumbnailUrl } from '@/lib/image-url';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  let fetchUrl = url;

  if (/drive\.google\.com/i.test(url)) {
    fetchUrl = getGoogleDriveThumbnailUrl(url);
  }

  try {
    const res = await fetch(fetchUrl, {
      cache: 'no-store',
      signal: AbortSignal.timeout(7000),
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'image/*,*/*;q=0.8',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: res.status });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';

    if (!contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Fetched resource is not an image' },
        { status: 415 },
      );
    }

    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}
