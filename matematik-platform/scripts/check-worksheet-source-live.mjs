import dotenv from 'dotenv';

dotenv.config({ path: '.env.local', quiet: true });

const sourceUrls = (process.env.WORKSHEET_CANDIDATE_SOURCE_URLS || '')
  .split(/[,\n]+/)
  .map((value) => value.trim())
  .filter(Boolean);
const allowedHosts = (process.env.WORKSHEET_CANDIDATE_ALLOWED_HOSTS || '')
  .split(/[,\n]+/)
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

if (sourceUrls.length === 0) {
  console.error('WORKSHEET_CANDIDATE_SOURCE_URLS eksik.');
  process.exit(1);
}

for (const sourceUrl of sourceUrls.slice(0, 8)) {
  const parsed = parseAllowedUrl(sourceUrl);

  if (!parsed) {
    console.log(`ATLANDI  ${sourceUrl} - izinli veya geçerli URL değil`);
    continue;
  }

  const response = await fetch(parsed, {
    headers: { 'User-Agent': 'ugurhoca-source-check/1.0' },
    redirect: 'follow',
  });

  if (!response.ok) {
    console.log(`HATA  ${sourceUrl} - HTTP ${response.status}`);
    continue;
  }

  const contentType = response.headers.get('content-type')?.toLowerCase() || '';
  if (isPdfSource(parsed, contentType)) {
    console.log(
      `OK  ${sourceUrl} - ${contentType || 'content-type yok'} - doğrudan PDF kaynağı`,
    );
    continue;
  }

  const body = await response.text();
  const pdfLinks = [...body.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => {
      try {
        const href = new URL(match[1], parsed).toString();
        const text = cleanText(`${getNearbyHtmlText(body, match.index)} ${match[2] || ''}`);
        return { href, text };
      } catch {
        return null;
      }
    })
    .filter((link) => link?.href.toLowerCase().includes('.pdf'));
  const mathLinks = pdfLinks.filter((link) => isLikelyMathLink(link));

  console.log(
    `OK  ${sourceUrl} - ${contentType || 'content-type yok'} - ${pdfLinks.length} PDF linki, ${mathLinks.length} matematik adayı`,
  );
  for (const link of mathLinks.slice(0, 5)) {
    console.log(`  - ${link.href}`);
    if (link.text) {
      console.log(`    ${link.text.slice(0, 140)}`);
    }
  }
}

function parseAllowedUrl(value) {
  let parsed;

  try {
    parsed = new URL(value);
  } catch {
    return null;
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return null;
  }

  if (isPrivateOrLocalHost(parsed.hostname)) {
    return null;
  }

  if (allowedHosts.length === 0) {
    return parsed;
  }

  const host = parsed.hostname.toLowerCase();
  const isAllowed = allowedHosts.some(
    (allowedHost) => host === allowedHost || host.endsWith(`.${allowedHost}`),
  );

  return isAllowed ? parsed : null;
}

function isPdfSource(parsed, contentType) {
  return contentType.includes('pdf') || parsed.pathname.toLowerCase().endsWith('.pdf');
}

function isPrivateOrLocalHost(host) {
  const lowerHost = host.toLowerCase();
  if (lowerHost === 'localhost' || lowerHost.endsWith('.local')) {
    return true;
  }

  const ipv4 = lowerHost.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!ipv4) {
    return false;
  }

  const first = Number(ipv4[1]);
  const second = Number(ipv4[2]);

  return (
    first === 10 ||
    first === 127 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

function getNearbyHtmlText(html, linkIndex) {
  const contextStart = Math.max(0, linkIndex - 350);
  const context = html.slice(contextStart, linkIndex);
  const boundaryIndex = Math.max(
    context.lastIndexOf('</a>'),
    context.lastIndexOf('</tr>'),
    context.lastIndexOf('</li>'),
    context.lastIndexOf('</p>'),
  );

  return boundaryIndex >= 0 ? context.slice(boundaryIndex) : context;
}

function cleanText(value) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\b[a-z-]+\s*:\s*[^;"]+;?/gi, ' ')
    .replace(/[;">]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isLikelyMathLink(link) {
  const text = `${link.href} ${link.text}`.toLocaleLowerCase('tr');
  return (
    text.includes('mat') ||
    text.includes('matematik') ||
    text.includes('ktt') ||
    text.includes('kazanım') ||
    text.includes('kazanim')
  );
}
