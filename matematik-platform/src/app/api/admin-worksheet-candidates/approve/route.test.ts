import { POST } from '@/app/api/admin-worksheet-candidates/approve/route';
import { getServerAccessToken } from '@/lib/auth-snapshot.server';
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from '@/lib/supabase/server';
import {
  downloadPdfForDriveUpload,
  getGoogleDriveOAuthConfig,
  getGoogleTokenExpiry,
  refreshGoogleDriveAccessToken,
  uploadWorksheetPdfToDrive,
} from '@/lib/google-drive-oauth';

vi.mock('@/lib/auth-snapshot.server', () => ({
  getServerAccessToken: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(),
  createServiceRoleClient: vi.fn(),
}));

vi.mock('@/lib/google-drive-oauth', () => ({
  downloadPdfForDriveUpload: vi.fn(),
  getGoogleDriveOAuthConfig: vi.fn(),
  getGoogleTokenExpiry: vi.fn(),
  refreshGoogleDriveAccessToken: vi.fn(),
  uploadWorksheetPdfToDrive: vi.fn(),
}));

const candidateId = '8b7f3392-4905-4fdd-aa18-d1f654681c6e';
const adminId = 'a9862dcf-93c8-4927-8e0a-9c48c7dc3d49';

const createAdminClient = () => ({
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: {
        user: {
          email: 'admin@ugurhoca.com',
          id: adminId,
        },
      },
      error: null,
    }),
  },
});

describe('POST /api/admin-worksheet-candidates/approve', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerAccessToken).mockResolvedValue('admin-token');
    vi.mocked(createServerSupabaseClient).mockReturnValue(
      createAdminClient() as never,
    );
    vi.mocked(getGoogleDriveOAuthConfig).mockReturnValue({} as never);
    vi.mocked(refreshGoogleDriveAccessToken).mockResolvedValue({
      access_token: 'google-token',
      expires_in: 3600,
    });
    vi.mocked(downloadPdfForDriveUpload).mockResolvedValue(
      new Uint8Array([0x25, 0x50, 0x44, 0x46]),
    );
    vi.mocked(uploadWorksheetPdfToDrive).mockResolvedValue({
      fileId: 'drive-file-1',
      fileUrl: 'https://drive.google.com/file/d/drive-file-1/view',
    });
    vi.mocked(getGoogleTokenExpiry).mockReturnValue('2026-05-25T10:00:00.000Z');
  });

  it('uses the same standard title for Drive upload and published document', async () => {
    const insertedDocuments: unknown[] = [];
    const insertedNotifications: unknown[] = [];
    const insertedSharedDocuments: unknown[] = [];
    const serviceRoleClient = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'worksheet_candidates') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    drive_file_url: null,
                    file_url: 'https://meb.gov.tr/pdf/8-sinif-uslu.pdf',
                    grade: 8,
                    id: candidateId,
                    learning_outcome:
                      'M.8.1.2.1. Üslü ifadelerle ilgili temel kuralları anlar.',
                    source_url: 'https://meb.gov.tr/kaynaklar',
                    status: 'pending',
                    subject: 'Üslü İfadeler',
                    title: '8. Sınıf Matematik - Üslü İfadeler - Yaprak Test',
                  },
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: candidateId, status: 'approved' },
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }

        if (table === 'google_drive_connections') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { refresh_token: 'refresh-token' },
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          };
        }

        if (table === 'documents') {
          return {
            select: vi.fn().mockImplementation((fields: string) => {
              if (fields === '*') {
                return {
                  eq: vi.fn().mockReturnValue({
                    in: vi.fn().mockResolvedValue({ data: [], error: null }),
                  }),
                };
              }

              return {
                eq: vi.fn().mockResolvedValue({ data: [], error: null }),
              };
            }),
            insert: vi.fn().mockImplementation((payload: unknown[]) => {
              insertedDocuments.push(...payload);
              return {
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      ...(payload[0] as object),
                      id: 'document-1',
                    },
                    error: null,
                  }),
                }),
              };
            }),
          };
        }

        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [
                  {
                    email: 'ogrenci@example.com',
                    grade: 8,
                    id: 'student-1',
                    name: 'Ayşe Öğrenci',
                  },
                ],
                error: null,
              }),
            }),
          };
        }

        if (table === 'shared_documents') {
          return {
            insert: vi.fn().mockImplementation((payload: unknown[]) => {
              insertedSharedDocuments.push(...payload);
              return Promise.resolve({ data: null, error: null });
            }),
          };
        }

        if (table === 'notifications') {
          return {
            insert: vi.fn().mockImplementation((payload: unknown[]) => {
              insertedNotifications.push(...payload);
              return Promise.resolve({ data: null, error: null });
            }),
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      }),
    };

    vi.mocked(createServiceRoleClient).mockReturnValue(
      serviceRoleClient as never,
    );

    const response = await POST(
      new Request('http://localhost/api/admin-worksheet-candidates/approve', {
        body: JSON.stringify({ candidate_id: candidateId }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      }),
    );

    if (!response) {
      throw new Error('Expected response to be defined.');
    }

    expect(response.status).toBe(200);
    expect(uploadWorksheetPdfToDrive).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          candidateTitle:
            '8. Sınıf Matematik - Üslü İfadeler - Yaprak Test 01',
        }),
      }),
    );
    expect(insertedDocuments[0]).toMatchObject({
      title: '8. Sınıf Matematik - Üslü İfadeler - Yaprak Test 01',
    });
    expect(insertedSharedDocuments[0]).toMatchObject({
      document_title: '8. Sınıf Matematik - Üslü İfadeler - Yaprak Test 01',
    });
    expect(insertedNotifications[0]).toMatchObject({
      message: 'Üslü İfadeler konusu için yeni yaprak test yayınlandı.',
      title: '8. Sınıf Matematik - Üslü İfadeler - Yaprak Test 01',
    });
    await expect(response.json()).resolves.toMatchObject({
      data: {
        document: {
          title: '8. Sınıf Matematik - Üslü İfadeler - Yaprak Test 01',
        },
        notifiedStudents: 1,
        sharedDocuments: 1,
      },
    });
  });
});
