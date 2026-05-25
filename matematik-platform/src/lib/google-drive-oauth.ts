const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';
const GOOGLE_DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const GOOGLE_DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';
const DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const DRIVE_FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';
const MAX_DRIVE_PDF_BYTES = 25 * 1024 * 1024;

export type GoogleDriveOAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export type GoogleDriveOAuthConfigStatus = {
  configured: boolean;
  missingKeys: string[];
};

export type GoogleDriveTokenResponse = {
  access_token: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
};

export type GoogleUserInfo = {
  email?: string;
};

export type GoogleDriveConnectionCredentials = {
  refresh_token: string;
};

export type GoogleDriveUploadInput = {
  candidateTitle: string;
  grade: number;
  learningOutcome: string;
  pdfBytes: Uint8Array;
  sourceFileUrl: string;
  subject: string;
};

export type GoogleDriveUploadResult = {
  fileId: string;
  fileUrl: string;
};

export function getGoogleDriveOAuthConfig(): GoogleDriveOAuthConfig {
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET || '';
  const redirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI || '';

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET ve GOOGLE_DRIVE_REDIRECT_URI ayarlanmalı.',
    );
  }

  return { clientId, clientSecret, redirectUri };
}

export function getGoogleDriveOAuthConfigStatus(): GoogleDriveOAuthConfigStatus {
  const requiredKeys = [
    'GOOGLE_DRIVE_CLIENT_ID',
    'GOOGLE_DRIVE_CLIENT_SECRET',
    'GOOGLE_DRIVE_REDIRECT_URI',
  ];
  const missingKeys = requiredKeys.filter((key) => !process.env[key]);

  return {
    configured: missingKeys.length === 0,
    missingKeys,
  };
}

export function buildGoogleDriveAuthUrl({
  config,
  state,
}: {
  config: GoogleDriveOAuthConfig;
  state: string;
}) {
  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('include_granted_scopes', 'true');
  url.searchParams.set('prompt', 'consent');
  url.searchParams.set('redirect_uri', config.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', DRIVE_FILE_SCOPE);
  url.searchParams.set('state', state);
  return url.toString();
}

export async function exchangeGoogleDriveCode({
  code,
  config,
}: {
  code: string;
  config: GoogleDriveOAuthConfig;
}) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri,
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Google Drive yetkilendirme kodu doğrulanamadı.');
  }

  return (await response.json()) as GoogleDriveTokenResponse;
}

export async function refreshGoogleDriveAccessToken({
  config,
  refreshToken,
}: {
  config: GoogleDriveOAuthConfig;
  refreshToken: string;
}) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Google Drive erişim anahtarı yenilenemedi.');
  }

  return (await response.json()) as GoogleDriveTokenResponse;
}

export async function fetchGoogleUserInfo(accessToken: string) {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as GoogleUserInfo;
}

export function getGoogleTokenExpiry(expiresIn?: number) {
  if (!expiresIn || !Number.isFinite(expiresIn)) {
    return null;
  }

  return new Date(Date.now() + expiresIn * 1000).toISOString();
}

