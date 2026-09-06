import { NextResponse } from 'next/server';
import { getGoogleDriveThumbnailUrl } from '@/lib/image-url';
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit';
import { isIP } from 'node:net';

const IMAGE_FETCH_TIMEOUT_MS = 7_000;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const DEFAULT_IMAGE_PROXY_ALLOWED_HOSTS = [
  'drive.google.com',
  '.googleusercontent.com',
  'i.ibb.co',
  'ibb.co',
  'imgur.com',
  'images.unsplash.com',
  'res.cloudinary.com',
  '.yandex.net',
  '.yandex.com',
  '.yandex.ru',
];

export async function GET(request: Request) {
  // Görsel-yoğun sayfalar tek gezinmede çok istek üretebildiği için limit yüksek
  // tutuldu; amaç yalnızca kötüye kullanımı (bant genişliği/SSRF amplifikasyonu) frenlemek.
  const limited = await enforceRateLimit('image-proxy', getClientIp(request), {
    limit: 120,
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

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return NextResponse.json({ error: 'Invalid url protocol' }, { status: 400 });
  }
  if (isPrivateOrLocalHost(parsed.hostname)) {
    return NextResponse.json({ error: 'Blocked hostname' }, { status: 400 });
  }
  if (!isAllowedRemoteHost(parsed.hostname, getAllowedImageProxyHosts())) {
    return NextResponse.json({ error: 'Hostname is not allowlisted' }, { status: 400 });
  }

  let fetchUrl = parsed.toString();

  if (/drive\.google\.com/i.test(url)) {
    fetchUrl = getGoogleDriveThumbnailUrl(url);
  }

  try {
    let res: Response | null = null;
    let currentUrl = fetchUrl;
    const maxRedirects = 3;

    for (let i = 0; i <= maxRedirects; i++) {
      res = await fetch(currentUrl, {
        cache: 'force-cache',
        redirect: 'manual',
        signal: AbortSignal.timeout(IMAGE_FETCH_TIMEOUT_MS),
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'image/*,*/*;q=0.8',
        },
      });

      if ([301, 302, 303, 307, 308].includes(res.status)) {
        const location = res.headers.get('location');
        if (!location) {
          return NextResponse.json({ error: 'Redirect without location' }, { status: 400 });
        }
        const nextUrl = new URL(location, currentUrl);
        if (!['http:', 'https:'].includes(nextUrl.protocol)) {
          return NextResponse.json({ error: 'Invalid redirect protocol' }, { status: 400 });
        }
        if (isPrivateOrLocalHost(nextUrl.hostname)) {
          return NextResponse.json({ error: 'Blocked redirect hostname' }, { status: 400 });
        }
        if (!isAllowedRemoteHost(nextUrl.hostname, getAllowedImageProxyHosts())) {
          return NextResponse.json({ error: 'Redirect hostname is not allowlisted' }, { status: 400 });
        }
        currentUrl = nextUrl.toString();
        continue;
      }

      break;
    }

    if (!res || !res.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: res?.status ?? 500 });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const contentLength = Number(res.headers.get('content-length') ?? '0');
    if (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'Image too large' }, { status: 413 });
    }

    if (!contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Fetched resource is not an image' },
        { status: 415 },
      );
    }

    const buffer = await res.arrayBuffer();
    if (buffer.byteLength > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'Image too large' }, { status: 413 });
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control':
          'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}

const parseAllowlist = (raw: string | undefined) =>
  (raw ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

const getAllowedImageProxyHosts = () => {
  const configured = parseAllowlist(process.env.IMAGE_PROXY_ALLOWED_HOSTS);
  return configured.length > 0 ? configured : DEFAULT_IMAGE_PROXY_ALLOWED_HOSTS;
};

const isAllowedRemoteHost = (host: string, allowlist: string[]) => {
  const lowerHost = host.toLowerCase();
  return allowlist.some((entry) => {
    const normalized = entry.trim().toLowerCase();
    if (!normalized) return false;
    if (normalized.startsWith('.')) {
      return lowerHost.endsWith(normalized);
    }
    return lowerHost === normalized || lowerHost.endsWith(`.${normalized}`);
  });
};

const isPrivateOrLocalHost = (host: string) => {
  const lowerHost = host.toLowerCase();
  if (lowerHost === 'localhost' || lowerHost.endsWith('.local')) {
    return true;
  }

  const ipKind = isIP(lowerHost);
  if (ipKind === 4) {
    return (
      lowerHost.startsWith('10.') ||
      lowerHost.startsWith('127.') ||
      lowerHost.startsWith('192.168.') ||
      lowerHost.startsWith('169.254.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(lowerHost)
    );
  }
  if (ipKind === 6) {
    return lowerHost === '::1' || lowerHost.startsWith('fc') || lowerHost.startsWith('fd');
  }
  return false;
};
