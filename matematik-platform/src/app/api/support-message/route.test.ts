import { POST } from '@/app/api/support-message/route';
import {
  buildSupportNotificationPayload,
  cleanupExpiredNotifications,
  findActiveModerationAction,
  notifyAdminForSupportMessage,
  recordSelfCopyForStudent,
  sendSupportEmail,
} from '@/features/support/server/supportMessages';
import { createServerSupabaseClient } from '@/lib/supabase/server';

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(),
}));

vi.mock('@/features/support/server/supportMessages', () => ({
  buildSupportNotificationPayload: vi.fn(),
  cleanupExpiredNotifications: vi.fn(),
  findActiveModerationAction: vi.fn(),
  notifyAdminForSupportMessage: vi.fn(),
  recordSelfCopyForStudent: vi.fn(),
  sendSupportEmail: vi.fn(),
}));

const createSupabaseStub = (userId = 'student-1', adminId = 'admin-1') =>
  ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      }),
    },
    rpc: vi.fn().mockImplementation((name: string) => {
      if (name === 'get_admin_profile_id') {
        return Promise.resolve({ data: adminId, error: null });
      }

      throw new Error(`Unexpected rpc: ${name}`);
    }),
  }) as const;

describe('POST /api/support-message', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when the access token is missing', async () => {
    const response = await POST(
      new Request('http://localhost/api/support-message', {
        body: JSON.stringify({ sender_id: 'student-1', text: 'Merhaba' }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'missing_access_token',
        message: 'Oturum açmanız gerekiyor.',
      },
    });
  });

  it('sends a support message for an authenticated user', async () => {
    const supabaseClient = createSupabaseStub();
    const body = {
      attachments: [],
      sender_email: 'ogrenci@example.com',
      sender_id: 'student-1',
      sender_name: 'Ayşe',
      text: 'Hocam merhaba',
    };
    const notificationPayload = {
      ...body,
      created_at: '2026-04-11T10:00:00.000Z',
      metadata: { ip: '127.0.0.1', user_agent: 'vitest' },
    };

    vi.mocked(createServerSupabaseClient).mockReturnValue(
      supabaseClient as never,
    );
    vi.mocked(findActiveModerationAction).mockResolvedValue(undefined);
    vi.mocked(buildSupportNotificationPayload).mockReturnValue(
      notificationPayload,
    );

    const response = await POST(
      new Request('http://localhost/api/support-message', {
        body: JSON.stringify(body),
        headers: {
          authorization: 'Bearer test-token',
          'content-type': 'application/json',
        },
        method: 'POST',
      }),
    );

    expect(response.status).toBe(200);
    expect(cleanupExpiredNotifications).toHaveBeenCalledWith(supabaseClient);
    expect(findActiveModerationAction).toHaveBeenCalledWith(
      supabaseClient,
      'admin-1',
      'student-1',
    );
    expect(notifyAdminForSupportMessage).toHaveBeenCalledWith(
      supabaseClient,
      'admin-1',
      notificationPayload,
    );
    expect(recordSelfCopyForStudent).toHaveBeenCalledWith(
      supabaseClient,
      notificationPayload,
    );
    expect(sendSupportEmail).toHaveBeenCalledWith(body);
    await expect(response.json()).resolves.toEqual({ data: { ok: true } });
  });
});
