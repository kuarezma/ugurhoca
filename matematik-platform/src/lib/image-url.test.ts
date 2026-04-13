import { describe, expect, it } from 'vitest';
import {
  extractGoogleDriveId,
  getGoogleDriveThumbnailUrl,
  getRemoteImageSrc,
} from '@/lib/image-url';

describe('image-url helpers', () => {
  it('extracts Google Drive ids from supported URL formats', () => {
    expect(
      extractGoogleDriveId(
        'https://drive.google.com/file/d/abc123/view?usp=sharing',
      ),
    ).toBe('abc123');
    expect(
      extractGoogleDriveId('https://drive.google.com/open?id=xyz789'),
    ).toBe('xyz789');
  });

  it('builds thumbnail URLs for Google Drive links', () => {
    expect(
      getGoogleDriveThumbnailUrl(
        'https://drive.google.com/file/d/abc123/view?usp=sharing',
        'w400',
      ),
    ).toBe('https://drive.google.com/thumbnail?id=abc123&sz=w400');
  });

  it('keeps known direct image hosts direct', () => {
    expect(
      getRemoteImageSrc('https://i.ibb.co/example/image.png'),
    ).toBe('https://i.ibb.co/example/image.png');
  });

  it('uses Drive thumbnails instead of proxying Drive URLs', () => {
    expect(
      getRemoteImageSrc('https://drive.google.com/open?id=abc123'),
    ).toBe('https://drive.google.com/thumbnail?id=abc123&sz=w800');
  });

  it('proxies generic remote resources as fallback', () => {
    expect(getRemoteImageSrc('https://example.com/asset')).toBe(
      '/api/image-proxy?url=https%3A%2F%2Fexample.com%2Fasset',
    );
  });

  it('leaves local paths unchanged', () => {
    expect(getRemoteImageSrc('/uploads/image.png')).toBe('/uploads/image.png');
  });
});
