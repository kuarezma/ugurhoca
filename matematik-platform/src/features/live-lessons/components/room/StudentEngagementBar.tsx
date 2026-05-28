"use client";

import {
  useConnectionState,
  useLocalParticipant,
  useRoomContext,
} from "@livekit/components-react";
import { ConnectionState, RoomEvent, type Participant } from "livekit-client";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  teacherAudioCaptureOptions,
  teacherAudioPublishOptions,
} from "@/features/live-lessons/lib/media-settings";
import {
  decodeDataPayload,
  encodeRoomDataMessage,
} from "@/features/live-lessons/lib/room-data";

type Props = {
  identity: string;
  displayName: string;
  lessonId: string;
  requireStudentApproval: boolean;
  onLessonUnlocked: () => void;
};

export function StudentEngagementBar({
  identity,
  displayName,
  lessonId,
  requireStudentApproval,
  onLessonUnlocked,
}: Props) {
  const room = useRoomContext();
  const { isMicrophoneEnabled, localParticipant } = useLocalParticipant();
  const connectionState = useConnectionState(room);
  const joinSentRef = useRef(false);
  const skipApprovalUnlockRef = useRef(false);
  const initialMicSyncRef = useRef(false);
  const [raised, setRaised] = useState(false);
  const [micAllowed, setMicAllowed] = useState(false);
  const [teacherMuted, setTeacherMuted] = useState(false);
  const [micBusy, setMicBusy] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [micRequestSent, setMicRequestSent] = useState(false);
  const [approvalResolved, setApprovalResolved] = useState(!requireStudentApproval);

  const unlockAfterApproval = useCallback(() => {
    setApprovalResolved(true);
    onLessonUnlocked();
  }, [onLessonUnlocked]);

  const checkApprovalStatus = useCallback(async () => {
    const response = await fetch(
      `/api/live-lessons/${lessonId}/approval?identity=${encodeURIComponent(identity)}`,
      { credentials: "same-origin" },
    );
    if (!response.ok) return;
    const payload = (await response.json().catch(() => null)) as { approved?: boolean } | null;
    if (payload?.approved) unlockAfterApproval();
  }, [identity, lessonId, unlockAfterApproval]);

  useEffect(() => {
    if (requireStudentApproval) return;
    if (skipApprovalUnlockRef.current) return;
    skipApprovalUnlockRef.current = true;
    unlockAfterApproval();
  }, [requireStudentApproval, unlockAfterApproval]);

  useEffect(() => {
    if (!requireStudentApproval) return;
    if (connectionState !== ConnectionState.Connected) return;
    if (joinSentRef.current) return;
    joinSentRef.current = true;
    void room.localParticipant.publishData(
      encodeRoomDataMessage({
        kind: "join_request",
        fromIdentity: identity,
        displayName,
      }),
      { reliable: true },
    );
  }, [connectionState, displayName, identity, requireStudentApproval, room]);

  useEffect(() => {
    if (!requireStudentApproval) return;

    const onData = (payload: Uint8Array, participant?: Participant) => {
      const decoded = decodeDataPayload(payload);
      if (!decoded || decoded.channel !== "room") return;
      const msg = decoded.message;
      if (msg.kind !== "join_approved") return;
      if (msg.targetIdentity !== identity) return;
      if (!participant || participant.isLocal) return;
      if (msg.fromIdentity !== participant.identity) return;
      unlockAfterApproval();
    };

    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [identity, requireStudentApproval, room, unlockAfterApproval]);

  useEffect(() => {
    if (!requireStudentApproval || approvalResolved) return;
    void checkApprovalStatus();
    const interval = window.setInterval(() => {
      void checkApprovalStatus();
    }, 2000);
    return () => window.clearInterval(interval);
  }, [approvalResolved, checkApprovalStatus, requireStudentApproval]);

  const setStudentMicrophone = useCallback(
    async (enabled: boolean) => {
      setMicBusy(true);
      setMicError(null);
      try {
        await localParticipant.setMicrophoneEnabled(
          enabled,
          enabled ? teacherAudioCaptureOptions : undefined,
          enabled ? teacherAudioPublishOptions : undefined,
        );
      } catch {
        if (enabled) {
          await new Promise((resolve) => window.setTimeout(resolve, 500));
          try {
            await localParticipant.setMicrophoneEnabled(
              true,
              teacherAudioCaptureOptions,
              teacherAudioPublishOptions,
            );
            return;
          } catch {
            // LiveKit permission update tarayıcıya ulaşmadıysa kullanıcıya net uyarı gösterilir.
          }
        }
        setMicError(
          enabled
            ? "Mikrofon açılamadı. Tarayıcı mikrofon iznini kontrol edin."
            : "Mikrofon kapatılamadı. Lütfen tekrar deneyin.",
        );
      } finally {
        setMicBusy(false);
      }
    },
    [localParticipant],
  );

  useEffect(() => {
    if (!requireStudentApproval) return;
    const onData = (payload: Uint8Array, participant?: Participant) => {
      const decoded = decodeDataPayload(payload);
      if (!decoded || decoded.channel !== "room") return;
      if (decoded.message.kind !== "lower_hand") return;
      const msg = decoded.message;
      if (msg.forIdentity !== identity) return;
      if (!participant || participant.isLocal) return;
      if (msg.fromIdentity !== participant.identity) return;
      setRaised(false);
    };
    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [identity, requireStudentApproval, room]);

  const applyMicrophonePermission = useCallback(
    (allowed: boolean, { mutedByTeacher = false }: { mutedByTeacher?: boolean } = {}) => {
      setMicAllowed(allowed);
      setMicRequestSent(false);
      if (allowed) {
        setTeacherMuted(false);
        void setStudentMicrophone(true);
      } else {
        setTeacherMuted(mutedByTeacher);
        void setStudentMicrophone(false);
      }
    },
    [setStudentMicrophone],
  );

  useEffect(() => {
    const onData = (payload: Uint8Array, participant?: Participant) => {
      const decoded = decodeDataPayload(payload);
      if (!decoded || decoded.channel !== "room") return;
      if (decoded.message.kind !== "microphone_permission") return;
      const msg = decoded.message;
      if (msg.targetIdentity !== identity && msg.targetIdentity !== "*") return;
      const fromServer = msg.fromIdentity === "server" && !participant;
      const fromTeacher = !!participant && !participant.isLocal && msg.fromIdentity === participant.identity;
      if (!fromServer && !fromTeacher) return;
      applyMicrophonePermission(msg.allowed, { mutedByTeacher: !msg.allowed });
    };
    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [applyMicrophonePermission, identity, room]);

  useEffect(() => {
    if (connectionState !== ConnectionState.Connected) return;
    if (initialMicSyncRef.current) return;
    initialMicSyncRef.current = true;

    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(
          `/api/live-lessons/${lessonId}/microphone?identity=${encodeURIComponent(identity)}`,
          { credentials: "same-origin" },
        );
        if (!response.ok || cancelled) return;
        const payload = (await response.json().catch(() => null)) as {
          micPermission?: "allowed" | "requested" | "blocked" | null;
          microphoneAllowed?: boolean;
          mutedByTeacher?: boolean;
        } | null;
        if (cancelled || !payload) return;
        if (payload.micPermission === "allowed" || payload.microphoneAllowed) {
          applyMicrophonePermission(true);
        } else if (payload.micPermission === "requested") {
          setMicRequestSent(true);
        } else if (payload.mutedByTeacher) {
          setTeacherMuted(true);
        }
      } catch {
        // Connect anında ağ titrer; sonraki polling tekrar deneyecek.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applyMicrophonePermission, connectionState, identity, lessonId]);

  useEffect(() => {
    if (!micRequestSent || micAllowed) return;
    if (connectionState !== ConnectionState.Connected) return;

    let cancelled = false;
    const poll = async () => {
      try {
        const response = await fetch(
          `/api/live-lessons/${lessonId}/microphone?identity=${encodeURIComponent(identity)}`,
          { credentials: "same-origin" },
        );
        if (!response.ok || cancelled) return;
        const payload = (await response.json().catch(() => null)) as {
          micPermission?: "allowed" | "requested" | "blocked" | null;
          microphoneAllowed?: boolean;
          mutedByTeacher?: boolean;
        } | null;
        if (cancelled || !payload) return;
        if (payload.micPermission === "allowed" || payload.microphoneAllowed) {
          applyMicrophonePermission(true);
        } else if (payload.micPermission === "blocked") {
          applyMicrophonePermission(false, {
            mutedByTeacher: Boolean(payload.mutedByTeacher),
          });
        }
      } catch {
        // Network hiccups are tolerated; data message yine de denenir.
      }
    };

    void poll();
    const interval = window.setInterval(() => {
      void poll();
    }, 2000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [
    applyMicrophonePermission,
    connectionState,
    identity,
    lessonId,
    micAllowed,
    micRequestSent,
  ]);

  const toggleRaise = useCallback(async () => {
    const next = !raised;
    setRaised(next);
    await room.localParticipant.publishData(
      encodeRoomDataMessage({
        kind: "raise_hand",
        raised: next,
        fromIdentity: identity,
        displayName,
      }),
      { reliable: true },
    );
  }, [displayName, identity, raised, room.localParticipant]);

  const toggleMic = useCallback(async () => {
    if (!micAllowed) {
      setMicRequestSent(true);
      const response = await fetch(`/api/live-lessons/${lessonId}/microphone`, {
        body: JSON.stringify({ action: "request" }),
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (!response.ok) {
        setMicRequestSent(false);
        setMicError("Mikrofon isteği gönderilemedi. Lütfen tekrar deneyin.");
      }
      return;
    }
    await setStudentMicrophone(!isMicrophoneEnabled);
  }, [
    isMicrophoneEnabled,
    lessonId,
    micAllowed,
    setStudentMicrophone,
  ]);

  return (
    <div className="flex shrink-0 flex-col items-center justify-center gap-2 border-t border-border bg-card px-3 py-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => void toggleRaise()}
          className={`touch-target rounded-xl px-4 py-2 text-sm font-medium transition ${
            raised
              ? "bg-amber-500 text-white hover:bg-amber-400"
              : "border border-border hover:bg-foreground/5"
          }`}
        >
          {raised ? "Eli indir" : "El kaldır"}
        </button>
        <button
          type="button"
          onClick={() => void toggleMic()}
          disabled={micBusy}
          className={`touch-target rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${
            isMicrophoneEnabled
              ? "bg-emerald-600 text-white hover:bg-emerald-500"
              : "border border-border hover:bg-foreground/5"
          }`}
        >
          {micBusy
            ? "İşleniyor..."
              : micAllowed
                ? isMicrophoneEnabled
                  ? "Mikrofonu kapat"
                  : "Mikrofonu aç"
              : micRequestSent
                ? "İzin bekleniyor"
                : teacherMuted
                  ? "Öğretmen susturdu"
                  : "Mikrofon izni iste"}
        </button>
      </div>
      {micError ? (
        <p className="max-w-sm text-center text-xs font-medium text-red-600 dark:text-red-300">
          {micError}
        </p>
      ) : null}
    </div>
  );
}
