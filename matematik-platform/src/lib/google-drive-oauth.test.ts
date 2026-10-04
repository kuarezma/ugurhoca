import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildGoogleDriveAuthUrl,
  buildWorksheetPdfFileName,
  downloadPdfForDriveUpload,
  exchangeGoogleDriveCode,
  fetchGoogleUserInfo,
  getGoogleDriveOAuthConfig,
  getGoogleDriveOAuthConfigStatus,
  getGoogleTokenExpiry,
  refreshGoogleDriveAccessToken,
  uploadWorksheetPdfToDrive,
} from '@/lib/google-drive-oauth';

const baseInput = {
  grade: 8,
  learningOutcome: 'M.8.1.2.1. Üslü ifadelerle ilgili temel kuralları anlar.',
  pdfBytes: new Uint8Array([0x25, 0x50, 0x44, 0x46]),
  sourceFileUrl: 'https://meb.gov.tr/test.pdf',
  subject: 'Üslü İfadeler',
};

describe('google drive worksheet helpers', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('configuration helpers', () => {
    it('throws error when required Google Drive environment variables are missing', () => {
      delete process.env.GOOGLE_DRIVE_CLIENT_ID;
      delete process.env.GOOGLE_DRIVE_CLIENT_SECRET;
      delete process.env.GOOGLE_DRIVE_REDIRECT_URI;

      expect(() => getGoogleDriveOAuthConfig()).toThrow(
        'GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET ve GOOGLE_DRIVE_REDIRECT_URI ayarlanmalı.',
      );
    });

    it('returns config object when all environment variables are present', () => {
      process.env.GOOGLE_DRIVE_CLIENT_ID = 'test-client-id';
      process.env.GOOGLE_DRIVE_CLIENT_SECRET = 'test-client-secret';
      process.env.GOOGLE_DRIVE_REDIRECT_URI = 'https://ugurhoca.test/oauth/callback';

      expect(getGoogleDriveOAuthConfig()).toEqual({
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        redirectUri: 'https://ugurhoca.test/oauth/callback',
      });
    });

    it('reports missing keys and status via getGoogleDriveOAuthConfigStatus', () => {
      delete process.env.GOOGLE_DRIVE_CLIENT_ID;
      process.env.GOOGLE_DRIVE_CLIENT_SECRET = 'secret';
      delete process.env.GOOGLE_DRIVE_REDIRECT_URI;

      const status = getGoogleDriveOAuthConfigStatus();
      expect(status.configured).toBe(false);
      expect(status.missingKeys).toContain('GOOGLE_DRIVE_CLIENT_ID');
      expect(status.missingKeys).toContain('GOOGLE_DRIVE_REDIRECT_URI');
      expect(status.missingKeys).not.toContain('GOOGLE_DRIVE_CLIENT_SECRET');

      process.env.GOOGLE_DRIVE_CLIENT_ID = 'id';
      process.env.GOOGLE_DRIVE_REDIRECT_URI = 'uri';
      const completeStatus = getGoogleDriveOAuthConfigStatus();
      expect(completeStatus.configured).toBe(true);
      expect(completeStatus.missingKeys).toEqual([]);
    });

    it('builds standard authorization URL with required scopes and query params', () => {
      const config = {
        clientId: 'id-123',
        clientSecret: 'sec-456',
        redirectUri: 'https://example.com/callback',
      };
      const authUrl = buildGoogleDriveAuthUrl({ config, state: 'state-random-uuid' });
      const parsed = new URL(authUrl);

      expect(parsed.hostname).toBe('accounts.google.com');
      expect(parsed.searchParams.get('client_id')).toBe('id-123');
      expect(parsed.searchParams.get('redirect_uri')).toBe('https://example.com/callback');
      expect(parsed.searchParams.get('state')).toBe('state-random-uuid');
      expect(parsed.searchParams.get('access_type')).toBe('offline');
      expect(parsed.searchParams.get('prompt')).toBe('consent');
    });
  });

  describe('token and user info API calls', () => {
    const config = {
      clientId: 'id-123',
      clientSecret: 'sec-456',
      redirectUri: 'https://example.com/callback',
    };

    it('exchanges code for tokens successfully', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        json: async () => ({
          access_token: 'token-abc',
          expires_in: 3600,
          refresh_token: 'refresh-xyz',
        }),
        ok: true,
      } as Response);

      const tokens = await exchangeGoogleDriveCode({ code: 'auth-code-123', config });
      expect(tokens.access_token).toBe('token-abc');
      expect(tokens.refresh_token).toBe('refresh-xyz');
    });

    it('throws error when code exchange fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
      } as Response);

      await expect(
        exchangeGoogleDriveCode({ code: 'invalid-code', config }),
      ).rejects.toThrow('Google Drive yetkilendirme kodu doğrulanamadı.');
    });

    it('refreshes access token successfully', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        json: async () => ({
          access_token: 'new-token-123',
          expires_in: 3600,
        }),
        ok: true,
      } as Response);

      const tokens = await refreshGoogleDriveAccessToken({
        config,
        refreshToken: 'refresh-xyz',
      });
      expect(tokens.access_token).toBe('new-token-123');
    });

    it('throws error when token refresh fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
      } as Response);

      await expect(
        refreshGoogleDriveAccessToken({ config, refreshToken: 'expired-refresh' }),
      ).rejects.toThrow('Google Drive erişim anahtarı yenilenemedi.');
    });

    it('fetches user info successfully and handles failure gracefully', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');

      fetchSpy.mockResolvedValueOnce({
        json: async () => ({ email: 'teacher@example.com' }),
        ok: true,
      } as Response);

      const userInfo = await fetchGoogleUserInfo('access-token-123');
      expect(userInfo).toEqual({ email: 'teacher@example.com' });

      fetchSpy.mockResolvedValueOnce({
        ok: false,
      } as Response);

      const failedInfo = await fetchGoogleUserInfo('bad-token');
      expect(failedInfo).toBeNull();
    });

    it('calculates token expiry timestamp', () => {
      expect(getGoogleTokenExpiry(undefined)).toBeNull();
      expect(getGoogleTokenExpiry(NaN)).toBeNull();

      const expiry = getGoogleTokenExpiry(3600);
      expect(expiry).not.toBeNull();
      expect(new Date(expiry!).getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('file name and download handling', () => {
    it('uses the standard worksheet title as the PDF file name', () => {
      expect(
        buildWorksheetPdfFileName({
          ...baseInput,
          candidateTitle: '8. Sınıf Matematik - Üslü İfadeler - Yaprak Test 01',
        }),
      ).toBe('8. Sınıf Matematik - Üslü İfadeler - Yaprak Test 01.pdf');
    });

    it('keeps an existing PDF extension and removes unsafe Drive characters', () => {
      expect(
        buildWorksheetPdfFileName({
          ...baseInput,
          candidateTitle:
            '8. Sınıf Matematik: Üslü/İfadeler? - Yaprak Test 01.pdf',
        }),
      ).toBe('8. Sınıf Matematik Üslü İfadeler - Yaprak Test 01.pdf');
    });

    it('downloads shared Google Drive file links through the direct download URL', async () => {
      const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        arrayBuffer: async () =>
          new Uint8Array([0x25, 0x50, 0x44, 0x46]).buffer,
        headers: new Headers({ 'content-type': 'application/pdf' }),
        ok: true,
      } as Response);

      const bytes = await downloadPdfForDriveUpload(
        'https://drive.google.com/file/d/drive-file-1/view?usp=sharing',
      );

      expect(bytes).toEqual(new Uint8Array([0x25, 0x50, 0x44, 0x46]));
      expect(fetchMock).toHaveBeenCalledWith(
        'https://drive.google.com/uc?export=download&id=drive-file-1',
        expect.objectContaining({ redirect: 'follow' }),
      );
    });

    it('rejects invalid or private URLs in downloadPdfForDriveUpload', async () => {
      await expect(downloadPdfForDriveUpload('not-a-valid-url')).rejects.toThrow(
        'PDF bağlantısı geçersiz.',
      );
      await expect(
        downloadPdfForDriveUpload('ftp://example.com/test.pdf'),
      ).rejects.toThrow('PDF bağlantısı geçersiz.');
      await expect(
        downloadPdfForDriveUpload('http://localhost:3000/test.pdf'),
      ).rejects.toThrow('PDF bağlantısı geçersiz.');
      await expect(
        downloadPdfForDriveUpload('http://127.0.0.1/test.pdf'),
      ).rejects.toThrow('PDF bağlantısı geçersiz.');
      await expect(
        downloadPdfForDriveUpload('http://192.168.1.5/test.pdf'),
      ).rejects.toThrow('PDF bağlantısı geçersiz.');
      await expect(
        downloadPdfForDriveUpload('http://10.0.0.1/test.pdf'),
      ).rejects.toThrow('PDF bağlantısı geçersiz.');
      await expect(
        downloadPdfForDriveUpload('http://172.20.0.1/test.pdf'),
      ).rejects.toThrow('PDF bağlantısı geçersiz.');
    });

    it('throws error when download returns non-ok response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
      } as Response);

      await expect(
        downloadPdfForDriveUpload('https://example.com/notfound.pdf'),
      ).rejects.toThrow('PDF indirilemedi.');
    });

    it('throws error when response indicates file is too large', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        headers: new Headers({
          'content-length': String(30 * 1024 * 1024),
          'content-type': 'application/pdf',
        }),
        ok: true,
      } as Response);

      await expect(
        downloadPdfForDriveUpload('https://example.com/giant.pdf'),
      ).rejects.toThrow('PDF dosyası çok büyük.');
    });

    it('throws error when content does not look like PDF', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        arrayBuffer: async () => new Uint8Array([0x01, 0x02, 0x03]).buffer,
        headers: new Headers({ 'content-type': 'text/html' }),
        ok: true,
      } as Response);

      await expect(
        downloadPdfForDriveUpload('https://example.com/page'),
      ).rejects.toThrow('Bağlantı PDF dosyası döndürmüyor.');
    });
  });

  describe('uploadWorksheetPdfToDrive full workflow', () => {
    it('creates folder structure, uploads pdf and shares file', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');

      // 1. Search for root folder "Yaprak Testler" -> not found
      fetchSpy.mockResolvedValueOnce({
        json: async () => ({ files: [] }),
        ok: true,
      } as Response);
      // Create "Yaprak Testler" -> id: "folder-root-id"
      fetchSpy.mockResolvedValueOnce({
        json: async () => ({ id: 'folder-root-id' }),
        ok: true,
      } as Response);

      // 2. Search for grade folder "8. Sınıf" -> not found
      fetchSpy.mockResolvedValueOnce({
        json: async () => ({ files: [] }),
        ok: true,
      } as Response);
      // Create "8. Sınıf" -> id: "folder-grade-id"
      fetchSpy.mockResolvedValueOnce({
        json: async () => ({ id: 'folder-grade-id' }),
        ok: true,
      } as Response);

      // 3. Search for topic folder -> found existing id: "folder-topic-id"
      fetchSpy.mockResolvedValueOnce({
        json: async () => ({ files: [{ id: 'folder-topic-id' }] }),
        ok: true,
      } as Response);

      // 4. Upload multipart PDF
      fetchSpy.mockResolvedValueOnce({
        json: async () => ({
          id: 'uploaded-file-123',
          webViewLink: 'https://drive.google.com/file/d/uploaded-file-123/view',
        }),
        ok: true,
      } as Response);

      // 5. Share file permission
      fetchSpy.mockResolvedValueOnce({
        json: async () => ({ id: 'permission-id' }),
        ok: true,
      } as Response);

      const result = await uploadWorksheetPdfToDrive({
        accessToken: 'mock-access-token',
        input: {
          candidateTitle: '8. Sınıf Deneme 1',
          grade: 8,
          learningOutcome: 'M.8.1.1.1',
          pdfBytes: new Uint8Array([0x25, 0x50, 0x44, 0x46]),
          sourceFileUrl: 'https://example.com/test.pdf',
          subject: 'Çarpanlar ve Katlar',
        },
      });

      expect(result).toEqual({
        fileId: 'uploaded-file-123',
        fileUrl: 'https://drive.google.com/file/d/uploaded-file-123/view',
      });
    });

    it('throws error when drive folder search fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
      } as Response);

      await expect(
        uploadWorksheetPdfToDrive({
          accessToken: 'mock-access-token',
          input: {
            candidateTitle: 'Test',
            grade: 8,
            learningOutcome: 'M.8.1.1.1',
            pdfBytes: new Uint8Array([0x25, 0x50, 0x44, 0x46]),
            sourceFileUrl: 'https://example.com/test.pdf',
            subject: 'Konu',
          },
        }),
      ).rejects.toThrow('Google Drive klasörü aranamadı.');
    });

    it('throws error when drive folder creation fails', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      // Search -> empty
      fetchSpy.mockResolvedValueOnce({
        json: async () => ({ files: [] }),
        ok: true,
      } as Response);
      // Create -> fails
      fetchSpy.mockResolvedValueOnce({
        ok: false,
      } as Response);

      await expect(
        uploadWorksheetPdfToDrive({
          accessToken: 'mock-access-token',
          input: {
            candidateTitle: 'Test',
            grade: 8,
            learningOutcome: 'M.8.1.1.1',
            pdfBytes: new Uint8Array([0x25, 0x50, 0x44, 0x46]),
            sourceFileUrl: 'https://example.com/test.pdf',
            subject: 'Konu',
          },
        }),
      ).rejects.toThrow('Google Drive klasörü oluşturulamadı.');
    });
  });
});
