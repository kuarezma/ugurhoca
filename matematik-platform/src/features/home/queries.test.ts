import {
  SUPPORT_IMAGE_MAX_BYTES,
  compressSupportImageFile,
  uploadSupportFiles,
  validateSupportImageFile,
} from '@/features/home/queries';
import { supabase } from '@/lib/supabase/client';

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
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
