import type { DashboardNotification } from '@/types/dashboard';

export type ParsedSupportPayload = {
  sender_id: string;
  sender_name: string;
  sender_email?: string;
  text: string;
  attachments?: { kind?: string; name: string; url: string }[];
};

export function parseSupportPayload(raw: string): ParsedSupportPayload | null {
  try {
    return JSON.parse(raw) as ParsedSupportPayload;
  } catch {
    return null;
  }
}

export function getImageUrlFromNotification(
  message: DashboardNotification,
): string | null {
  const attachments = (message.metadata?.attachments as unknown[]) || [];
  if (Array.isArray(attachments)) {
    const image = attachments.find(
      (item): item is { kind: string; url: string; name?: string } =>
        Boolean(
          item &&
            typeof item === 'object' &&
            'kind' in item &&
            (item as { kind?: string }).kind === 'image' &&
            'url' in item &&
            typeof (item as { url?: string }).url === 'string',
        ),
    );
    if (image) return image.url;
  }
  if (message.metadata?.image_url) return message.metadata.image_url;
  return null;
}
