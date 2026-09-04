'use client';

import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Clock,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  MessageSquare,
  Users,
  HelpCircle,
  Settings,
  PenTool,
  Radio,
  LogOut,
} from 'lucide-react';
import { DisplaySettingsBridge } from '@/features/live-lessons/components/room/DisplaySettingsBridge';
import { DisplaySettingsPanel } from '@/features/live-lessons/components/room/DisplaySettingsPanel';
import { QuizPanel } from '@/features/live-lessons/components/quiz/QuizPanel';
import { LiveLessonChatPanel } from '@/features/live-lessons/components/room/LiveLessonChatPanel';
import { RemoteScreenShareView } from '@/features/live-lessons/components/room/RemoteScreenShareView';
import { StudentEngagementBar } from '@/features/live-lessons/components/room/StudentEngagementBar';
import { TeacherCameraView } from '@/features/live-lessons/components/room/TeacherCameraView';
import { TeacherModerationPanel } from '@/features/live-lessons/components/room/TeacherModerationPanel';
import { TeacherToolbar } from '@/features/live-lessons/components/room/TeacherToolbar';
import { RoomLobbyPreview } from '@/features/live-lessons/components/room/RoomLobbyPreview';
import type { LiveLessonDisplaySettings } from '@/features/live-lessons/lib/room-data';
import type { LiveLesson, LiveLessonRole } from '@/features/live-lessons/types';

const ScratchpadModal = dynamic(() => import('@/components/ScratchpadModal'), {
  ssr: false,
});

const requireStudentApproval =
  process.env.NEXT_PUBLIC_REQUIRE_STUDENT_APPROVAL !== 'false';

const defaultDisplaySettings: LiveLessonDisplaySettings = {
  cameraPlacement: 'side',
  cameraSize: 'medium',
  panelWidth: 'normal',
  screenFit: 'contain',
};

type DockTab = 'chat' | 'participants' | 'quiz' | 'settings';

function newIdentity(userId: string, role: LiveLessonRole): string {
  const prefix = role === 'teacher' ? 'teacher' : 'student';
  return `${prefix}_${userId.slice(0, 24)}`;
}

type Props = {
  displayName: string;
  lesson: LiveLesson;
  role: LiveLessonRole;
  teacherProof?: string | null;
  userId: string;
};

