import {
  SUPPORT_IMAGE_MAX_BYTES,
  clearUserAssignmentsCache,
  compressSupportImageFile,
  fetchUserAssignments,
  uploadSupportFiles,
  validateSupportImageFile,
} from '@/features/home/queries';
import { supabase } from '@/lib/supabase/client';

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
}));

const createFile = (type: string, size: number, name = 'upload.bin') =>
  new File([new Uint8Array(size)], name, { type });

describe('home queries support image validation', () => {
  it.each([
    ['image/jpeg', 'photo.jpg'],
    ['image/png', 'photo.png'],
    ['image/webp', 'photo.webp'],
  ])('accepts %s support images', (type, name) => {
    expect(() =>
      validateSupportImageFile(createFile(type, 1024, name)),
    ).not.toThrow();
  });

  it('rejects non-image files', () => {
    expect(() =>
      validateSupportImageFile(createFile('application/pdf', 1024, 'file.pdf')),
    ).toThrow('Sadece JPG, PNG veya WebP görsel eklenebilir.');
  });

  it('allows large images so they can be compressed before upload', () => {
    expect(() =>
      validateSupportImageFile(
        createFile('image/jpeg', SUPPORT_IMAGE_MAX_BYTES + 1, 'large.jpg'),
      ),
    ).not.toThrow();
  });

  it('keeps already small images under the upload limit unchanged', async () => {
    const smallImage = createFile('image/jpeg', 1024, 'small.jpg');

    await expect(compressSupportImageFile(smallImage)).resolves.toBe(smallImage);
  });

  it('uploads support images only after enforcing the 1 MB limit', async () => {
    const upload = vi
      .fn()
      .mockResolvedValue({ data: { path: 'support/small.jpg' }, error: null });
    const getPublicUrl = vi.fn().mockReturnValue({
      data: { publicUrl: 'https://example.com/support/small.jpg' },
    });
    vi.mocked(supabase.storage.from).mockReturnValue({
      getPublicUrl,
      upload,
    } as never);

    await expect(
      uploadSupportFiles([createFile('image/jpeg', 1024, 'small.jpg')], {
        imagesOnly: true,
      }),
    ).resolves.toEqual([
      {
        kind: 'image',
        name: 'small.jpg',
        url: 'https://example.com/support/small.jpg',
      },
    ]);

    const uploadedFile = upload.mock.calls[0]?.[1] as File;
    expect(uploadedFile.size).toBeLessThanOrEqual(SUPPORT_IMAGE_MAX_BYTES);
    expect(uploadedFile.type).toBe('image/jpeg');
  });
});

describe('fetchUserAssignments caching and deduplication', () => {
  it('deduplicates concurrent calls and caches results', async () => {
    clearUserAssignmentsCache();
    const mockOrder = vi.fn().mockResolvedValue({ data: [] });
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    vi.mocked(supabase.from).mockImplementation(mockFrom as never);

    const [r1, r2, r3] = await Promise.all([
      fetchUserAssignments('user-abc'),
      fetchUserAssignments('user-abc'),
      fetchUserAssignments('user-abc'),
    ]);

    expect(r1).toEqual([]);
    expect(r2).toEqual([]);
    expect(r3).toEqual([]);
    // Only 2 calls to supabase.from (shared_documents and notifications)
    expect(mockFrom).toHaveBeenCalledTimes(2);

    // Subsequent call should hit cache
    await fetchUserAssignments('user-abc');
    expect(mockFrom).toHaveBeenCalledTimes(2);

    // After clearing cache, should call again
    clearUserAssignmentsCache('user-abc');
    await fetchUserAssignments('user-abc');
    expect(mockFrom).toHaveBeenCalledTimes(4);
  });
});
