import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PROFILE_AVATAR_BUCKET,
  PROFILE_AVATAR_MAX_BYTES,
  PROFILE_AVATAR_MAX_LABEL,
  buildProfileAvatarPath,
  compressProfileAvatar,
  isAvatarImage,
} from './avatar-upload';

describe('avatar-upload utils', () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    vi.restoreAllMocks();
    URL.createObjectURL = vi.fn().mockReturnValue('blob:test-image-url');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  describe('isAvatarImage', () => {
    it('identifies http/https URLs as valid avatar images', () => {
      expect(isAvatarImage('https://example.com/avatar.jpg')).toBe(true);
      expect(isAvatarImage('http://example.com/avatar.png')).toBe(true);
      expect(isAvatarImage('HTTP://EXAMPLE.COM/AVATAR.WEBP')).toBe(true);
    });

    it('rejects invalid or non-http values', () => {
      expect(isAvatarImage(null)).toBe(false);
      expect(isAvatarImage(undefined)).toBe(false);
      expect(isAvatarImage('')).toBe(false);
      expect(isAvatarImage('ftp://example.com/photo.jpg')).toBe(false);
      expect(isAvatarImage('data:image/png;base64,123')).toBe(false);
      expect(isAvatarImage('avatar-uuid-123')).toBe(false);
    });
  });

  describe('buildProfileAvatarPath and constants', () => {
    it('builds standard avatar storage path', () => {
      expect(buildProfileAvatarPath('user-abc-123')).toBe(
        'user-abc-123/profile-avatar.jpg',
      );
      expect(PROFILE_AVATAR_BUCKET).toBe('avatars');
      expect(PROFILE_AVATAR_MAX_BYTES).toBe(500 * 1024);
      expect(PROFILE_AVATAR_MAX_LABEL).toBe('500 KB');
    });
  });

  describe('compressProfileAvatar', () => {
    it('throws error for non-image file type', async () => {
      const file = new File(['text'], 'document.pdf', { type: 'application/pdf' });
      await expect(compressProfileAvatar(file)).rejects.toThrow(
        'Lütfen geçerli bir görsel dosyası seçin.',
      );
    });

    it('throws error for unsupported image format (e.g. HEIC/TIFF)', async () => {
      const file = new File(['image-bytes'], 'photo.heic', {
        type: 'image/heic',
      });
      await expect(compressProfileAvatar(file)).rejects.toThrow(
        'Şimdilik JPG, PNG, WEBP veya AVIF destekleniyor.',
      );
    });

    it('throws error when image fails to load', async () => {
      const originalImage = global.Image;
      class FailingImage {
        naturalWidth = 0;
        naturalHeight = 0;
        onerror: (() => void) | null = null;
        onload: (() => void) | null = null;
        set src(_val: string) {
          setTimeout(() => this.onerror?.(), 0);
        }
      }
      global.Image = FailingImage as unknown as typeof Image;

      try {
        const file = new File(['dummy'], 'photo.jpg', { type: 'image/jpeg' });
        await expect(compressProfileAvatar(file)).rejects.toThrow('Görsel okunamadı.');
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-image-url');
      } finally {
        global.Image = originalImage;
      }
    });

    it('compresses supported image down to allowed byte limit', async () => {
      const originalImage = global.Image;
      const originalCreateElement = document.createElement.bind(document);

      class MockImage {
        naturalWidth = 2400;
        naturalHeight = 1600;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(_val: string) {
          setTimeout(() => this.onload?.(), 0);
        }
      }
      global.Image = MockImage as unknown as typeof Image;

      const mockDrawImage = vi.fn();
      const mockContext = {
        drawImage: mockDrawImage,
      };

      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'canvas') {
          return {
            getContext: vi.fn().mockReturnValue(mockContext),
            height: 0,
            toBlob: vi.fn((callback: (blob: Blob | null) => void) => {
              // Return a small blob within limit
              const smallBlob = new Blob(['compressed-image'], {
                type: 'image/jpeg',
              });
              callback(smallBlob);
            }),
            width: 0,
          } as unknown as HTMLCanvasElement;
        }
        return originalCreateElement(tagName);
      });

      try {
        const file = new File(['valid-data'], 'photo.png', { type: 'image/png' });
        const result = await compressProfileAvatar(file);

        expect(result).toBeInstanceOf(Blob);
        expect(result.size).toBeLessThanOrEqual(PROFILE_AVATAR_MAX_BYTES);
        expect(mockDrawImage).toHaveBeenCalled();
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-image-url');
      } finally {
        global.Image = originalImage;
      }
    });

    it('throws error when canvas context cannot be retrieved', async () => {
      const originalImage = global.Image;
      const originalCreateElement = document.createElement.bind(document);

      class MockImage {
        naturalWidth = 800;
        naturalHeight = 600;
        onload: (() => void) | null = null;
        set src(_val: string) {
          setTimeout(() => this.onload?.(), 0);
        }
      }
      global.Image = MockImage as unknown as typeof Image;

      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'canvas') {
          return {
            getContext: vi.fn().mockReturnValue(null),
          } as unknown as HTMLCanvasElement;
        }
        return originalCreateElement(tagName);
      });

      try {
        const file = new File(['valid-data'], 'photo.webp', { type: 'image/webp' });
        await expect(compressProfileAvatar(file)).rejects.toThrow(
          'Tarayıcı görsel sıkıştırmayı desteklemiyor.',
        );
      } finally {
        global.Image = originalImage;
      }
    });

    it('throws error when canvas.toBlob returns null', async () => {
      const originalImage = global.Image;
      const originalCreateElement = document.createElement.bind(document);

      class MockImage {
        naturalWidth = 800;
        naturalHeight = 600;
        onload: (() => void) | null = null;
        set src(_val: string) {
          setTimeout(() => this.onload?.(), 0);
        }
      }
      global.Image = MockImage as unknown as typeof Image;

      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'canvas') {
          return {
            getContext: vi.fn().mockReturnValue({ drawImage: vi.fn() }),
            height: 0,
            toBlob: vi.fn((callback: (blob: Blob | null) => void) => {
              callback(null);
            }),
            width: 0,
          } as unknown as HTMLCanvasElement;
        }
        return originalCreateElement(tagName);
      });

      try {
        const file = new File(['valid-data'], 'photo.avif', { type: 'image/avif' });
        await expect(compressProfileAvatar(file)).rejects.toThrow(
          'Görsel sıkıştırılamadı.',
        );
      } finally {
        global.Image = originalImage;
      }
    });

    it('throws error when file cannot be compressed below maxBytes', async () => {
      const originalImage = global.Image;
      const originalCreateElement = document.createElement.bind(document);

      class MockImage {
        naturalWidth = 1000;
        naturalHeight = 1000;
        onload: (() => void) | null = null;
        set src(_val: string) {
          setTimeout(() => this.onload?.(), 0);
        }
      }
      global.Image = MockImage as unknown as typeof Image;

      // Huge blob that always exceeds maxBytes
      const hugeBlob = new Blob([new Uint8Array(600 * 1024)], {
        type: 'image/jpeg',
      });

      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'canvas') {
          return {
            getContext: vi.fn().mockReturnValue({ drawImage: vi.fn() }),
            height: 0,
            toBlob: vi.fn((callback: (blob: Blob | null) => void) => {
              callback(hugeBlob);
            }),
            width: 0,
          } as unknown as HTMLCanvasElement;
        }
        return originalCreateElement(tagName);
      });

      try {
        const file = new File(['valid-data'], 'photo.jpg', { type: 'image/jpeg' });
        await expect(compressProfileAvatar(file)).rejects.toThrow(
          'Görsel 500 KB altına indirilemedi.',
        );
      } finally {
        global.Image = originalImage;
      }
    });
  });
});
