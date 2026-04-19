/** Realtime Broadcast kanalı: admin → öğrenci mesajı anında düşsün diye. */
export const getStudentMessagesChannelName = (userId: string) =>
  `student_messages_${userId}`;

export const ADMIN_MESSAGE_BROADCAST_EVENT = 'admin_message';
