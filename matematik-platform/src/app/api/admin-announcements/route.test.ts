import { POST } from '@/app/api/admin-announcements/route';
import { getServerAccessToken } from '@/lib/auth-snapshot.server';
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from '@/lib/supabase/server';

vi.mock('@/lib/auth-snapshot.server', () => ({
  getServerAccessToken: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(),
  createServiceRoleClient: vi.fn(),
}));

describe('POST /api/admin-announcements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('accepts the access token from cookies when the auth header is missing', async () => {
    vi.mocked(getServerAccessToken).mockResolvedValue('cookie-token');

    const userClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              email: 'admin@ugurhoca.com',
              id: 'a9862dcf-93c8-4927-8e0a-9c48c7dc3d49',
            },
          },
          error: null,
        }),
      },
    };

    const serviceRoleClient = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table !== 'announcements') {
          throw new Error(`Unexpected table: ${table}`);
        }

        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  content: 'Cookie auth',
                  id: 'announcement-1',
                  title: 'Test',
                },
                error: null,
              }),
            }),
          }),
        };
      }),
    };

    vi.mocked(createServerSupabaseClient).mockReturnValue(
      userClient as never,
    );
    vi.mocked(createServiceRoleClient).mockReturnValue(
      serviceRoleClient as never,
    );

    const response = await POST(
      new Request('http://localhost/api/admin-announcements', {
        body: JSON.stringify({
          announcement: {
            content: 'Cookie auth',
            title: 'Test',
          },
          recipient_user_ids: [],
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      }),
    );

    expect(response).toBeDefined();

    if (!response) {
      throw new Error('Expected response to be defined.');
    }

    expect(response.status).toBe(200);
    expect(getServerAccessToken).toHaveBeenCalledTimes(1);
    expect(createServerSupabaseClient).toHaveBeenCalledWith('cookie-token');
    await expect(response.json()).resolves.toEqual({
      data: {
        content: 'Cookie auth',
        id: 'announcement-1',
        title: 'Test',
      },
    });
  });
});