export function RoomExperience({
  displayName,
  lesson,
  role,
  teacherProof,
  userId,
}: Props) {
  const roomId = lesson.room_id;
  const router = useRouter();
  const [identity] = useState(() => newIdentity(userId, role));
  const [token, setToken] = useState<string | null>(null);
  const [persistToken, setPersistToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [lessonUnlocked, setLessonUnlocked] = useState(
    () => role === 'teacher' || !requireStudentApproval,
  );
  const [displaySettings, setDisplaySettings] = useState(defaultDisplaySettings);
  const [leaving, setLeaving] = useState(false);
  const [activeTab, setActiveTab] = useState<DockTab>('chat');
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [initialMicOn, setInitialMicOn] = useState(role === 'teacher');
  const [initialCameraOn, setInitialCameraOn] = useState(false);

  // Sayaç Durumu (Elapsed timer)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  const unlockLesson = useCallback(() => {
    setLessonUnlocked(true);
  }, []);

  useEffect(
    () => () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    },
    [],
  );

  // Canlı Ders Süresi Sayacı
  useEffect(() => {
    if (!token) return;
    const baseTime = lesson.started_at
      ? new Date(lesson.started_at).getTime()
      : Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      setElapsedSeconds(Math.max(0, Math.floor((now - baseTime) / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [lesson.started_at, token]);

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const toggleFullscreen = useCallback(() => {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      void document.documentElement
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      void document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  }, []);

  const joinRoom = useCallback(async () => {
    if (!serverUrl) {
      setError('NEXT_PUBLIC_LIVEKIT_URL tanımlı değil.');
      return;
    }
    setError(null);
    setConnecting(true);
    try {
      await fetch(`/api/live-lessons/${lesson.id}/join`, {
        credentials: 'same-origin',
        method: 'POST',
      });

      const res = await fetch('/api/livekit/token', {
        body: JSON.stringify({
          identity,
          lessonId: lesson.id,
          role,
          roomName: roomId,
          ...(teacherProof ? { teacherProof } : {}),
        }),
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const data = (await res.json()) as {
        error?: string;
        persistToken?: string;
        token?: string;
      };
      if (!res.ok || !data.token || !data.persistToken) {
        setError(data.error ?? 'Derse bağlanılamadı.');
        return;
      }
      setPersistToken(data.persistToken);
      setLessonUnlocked(role === 'teacher' || !requireStudentApproval);
      setToken(data.token);
    } catch {
      setError('Ağ hatası — tekrar deneyin.');
    } finally {
      setConnecting(false);
    }
  }, [identity, lesson.id, role, roomId, serverUrl, teacherProof]);

  const studentShareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/canli-ders/d/${roomId}`;
  }, [roomId]);

  const copyStudentLink = useCallback(() => {
    if (!studentShareUrl) return;
    void navigator.clipboard.writeText(studentShareUrl).then(() => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      setLinkCopied(true);
      copyTimeoutRef.current = setTimeout(() => {
        copyTimeoutRef.current = null;
        setLinkCopied(false);
      }, 2000);
    });
  }, [studentShareUrl]);

  const leaveLesson = useCallback(async () => {
    setLeaving(true);
    try {
      await fetch(`/api/live-lessons/${lesson.id}/leave`, {
        credentials: 'same-origin',
        method: 'POST',
      });
    } finally {
      router.push('/canli-ders');
    }
  }, [lesson.id, router]);

  const overlayCameraSize =
    displaySettings.cameraSize === 'large'
      ? 'w-80 max-w-[42vw]'
      : displaySettings.cameraSize === 'small'
        ? 'w-36 max-w-[34vw]'
        : 'w-56 max-w-[38vw]';
  const sidePanelWidth = displaySettings.panelWidth === 'wide' ? 'lg:w-[28rem]' : 'lg:w-96';

  // Lobi / Bekleme Ekranı
  if (!token) {
    return (
      <RoomLobbyPreview
        connecting={connecting}
        displayName={displayName}
        error={error}
        initialCameraOn={initialCameraOn}
        initialMicOn={initialMicOn}
        lesson={lesson}
        onCameraToggle={() => setInitialCameraOn((v) => !v)}
        onJoin={() => void joinRoom()}
        onMicToggle={() => setInitialMicOn((v) => !v)}
        role={role}
      />
    );
  }

  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={token}
      connect
      audio={initialMicOn}
      video={initialCameraOn}
      className="flex min-h-screen min-h-dvh flex-col bg-background text-foreground select-none"
      onDisconnected={() => {
        setToken(null);
        setPersistToken(null);
        setRoomError(null);
        setLessonUnlocked(role === 'teacher' || !requireStudentApproval);
      }}
      onError={(event) => setRoomError(event.message)}
    >
      {(role === 'teacher' || lessonUnlocked) && <RoomAudioRenderer />}
      <DisplaySettingsBridge
        identity={identity}
        onSettingsChange={setDisplaySettings}
        role={role}
        settings={displaySettings}
      />

      {roomError && (
        <div
          className="flex shrink-0 items-center justify-between gap-2 border-b border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-300"
          role="alert"
        >
          <span className="min-w-0 break-words">{roomError}</span>
          <button
            type="button"
            onClick={() => setRoomError(null)}
            className="shrink-0 rounded-lg border border-red-500/40 px-2 py-1 text-xs hover:bg-red-500/10"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Oda Üst Barı */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-card/95 px-4 py-2.5 backdrop-blur-md">
        {/* Sol Taraf: Ders Başlığı ve Sayaç */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-rose-500/15 px-2.5 py-1 text-xs font-bold text-rose-500">
            <Radio className="h-3 w-3 animate-pulse" />
            <span className="hidden sm:inline">CANLI</span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-xs sm:text-sm font-bold text-foreground">
                {lesson.title}
              </h2>
              <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-semibold text-foreground/70">
                {role === 'teacher' ? 'Öğretmen' : 'Öğrenci'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-foreground/60">
              <span className="flex items-center gap-1 font-mono font-medium text-emerald-600 dark:text-emerald-400">
                <Clock className="h-3 w-3" />
                <span>{formatElapsed(elapsedSeconds)}</span>
              </span>
              <span>•</span>
              <span className="font-mono text-[10px]">{roomId}</span>
            </div>
          </div>
        </div>

        {/* Sağ Taraf: Kontroller */}
        <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          {/* Karalama Tahtası Butonu */}
          <button
            type="button"
            onClick={() => setIsScratchpadOpen(true)}
            className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition"
            title="Matematik Karalama Tahtasını Aç"
          >
            <PenTool className="h-3.5 w-3.5 text-brand-primary" />
            <span className="hidden sm:inline">Tahta</span>
          </button>

          {/* Tam Ekran Butonu */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-xl border border-border bg-card p-2 text-foreground/70 hover:bg-foreground/5 hover:text-foreground transition"
            title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>

          {role === 'teacher' && (
            <>
              <button
                type="button"
                onClick={copyStudentLink}
                className="hidden sm:inline-flex items-center gap-1 rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground/80 hover:bg-foreground/5 transition"
              >
                {linkCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Linki Paylaş</span>
                  </>
                )}
              </button>
              <TeacherToolbar />
            </>
          )}

          {/* Dersten Çık Butonu */}
          <button
            type="button"
            onClick={() => void leaveLesson()}
            disabled={leaving}
            className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-500/20 dark:text-rose-400 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>{leaving ? 'Çıkılıyor...' : 'Dersten Çık'}</span>
          </button>
        </div>
      </header>

      {/* Ana Gövde: Sol Ekran Paylaşımı + Sağ Sekmeli Panel */}
      <div className="relative flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2 lg:flex-row lg:gap-3 lg:p-3">
        {role === 'student' && requireStudentApproval && !lessonUnlocked && (
          <div className="absolute inset-2 z-20 flex items-center justify-center rounded-2xl bg-background/95 p-6 text-center backdrop-blur-md lg:inset-3 shadow-2xl">
            <div className="max-w-sm space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">Öğretmen Onayı Bekleniyor</h3>
              <p className="text-xs leading-relaxed text-foreground/70">
                Öğretmeniniz derse girişinizi onayladığında ekran ve ses otomatik olarak açılacaktır. Lütfen bekleyin.
              </p>
            </div>
          </div>
        )}

        {/* Sol Alan: Ekran Paylaşımı */}
        <div
          className={`relative flex min-h-[45vh] min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-black/95 shadow-inner lg:min-h-0 ${
            role === 'student' && requireStudentApproval && !lessonUnlocked
              ? 'pointer-events-none opacity-30'
              : ''
          }`}
        >
          <div className="relative flex min-h-0 flex-1">
            <RemoteScreenShareView fit={displaySettings.screenFit} role={role} />

            {/* Overlay Kamera */}
            {displaySettings.cameraPlacement === 'overlay' && (
              <div className={`absolute right-3 top-3 z-10 ${overlayCameraSize} shadow-2xl drop-shadow-lg`}>
                <TeacherCameraView
                  cameraSize={displaySettings.cameraSize}
                  role={role}
                />
              </div>
            )}
          </div>
        </div>

        {/* Sağ Alan: Sekmeli Dock Paneli */}
        <aside className={`flex min-h-0 w-full min-w-0 flex-col gap-2 ${sidePanelWidth} lg:shrink-0`}>
          {/* Yan Panel Kamerası (Eğer 'side' seçiliyse her zaman üstte kalır) */}
          {displaySettings.cameraPlacement === 'side' && (
            <div className="shrink-0">
              <TeacherCameraView
                cameraSize={displaySettings.cameraSize}
                role={role}
              />
            </div>
          )}

          {/* Sekme Butonları */}
          <div className="flex items-center justify-around rounded-xl border border-border bg-card p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${
                activeTab === 'chat'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-foreground/70 hover:bg-foreground/5'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Sohbet</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('participants')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${
                activeTab === 'participants'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-foreground/70 hover:bg-foreground/5'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Katılımcılar</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${
                activeTab === 'quiz'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-foreground/70 hover:bg-foreground/5'
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Quiz</span>
            </button>

            {role === 'teacher' && (
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`flex items-center justify-center rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  activeTab === 'settings'
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-foreground/70 hover:bg-foreground/5'
                }`}
                title="Görünüm Ayarları"
              >
                <Settings className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Aktif Sekme İçeriği */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {activeTab === 'chat' && (
              <LiveLessonChatPanel lessonId={lesson.id} />
            )}

            {activeTab === 'participants' && (
              role === 'teacher' ? (
                <TeacherModerationPanel
                  teacherIdentity={identity}
                  lessonId={lesson.id}
                  requireStudentApproval={requireStudentApproval}
                />
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 text-center text-xs text-foreground/70">
                  <Users className="h-8 w-8 text-brand-primary opacity-60 mb-2" />
                  <p className="font-semibold text-foreground">Sınıf Katılımcıları</p>
                  <p className="mt-1">
                    Öğretmeniniz ve sınıf arkadaşlarınız derse bağlı. Söz hakkı istemek için aşağıdaki el kaldır butonunu kullanabilirsiniz.
                  </p>
                </div>
              )
            )}

            {activeTab === 'quiz' && (
              <QuizPanel
                roomId={roomId}
                role={role}
                displayName={displayName}
                identity={identity}
                persistToken={persistToken}
                interactionLocked={
                  role === 'student' && requireStudentApproval && !lessonUnlocked
                }
              />
            )}

            {activeTab === 'settings' && role === 'teacher' && (
              <DisplaySettingsPanel
                settings={displaySettings}
                onChange={setDisplaySettings}
              />
            )}
          </div>
        </aside>
      </div>

      {/* Öğrenci Etkileşim Barı (El Kaldır / Mikrofon İste) */}
      {role === 'student' && (
        <StudentEngagementBar
          identity={identity}
          displayName={displayName.trim()}
          requireStudentApproval={requireStudentApproval}
          lessonId={lesson.id}
          onLessonUnlocked={unlockLesson}
        />
      )}

      {/* Matematik Karalama Tahtası Modalı */}
      {isScratchpadOpen && (
        <ScratchpadModal
          isOpen={isScratchpadOpen}
          onClose={() => setIsScratchpadOpen(false)}
          title={`Karalama Tahtası · ${lesson.title}`}
        />
      )}
    </LiveKitRoom>
  );
}

export default RoomExperience;
