import type { DashboardNotification } from '@/types/dashboard';
import type { ThreadMessage } from '@/features/messages/types';
import {
  getImageUrlFromNotification,
  parseSupportPayload,
} from '@/features/messages/supportChatUtils';

/** Öğrenci paneli: sent-message = kendi, admin-message = gelen. */
export function mapStudentNotificationsToThread(
  items: DashboardNotification[],
): ThreadMessage[] {
  return items.map((n) => {
    const isOwn = n.type === 'sent-message';
    return {
      created_at: n.created_at,
      id: n.id,
      imageUrl: getImageUrlFromNotification(n),
      isOwn,
      text: n.message || '',
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
  metadata?: { image_url?: string | null } | null;
};

/** Admin paneli: öğrenciden gelen (admin inbox message) + admin cevapları (öğrenci satırında admin-message). */
export function mergeAdminThread(
  inboxFromStudent: AdminInboxRow[],
  adminRepliesOnStudent: AdminReplyRow[],
): ThreadMessage[] {
  const incoming: ThreadMessage[] = inboxFromStudent.map((row) => {
    const parsed = parseSupportPayload(row.message);
    return {
      created_at: row.created_at,
      id: `in-${row.id}`,
      imageUrl:
        parsed?.attachments?.find((a) => a.kind === 'image')?.url ?? null,
      isOwn: false,
      text: parsed?.text || '',
    };
  });

  const outgoing: ThreadMessage[] = adminRepliesOnStudent.map((row) => ({
    created_at: row.created_at,
    id: `out-${row.id}`,
    imageUrl: row.metadata?.image_url ?? null,
    isOwn: true,
    text: row.message || '',
  }));

  return [...incoming, ...outgoing].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}
