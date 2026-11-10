import { supabase } from '@/lib/supabase/client';
import type {
  AdminNotification,
  AdminSubmission,
  ModerationPayload,
} from '@/features/admin/types';

export const loadAdminAssignmentSubmissions = async (assignmentId: string) => {
  const { data } = await supabase
    .from('assignment_submissions')
    .select('*')
    .eq('assignment_id', assignmentId)
    .order('submitted_at', { ascending: false });

  return (data || []) as AdminSubmission[];
};

export const updateAdminSubmissionReview = async (
  submissionId: string,
  grade: number,
  feedback: string,
) => {
  return supabase
    .from('assignment_submissions')
    .update({
      feedback,
      grade,
      status: 'reviewed',
    })
    .eq('id', submissionId);
};

export const markAdminNotificationAsRead = async (
  notification: AdminNotification,
  senderId?: string,
) => {
  if (!notification.is_read) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notification.id);
  }

  if (notification.type === 'message' && senderId) {
    await supabase.from('notifications').insert([
      {
        message: '',
        title: 'Uğur Hoca mesajını gördü',
        type: 'message-read',
        user_id: senderId,
      },
    ]);
  }
};

type AdminModerationAction = 'block' | 'mute' | 'report';

export const applyAdminModerationAction = async ({
  action,
  adminUserId,
  reason,
  selectedNotificationId,
  senderEmail,
  senderId,
  senderName,
}: {
  action: AdminModerationAction;
  adminUserId: string;
  reason: string;
  selectedNotificationId: string;
  senderEmail?: string;
  senderId: string;
  senderName?: string;
}) => {
  const moderationPayload: ModerationPayload = {
    action,
    created_at: new Date().toISOString(),
    expires_at:
      action === 'mute'
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        : null,
    reason,
    sender_email: senderEmail || '',
    sender_id: senderId,
    sender_name: senderName || '',
    source_notification_id: selectedNotificationId,
  };

  await supabase.from('notifications').insert([
    {
      message: JSON.stringify(moderationPayload),
      title:
        action === 'report'
          ? 'Mesaj raporlandı'
          : action === 'mute'
            ? 'Öğrenci sessize alındı'
            : 'Öğrenci engellendi',
      type: action === 'report' ? 'report' : 'moderation',
      user_id: adminUserId,
    },
  ]);

  if (action !== 'report') {
    await supabase.from('notifications').insert([
      {
        message:
          action === 'mute'
            ? "7 gün boyunca Uğur Hoca'ya mesaj gönderemezsiniz."
            : 'Mesaj gönderim hakkınız kaldırıldı.',
        title:
          action === 'mute'
            ? 'Mesaj gönderimi geçici kapatıldı'
            : 'Mesaj gönderiminiz engellendi',
        type: 'message',
        user_id: senderId,
      },
    ]);
  }
};

export const sendAdminNotificationReply = async (
  recipientId: string,
  text: string,
) => {
  return supabase.from('notifications').insert([
    {
      message: text.trim(),
      title: 'Uğur Hoca yazdı',
      type: 'admin-message',
      user_id: recipientId,
    },
  ]);
};

export const deleteAdminNotification = async (notificationId: string) => {
  return supabase.from('notifications').delete().eq('id', notificationId);
};
