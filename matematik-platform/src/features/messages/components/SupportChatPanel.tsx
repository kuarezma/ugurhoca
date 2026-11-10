'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import type { ThreadMessage } from '@/features/messages/types';
import ImageViewerLightbox from '@/components/ImageViewerLightbox';
import { formatReplyText } from '@/features/messages/supportChatUtils';
import {
  STUDENT_QUICK_TEMPLATES,
  MATH_QUICK_SYMBOLS,
} from './SupportChatPanel/constants';
import type {
  ChatAttachmentPreview,
  SupportChatPanelProps,
} from './SupportChatPanel/types';
import { SupportChatHeader } from './SupportChatPanel/SupportChatHeader';
import { SupportChatMessageList } from './SupportChatPanel/SupportChatMessageList';
import { SupportChatInputBar } from './SupportChatPanel/SupportChatInputBar';

export { STUDENT_QUICK_TEMPLATES, MATH_QUICK_SYMBOLS };
export type { SupportChatPanelProps };

export function SupportChatPanel({
  peerDisplayName,
  peerSubtitle,
  peerAvatarSrc,
  messages,
  draft,
  onDraftChange,
  onSubmit,
  sending,
  error,
  onClose,
  onBack,
  appearance,
  isLight = true,
  placeholder = 'Mesaj yaz...',
  inputDisabled = false,
  attachmentPreview = null,
  attachmentPreviews = null,
  onAttachmentRemove,
  onAttachmentSelect,
  onVoiceRecordComplete,
  peerTyping = false,
  onTyping,
  hasMoreMessages = false,
  onLoadMore,
  loadingMore = false,
}: SupportChatPanelProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(
    null,
  );

  // Yanıtlama (Quote / Reply) State
  const [replyingTo, setReplyingTo] = useState<ThreadMessage | null>(null);

  // Sohbet İçi Arama State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Otomatik kaydırma
  useLayoutEffect(() => {
    if (!listRef.current || searchQuery) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length, searchQuery, peerTyping]);

  // Arama filtreleme
  const filteredMessages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(
      (m) =>
        m.text.toLowerCase().includes(q) ||
        m.replyTo?.text.toLowerCase().includes(q) ||
        m.attachments?.some((a) => a.name.toLowerCase().includes(q)),
    );
  }, [messages, searchQuery]);

  // Ses kaydını bitirip gönderme
  const stopRecordingAndSend = useCallback(async () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      setIsRecording(false);
      return;
    }

    recorder.onstop = () => {
      const stream = recorder.stream;
      stream.getTracks().forEach((track) => track.stop());

      const mimeType = recorder.mimeType || 'audio/webm';
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      const audioFile = new File(
        [audioBlob],
        `ses_${Date.now()}.${mimeType.includes('mp4') ? 'm4a' : 'webm'}`,
        { type: mimeType },
      );

      setIsRecording(false);
      setRecordingSeconds(0);
      onVoiceRecordComplete?.(audioFile);
    };

    recorder.stop();
  }, [onVoiceRecordComplete]);

  // Ses kaydı başlatma
  const startRecording = async () => {
    setRecordingError(null);
    try {
      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        setRecordingError('Tarayıcınız mikrofon erişimini desteklemiyor.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 60) {
            void stopRecordingAndSend();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      setRecordingError('Mikrofon erişim izni verilmedi.');
    }
  };

  // Ses kaydını iptal etme
  const cancelRecording = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      mediaRecorderRef.current.stop();
    }
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  // Form gönderme sarmalayıcısı (Yanıt alıntısı varsa ekle)
  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (replyingTo) {
      const senderName = replyingTo.isOwn ? 'Sen' : peerDisplayName;
      const formatted = formatReplyText(
        { text: replyingTo.text, senderName },
        draft,
      );
      onDraftChange(formatted);
      setReplyingTo(null);
    }
    onSubmit(event);
  };

  // Normalleştirilmiş ek listesi
  const allAttachments: ChatAttachmentPreview[] = useMemo(() => {
    if (attachmentPreviews && attachmentPreviews.length > 0) {
      return attachmentPreviews;
    }
    if (attachmentPreview) {
      return [
        {
          kind: 'image' as const,
          name: attachmentPreview.name,
          url: attachmentPreview.url,
        },
      ];
    }
    return [];
  }, [attachmentPreview, attachmentPreviews]);

  const containerBg =
    appearance === 'navbar'
      ? isLight
        ? 'bg-slate-50 text-slate-900'
        : 'bg-slate-950 text-slate-100'
      : 'bg-[var(--bg)] text-[var(--text)]';

  return (
    <div
      className={`flex h-full min-h-0 flex-col overflow-hidden transition-colors ${containerBg}`}
    >
      {/* 1. Üst Başlık & Arama Çubuğu */}
      <SupportChatHeader
        appearance={appearance}
        isLight={isLight}
        peerDisplayName={peerDisplayName}
        peerSubtitle={peerSubtitle}
        peerAvatarSrc={peerAvatarSrc}
        onBack={onBack}
        onClose={onClose}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchInputRef={searchInputRef}
        matchedCount={filteredMessages.length}
      />

      {/* 2. Mesaj Listesi */}
      <SupportChatMessageList
        listRef={listRef}
        appearance={appearance}
        isLight={isLight}
        messages={filteredMessages}
        searchQuery={searchQuery}
        hasMoreMessages={hasMoreMessages}
        onLoadMore={onLoadMore}
        loadingMore={loadingMore}
        peerTyping={peerTyping}
        peerDisplayName={peerDisplayName}
        onOpenLightbox={setActiveLightboxImage}
        onReplySelect={(msg: ThreadMessage) => setReplyingTo(msg)}
      />

      {/* 3. Giriş ve Kontrol Çubuğu */}
      <SupportChatInputBar
        appearance={appearance}
        isLight={isLight}
        draft={draft}
        onDraftChange={onDraftChange}
        onSubmit={handleFormSubmit}
        sending={sending}
        inputDisabled={inputDisabled}
        placeholder={placeholder}
        error={error}
        recordingError={recordingError}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        peerDisplayName={peerDisplayName}
        allAttachments={allAttachments}
        onAttachmentRemove={onAttachmentRemove}
        onAttachmentSelect={onAttachmentSelect}
        onVoiceRecordComplete={onVoiceRecordComplete}
        isRecording={isRecording}
        recordingSeconds={recordingSeconds}
        onCancelRecording={cancelRecording}
        onStopRecordingAndSend={stopRecordingAndSend}
        onStartRecording={startRecording}
        fileInputRef={fileInputRef}
        onTyping={onTyping}
        onOpenLightbox={setActiveLightboxImage}
      />

      {/* 4. Görsel Büyütme Lightbox */}
      <ImageViewerLightbox
        src={activeLightboxImage}
        alt="Fotoğraf Önizleme"
        onClose={() => setActiveLightboxImage(null)}
      />
    </div>
  );
}

export default SupportChatPanel;
