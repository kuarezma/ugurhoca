import { supabase } from '@/lib/supabase/client';
import { trackStudentActivityEvent } from '@/features/analytics/trackActivity';
import { getRemoteImageSrc } from '@/lib/image-url';
import type { ApiErrorResponse, ApiSuccessResponse } from '@/lib/api-response';
import type {
  Announcement,
  ContentDocument,
  SharedDocumentAssignment,
  SupportAttachment,
} from '@/types';

const SUPPORT_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
export const SUPPORT_IMAGE_MAX_BYTES = 1 * 1024 * 1024;
const SUPPORT_IMAGE_MAX_LABEL = '1 MB';
const SUPPORT_IMAGE_MAX_DIMENSION = 1600;
const SUPPORT_IMAGE_QUALITY_STEPS = [
  0.88, 0.8, 0.72, 0.64, 0.56, 0.48, 0.4, 0.32,
];
const SUPPORT_IMAGE_SCALE_STEPS = [1, 0.85, 0.7, 0.55, 0.42, 0.32, 0.24, 0.18];

export const validateSupportImageFile = (file: File) => {
  if (!SUPPORT_IMAGE_TYPES.has(file.type)) {
    throw new Error('Sadece JPG, PNG veya WebP görsel eklenebilir.');
  }

};

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
      reject(new Error('Fotoğraf okunamadı.'));
    };

    image.src = objectUrl;
  });

const canvasToSupportImageBlob = (
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Fotoğraf sıkıştırılamadı.'));
          return;
        }

        resolve(blob);
      },
      mimeType,
      quality,
    );
  });

const getCompressedSupportImageName = (fileName: string, mimeType: string) => {
  const extension = mimeType === 'image/png' ? 'png' : 'webp';
  const baseName = fileName.replace(/\.[^.]+$/, '') || 'support-image';
  return `${baseName}.${extension}`;
};

export const compressSupportImageFile = async (
  file: File,
  maxBytes = SUPPORT_IMAGE_MAX_BYTES,
) => {
  validateSupportImageFile(file);

  if (file.size <= maxBytes) {
    return file;
  }

  const image = await loadImageFromFile(file);
  const outputType = file.type === 'image/png' ? 'image/png' : 'image/webp';
  const baseScale = Math.min(
    1,
    SUPPORT_IMAGE_MAX_DIMENSION /
      Math.max(image.naturalWidth, image.naturalHeight),
  );
  const baseWidth = Math.max(1, Math.round(image.naturalWidth * baseScale));
  const baseHeight = Math.max(1, Math.round(image.naturalHeight * baseScale));
  let smallestBlob: Blob | null = null;

  for (const scale of SUPPORT_IMAGE_SCALE_STEPS) {
    const width = Math.max(1, Math.round(baseWidth * scale));
    const height = Math.max(1, Math.round(baseHeight * scale));
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Tarayıcı fotoğraf sıkıştırmayı desteklemiyor.');
    }

    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);

    for (const quality of SUPPORT_IMAGE_QUALITY_STEPS) {
      const blob = await canvasToSupportImageBlob(canvas, outputType, quality);

      if (!smallestBlob || blob.size < smallestBlob.size) {
        smallestBlob = blob;
      }

      if (blob.size <= maxBytes) {
        return new File(
          [blob],
          getCompressedSupportImageName(file.name, outputType),
          {
            lastModified: Date.now(),
            type: outputType,
          },
        );
      }
    }
  }

  if (smallestBlob && smallestBlob.size <= maxBytes) {
    return new File(
      [smallestBlob],
      getCompressedSupportImageName(file.name, outputType),
      {
        lastModified: Date.now(),
        type: outputType,
      },
    );
  }

  throw new Error(
    `Fotoğraf ${SUPPORT_IMAGE_MAX_LABEL} altına indirilemedi. Daha sade bir fotoğraf deneyin.`,
  );
};

export const resolveYandexImageUrl = async (url: string) => {
  if (!url || !/disk\.yandex|yadi\.sk/i.test(url)) {
    return url;
  }

  try {
    const response = await fetch(
      `/api/yandex-resolve?url=${encodeURIComponent(url)}`,
    );
    const data = (await response.json().catch(() => null)) as {
      href?: string;
    } | null;

    return data?.href || url;
  } catch {
    return url;
  }
};

export const fetchHomeDocuments = async () => {
  const { data } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  return (data || []) as ContentDocument[];
};

