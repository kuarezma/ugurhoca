import type { DashboardNotification } from '@/types/dashboard';
import type { MessageAttachment, MessageReplyReference } from '@/features/messages/types';

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

export function getAttachmentsFromNotification(
  message: DashboardNotification,
): MessageAttachment[] {
  const rawList = (message.metadata?.attachments as unknown[]) || [];
  if (!Array.isArray(rawList)) return [];

  const result: MessageAttachment[] = [];
  for (const item of rawList) {
    if (
      item &&
      typeof item === 'object' &&
      'url' in item &&
      typeof (item as { url?: string }).url === 'string'
    ) {
      const rawObj = item as { kind?: string; name?: string; url: string; size?: number };
      const kind = rawObj.kind === 'audio' ? 'audio' : rawObj.kind === 'file' ? 'file' : 'image';
      result.push({
        kind,
        name: rawObj.name || (kind === 'audio' ? 'Sesli Mesaj' : 'Ek'),
        url: rawObj.url,
        size: rawObj.size,
      });
    }
  }

  // Fallback if legacy single image_url exists without attachments
  if (result.length === 0 && message.metadata?.image_url) {
    result.push({
      kind: 'image',
      name: 'Fotoğraf',
      url: message.metadata.image_url,
    });
  }

  return result;
}

export function getImageUrlFromNotification(
  message: DashboardNotification,
): string | null {
  const attachments = getAttachmentsFromNotification(message);
  const img = attachments.find((a) => a.kind === 'image');
  if (img) return img.url;
  if (message.metadata?.image_url) return message.metadata.image_url;
  return null;
}

/**
 * Yanıt formatını metinden ayrıştırır.
 * Format: 💬 [Yanıt: "Özet..." - Gönderen]
 */
export function extractReplyFromText(raw: string): {
  cleanText: string;
  replyTo: MessageReplyReference | null;
} {
  if (!raw || !raw.startsWith('💬 [Yanıt:')) {
    return { cleanText: raw || '', replyTo: null };
  }

  const match = raw.match(/^💬 \[Yanıt: "(.*?)"(?: - (.*?))?\]\n\n([\s\S]*)$/);
  if (match) {
    return {
      replyTo: {
        text: match[1] || '',
        senderName: match[2] || undefined,
      },
      cleanText: match[3] || '',
    };
  }

  return { cleanText: raw, replyTo: null };
}

/**
 * Yanıt metnini prefix formatında oluşturur.
 */
export function formatReplyText(
  replyTo: { text: string; senderName?: string },
  actualText: string,
): string {
  const snippet = (replyTo.text || 'Ek dosya')
    .replace(/[\n\r]+/g, ' ')
    .trim()
    .slice(0, 80);
  const sender = replyTo.senderName ? ` - ${replyTo.senderName}` : '';
  return `💬 [Yanıt: "${snippet}"${sender}]\n\n${actualText.trim()}`;
}
