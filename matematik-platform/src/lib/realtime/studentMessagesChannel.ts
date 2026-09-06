/** Realtime Broadcast kanalı: admin → öğrenci mesajı anında düşsün diye. */
export const getStudentMessagesChannelName = (userId: string) =>
  `student_messages_${userId}`;

export const ADMIN_MESSAGE_BROADCAST_EVENT = 'admin_message';
export const TYPING_BROADCAST_EVENT = 'typing_status';

export type TypingPayload = {
  senderId: string;
  senderName: string;
  isTyping: boolean;
};
