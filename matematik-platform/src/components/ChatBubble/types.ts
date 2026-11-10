import type { ParsedSupportPayload } from '@/features/messages/supportChatUtils';

export type InboxMessage = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  parsed: ParsedSupportPayload | null;
};

export type ConversationPreview = {
  studentId: string;
  studentName: string;
  lastSnippet: string;
  lastAt: string;
  unreadCount: number;
};
