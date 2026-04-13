import type { SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { getResendApiKey } from '@/lib/env.server';
import type { SupportAttachment } from '@/types';

const RETENTION_DAYS = 180;

type SupportBody = {
  attachments: SupportAttachment[];
  sender_email?: string;
  sender_id: string;
  sender_name?: string;
  text: string;
};

type ModerationAction = {
  action?: 'block' | 'mute';
  expires_at?: string;
  sender_id?: string;
};

export const getClientIp = (request: Request) => {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }

  return realIp || 'unknown';
};

export const parseModerationPayload = (value: string | null) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as ModerationAction;
  } catch {
    return null;
  }
};

export const cleanupExpiredNotifications = async (
  supabase: SupabaseClient,
  retentionDays = RETENTION_DAYS,
) => {
  const cutoffIso = new Date(
    Date.now() - retentionDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  await supabase
    .from('notifications')
    .delete()
    .in('type', ['message', 'moderation', 'report'])
    .lt('created_at', cutoffIso);
};

export const findActiveModerationAction = async (
  supabase: SupabaseClient,
  adminId: string,
  senderId: string,
) => {
  const { data: moderationRows } = await supabase
    .from('notifications')
    .select('message,created_at')
    .eq('user_id', adminId)
    .eq('type', 'moderation')
    .order('created_at', { ascending: false })
    .limit(200);

  return (moderationRows || [])
    .map((row) => parseModerationPayload(row.message))
    .find((entry) => {
      if (!entry || entry.sender_id !== senderId) {
        return false;
      }

      if (entry.action === 'block') {
        return true;
      }

      if (entry.action === 'mute') {
        return Boolean(
          entry.expires_at && new Date(entry.expires_at).getTime() > Date.now(),
        );
      }

      return false;
    });
};

export const buildSupportNotificationPayload = (
  body: SupportBody,
  request: Request,
) => ({
  attachments: body.attachments,
  created_at: new Date().toISOString(),
  metadata: {
    ip: getClientIp(request),
    user_agent: request.headers.get('user-agent') || 'unknown',
  },
  sender_email: body.sender_email || '',
  sender_id: body.sender_id,
  sender_name: body.sender_name || 'Öğrenci',
  text: body.text,
});

export const notifyAdminForSupportMessage = async (
  supabase: SupabaseClient,
  adminId: string,
  payload: ReturnType<typeof buildSupportNotificationPayload>,
) => {
  const { error } = await supabase.from('notifications').insert([
    {
      message: JSON.stringify(payload),
      title: `${payload.sender_name || 'Bir öğrenci'} sana yazdı`,
      type: 'message',
      user_id: adminId,
    },
  ]);

  if (error) {
    throw error;
  }
};

export const sendSupportEmail = async (
  body: SupportBody,
  adminUrl = 'https://ugurhoca.com/admin',
) => {
  const resendApiKey = getResendApiKey();

  if (!resendApiKey) {
    return;
  }

  const resend = new Resend(resendApiKey);
  const emailText =
    body.text ||
    (body.attachments.length > 0
      ? `[Dosya eki: ${body.attachments.map((attachment) => attachment.name).join(', ')}]`
      : '');
  const truncatedText =
    emailText.length > 200 ? `${emailText.slice(0, 200)}...` : emailText;

  await resend.emails.send({
    from: 'Uğur Hoca Matematik <noreply@resend.dev>',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">📩 Yeni Mesaj Aldınız</h1>
        </div>
        <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="margin: 0 0 8px; color: #64748b; font-size: 14px;"><strong>Öğrenci:</strong> ${body.sender_name || 'İsimsiz'}</p>
          ${body.sender_email ? `<p style="margin: 0 0 16px; color: #64748b; font-size: 14px;"><strong>E-posta:</strong> ${body.sender_email}</p>` : '<br/>'}
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <p style="margin: 0; color: #1e293b; font-size: 15px; line-height: 1.6;">${truncatedText.replace(/\n/g, '<br/>')}</p>
          </div>
          ${body.attachments.length > 0 ? `<p style="color: #64748b; font-size: 13px; margin-bottom: 16px;"><strong>Ekler:</strong> ${body.attachments.map((attachment) => attachment.name).join(', ')}</p>` : ''}
          <a href="${adminUrl}" style="display: inline-block; background: #667eea; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold;">Admin Panele Git</a>
        </div>
      </div>
    `,
    subject: `📩 Yeni mesaj: ${body.sender_name || 'Bir öğrenci'}`,
    to: ['yasayanugur@gmail.com'],
  });
};
