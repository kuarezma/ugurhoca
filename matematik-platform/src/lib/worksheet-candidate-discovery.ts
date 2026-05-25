export type WorksheetCandidatePlanItem = {
  id: string;
  grade: number;
  week_start?: string | null;
  week_end?: string | null;
  subject: string;
  learning_outcome: string;
};

export type DiscoveredWorksheetCandidate = {
  annual_plan_item_id: string;
  grade: number;
  week_start?: string | null;
  week_end?: string | null;
  subject: string;
  learning_outcome: string;
  title: string;
  source_name: string | null;
  source_url: string;
  file_url: string;
  match_score: number;
  status: 'pending';
};

export type WorksheetDiscoveryResult = {
  candidates: DiscoveredWorksheetCandidate[];
  searchedSources: number;
  skippedSources: number;
};

type Fetcher = typeof fetch;

const MAX_SOURCES_PER_SCAN = 8;
const MAX_LINKS_PER_SOURCE = 80;
const MIN_MATCH_SCORE = 20;
const DEFAULT_TIMEOUT_MS = 8_000;

export function parseSourceUrls(raw: string | undefined) {
  return (raw ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

export function parseAllowedHosts(raw: string | undefined, sourceUrls: string[]) {
  const configured = (raw ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (configured.length > 0) {
    return configured;
  }

  return Array.from(
    new Set(
      sourceUrls
        .map((sourceUrl) => {
          try {
            return new URL(sourceUrl).hostname.toLowerCase();
          } catch {
            return '';
          }
        })
        .filter(Boolean),
    ),
  );
}

export async function discoverWorksheetCandidatesFromSources({
  allowedHosts,
  fetcher = fetch,
  planItem,
  sourceUrls,
}: {
  allowedHosts: string[];
  fetcher?: Fetcher;
  planItem: WorksheetCandidatePlanItem;
  sourceUrls: string[];
}): Promise<WorksheetDiscoveryResult> {
  const candidates = new Map<string, DiscoveredWorksheetCandidate>();
  let searchedSources = 0;
  let skippedSources = 0;

  for (const sourceUrl of sourceUrls.slice(0, MAX_SOURCES_PER_SCAN)) {
    const parsedSource = parseAllowedUrl(sourceUrl, allowedHosts);
    if (!parsedSource) {
      skippedSources += 1;
      continue;
    }

    searchedSources += 1;
    const response = await fetcher(parsedSource.toString(), {
      headers: { 'User-Agent': 'ugurhoca-worksheet-discovery/1.0' },
      redirect: 'follow',
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    });

    if (!response.ok) {
      skippedSources += 1;
      continue;
    }

    const contentType = response.headers.get('content-type')?.toLowerCase() || '';
    const sourceName = parsedSource.hostname.replace(/^www\./, '');

    if (isPdfUrl(parsedSource.toString()) || contentType.includes('pdf')) {
      const candidate = buildCandidate({
        fileUrl: parsedSource.toString(),
        linkText: '',
        planItem,
        sourceName,
        sourceUrl: parsedSource.toString(),
      });

      if (candidate.match_score >= MIN_MATCH_SCORE) {
        candidates.set(candidate.file_url, candidate);
      }
      continue;
    }

    const html = await response.text();
    const links = extractLinks(html, parsedSource).slice(0, MAX_LINKS_PER_SOURCE);

    for (const link of links) {
      const parsedFile = parseAllowedUrl(link.href, allowedHosts);
      if (!parsedFile || !isPdfUrl(parsedFile.toString())) {
        continue;
      }

      const candidate = buildCandidate({
        fileUrl: parsedFile.toString(),
        linkText: link.text,
        planItem,
        sourceName,
        sourceUrl: parsedSource.toString(),
      });

      if (candidate.match_score >= MIN_MATCH_SCORE) {
        candidates.set(candidate.file_url, candidate);
      }
    }
  }

  return {
    candidates: Array.from(candidates.values()).sort(
      (left, right) => right.match_score - left.match_score,
    ),
    searchedSources,
    skippedSources,
  };
}

function buildCandidate({
  fileUrl,
  linkText,
  planItem,
  sourceName,
  sourceUrl,
}: {
  fileUrl: string;
  linkText: string;
  planItem: WorksheetCandidatePlanItem;
  sourceName: string;
  sourceUrl: string;
}): DiscoveredWorksheetCandidate {
  const title = cleanTitle(linkText) || cleanTitle(decodeUrlName(fileUrl));
  const matchScore = calculateMatchScore(planItem, `${title} ${fileUrl}`);

  return {
    annual_plan_item_id: planItem.id,
    file_url: fileUrl,
    grade: planItem.grade,
    learning_outcome: planItem.learning_outcome,
    match_score: matchScore,
    source_name: sourceName,
    source_url: sourceUrl,
    status: 'pending',
    subject: planItem.subject,
    title: title || `${planItem.subject} Yaprak Test`,
    week_end: planItem.week_end,
    week_start: planItem.week_start,
  };
}

function calculateMatchScore(
  planItem: Pick<WorksheetCandidatePlanItem, 'grade' | 'learning_outcome' | 'subject'>,
  sourceText: string,
) {
  const source = normalizeSearchText(sourceText);
  const subjectTokens = tokenize(planItem.subject);
  const outcomeTokens = tokenize(planItem.learning_outcome);
  const importantTokens = [...subjectTokens, ...outcomeTokens].slice(0, 10);
  const matchedTokens = importantTokens.filter((token) => source.includes(token));
  const gradeMatched =
    source.includes(`${planItem.grade} sinif`) ||
    source.includes(`${planItem.grade}sinif`) ||
    source.includes(`${planItem.grade}-sinif`);
  const pdfMatched = source.includes('pdf') ? 10 : 0;
  const worksheetMatched =
    source.includes('test') || source.includes('yaprak') ? 15 : 0;

  if (importantTokens.length > 0 && matchedTokens.length === 0) {
    const broadMathPdfMatched =
      gradeMatched &&
      pdfMatched > 0 &&
      worksheetMatched > 0 &&
      source.includes('matematik');

    return broadMathPdfMatched ? MIN_MATCH_SCORE : 0;
  }

  const tokenScore =
    importantTokens.length === 0
      ? 0
      : Math.round((matchedTokens.length / importantTokens.length) * 55);

  return Math.min(100, tokenScore + (gradeMatched ? 20 : 0) + worksheetMatched + pdfMatched);
}

function extractLinks(html: string, baseUrl: URL) {
  const links: Array<{ href: string; text: string }> = [];
  const linkPattern = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(html)) !== null) {
    const href = match[1]?.trim();
    if (!href) {
      continue;
    }

    try {
      const linkText = stripHtml(match[2] || '');
      links.push({
        href: new URL(href, baseUrl).toString(),
        text: cleanTitle(
          `${getNearbyHtmlText(html, match.index)} ${linkText}`.trim(),
        ),
      });
    } catch {
      continue;
    }
  }

  return links;
}

function getNearbyHtmlText(html: string, linkIndex: number) {
  const contextStart = Math.max(0, linkIndex - 350);
  const context = html.slice(contextStart, linkIndex);
  const boundaryIndex = Math.max(
    context.lastIndexOf('</a>'),
    context.lastIndexOf('</tr>'),
    context.lastIndexOf('</li>'),
    context.lastIndexOf('</p>'),
  );
  const nearbyHtml = boundaryIndex >= 0 ? context.slice(boundaryIndex) : context;

  return stripHtml(nearbyHtml);
}

function parseAllowedUrl(value: string, allowedHosts: string[]) {
  let parsed: URL;
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

  if (!isAllowedHost(parsed.hostname, allowedHosts)) {
    return null;
  }

  return parsed;
}

function isAllowedHost(host: string, allowedHosts: string[]) {
  const lowerHost = host.toLowerCase();
  return allowedHosts.some((entry) => {
    const normalized = entry.trim().toLowerCase();
    if (!normalized) return false;
    if (normalized.startsWith('.')) {
      return lowerHost.endsWith(normalized);
    }
    return lowerHost === normalized || lowerHost.endsWith(`.${normalized}`);
  });
}

function isPrivateOrLocalHost(host: string) {
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

function isPdfUrl(value: string) {
  try {
    const parsed = new URL(value);
    return /\.pdf$/i.test(parsed.pathname);
  } catch {
    return /\.pdf(?:[?#].*)?$/i.test(value);
  }
}

function decodeUrlName(value: string) {
  try {
    const pathname = new URL(value).pathname;
    const fileName = pathname.split('/').pop() || '';
    return decodeURIComponent(fileName).replace(/\.pdf$/i, '');
  } catch {
    return value;
  }
}

function cleanTitle(value: string) {
  return stripHtml(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\.pdf$/i, '')
    .trim();
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(value: string) {
  return normalizeSearchText(value)
    .split(' ')
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOP_WORDS = new Set([
  'bir',
  'ile',
  'icin',
  'ilgili',
  'kazanim',
  'matematik',
  'sinif',
  'test',
  'testi',
  've',
  'ya',
  'yaprak',
]);