export async function downloadPdfForDriveUpload(fileUrl: string) {
  const parsed = parsePublicHttpUrl(fileUrl);
  if (!parsed) {
    throw new Error('PDF bağlantısı geçersiz.');
  }

  const response = await fetch(parsed.toString(), {
    headers: { 'User-Agent': 'ugurhoca-drive-upload/1.0' },
    redirect: 'follow',
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) {
    throw new Error('PDF indirilemedi.');
  }

  const contentLength = Number(response.headers.get('content-length') || '0');
  if (Number.isFinite(contentLength) && contentLength > MAX_DRIVE_PDF_BYTES) {
    throw new Error('PDF dosyası çok büyük.');
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > MAX_DRIVE_PDF_BYTES) {
    throw new Error('PDF dosyası çok büyük.');
  }

  const contentType = response.headers.get('content-type')?.toLowerCase() || '';
  const looksLikePdf =
    contentType.includes('pdf') ||
    parsed.pathname.toLowerCase().endsWith('.pdf') ||
    (bytes.length >= 4 &&
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46);

  if (!looksLikePdf) {
    throw new Error('Bağlantı PDF dosyası döndürmüyor.');
  }

  return bytes;
}

export async function uploadWorksheetPdfToDrive({
  accessToken,
  input,
}: {
  accessToken: string;
  input: GoogleDriveUploadInput;
}): Promise<GoogleDriveUploadResult> {
  const parentId = await ensureDriveFolderPath({
    accessToken,
    folders: [
      'Yaprak Testler',
      `${input.grade}. Sınıf`,
      input.learningOutcome || input.subject,
    ],
  });
  const uploadResult = await uploadPdfFile({
    accessToken,
    fileName: buildWorksheetPdfFileName(input),
    parentId,
    pdfBytes: input.pdfBytes,
  });

  await shareDriveFile(accessToken, uploadResult.id);

  return {
    fileId: uploadResult.id,
    fileUrl: uploadResult.webViewLink || uploadResult.webContentLink,
  };
}

async function ensureDriveFolderPath({
  accessToken,
  folders,
}: {
  accessToken: string;
  folders: string[];
}) {
  let parentId = 'root';

  for (const folder of folders) {
    const folderName = sanitizeDriveName(folder);
    parentId = await findOrCreateDriveFolder({
      accessToken,
      name: folderName,
      parentId,
    });
  }

  return parentId;
}

async function findOrCreateDriveFolder({
  accessToken,
  name,
  parentId,
}: {
  accessToken: string;
  name: string;
  parentId: string;
}) {
  const query = [
    `name = '${escapeDriveQueryValue(name)}'`,
    `mimeType = '${DRIVE_FOLDER_MIME_TYPE}'`,
    `'${escapeDriveQueryValue(parentId)}' in parents`,
    'trashed = false',
  ].join(' and ');
  const searchUrl = new URL(GOOGLE_DRIVE_FILES_URL);
  searchUrl.searchParams.set('fields', 'files(id,name)');
  searchUrl.searchParams.set('pageSize', '1');
  searchUrl.searchParams.set('q', query);

  const searchResponse = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!searchResponse.ok) {
    throw new Error('Google Drive klasörü aranamadı.');
  }

  const searchPayload = (await searchResponse.json()) as {
    files?: Array<{ id?: string }>;
  };
  const existingId = searchPayload.files?.[0]?.id;
  if (existingId) {
    return existingId;
  }

  const createResponse = await fetch(`${GOOGLE_DRIVE_FILES_URL}?fields=id`, {
    body: JSON.stringify({
      mimeType: DRIVE_FOLDER_MIME_TYPE,
      name,
      parents: parentId === 'root' ? undefined : [parentId],
    }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!createResponse.ok) {
    throw new Error('Google Drive klasörü oluşturulamadı.');
  }

  const createPayload = (await createResponse.json()) as { id?: string };
  if (!createPayload.id) {
    throw new Error('Google Drive klasör kimliği alınamadı.');
  }

  return createPayload.id;
}

async function uploadPdfFile({
  accessToken,
  fileName,
  parentId,
  pdfBytes,
}: {
  accessToken: string;
  fileName: string;
  parentId: string;
  pdfBytes: Uint8Array;
}) {
  const boundary = `ugurhoca_${crypto.randomUUID()}`;
  const metadata = {
    mimeType: 'application/pdf',
    name: fileName,
    parents: parentId === 'root' ? undefined : [parentId],
  };
  const pdfArrayBuffer = new ArrayBuffer(pdfBytes.byteLength);
  new Uint8Array(pdfArrayBuffer).set(pdfBytes);
  const body = new Blob([
    `--${boundary}\r\n`,
    'Content-Type: application/json; charset=UTF-8\r\n\r\n',
    JSON.stringify(metadata),
    `\r\n--${boundary}\r\n`,
    'Content-Type: application/pdf\r\n\r\n',
    pdfArrayBuffer,
    `\r\n--${boundary}--`,
  ]);
  const uploadUrl = new URL(GOOGLE_DRIVE_UPLOAD_URL);
  uploadUrl.searchParams.set('fields', 'id,webContentLink,webViewLink');
  uploadUrl.searchParams.set('uploadType', 'multipart');

  const response = await fetch(uploadUrl, {
    body,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('PDF Google Drive’a yüklenemedi.');
  }

  const payload = (await response.json()) as {
    id?: string;
    webContentLink?: string;
    webViewLink?: string;
  };

  if (!payload.id || (!payload.webViewLink && !payload.webContentLink)) {
    throw new Error('Google Drive dosya bağlantısı alınamadı.');
  }

  return {
    id: payload.id,
    webContentLink: payload.webContentLink || '',
    webViewLink: payload.webViewLink || '',
  };
}

async function shareDriveFile(accessToken: string, fileId: string) {
  const response = await fetch(
    `${GOOGLE_DRIVE_FILES_URL}/${encodeURIComponent(fileId)}/permissions?fields=id`,
    {
      body: JSON.stringify({
        allowFileDiscovery: false,
        role: 'reader',
        type: 'anyone',
      }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    },
  );

  if (!response.ok) {
    throw new Error('Google Drive paylaşım izni verilemedi.');
  }
}

export function buildWorksheetPdfFileName(input: GoogleDriveUploadInput) {
  const title = sanitizeDriveName(input.candidateTitle || input.subject);
  return title.toLowerCase().endsWith('.pdf') ? title : `${title}.pdf`;
}

function sanitizeDriveName(value: string) {
  return (
    value
      .replace(/[\\/:*?"<>|]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120) || 'Yaprak Test'
  );
}

function escapeDriveQueryValue(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function parsePublicHttpUrl(value: string) {
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

  return parsed;
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
