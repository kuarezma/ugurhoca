import { apiError, apiOk } from '@/lib/api-response';
import { chatRegisterSchema } from '@/lib/route-schemas';
import { createServiceRoleClient } from '@/lib/supabase/server';
import {
  buildChatUser,
  registerChatUser,
} from '@/features/chat/server/registerChatUser';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = chatRegisterSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message || 'Geçersiz istek.', 400);
  }

  try {
    const supabase = createServiceRoleClient();
    const user = buildChatUser(
      parsed.data.full_name,
      parsed.data.grade,
      parsed.data.school_number,
    );

    await registerChatUser(supabase, user);

    return apiOk({ ok: true, user });
  } catch (error) {
    console.error('chat-register upsert', error);
    return apiError(
      error instanceof Error
        ? error.message
        : 'Veritabanına yazılamadı. chat_users tablosunu kontrol edin.',
      500,
      'chat_register_failed',
    );
  }
}
