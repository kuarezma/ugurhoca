import { supabase } from '@/lib/supabase/client';
import { getRemoteImageSrc } from '@/lib/image-url';
import type { ApiErrorResponse, ApiSuccessResponse } from '@/lib/api-response';
import type {
  Announcement,
  ContentDocument,
  SharedDocumentAssignment,
  SupportAttachment,
} from '@/types';

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

export const fetchHomeWritings = async () => {
  const { data } = await supabase
    .from('documents')
    .select('*')
    .in('type', ['ders-notlari', 'writing', 'yaprak-test'])
    .order('created_at', { ascending: false })
    .limit(4);

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
  const [documents, writings, announcements] = await Promise.all([
    fetchHomeDocuments(),
    fetchHomeWritings(),
    fetchAnnouncements(),
  ]);

  return { announcements, documents, writings };
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

export const uploadSupportFiles = async (files: FileList) => {
  const uploads = await Promise.all(
    Array.from(files).map(async (file) => {
      const fileName = `support_${Date.now()}_${Math.random().toString(36).slice(2)}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(fileName, file, { upsert: false });

      if (error) {
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(data.path);

      const kind: SupportAttachment['kind'] = file.type.startsWith('image/')
        ? 'image'
        : 'file';

      return { kind, name: file.name, url: urlData.publicUrl };
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
    | ApiSuccessResponse<{ ok: boolean }>
    | null;

  if (!response.ok) {
    throw new Error(
      responseData && 'error' in responseData
        ? responseData.error.message
        : `Sunucu hatası (${response.status}).`,
    );
  }
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
  return getRemoteImageSrc(url);
};

export const isNewContent = (createdAt?: string) => {
  if (!createdAt) {
    return false;
  }

  const diffDays =
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);

  return diffDays <= 7;
};
