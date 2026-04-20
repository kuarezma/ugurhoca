import { POST } from '@/app/api/import-questions-bundle/route';
import { parseQuizBundleArchive } from '@/lib/question-import';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { insertQuizBundleWithImages } from '@/features/quizzes/server/importQuiz';

vi.mock('@/lib/question-import', () => ({
  parseQuizBundleArchive: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: vi.fn(),
}));

vi.mock('@/features/quizzes/server/importQuiz', () => ({
  insertQuizBundleWithImages: vi.fn(),
}));

describe('POST /api/import-questions-bundle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when no bundle file is provided', async () => {
    const response = await POST(
      new Request('http://localhost/api/import-questions-bundle', {
        method: 'POST',
        body: new FormData(),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'missing_bundle_file',
        message: 'ZIP dosyası gerekli.',
      },
    });
  });

  it('imports a valid bundle through the quiz bundle service', async () => {
    const formData = new FormData();
    formData.set(
      'file',
      new File([new Uint8Array([1, 2, 3])], 'quiz-bundle.zip', {
        type: 'application/zip',
      }),
    );

    const archive = {
      assetFiles: new Map(),
      importResult: {
        assetPreviewUrls: {},
        errors: [],
        meta: {
          description: '',
          difficulty: 'Orta' as const,
          grade: 8,
          time_limit: 20,
          title: 'Bundle Testi',
        },
        source: 'bundle' as const,
        valid: [
          {
            correct_index: 1,
            explanation: '',
            option_image_files: [[], [], [], []] as [
              string[],
              string[],
              string[],
              string[],
            ],
            options: ['1', '2', '3', '4'] as [string, string, string, string],
            question: '1 + 1 kaç eder?',
            question_image_files: [],
          },
        ],
      },
    };
    const supabaseClient = { kind: 'service' };
    const result = {
      inserted: 1,
      quiz_id: 'quiz-1',
      quiz_title: 'Bundle Testi',
      success: true,
      uploaded_images: 0,
    };

    vi.mocked(parseQuizBundleArchive).mockResolvedValue(archive);
    vi.mocked(createServiceRoleClient).mockReturnValue(supabaseClient as never);
    vi.mocked(insertQuizBundleWithImages).mockResolvedValue(result);

    const response = await POST(
      new Request('http://localhost/api/import-questions-bundle', {
        method: 'POST',
        body: formData,
      }),
    );

    expect(response.status).toBe(200);
    expect(insertQuizBundleWithImages).toHaveBeenCalledWith(
      supabaseClient,
      archive,
    );
    await expect(response.json()).resolves.toEqual({ data: result });
  });
});
