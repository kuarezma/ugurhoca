import type { SupabaseClient } from '@supabase/supabase-js';
import { computeChatDisplayName } from '@/lib/chat-display-name';
import type { ChatUser } from '@/types';

export const buildChatUser = (
  fullName: string,
  grade: number,
  schoolNumber: string,
): ChatUser => ({
  display_name: computeChatDisplayName(fullName),
  full_name: fullName,
  grade,
  school_number: schoolNumber,
});

export const registerChatUser = async (
  supabase: SupabaseClient,
  payload: ChatUser,
) => {
  const { error } = await supabase.from('chat_users').upsert(
    {
      ...payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'full_name,grade,school_number' },
  );

  if (error) {
    throw error;
  }

  return payload;
};
