import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const getResendApiKeyMock = vi.fn<() => string | undefined>();

vi.mock('@/lib/env.server', () => ({
  getResendApiKey: () => getResendApiKeyMock(),
}));

import {
  buildAssignmentNotificationEmail,
  buildLiveLessonReminderEmail,
  escapeEmailHtml,
  sendEmailNotification,
} from '@/lib/email';

describe('email notification service', () => {
  beforeEach(() => {
    getResendApiKeyMock.mockReset();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('escapes unsafe HTML characters in email templates', () => {
    expect(escapeEmailHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    );
  });

  it('builds assignment notification email with escaped content', () => {
    const email = buildAssignmentNotificationEmail({
      studentName: 'Ali <Admin>',
      assignmentTitle: 'Çarpanlar & Katlar',
      dueDate: '2026-10-20',
      description: 'Sayfa 12-15 arası çözülecek.',
      platformUrl: 'https://www.ugurhoca.org',
    });

    expect(email.subject).toBe('Yeni Ödev Atandı: Çarpanlar & Katlar');
    expect(email.html).toContain('Ali &lt;Admin&gt;');
    expect(email.html).toContain('Çarpanlar &amp; Katlar');
    expect(email.html).toContain('https://www.ugurhoca.org/odevler');
  });

  it('builds live lesson reminder email', () => {
    const email = buildLiveLessonReminderEmail({
      studentName: 'Ayşe',
      lessonTitle: '8. Sınıf LGS Kampı',
      scheduledAt: '15 Ekim 2026 19:00',
    });

    expect(email.subject).toContain('8. Sınıf LGS Kampı');
    expect(email.html).toContain('15 Ekim 2026 19:00');
  });

  it('skips sending gracefully when RESEND_API_KEY is not configured', async () => {
    getResendApiKeyMock.mockReturnValue(undefined);

    const result = await sendEmailNotification({
      to: 'ogrenci@example.com',
      subject: 'Test',
      html: '<p>Merhaba</p>',
    });

    expect(result).toEqual({ delivered: false, skipped: true });
  });

  it('delivers email via Resend API when RESEND_API_KEY is configured', async () => {
    getResendApiKeyMock.mockReturnValue('re_test_key');
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await sendEmailNotification({
      to: ['ogrenci@example.com'],
      subject: 'Yeni Ödev',
      html: '<p>Detaylar</p>',
    });

    expect(result).toEqual({ delivered: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
