"use client";

import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QuizPanel } from "@/features/live-lessons/components/quiz/QuizPanel";
import { LiveLessonChatPanel } from "@/features/live-lessons/components/room/LiveLessonChatPanel";
import { RemoteScreenShareView } from "@/features/live-lessons/components/room/RemoteScreenShareView";
import { StudentEngagementBar } from "@/features/live-lessons/components/room/StudentEngagementBar";
import { TeacherCameraView } from "@/features/live-lessons/components/room/TeacherCameraView";
import { TeacherModerationPanel } from "@/features/live-lessons/components/room/TeacherModerationPanel";
import { TeacherToolbar } from "@/features/live-lessons/components/room/TeacherToolbar";
import type { LiveLesson, LiveLessonRole } from "@/features/live-lessons/types";

const requireStudentApproval =
  process.env.NEXT_PUBLIC_REQUIRE_STUDENT_APPROVAL === "true";

function newIdentity(userId: string, role: LiveLessonRole): string {
  const prefix = role === "teacher" ? "teacher" : "student";
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
  const [identity] = useState(() => newIdentity(userId, role));
  const [token, setToken] = useState<string | null>(null);
  const [persistToken, setPersistToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [lessonUnlocked, setLessonUnlocked] = useState(
    () => role === "teacher" || !requireStudentApproval,
  );
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

          <Link href="/canli-ders" className="block text-center text-sm text-violet-200 underline">
            Canlı derslere dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={token}
      connect
      audio={role === "teacher"}
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
      <RoomAudioRenderer />
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
          <Link
            href="/canli-ders"
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-white/5"
          >
            Çık
          </Link>
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
          <RemoteScreenShareView role={role} />
        </div>
        <aside className="flex min-h-0 w-full min-w-0 flex-col gap-2 lg:w-96 lg:shrink-0">
          <TeacherCameraView role={role} />
          {role === "teacher" ? (
            <TeacherModerationPanel
              teacherIdentity={identity}
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
      {role === "student" ? (
        <StudentEngagementBar
          identity={identity}
          displayName={displayName.trim()}
          requireStudentApproval={requireStudentApproval}
          onLessonUnlocked={unlockLesson}
        />
      ) : null}
    </LiveKitRoom>
  );
}

export default RoomExperience;
