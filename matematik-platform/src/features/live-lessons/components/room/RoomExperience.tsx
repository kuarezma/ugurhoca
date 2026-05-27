"use client";

import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DisplaySettingsBridge } from "@/features/live-lessons/components/room/DisplaySettingsBridge";
import { DisplaySettingsPanel } from "@/features/live-lessons/components/room/DisplaySettingsPanel";
import { QuizPanel } from "@/features/live-lessons/components/quiz/QuizPanel";
import { LiveLessonChatPanel } from "@/features/live-lessons/components/room/LiveLessonChatPanel";
import { RemoteScreenShareView } from "@/features/live-lessons/components/room/RemoteScreenShareView";
import { StudentEngagementBar } from "@/features/live-lessons/components/room/StudentEngagementBar";
import { TeacherCameraView } from "@/features/live-lessons/components/room/TeacherCameraView";
import { TeacherPresenceNotice } from "@/features/live-lessons/components/room/TeacherPresenceNotice";
import { TeacherModerationPanel } from "@/features/live-lessons/components/room/TeacherModerationPanel";
import { TeacherToolbar } from "@/features/live-lessons/components/room/TeacherToolbar";
import { ConnectionStatusBar } from "@/features/live-lessons/components/room/ConnectionStatusBar";
import { WhiteboardCanvas } from "@/features/live-lessons/components/room/WhiteboardCanvas";
import {
  liveLessonConnectOptions,
  liveLessonRoomOptions,
  teacherAudioCaptureOptions,
} from "@/features/live-lessons/lib/media-settings";
import { buildLiveLessonIdentity } from "@/features/live-lessons/lib/participant-identity";
import type { LiveLessonDisplaySettings } from "@/features/live-lessons/lib/room-data";
import type { LiveLesson, LiveLessonRole } from "@/features/live-lessons/types";

const requireStudentApproval =
  process.env.NEXT_PUBLIC_REQUIRE_STUDENT_APPROVAL !== "false";

