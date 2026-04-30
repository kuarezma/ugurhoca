import {
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
});
