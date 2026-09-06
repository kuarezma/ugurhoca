import type { DashboardNotification } from '@/types/dashboard';
import type { MessageAttachment, ThreadMessage } from '@/features/messages/types';
import {
  extractReplyFromText,
  getAttachmentsFromNotification,
  getImageUrlFromNotification,
  parseSupportPayload,
} from '@/features/messages/supportChatUtils';

/** Öğrenci paneli: sent-message = kendi, admin-message = gelen. */
export function mapStudentNotificationsToThread(
  items: DashboardNotification[],
): ThreadMessage[] {
  // Hocanın son okuma veya cevap zamanını tespit et
  const teacherActivityTimestamps = items
    .filter((n) => n.type === 'admin-message' || n.type === 'message-read')
    .map((n) => new Date(n.created_at).getTime());
  const latestTeacherActivity = teacherActivityTimestamps.length > 0
    ? Math.max(...teacherActivityTimestamps)
    : 0;

  return items
    .filter((n) => n.type === 'sent-message' || n.type === 'admin-message')
    .map((n) => {
      const isOwn = n.type === 'sent-message';
      const msgTime = new Date(n.created_at).getTime();

      // Kendi mesajımızsa ve hocanın sonraki bir aktivitesi varsa veya is_read ise çift tik (read)
      const status: 'sent' | 'read' = isOwn
        ? (n.is_read || (latestTeacherActivity > 0 && msgTime <= latestTeacherActivity) ? 'read' : 'sent')
        : 'read';

      const { cleanText, replyTo } = extractReplyFromText(n.message || '');
      const attachments = getAttachmentsFromNotification(n);
      const audioAttachment = attachments.find((a) => a.kind === 'audio');

      return {
        created_at: n.created_at,
        id: n.id,
        imageUrl: getImageUrlFromNotification(n),
        isOwn,
        text: cleanText,
        attachments,
        audioUrl: audioAttachment?.url || null,
        status,
        replyTo,
      };
    });
}

type AdminInboxRow = {
  id: string;
  created_at: string;
  message: string;
  is_read: boolean;
};

type AdminReplyRow = {
  id: string;
  created_at: string;
  message: string | null;
  is_read?: boolean;
  metadata?: {
    image_url?: string | null;
    attachments?: MessageAttachment[] | null;
  } | null;
};

/** Admin paneli: öğrenciden gelen (admin inbox message) + admin cevapları (öğrenci satırında admin-message). */
export function mergeAdminThread(
  inboxFromStudent: AdminInboxRow[],
  adminRepliesOnStudent: AdminReplyRow[],
): ThreadMessage[] {
  const incoming: ThreadMessage[] = inboxFromStudent.map((row) => {
    const parsed = parseSupportPayload(row.message);
    const rawAttachments = parsed?.attachments || [];
    const attachments: MessageAttachment[] = rawAttachments.map((a) => ({
      kind: a.kind === 'audio' ? 'audio' : a.kind === 'file' ? 'file' : 'image',
      name: a.name || 'Ek',
      url: a.url,
    }));
    const audioAttachment = attachments.find((a) => a.kind === 'audio');
    const { cleanText, replyTo } = extractReplyFromText(parsed?.text || '');

    return {
      created_at: row.created_at,
      id: `in-${row.id}`,
      imageUrl:
        attachments.find((a) => a.kind === 'image')?.url ?? null,
      isOwn: false,
      text: cleanText,
      attachments,
      audioUrl: audioAttachment?.url || null,
      status: row.is_read ? 'read' : 'sent',
      replyTo,
    };
  });

  const outgoing: ThreadMessage[] = adminRepliesOnStudent.map((row) => {
    const { cleanText, replyTo } = extractReplyFromText(row.message || '');
    const metaAttachments = row.metadata?.attachments || [];
    const attachments: MessageAttachment[] = Array.isArray(metaAttachments)
      ? metaAttachments.map((a) => ({
          kind: a.kind === 'audio' ? 'audio' : a.kind === 'file' ? 'file' : 'image',
          name: a.name || 'Ek',
          url: a.url,
        }))
      : [];
    const audioAttachment = attachments.find((a) => a.kind === 'audio');

    return {
      created_at: row.created_at,
      id: `out-${row.id}`,
      imageUrl: row.metadata?.image_url ?? attachments.find((a) => a.kind === 'image')?.url ?? null,
      isOwn: true,
      text: cleanText,
      attachments,
      audioUrl: audioAttachment?.url || null,
      status: row.is_read ? 'read' : 'sent',
      replyTo,
    };
  });

  return [...incoming, ...outgoing].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}
