import { NextResponse } from 'next/server';

const extractDriveId = (url: string): string | null => {
  const patterns = [
    /drive\.google\.com\/file\/d\/([^/?]+)/,
    /drive\.google\.com\/open\?id=([^&]+)/,
    /drive\.google\.com\/thumbnail\?id=([^&]+)/,
    /drive\.google\.com\/[^?]*id=([^&/?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  let fetchUrl = url;

  if (/drive\.google\.com/i.test(url)) {
    const driveId = extractDriveId(url);
    if (driveId) {
      fetchUrl = `https://drive.google.com/thumbnail?id=${driveId}&sz=w800`;
    }
  }

  try {
    const res = await fetch(fetchUrl, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'image/*,*/*;q=0.8',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: res.status });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
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
