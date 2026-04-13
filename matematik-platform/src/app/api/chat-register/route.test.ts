import { POST } from '@/app/api/chat-register/route';
import {
  buildChatUser,
  registerChatUser,
} from '@/features/chat/server/registerChatUser';
import { createServiceRoleClient } from '@/lib/supabase/server';

vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: vi.fn(),
}));

vi.mock('@/features/chat/server/registerChatUser', () => ({
  buildChatUser: vi.fn(),
  registerChatUser: vi.fn(),
}));

describe('POST /api/chat-register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 for an invalid payload', async () => {
    const response = await POST(
      new Request('http://localhost/api/chat-register', {
        body: JSON.stringify({}),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        message: 'Invalid input: expected string, received undefined',
      },
    });
  });

  it('registers the chat user and returns normalized data', async () => {
    const supabaseClient = { kind: 'service' };
    const builtUser = {
      display_name: 'Ayşe D.',
      full_name: 'Ayşe Demir',
      grade: 8,
      school_number: '123',
    };

    vi.mocked(createServiceRoleClient).mockReturnValue(
      supabaseClient as never,
    );
    vi.mocked(buildChatUser).mockReturnValue(builtUser);
    vi.mocked(registerChatUser).mockResolvedValue(builtUser);

    const response = await POST(
      new Request('http://localhost/api/chat-register', {
        body: JSON.stringify({
          full_name: builtUser.full_name,
          grade: builtUser.grade,
          school_number: builtUser.school_number,
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      }),
    );

    expect(response.status).toBe(200);
    expect(createServiceRoleClient).toHaveBeenCalledTimes(1);
    expect(registerChatUser).toHaveBeenCalledWith(supabaseClient, builtUser);
    await expect(response.json()).resolves.toEqual({
      data: { ok: true, user: builtUser },
    });
  });
});
