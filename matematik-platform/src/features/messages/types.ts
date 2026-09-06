export type MessageAttachment = {
  kind: 'image' | 'file' | 'audio';
  name: string;
  url: string;
  size?: number;
};

export type MessageReplyReference = {
  id?: string;
  text: string;
  senderName?: string;
  imageUrl?: string | null;
};

export type MessageStatus = 'sending' | 'sent' | 'read';

/** WhatsApp tarzı sohbet satırı (görünüm tarafına göre isOwn). */
export type ThreadMessage = {
  id: string;
  created_at: string;
  text: string;
  isOwn: boolean;
  imageUrl?: string | null;
  attachments?: MessageAttachment[];
  audioUrl?: string | null;
  audioDuration?: number;
  status?: MessageStatus;
  replyTo?: MessageReplyReference | null;
};