const defaultDisplaySettings: LiveLessonDisplaySettings = {
  cameraPlacement: "side",
  cameraSize: "medium",
  mainView: "screen",
  panelWidth: "normal",
  screenFit: "contain",
};

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
  const [identity] = useState(() => buildLiveLessonIdentity(userId, role));
  const [token, setToken] = useState<string | null>(null);
  const [persistToken, setPersistToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [lessonUnlocked, setLessonUnlocked] = useState(
    () => role === "teacher" || !requireStudentApproval,
  );
  const [displaySettings, setDisplaySettings] = useState(defaultDisplaySettings);
  const [leaving, setLeaving] = useState(false);
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

  const joinRoom = useCallback(async () => {
    if (!serverUrl) {
      setError("NEXT_PUBLIC_LIVEKIT_URL tanımlı değil.");
      return;
    }
    setError(null);
    setConnecting(true);
    try {
      await fetch(`/api/live-lessons/${lesson.id}/join`, {
        credentials: "same-origin",
        method: "POST",
      });

      const res = await fetch("/api/livekit/token", {
        body: JSON.stringify({
          identity,
          lessonId: lesson.id,
          role,
          roomName: roomId,
          ...(teacherProof ? { teacherProof } : {}),
        }),
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = (await res.json()) as {
        error?: string;
        persistToken?: string;
        token?: string;
      };
      if (!res.ok || !data.token || !data.persistToken) {
        setError(data.error ?? "Derse bağlanılamadı.");
        return;
      }
      setPersistToken(data.persistToken);
      setLessonUnlocked(role === "teacher" || !requireStudentApproval);
      setToken(data.token);
    } catch {
      setError("Ağ hatası — tekrar deneyin.");
    } finally {
      setConnecting(false);
    }
  }, [identity, lesson.id, role, roomId, serverUrl, teacherProof]);

  const studentShareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
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
        credentials: "same-origin",
        method: "POST",
      });
    } finally {
      router.push("/canli-ders");
    }
  }, [lesson.id, router]);

  const overlayCameraSize =
    displaySettings.cameraSize === "large"
      ? "w-80 max-w-[42vw]"
      : displaySettings.cameraSize === "small"
        ? "w-36 max-w-[34vw]"
        : "w-56 max-w-[38vw]";
  const sidePanelWidth = displaySettings.panelWidth === "wide" ? "lg:w-[30rem]" : "lg:w-96";

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-8 text-white">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-slate-900 p-8 shadow-2xl">
          <div className="space-y-2 text-center">
            <p className="text-sm text-slate-400">Canlı ders odası</p>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            <p className="font-mono text-lg text-violet-200">{roomId}</p>
            <p className="text-sm text-slate-300">
              {displayName} olarak {role === "teacher" ? "öğretmen" : "öğrenci"} girişi
            </p>
          </div>

          {error ? (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => void joinRoom()}
            disabled={connecting}
            className="min-h-12 w-full rounded-xl bg-brand-primary px-4 py-3 text-base font-semibold text-white transition hover:bg-brand-primary-deep disabled:opacity-50"
          >
            {connecting ? "Bağlanıyor..." : "Derse gir"}
          </button>

          {role === "teacher" && studentShareUrl ? (
            <div className="space-y-2 border-t border-white/10 pt-4">
              <p className="text-xs font-medium text-slate-300">Öğrenci linki</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  className="min-h-10 flex-1 truncate rounded-lg border border-white/10 bg-slate-950 px-2 text-xs text-slate-200"
                  value={studentShareUrl}
                />
                <button
                  type="button"
                  onClick={copyStudentLink}
                  className="shrink-0 rounded-lg border border-white/10 px-3 text-sm font-medium hover:bg-white/5"
                >
                  {linkCopied ? "Kopyalandı" : "Kopyala"}
                </button>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => router.push("/canli-ders")}
            className="block w-full text-center text-sm text-violet-200 underline"
          >
            Canlı derslere dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={token}
      connect
      audio={role === "teacher" ? teacherAudioCaptureOptions : false}
      connectOptions={liveLessonConnectOptions}
      options={liveLessonRoomOptions}
      video={false}
      className="flex min-h-screen min-h-dvh flex-col bg-background text-foreground"
      onDisconnected={() => {
        setToken(null);
        setPersistToken(null);
        setRoomError(null);
        setLessonUnlocked(role === "teacher" || !requireStudentApproval);
      }}
      onError={(event) => setRoomError(event.message)}
    >
      {(role === "teacher" || lessonUnlocked) && <RoomAudioRenderer />}
      <DisplaySettingsBridge
        identity={identity}
        onSettingsChange={setDisplaySettings}
        role={role}
        settings={displaySettings}
      />
      {roomError ? (
        <div
          className="flex shrink-0 items-center justify-between gap-2 border-b border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200"
          role="alert"
        >
          <span className="min-w-0 break-words">{roomError}</span>
          <button
            type="button"
            onClick={() => setRoomError(null)}
            className="shrink-0 rounded-md border border-red-500/40 px-2 py-1 text-xs font-medium hover:bg-red-500/10"
          >
            Kapat
          </button>
        </div>
      ) : null}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border bg-card px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-medium">{displayName}</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
            {role === "teacher" ? "Öğretmen" : "Öğrenci"}
          </span>
          <span className="font-mono text-xs text-slate-400">{roomId}</span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {role === "teacher" ? (
            <>
              <button
                type="button"
                onClick={copyStudentLink}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-white/5"
              >
                {linkCopied ? "Kopyalandı" : "Linki kopyala"}
              </button>
              <TeacherToolbar />
            </>
          ) : null}
          <ConnectionStatusBar />
          <button
            type="button"
            onClick={() => void leaveLesson()}
            disabled={leaving}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-white/5"
          >
            {leaving ? "Çıkılıyor" : "Dersten çık"}
          </button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2 lg:flex-row lg:gap-3 lg:p-3">
        {role === "student" && requireStudentApproval && !lessonUnlocked ? (
          <div className="absolute inset-2 z-10 flex items-center justify-center rounded-xl bg-background/90 p-4 text-center lg:inset-3">
            <p className="max-w-xs text-sm font-medium text-foreground/90">
              Öğretmen onayı bekleniyor. Onaylandığında ders içeriği açılacaktır.
            </p>
          </div>
        ) : null}
        <div
          className={`flex min-h-[45vh] min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-black/90 lg:min-h-0 ${
            role === "student" && requireStudentApproval && !lessonUnlocked
              ? "pointer-events-none opacity-40"
              : ""
          }`}
        >
          <div className="relative flex min-h-0 flex-1">
            {displaySettings.mainView === "whiteboard" ? (
              <WhiteboardCanvas identity={identity} role={role} />
            ) : null}
            {displaySettings.mainView === "screen" ? (
              <RemoteScreenShareView fit={displaySettings.screenFit} role={role} />
            ) : null}
            {displaySettings.cameraPlacement === "overlay" && (
              <div className={`absolute right-3 top-3 z-10 ${overlayCameraSize}`}>
                <TeacherCameraView
                  cameraSize={displaySettings.cameraSize}
                  role={role}
                />
              </div>
            )}
          </div>
        </div>
        <aside className={`flex min-h-0 w-full min-w-0 flex-col gap-2 ${sidePanelWidth} lg:shrink-0`}>
          {role === "teacher" ? (
            <DisplaySettingsPanel
              settings={displaySettings}
              onChange={setDisplaySettings}
            />
          ) : null}
          {displaySettings.cameraPlacement === "side" ? (
            <TeacherCameraView
              cameraSize={displaySettings.cameraSize}
              role={role}
            />
          ) : null}
          {role === "teacher" ? (
            <TeacherModerationPanel
              teacherIdentity={identity}
              lessonId={lesson.id}
              requireStudentApproval={requireStudentApproval}
            />
          ) : null}
          <QuizPanel
            roomId={roomId}
            role={role}
            displayName={displayName}
            identity={identity}
            persistToken={persistToken}
            interactionLocked={
              role === "student" && requireStudentApproval && !lessonUnlocked
            }
          />
          <LiveLessonChatPanel lessonId={lesson.id} />
        </aside>
      </div>
      {role === "student" ? <TeacherPresenceNotice /> : null}
      {role === "student" ? (
        <StudentEngagementBar
          identity={identity}
          displayName={displayName.trim()}
          requireStudentApproval={requireStudentApproval}
          lessonId={lesson.id}
          onLessonUnlocked={unlockLesson}
        />
      ) : null}
    </LiveKitRoom>
  );
}

export default RoomExperience;
