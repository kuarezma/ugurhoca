export const PROFILE_AVATAR_MAX_BYTES = 500 * 1024;
export const PROFILE_AVATAR_MAX_LABEL = '500 KB';
export const PROFILE_AVATAR_ACCEPT =
  'image/png,image/jpeg,image/webp,image/avif';
export const PROFILE_AVATAR_BUCKET = 'avatars';

const MAX_AVATAR_DIMENSION = 1200;
const QUALITY_STEPS = [0.92, 0.86, 0.8, 0.74, 0.68, 0.62, 0.56, 0.5, 0.44];
const SCALE_STEPS = [1, 0.85, 0.72, 0.6, 0.5, 0.4, 0.3, 0.24, 0.18, 0.12];

export const isAvatarImage = (value?: string | null) =>
  Boolean(value && /^https?:\/\//i.test(value));

export const buildProfileAvatarPath = (userId: string) =>
  `${userId}/profile-avatar.jpg`;

const loadImageFromFile = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Görsel okunamadı.'));
    };

    image.src = objectUrl;
  });

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Görsel sıkıştırılamadı.'));
          return;
        }

        resolve(blob);
      },
      'image/jpeg',
      quality,
    );
  });

export const compressProfileAvatar = async (
  file: File,
  maxBytes = PROFILE_AVATAR_MAX_BYTES,
) => {
  if (!file.type.startsWith('image/')) {
    throw new Error('Lütfen geçerli bir görsel dosyası seçin.');
  }

  const image = await loadImageFromFile(file);
  const baseScale = Math.min(
    1,
    MAX_AVATAR_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight),
  );
  const baseWidth = Math.max(1, Math.round(image.naturalWidth * baseScale));
  const baseHeight = Math.max(1, Math.round(image.naturalHeight * baseScale));
  let smallestBlob: Blob | null = null;

  for (const scale of SCALE_STEPS) {
    const width = Math.max(1, Math.round(baseWidth * scale));
    const height = Math.max(1, Math.round(baseHeight * scale));
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Tarayıcı görsel sıkıştırmayı desteklemiyor.');
    }

    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);

    for (const quality of QUALITY_STEPS) {
      const blob = await canvasToBlob(canvas, quality);

      if (!smallestBlob || blob.size < smallestBlob.size) {
        smallestBlob = blob;
      }

      if (blob.size <= maxBytes) {
        return blob;
      }
    }
  }

  if (smallestBlob && smallestBlob.size <= maxBytes) {
    return smallestBlob;
  }

  throw new Error(
    `Görsel ${PROFILE_AVATAR_MAX_LABEL} altına indirilemedi. Daha sade bir fotoğraf deneyin.`,
  );
};
