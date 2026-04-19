/** WhatsApp tarzı sohbet satırı (görünüm tarafına göre isOwn). */
export type ThreadMessage = {
  id: string;
  created_at: string;
  text: string;
  isOwn: boolean;
  imageUrl?: string | null;
};
