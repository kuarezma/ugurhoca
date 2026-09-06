import {
  extractReplyFromText,
  formatReplyText,
  getAttachmentsFromNotification,
  getImageUrlFromNotification,
  parseSupportPayload,
} from '@/features/messages/supportChatUtils';
import type { DashboardNotification } from '@/types/dashboard';

const notification = (
  metadata: DashboardNotification['metadata'],
): DashboardNotification => ({
  created_at: '2026-04-30T10:00:00Z',
  id: 'notification-1',
  is_read: false,
  message: '',
  metadata,
  title: 'Mesaj',
  type: 'message',
  user_id: 'user-1',
});

describe('support chat utils', () => {
  it('parses valid support payloads and ignores malformed json', () => {
    expect(
      parseSupportPayload(
        JSON.stringify({
          sender_id: 'student-1',
          sender_name: 'Ayşe',
          text: 'Hocam bakar mısınız?',
        }),
      ),
    ).toMatchObject({
      sender_id: 'student-1',
      sender_name: 'Ayşe',
    });

    expect(parseSupportPayload('{broken')).toBeNull();
  });

  it('prefers image attachments over legacy image_url metadata', () => {
    expect(
      getImageUrlFromNotification(
        notification({
          attachments: [
            { kind: 'file', name: 'not-image.pdf', url: 'https://example.com/a.pdf' },
            { kind: 'image', name: 'soru.png', url: 'https://example.com/soru.png' },
          ],
          image_url: 'https://example.com/legacy.png',
        }),
      ),
    ).toBe('https://example.com/soru.png');
  });

  it('falls back to image_url metadata when no image attachment exists', () => {
    expect(
      getImageUrlFromNotification(
        notification({ image_url: 'https://example.com/legacy.png' }),
      ),
    ).toBe('https://example.com/legacy.png');

    expect(getImageUrlFromNotification(notification({}))).toBeNull();
  });

  it('getAttachmentsFromNotification parses mixed attachments and handles legacy fallbacks', () => {
    const notif = notification({
      attachments: [
        { kind: 'image', name: 'foto.jpg', url: 'https://example.com/foto.jpg' },
        { kind: 'file', name: 'odev.pdf', url: 'https://example.com/odev.pdf' },
        { kind: 'audio', name: 'ses.webm', url: 'https://example.com/ses.webm' },
      ],
    });

    const attachments = getAttachmentsFromNotification(notif);
    expect(attachments).toHaveLength(3);
    expect(attachments[0]).toEqual({
      kind: 'image',
      name: 'foto.jpg',
      url: 'https://example.com/foto.jpg',
      size: undefined,
    });
    expect(attachments[1]).toEqual({
      kind: 'file',
      name: 'odev.pdf',
      url: 'https://example.com/odev.pdf',
      size: undefined,
    });
    expect(attachments[2]).toEqual({
      kind: 'audio',
      name: 'ses.webm',
      url: 'https://example.com/ses.webm',
      size: undefined,
    });
  });

  it('extractReplyFromText extracts quoted reply correctly', () => {
    const formatted = '💬 [Yanıt: "Önceki soru" - Uğur Hoca]\n\nEvet hocam anladım.';
    const parsed = extractReplyFromText(formatted);
    expect(parsed.replyTo).toEqual({
      senderName: 'Uğur Hoca',
      text: 'Önceki soru',
    });
    expect(parsed.cleanText).toBe('Evet hocam anladım.');

    const normal = 'Normal mesaj metni';
    expect(extractReplyFromText(normal)).toEqual({
      cleanText: 'Normal mesaj metni',
      replyTo: null,
    });
  });

  it('formatReplyText constructs standardized quote prefix', () => {
    const result = formatReplyText(
      { text: 'Bu soru nasıl çözülür?', senderName: 'Ahmet' },
      'Ben de aynı yerde takıldım.',
    );
    expect(result).toBe('💬 [Yanıt: "Bu soru nasıl çözülür?" - Ahmet]\n\nBen de aynı yerde takıldım.');
  });
});
