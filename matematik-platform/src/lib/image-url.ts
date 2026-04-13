const GOOGLE_DRIVE_PATTERNS = [
  /drive\.google\.com\/file\/d\/([^/?]+)/i,
  /drive\.google\.com\/open\?id=([^&]+)/i,
  /drive\.google\.com\/thumbnail\?id=([^&]+)/i,
  /drive\.google\.com\/uc\?id=([^&]+)/i,
  /drive\.google\.com\/[^?]*id=([^&/?]+)/i,
];

const IMAGE_EXTENSION_PATTERN =
  /\.(avif|bmp|gif|ico|jpe?g|png|svg|webp)(?:[?#].*)?$/i;

const DIRECT_IMAGE_HOST_PATTERNS = [
  /(^|\.)i\.ibb\.co$/i,
  /(^|\.)ibb\.co$/i,
  /(^|\.)imgur\.com$/i,
  /(^|\.)googleusercontent\.com$/i,
  /(^|\.)unsplash\.com$/i,
  /(^|\.)cloudinary\.com$/i,
];

export const extractGoogleDriveId = (url: string): string | null => {
  for (const pattern of GOOGLE_DRIVE_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
};

export const getGoogleDriveThumbnailUrl = (
  url: string,
  size = 'w800',
): string => {
  const driveId = extractGoogleDriveId(url);
  return driveId
    ? `https://drive.google.com/thumbnail?id=${driveId}&sz=${size}`
    : url;
};

export const isRemoteUrl = (url: string) => /^https?:\/\//i.test(url);

const isKnownDirectImageHost = (hostname: string) =>
  DIRECT_IMAGE_HOST_PATTERNS.some((pattern) => pattern.test(hostname));

export const isLikelyDirectImageUrl = (url: string) => {
  if (IMAGE_EXTENSION_PATTERN.test(url)) {
    return true;
  }

  try {
    const hostname = new URL(url).hostname;
    return isKnownDirectImageHost(hostname);
  } catch {
    return false;
  }
};

type RemoteImageOptions = {
  driveSize?: string;
  proxyFallback?: boolean;
};

export const getRemoteImageSrc = (
  url?: string | null,
  options: RemoteImageOptions = {},
) => {
  if (!url) {
    return '';
  }

  if (!isRemoteUrl(url)) {
    return url;
  }

  if (/drive\.google\.com/i.test(url)) {
    return getGoogleDriveThumbnailUrl(url, options.driveSize);
  }

  if (isLikelyDirectImageUrl(url) || options.proxyFallback === false) {
    return url;
  }

  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
};
