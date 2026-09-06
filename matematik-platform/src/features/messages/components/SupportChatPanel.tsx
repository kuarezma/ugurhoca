'use client';

import {
  ArrowLeft,
  Calculator,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  FileText,
  ImagePlus,
  LayoutGrid,
  Loader2,
  Mic,
  Pause,
  Play,
  Reply,
  Search,
  Sparkles,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import Image from 'next/image';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import type { ThreadMessage } from '@/features/messages/types';
import ImageViewerLightbox from '@/components/ImageViewerLightbox';
import MathText from '@/components/MathText';
import { formatReplyText } from '@/features/messages/supportChatUtils';

const QUICK_FEEDBACK_TEMPLATES = [
  'Harika çözüm! 👏',
  'İşlem hatasına dikkat et ⚠️',
  'Ortak çarpan parantezine almayı dene 📐',
  'Soru kökündeki kısıtı tekrar oku 🔍',
  'Tebrikler, tam doğru! ⭐',
  'Yanlış defterindeki çözümlü videoyu izle 🎬',
  'Ödevini inceledim, eline sağlık! 📚',
];

export const STUDENT_QUICK_TEMPLATES = [
  '❓ Çözüm adımlarını anlayamadım',
  '📐 Hangi konuya çalışmalıyım?',
  '⏰ Canlı ders ne zaman?',
  '📝 Ödev kontrolü rica edebilir miyim?',
  '💡 Bir sonraki deneme ne zaman?',
];

export const MATH_QUICK_SYMBOLS = [
  { label: '√x', snippet: '$\\sqrt{x}$' },
  { label: 'x²', snippet: '$x^2$' },
  { label: 'a/b', snippet: '$\\frac{a}{b}$' },
  { label: 'π', snippet: '$\\pi$' },
  { label: '±', snippet: '$\\pm$' },
  { label: '≤', snippet: '$\\le$' },
  { label: '≥', snippet: '$\\ge$' },
  { label: '≠', snippet: '$\\neq$' },
  { label: '·', snippet: '$\\cdot$' },
  { label: '°', snippet: '$^\\circ$' },
  { label: 'Δ', snippet: '$\\Delta$' },
];

const formatTime = (value: string) =>
  new Date(value).toLocaleString('tr-TR', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  });

function formatAudioDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/** Sesli Mesaj Oynatıcı Bileşeni */
function VoiceNotePlayer({
  audioUrl,
  isOwn,
  isLight = true,
}: {
  audioUrl: string;
  isOwn: boolean;
  isLight?: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const onLoaded = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      void audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div
      className={`my-1 flex items-center gap-2 rounded-xl p-2 min-w-[180px] max-w-[240px] ${
        isOwn
          ? 'bg-white/15 text-white'
          : isLight
            ? 'bg-slate-100 text-slate-800'
            : 'bg-slate-700/60 text-slate-100'
      }`}
    >
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Durdur' : 'Oynat'}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition shadow-sm ${
          isOwn
            ? 'bg-white text-indigo-600 hover:bg-slate-100'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4 fill-current" />
        ) : (
          <Play className="h-4 w-4 fill-current ml-0.5" />
        )}
      </button>

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/20 dark:bg-white/20">
          <div
            className={`h-full transition-all duration-100 ${
              isOwn ? 'bg-white' : 'bg-indigo-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] opacity-75 font-mono">
          <span>{formatAudioDuration((progress / 100) * (duration || 0))}</span>
          <span>{formatAudioDuration(duration)}</span>
        </div>
      </div>
    </div>
  );
}

function ScrollableChipRow({
  children,
  isLight = true,
  className = '',
}: {
  children: React.ReactNode;
  isLight?: boolean;
  className?: string;
}) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScroll = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 6);
  }, []);

  useEffect(() => {
    updateScroll();
    const el = rowRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll);
    return () => {
      el.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, [updateScroll]);

  const scrollLeft = () => {
    rowRef.current?.scrollBy({ left: -160, behavior: 'smooth' });
  };

  const scrollRight = () => {
    rowRef.current?.scrollBy({ left: 160, behavior: 'smooth' });
  };

  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftPosRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = rowRef.current;
    if (!el) return;
    isDownRef.current = true;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftPosRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDownRef.current) return;
    const el = rowRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.3;
    el.scrollLeft = scrollLeftPosRef.current - walk;
  };

  const handleMouseUp = () => {
    isDownRef.current = false;
  };

  return (
    <div className="group/scrollrow relative flex items-center min-w-0 w-full">
      {/* Sol Kaydırma Oku & Hafif Gradyan Fade */}
      {canScrollLeft && (
        <>
          <div
            className={`pointer-events-none absolute left-0 top-0 bottom-1 w-8 bg-gradient-to-r ${
              isLight
                ? 'from-white via-white/80 to-transparent'
                : 'from-slate-900 via-slate-900/80 to-transparent'
            }`}
          />
          <button
            type="button"
            onClick={scrollLeft}
            aria-label="Sola kaydır"
            title="Sola kaydır"
            className={`absolute left-0 z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full shadow-md transition-all ${
              isLight
                ? 'bg-white text-slate-700 hover:bg-slate-100 hover:text-indigo-600 border border-slate-200'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        </>
      )}

      {/* Kaydırılabilir İçerik */}
      <div
        ref={rowRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex items-center gap-1.5 overflow-x-auto overflow-y-hidden overscroll-contain pb-1 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full cursor-grab active:cursor-grabbing ${className}`}
        style={{ overscrollBehavior: 'contain' }}
      >
        {children}
      </div>

      {/* Sağ Kaydırma Oku & Hafif Gradyan Fade */}
      {canScrollRight && (
        <>
          <div
            className={`pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l ${
              isLight
                ? 'from-white via-white/80 to-transparent'
                : 'from-slate-900 via-slate-900/80 to-transparent'
            }`}
          />
          <button
            type="button"
            onClick={scrollRight}
            aria-label="Sağa kaydır"
            title="Sağa kaydır"
            className={`absolute right-0 z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full shadow-md transition-all ${
              isLight
                ? 'bg-white text-slate-700 hover:bg-slate-100 hover:text-indigo-600 border border-slate-200'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
}

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
  attachmentPreviews?: Array<{
    name: string;
    url: string;
    kind?: 'image' | 'file' | 'audio';
    size?: number;
  }> | null;
  onAttachmentRemove?: (index?: number) => void;
  onAttachmentSelect?: (files: FileList | null) => void;
  onVoiceRecordComplete?: (audioFile: File) => void;
  peerTyping?: boolean;
  onTyping?: () => void;
  hasMoreMessages?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
};

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
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);

  // Yanıtlama (Quote / Reply) State
  const [replyingTo, setReplyingTo] = useState<ThreadMessage | null>(null);

  // Hızlı Semboller Grid Görünümü State
  const [isSymbolsExpanded, setIsSymbolsExpanded] = useState(false);

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

  // Ses kaydı başlatma
  const startRecording = async () => {
    try {
      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        alert('Tarayıcınız mikrofon erişimini desteklemiyor.');
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
      alert('Mikrofon erişim izni verilmedi.');
    }
  };

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

  // Ses kaydını iptal etme
  const cancelRecording = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
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

  const handleAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    onAttachmentSelect?.(event.target.files);
    event.target.value = '';
  };

  // Normalleştirilmiş ek listesi
  const allAttachments = useMemo(() => {
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

  const canSend =
    !sending &&
    !inputDisabled &&
    (draft.trim().length > 0 || allAttachments.length > 0);

  // Tasarım Stilleri
  const headerBorder =
    appearance === 'navbar'
      ? isLight
        ? 'border-slate-200'
        : 'border-slate-700/80'
      : 'border-[var(--border)]';

  const headerBg =
    appearance === 'navbar'
      ? isLight
        ? 'bg-white/90 backdrop-blur-md'
        : 'bg-slate-900/90 backdrop-blur-md'
      : 'bg-[var(--bg-elevated)]';

  const titleClass =
    appearance === 'navbar'
      ? isLight
        ? 'text-slate-900'
        : 'text-white'
      : 'text-[var(--text-strong)]';

  const subtitleClass =
    appearance === 'navbar'
      ? isLight
        ? 'text-slate-500'
        : 'text-slate-400'
      : 'text-[var(--text-muted)]';

  const listBg =
    appearance === 'navbar'
      ? isLight
        ? 'bg-slate-50/70'
        : 'bg-slate-950/40'
      : 'bg-[var(--bg-soft,#0f172a)]';

  const formBorder =
    appearance === 'navbar'
      ? isLight
        ? 'border-slate-200 bg-white'
        : 'border-slate-800 bg-slate-900'
      : 'border-[var(--border)] bg-[var(--bg-elevated)]';

  const textareaClass =
    appearance === 'navbar'
      ? isLight
        ? 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
        : 'border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500'
      : 'border-[var(--border)] bg-[var(--bg-soft)] text-[var(--text)] placeholder:text-[var(--text-muted)]';

  const ownBubble =
    appearance === 'navbar'
      ? 'rounded-br-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
      : 'rounded-br-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md';

  const peerBubble = (() => {
    if (appearance === 'navbar') {
      return isLight
        ? 'rounded-bl-sm bg-white text-slate-900 ring-1 ring-slate-200/80 shadow-xs'
        : 'rounded-bl-sm bg-slate-800 text-slate-100 ring-1 ring-slate-700/80 shadow-xs';
    }
    return 'rounded-bl-sm bg-[var(--bg-muted)] text-[var(--text)] ring-1 ring-[var(--border)] shadow-xs';
  })();

  return (
    <div className="flex min-h-0 flex-1 flex-col font-sans">
      {/* 1. Üst Başlık (Header) */}
      <div
        className={`flex shrink-0 items-center justify-between border-b px-4 py-3 ${headerBorder} ${headerBg}`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Geri"
              className={`shrink-0 rounded-lg p-1.5 transition-colors ${
                appearance === 'navbar'
                  ? isLight
                    ? 'text-slate-500 hover:bg-slate-100'
                    : 'text-slate-400 hover:bg-white/5'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-muted)]'
              }`}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}

          {/* Profil Avatarı & Çevrim içi Noktası */}
          <div className="relative shrink-0">
            {peerAvatarSrc ? (
              <Image
                src={peerAvatarSrc}
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover border border-white/40 shadow-xs"
              />
            ) : (
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-sm"
                aria-hidden
              >
                {(peerDisplayName.trim()[0] || '?').toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500" />
          </div>

          <div className="min-w-0 flex-1">
            <span className={`block truncate text-sm font-semibold ${titleClass}`}>
              {peerDisplayName}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`block truncate text-[11px] ${subtitleClass}`}>
                {peerSubtitle || 'Çevrim içi • Aktif'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Sohbet İçi Arama Butonu */}
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen((prev) => !prev);
              if (isSearchOpen) setSearchQuery('');
            }}
            aria-label="Sohbette ara"
            title="Sohbette ara"
            className={`rounded-lg p-1.5 transition-colors ${
              isSearchOpen
                ? 'bg-indigo-500/10 text-indigo-500'
                : appearance === 'navbar'
                  ? isLight
                    ? 'text-slate-500 hover:bg-slate-100'
                    : 'text-slate-400 hover:bg-white/5'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-muted)]'
            }`}
          >
            <Search className="h-4 w-4" />
          </button>

          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className={`shrink-0 rounded-lg p-1.5 transition-colors ${
                appearance === 'navbar'
                  ? isLight
                    ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-muted)]'
              }`}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      {/* 2. Canlı Arama Çubuğu (Açıksa) */}
      {isSearchOpen && (
        <div
          className={`flex items-center gap-2 border-b px-3 py-2 text-xs transition-all ${
            isLight
              ? 'bg-slate-100/90 border-slate-200'
              : 'bg-slate-800/90 border-slate-700'
          }`}
        >
          <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Mesajlarda ara..."
            className={`w-full bg-transparent text-xs focus:outline-none ${
              isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-slate-100 placeholder:text-slate-500'
            }`}
          />
          {searchQuery ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-indigo-500 shrink-0">
                {filteredMessages.length} eşleşme
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* 3. Mesaj Akış Alanı (List) */}
      <div
        ref={listRef}
        className={`flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-3 ${listBg}`}
        style={{ minHeight: 0, overscrollBehavior: 'contain' }}
      >
        {/* Daha Eski Mesajları Yükle Butonu */}
        {hasMoreMessages && (
          <div className="flex justify-center pb-2">
            <button
              type="button"
              onClick={onLoadMore}
              disabled={loadingMore}
              className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold text-indigo-500 transition hover:bg-indigo-500/20 disabled:opacity-50"
            >
              {loadingMore ? 'Yükleniyor...' : 'Daha eski mesajları göster'}
            </button>
          </div>
        )}

        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center my-auto">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
              <Calculator className="h-6 w-6" />
            </div>
            <p className={`text-sm font-semibold mb-1 ${titleClass}`}>
              {searchQuery ? 'Eşleşen Mesaj Bulunamadı' : 'Uğur Hoca ile Matematik Sohbeti'}
            </p>
            <p className={`text-xs max-w-xs ${subtitleClass}`}>
              {searchQuery
                ? `"${searchQuery}" ifadesiyle ilgili mesaj bulunamadı.`
                : "Takıldığın bir soru, ödev veya çalışma programın hakkında Uğur Hoca'ya doğrudan yazabilirsin."}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {filteredMessages.map((message) => {
              const isOwn = message.isOwn;

              return (
                <li
                  key={message.id}
                  className={`group relative flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Yanıtla Butonu (Hover / Odak) */}
                  <div
                    className={`absolute -top-3.5 z-10 hidden items-center gap-1 group-hover:flex ${
                      isOwn ? 'right-2' : 'left-2'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setReplyingTo(message)}
                      aria-label="Mesajı yanıtla"
                      title="Yanıtla"
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <Reply className="h-3 w-3" />
                    </button>
                  </div>

                  <div
                    className={`max-w-[84%] break-words [overflow-wrap:anywhere] rounded-2xl px-3.5 py-2.5 text-sm transition-all ${
                      isOwn ? ownBubble : peerBubble
                    }`}
                  >
                    {/* Alıntılanan Mesaj Kutusu (Varsa) */}
                    {message.replyTo ? (
                      <div
                        className={`mb-2 rounded-xl border-l-3 border-indigo-400 px-2.5 py-1 text-xs ${
                          isOwn
                            ? 'bg-black/20 text-indigo-100'
                            : isLight
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-slate-700/50 text-slate-200'
                        }`}
                      >
                        <span className="block font-semibold text-[10px] text-indigo-300">
                          {message.replyTo.senderName || 'Alıntı'}
                        </span>
                        <p className="line-clamp-2 italic text-[11px]">
                          {message.replyTo.text}
                        </p>
                      </div>
                    ) : null}

                    {/* Tekil veya Çoklu Görsel Eki */}
                    {message.imageUrl && !message.attachments?.some((a) => a.kind === 'image') ? (
                      <button
                        type="button"
                        onClick={() => setActiveLightboxImage(message.imageUrl || null)}
                        aria-label="Görseli tam ekran incele"
                        className="mb-1.5 block overflow-hidden rounded-xl cursor-zoom-in text-left transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                      >
                        <Image
                          src={message.imageUrl}
                          alt="Ek görsel"
                          width={260}
                          height={190}
                          className="h-auto w-full max-w-[260px] rounded-xl object-cover shadow-xs"
                          unoptimized
                        />
                      </button>
                    ) : null}

                    {/* Ekler Listesi (Görseller, Belgeler, PDF) */}
                    {message.attachments && message.attachments.length > 0 ? (
                      <div className="mb-1.5 flex flex-col gap-1.5">
                        {message.attachments.map((att, idx) => {
                          if (att.kind === 'image') {
                            return (
                              <button
                                key={`${att.url}-${idx}`}
                                type="button"
                                onClick={() => setActiveLightboxImage(att.url)}
                                aria-label="Görseli büyüt"
                                className="block overflow-hidden rounded-xl cursor-zoom-in text-left transition hover:opacity-95"
                              >
                                <Image
                                  src={att.url}
                                  alt={att.name || 'Ek görsel'}
                                  width={260}
                                  height={190}
                                  className="h-auto w-full max-w-[260px] rounded-xl object-cover shadow-xs"
                                  unoptimized
                                />
                              </button>
                            );
                          }

                          if (att.kind === 'file') {
                            return (
                              <a
                                key={`${att.url}-${idx}`}
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 rounded-xl p-2 text-xs transition ${
                                  isOwn
                                    ? 'bg-white/15 text-white hover:bg-white/25'
                                    : isLight
                                      ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                                      : 'bg-slate-700/60 text-slate-100 hover:bg-slate-700'
                                }`}
                              >
                                <FileText className="h-4 w-4 shrink-0 text-red-400" />
                                <span className="truncate font-medium flex-1">
                                  {att.name || 'Belge'}
                                </span>
                              </a>
                            );
                          }

                          return null;
                        })}
                      </div>
                    ) : null}

                    {/* Sesli Mesaj Oynatıcısı (Varsa) */}
                    {message.audioUrl && (
                      <VoiceNotePlayer
                        audioUrl={message.audioUrl}
                        isOwn={isOwn}
                        isLight={isLight}
                      />
                    )}

                    {/* Mesaj Metni ve KaTeX Matematik Desteği */}
                    {message.text ? (
                      <div className="whitespace-pre-wrap break-words text-[13px] leading-relaxed">
                        <MathText>{message.text}</MathText>
                      </div>
                    ) : null}

                    {/* Saat ve Okundu/Teslim Durumu (✓✓) */}
                    <div
                      className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                        isOwn
                          ? 'text-indigo-100/90'
                          : isLight
                            ? 'text-slate-400'
                            : 'text-slate-400'
                      }`}
                    >
                      <span>{formatTime(message.created_at)}</span>

                      {/* WhatsApp Tarzı İletildi / Okundu Çift Tik */}
                      {isOwn && (
                        <span title={message.status === 'read' ? 'Okundu' : 'İletildi'}>
                          {message.status === 'read' ? (
                            <CheckCheck className="h-3.5 w-3.5 text-sky-300" strokeWidth={2.4} />
                          ) : (
                            <Check className="h-3 w-3 text-indigo-200/80" strokeWidth={2} />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* 4. Karşı Taraf Yazıyor Göstergesi */}
        {peerTyping && (
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 animate-pulse">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-500">
              {(peerDisplayName[0] || 'U').toUpperCase()}
            </div>
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
              {peerDisplayName} yazıyor
            </span>
            <span className="flex gap-1 items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" />
            </span>
          </div>
        )}
      </div>

      {/* 5. Alt Form Alanı */}
      <form
        onSubmit={handleFormSubmit}
        className={`shrink-0 border-t px-3 py-2.5 transition-colors ${formBorder}`}
      >
        {error ? (
          <p className="mb-1.5 text-[11px] font-medium text-red-500">{error}</p>
        ) : null}

        {/* Öğrenci Hızlı Soru Şablonları */}
        {appearance === 'navbar' && !draft && (
          <div className="mb-2">
            <ScrollableChipRow isLight={isLight}>
              <span className="text-[10px] font-bold text-indigo-500 shrink-0 flex items-center gap-1 pr-1 select-none">
                <Sparkles className="h-3 w-3 text-amber-400" />
                Soru Şablonu:
              </span>
              {STUDENT_QUICK_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl}
                  type="button"
                  onClick={() => onDraftChange(tmpl)}
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition shadow-2xs ${
                    isLight
                      ? 'border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600'
                      : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-indigo-400 hover:bg-slate-700 hover:text-indigo-300'
                  }`}
                >
                  {tmpl}
                </button>
              ))}
            </ScrollableChipRow>
          </div>
        )}

        {/* Öğretmen / Admin Hızlı Geri Bildirim Şablonları */}
        {appearance === 'admin' && (
          <div className="mb-2">
            <ScrollableChipRow isLight={isLight}>
              <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1 pr-1 select-none">
                <Sparkles className="h-3 w-3 text-amber-400" />
                Hızlı Not:
              </span>
              {QUICK_FEEDBACK_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl}
                  type="button"
                  onClick={() => onDraftChange(draft ? `${draft} ${tmpl}` : tmpl)}
                  className="shrink-0 rounded-lg border border-[var(--border)] bg-[var(--bg-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-strong)] hover:bg-[var(--bg-muted)] hover:border-indigo-400/40 transition shadow-sm"
                >
                  {tmpl}
                </button>
              ))}
            </ScrollableChipRow>
          </div>
        )}

        {/* Hızlı Matematik Sembolleri Çubuğu / Izgara */}
        <div className="mb-2">
          {isSymbolsExpanded ? (
            <div
              className={`rounded-xl border p-2 transition-all shadow-xs ${
                isLight
                  ? 'border-slate-200 bg-slate-50/90'
                  : 'border-slate-700/80 bg-slate-800/80'
              }`}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-500 flex items-center gap-1 select-none">
                  <Calculator className="h-3 w-3" />
                  Matematik Sembolleri (Tümü):
                </span>
                <button
                  type="button"
                  onClick={() => setIsSymbolsExpanded(false)}
                  className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-slate-500 hover:text-indigo-600 transition"
                  title="Satır görünümüne dön"
                >
                  <LayoutGrid className="h-3 w-3 text-indigo-500" />
                  Kapat
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {MATH_QUICK_SYMBOLS.map((sym) => (
                  <button
                    key={sym.label}
                    type="button"
                    onClick={() => onDraftChange(draft ? `${draft} ${sym.snippet}` : sym.snippet)}
                    title={`${sym.label} ekle`}
                    className={`rounded-lg border px-2 py-0.5 text-xs font-medium transition shadow-2xs ${
                      appearance === 'navbar'
                        ? isLight
                          ? 'border-slate-200 bg-white text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600'
                          : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:border-indigo-400 hover:text-indigo-300'
                        : 'border-[var(--border)] bg-[var(--bg-soft)] text-[var(--text)] hover:border-indigo-400 hover:bg-[var(--bg-muted)]'
                    }`}
                  >
                    {sym.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ScrollableChipRow isLight={isLight}>
              <div className="shrink-0 flex items-center gap-1 pr-1">
                <span className="text-[10px] font-bold text-indigo-500 flex items-center gap-1 select-none">
                  <Calculator className="h-3 w-3" />
                  Sembol:
                </span>
                <button
                  type="button"
                  onClick={() => setIsSymbolsExpanded(true)}
                  className={`flex h-5 w-5 items-center justify-center rounded border transition shadow-2xs ${
                    isLight
                      ? 'border-slate-200 bg-slate-50 text-slate-600 hover:text-indigo-600 hover:border-indigo-300'
                      : 'border-slate-700 bg-slate-800 text-slate-300 hover:text-indigo-400 hover:border-indigo-500'
                  }`}
                  title="Tüm sembolleri ızgara olarak göster"
                  aria-label="Tüm sembolleri ızgara olarak göster"
                >
                  <LayoutGrid className="h-3 w-3" />
                </button>
              </div>
              {MATH_QUICK_SYMBOLS.map((sym) => (
                <button
                  key={sym.label}
                  type="button"
                  onClick={() => onDraftChange(draft ? `${draft} ${sym.snippet}` : sym.snippet)}
                  title={`${sym.label} ekle`}
                  className={`shrink-0 rounded-lg border px-2 py-0.5 text-xs font-medium transition shadow-2xs ${
                    appearance === 'navbar'
                      ? isLight
                        ? 'border-slate-200 bg-slate-100/80 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600'
                        : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:border-indigo-400 hover:text-indigo-300'
                      : 'border-[var(--border)] bg-[var(--bg-soft)] text-[var(--text)] hover:border-indigo-400 hover:bg-[var(--bg-muted)]'
                  }`}
                >
                  {sym.label}
                </button>
              ))}
            </ScrollableChipRow>
          )}
        </div>

        {/* Canlı Matematik Önizleme */}
        {draft.includes('$') && (
          <div className="mb-2 rounded-xl border border-indigo-400/30 bg-indigo-500/10 p-2 text-xs">
            <span className="block text-[10px] font-bold text-indigo-500 mb-0.5">
              Canlı Formül Önizleme:
            </span>
            <div className="text-[13px] font-serif text-slate-800 dark:text-slate-100">
              <MathText>{draft}</MathText>
            </div>
          </div>
        )}

        {/* Yanıtlanan Mesaj Banner'ı (Quote Banner) */}
        {replyingTo && (
          <div className="mb-2 flex items-center justify-between gap-2 rounded-xl border-l-4 border-indigo-500 bg-indigo-500/10 p-2 text-xs">
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold text-indigo-500">
                {replyingTo.isOwn ? 'Kendi Mesajını Yanıtlıyorsun' : `${peerDisplayName}'ı Yanıtlıyorsun`}
              </span>
              <p className="line-clamp-1 italic text-slate-600 dark:text-slate-300">
                {replyingTo.text || 'Ek dosya / Fotoğraf'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              aria-label="Yanıtı kaldır"
              className="rounded-lg p-1 text-slate-400 hover:bg-black/10 dark:hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Ekler Önizleme Çubuğu (Görsel ve Dosya) */}
        {allAttachments.length > 0 ? (
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {allAttachments.map((att, idx) => (
              <div
                key={`${att.name}-${idx}`}
                className="flex items-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-500/10 p-1.5 text-xs shadow-2xs"
              >
                {att.kind !== 'file' ? (
                  <button
                    type="button"
                    onClick={() => setActiveLightboxImage(att.url)}
                    className="cursor-zoom-in"
                  >
                    <Image
                      src={att.url}
                      alt=""
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-lg object-cover"
                      unoptimized
                    />
                  </button>
                ) : (
                  <FileText className="h-5 w-5 text-indigo-500" />
                )}
                <span className="max-w-[120px] truncate text-[11px] font-medium text-slate-700 dark:text-slate-200">
                  {att.name}
                </span>
                <button
                  type="button"
                  onClick={() => onAttachmentRemove?.(idx)}
                  aria-label="Eki kaldır"
                  className="rounded-lg p-1 text-slate-400 transition hover:bg-black/10 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {/* Canlı Ses Kaydı Durumu */}
        {isRecording ? (
          <div className="flex h-11 items-center justify-between rounded-xl bg-red-500/10 border border-red-500/30 px-3">
            <div className="flex items-center gap-2 text-red-500">
              <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
              <span className="font-mono text-xs font-bold">
                {formatAudioDuration(recordingSeconds)} / 1:00
              </span>
              <span className="text-[11px] font-medium ml-1">Ses kaydediliyor...</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={cancelRecording}
                aria-label="Kaydı iptal et"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/20 hover:text-red-500 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={stopRecordingAndSend}
                aria-label="Kaydı tamamla ve gönder"
                className="rounded-lg bg-red-500 p-1.5 text-white hover:bg-red-600 transition"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </button>
            </div>
          </div>
        ) : (
          /* Normal Mesaj Giriş Satırı */
          <div className="flex items-end gap-2">
            {onAttachmentSelect ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  multiple
                  className="sr-only"
                  onChange={handleAttachmentChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending || inputDisabled}
                  aria-label="Fotoğraf veya PDF ekle"
                  title="Fotoğraf veya PDF ekle"
                  className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    appearance === 'navbar'
                      ? isLight
                        ? 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                        : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                      : 'border-[var(--border)] bg-[var(--bg-soft)] text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-strong)]'
                  }`}
                >
                  <ImagePlus className="h-5 w-5" aria-hidden="true" />
                </button>
              </>
            ) : null}

            {/* Ses Kaydı Başlatma Butonu */}
            {onVoiceRecordComplete ? (
              <button
                type="button"
                onClick={startRecording}
                disabled={sending || inputDisabled}
                aria-label="Sesli mesaj kaydet"
                title="Sesli mesaj kaydet"
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  appearance === 'navbar'
                    ? isLight
                      ? 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-indigo-600'
                      : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-indigo-300'
                    : 'border-[var(--border)] bg-[var(--bg-soft)] text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-strong)]'
                }`}
              >
                <Mic className="h-5 w-5" aria-hidden="true" />
              </button>
            ) : null}

            <textarea
              value={draft}
              onChange={(event) => {
                onDraftChange(event.target.value);
                onTyping?.();
              }}
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  (
                    event.currentTarget.form as HTMLFormElement | null
                  )?.requestSubmit();
                }
              }}
              placeholder={placeholder}
              rows={1}
              autoComplete="off"
              autoCorrect="on"
              enterKeyHint="send"
              disabled={sending || inputDisabled}
              className={`max-h-32 min-h-[2.5rem] flex-1 resize-none appearance-none rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${textareaClass}`}
            />
            <button
              type="submit"
              disabled={!canSend}
              aria-busy={sending}
              aria-label={sending ? 'Gönderiliyor' : 'Gönder'}
              className="inline-flex h-10 min-w-[5.25rem] flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-3 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                'Gönder'
              )}
            </button>
          </div>
        )}
      </form>

      {/* 6. Görsel Büyütme Lightbox */}
      <ImageViewerLightbox
        src={activeLightboxImage}
        alt="Fotoğraf Önizleme"
        onClose={() => setActiveLightboxImage(null)}
      />
    </div>
  );
}