export const fetchAnnouncements = async () => {
  const { data } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(4);

  const sorted = [...(data || [])]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 4) as Announcement[];

  return Promise.all(
    sorted.map(async (item) => {
      const images =
        item.image_urls?.length && Array.isArray(item.image_urls)
          ? item.image_urls
          : item.image_url
            ? [item.image_url]
            : [];
      const resolvedImageUrls = await Promise.all(
        images.map(resolveYandexImageUrl),
      );

      return {
        ...item,
        image_url: resolvedImageUrls[0] || item.image_url,
        image_urls:
          resolvedImageUrls.length > 0 ? resolvedImageUrls : item.image_urls,
      };
    }),
  );
};

export const fetchHomeFeed = async () => {
  const [documents, announcements] = await Promise.all([
    fetchHomeDocuments(),
    fetchAnnouncements(),
  ]);

  return { announcements, documents };
};

export const fetchUserAssignments = async (userId: string) => {
  const [sharedDocumentsResponse, notificationsResponse] = await Promise.all([
    supabase
      .from('shared_documents')
      .select('*')
      .eq('student_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  ]);

  const sharedDocuments = (sharedDocumentsResponse.data ||
    []) as SharedDocumentAssignment[];
  const notifications = (notificationsResponse.data ||
    []) as SharedDocumentAssignment[];

  return [
    ...sharedDocuments.map((item) => ({ ...item, source: 'shared' as const })),
    ...notifications
      .filter(
        (item) =>
          (item.type === 'assignment' || item.type === 'document') &&
          !item.is_read,
      )
      .map((item) => ({ ...item, source: 'notification' as const })),
  ];
};

export const dismissHomeAssignment = async (
  assignment: SharedDocumentAssignment,
) => {
  if (assignment.source === 'shared') {
    await supabase.from('shared_documents').delete().eq('id', assignment.id);
    return;
  }

  if (assignment.source === 'notification') {
    await supabase.from('notifications').delete().eq('id', assignment.id);
  }
};

export const uploadSupportFiles = async (
  files: FileList | File[],
  options: { imagesOnly?: boolean } = {},
) => {
  const uploads = await Promise.all(
    Array.from(files).map(async (file) => {
      let uploadFile = file;
      if (options.imagesOnly) {
        uploadFile = await compressSupportImageFile(file);
      }

      const fileName = `support_${Date.now()}_${Math.random().toString(36).slice(2)}_${uploadFile.name}`;
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(fileName, uploadFile, { upsert: false });

      if (error) {
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(data.path);

      const kind: SupportAttachment['kind'] = uploadFile.type.startsWith('image/')
        ? 'image'
        : 'file';

      return { kind, name: uploadFile.name, url: urlData.publicUrl };
    }),
  );

  return uploads;
};

export const sendSupportMessage = async (
  payload: {
    attachments: SupportAttachment[];
    sender_email: string;
    sender_id: string;
    sender_name: string;
    text: string;
  },
  accessToken: string,
) => {
  const response = await fetch('/api/support-message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const responseData = (await response.json().catch(() => null)) as
    | ApiErrorResponse
    | ApiSuccessResponse<{ ok: boolean; message?: unknown }>
    | null;

  if (!response.ok) {
    throw new Error(
      responseData && 'error' in responseData
        ? responseData.error.message
        : `Sunucu hatası (${response.status}).`,
    );
  }

  if (responseData && 'data' in responseData) {
    void trackStudentActivityEvent({
      entityType: 'support_message',
      eventType: 'support_message_sent',
      metadata: {
        attachment_count: payload.attachments.length,
        has_image: payload.attachments.some(
          (attachment) => attachment.kind === 'image',
        ),
      },
      userId: payload.sender_id,
    });
    return responseData.data.message ?? null;
  }

  void trackStudentActivityEvent({
    entityType: 'support_message',
    eventType: 'support_message_sent',
    metadata: {
      attachment_count: payload.attachments.length,
      has_image: payload.attachments.some(
        (attachment) => attachment.kind === 'image',
      ),
    },
    userId: payload.sender_id,
  });

  return null;
};

export const getAnnouncementLinkLabel = (url?: string | null) => {
  if (!url) {
    return 'Detaya Git';
  }

  const lower = url.toLowerCase();

  if (lower.includes('.pdf')) {
    return 'PDF Aç';
  }

  if (
    lower.includes('drive.google') ||
    lower.includes('yadi.sk') ||
    lower.includes('disk.yandex')
  ) {
    return 'Dosyayı Aç';
  }

  return 'Siteye Git';
};

export const proxiedImageSrc = (url?: string | null) => {
  if (!url) {
    return '';
  }

  if (!/^https?:\/\//i.test(url)) {
    return getRemoteImageSrc(url);
  }

  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
};

export const isNewContent = (createdAt?: string) => {
  if (!createdAt) {
    return false;
  }

  const diffDays =
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);

  return diffDays <= 7;
};
