import type { FormEvent } from 'react';
import type { ThreadMessage } from '@/features/messages/types';

export type ChatAttachmentPreview = {
  name: string;
  url: string;
  kind?: 'image' | 'file' | 'audio';
  size?: number;
};

export type SupportChatPanelProps = {
  peerDisplayName: string;
  peerSubtitle?: string;
  peerAvatarSrc?: string;
  messages: ThreadMessage[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  sending: boolean;
  error: string | null;
  onClose?: () => void;
  onBack?: () => void;
  appearance: 'navbar' | 'admin';
  isLight?: boolean;
  placeholder?: string;
  inputDisabled?: boolean;
  attachmentPreview?: { name: string; url: string } | null;
  attachmentPreviews?: ChatAttachmentPreview[] | null;
  onAttachmentRemove?: (index?: number) => void;
  onAttachmentSelect?: (files: FileList | null) => void;
  onVoiceRecordComplete?: (audioFile: File) => void;
  peerTyping?: boolean;
  onTyping?: () => void;
  hasMoreMessages?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
};
