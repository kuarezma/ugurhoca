import { getResendApiKey } from '@/lib/env.server';
import { createLogger } from '@/lib/logger';

const log = createLogger('email');

const DEFAULT_FROM_ADDRESS =
  process.env.RESEND_FROM_EMAIL || 'Uğur Hoca Platformu <onboarding@resend.dev>';
const DEFAULT_PLATFORM_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ugurhoca.org';

export function escapeEmailHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export type SendEmailNotificationInput = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  from?: string;
};

export type SendEmailNotificationResult = {
  delivered: boolean;
  skipped?: boolean;
  error?: string;
};

export async function sendEmailNotification(
  input: SendEmailNotificationInput,
): Promise<SendEmailNotificationResult> {
  const apiKey = getResendApiKey();
  const recipients = (Array.isArray(input.to) ? input.to : [input.to])
    .map((addr) => addr.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    return { delivered: false, skipped: true, error: 'Alıcı e-posta adresi belirtilmedi.' };
  }

  if (!apiKey) {
    log.info('RESEND_API_KEY tanımlı olmadığı için e-posta gönderimi atlandı.', {
      subject: input.subject,
      recipientCount: recipients.length,
    });
    return { delivered: false, skipped: true };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: input.from || DEFAULT_FROM_ADDRESS,
        to: recipients,
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
        subject: input.subject,
        html: input.html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      log.warn('Resend API e-posta gönderim hatası', {
        status: response.status,
        body: errorText.slice(0, 200),
      });
      return {
        delivered: false,
        error: `E-posta servisi hatası (${response.status})`,
      };
    }

    return { delivered: true };
  } catch (error) {
    log.error('E-posta bildirimi gönderilirken beklenmeyen hata oluştu', error);
    return {
      delivered: false,
      error: 'E-posta gönderimi sırasında bağlantı hatası oluştu.',
    };
  }
}

export type AssignmentNotificationTemplateInput = {
  studentName: string;
  assignmentTitle: string;
  dueDate?: string | null;
  description?: string | null;
  platformUrl?: string;
};

export function buildAssignmentNotificationEmail(
  input: AssignmentNotificationTemplateInput,
): { subject: string; html: string } {
  const safeStudent = escapeEmailHtml(input.studentName || 'Öğrencimiz');
  const safeTitle = escapeEmailHtml(input.assignmentTitle);
  const safeDescription = input.description
    ? escapeEmailHtml(input.description)
    : null;
  const safeDueDate = input.dueDate ? escapeEmailHtml(input.dueDate) : null;
  const targetUrl = escapeEmailHtml(
    `${(input.platformUrl || DEFAULT_PLATFORM_URL).replace(/\/$/, '')}/odevler`,
  );

  return {
    subject: `Yeni Ödev Atandı: ${input.assignmentTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 14px; background: #ffffff;">
        <h2 style="color: #0f172a; margin-top: 0;">Merhaba ${safeStudent},</h2>
        <p style="color: #334155; line-height: 1.6;">
          Uğur Hoca Matematik Platformu üzerinde sana yeni bir çalışma/ödev atandı:
        </p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 10px; border-left: 4px solid #16a34a; margin: 16px 0;">
          <p style="margin: 0; font-weight: 700; color: #0f172a;">${safeTitle}</p>
          ${safeDescription ? `<p style="margin: 8px 0 0; color: #475569; white-space: pre-wrap;">${safeDescription}</p>` : ''}
          ${safeDueDate ? `<p style="margin: 8px 0 0; font-size: 13px; color: #64748b;"><strong>Son Teslim:</strong> ${safeDueDate}</p>` : ''}
        </div>
        <p style="margin-top: 20px;">
          <a href="${targetUrl}" style="display: inline-block; background: #16a34a; color: #ffffff; text-decoration: none; font-weight: 700; padding: 10px 18px; border-radius: 8px;">
            Ödevi Görüntüle
          </a>
        </p>
      </div>
    `.trim(),
  };
}

export type LiveLessonReminderTemplateInput = {
  studentName: string;
  lessonTitle: string;
  scheduledAt: string;
  roomUrl?: string;
};

export function buildLiveLessonReminderEmail(
  input: LiveLessonReminderTemplateInput,
): { subject: string; html: string } {
  const safeStudent = escapeEmailHtml(input.studentName || 'Öğrencimiz');
  const safeTitle = escapeEmailHtml(input.lessonTitle);
  const safeScheduledAt = escapeEmailHtml(input.scheduledAt);
  const targetUrl = escapeEmailHtml(
    input.roomUrl || `${DEFAULT_PLATFORM_URL.replace(/\/$/, '')}/canli-ders`,
  );

  return {
    subject: `Canlı Ders Hatırlatması: ${input.lessonTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 14px; background: #ffffff;">
        <h2 style="color: #0f172a; margin-top: 0;">Merhaba ${safeStudent},</h2>
        <p style="color: #334155; line-height: 1.6;">
          Planlanan canlı matematik dersin yaklaşıyor:
        </p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 10px; border-left: 4px solid #2563eb; margin: 16px 0;">
          <p style="margin: 0; font-weight: 700; color: #0f172a;">${safeTitle}</p>
          <p style="margin: 8px 0 0; font-size: 13px; color: #475569;"><strong>Başlangıç Zamanı:</strong> ${safeScheduledAt}</p>
        </div>
        <p style="margin-top: 20px;">
          <a href="${targetUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; font-weight: 700; padding: 10px 18px; border-radius: 8px;">
            Canlı Derse Katıl
          </a>
        </p>
      </div>
    `.trim(),
  };
}
