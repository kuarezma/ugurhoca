"use client";

import { useConnectionState, useRoomContext } from "@livekit/components-react";
import { ConnectionState, RoomEvent, type Participant } from "livekit-client";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  decodeDataPayload,
  encodeRoomDataMessage,
} from "@/features/live-lessons/lib/room-data";

type Props = {
  identity: string;
  displayName: string;
  requireStudentApproval: boolean;
  onLessonUnlocked: () => void;
};

export function StudentEngagementBar({
  identity,
  displayName,
  requireStudentApproval,
  onLessonUnlocked,
}: Props) {
  const room = useRoomContext();
  const connectionState = useConnectionState(room);
  const joinSentRef = useRef(false);
  const skipApprovalUnlockRef = useRef(false);
  const [raised, setRaised] = useState(false);
  const [micAllowed, setMicAllowed] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);

  useEffect(() => {
    if (requireStudentApproval) return;
    if (skipApprovalUnlockRef.current) return;
    skipApprovalUnlockRef.current = true;
    onLessonUnlocked();
  }, [onLessonUnlocked, requireStudentApproval]);

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
      onLessonUnlocked();
    };

    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [identity, onLessonUnlocked, requireStudentApproval, room]);

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

  useEffect(() => {
    const onData = (payload: Uint8Array, participant?: Participant) => {
      const decoded = decodeDataPayload(payload);
      if (!decoded || decoded.channel !== "room") return;
      if (decoded.message.kind !== "microphone_permission") return;
      const msg = decoded.message;
      if (msg.targetIdentity !== identity) return;
      if (!participant || participant.isLocal) return;
      if (msg.fromIdentity !== participant.identity) return;
      setMicAllowed(msg.allowed);
      if (!msg.allowed) {
        setMicEnabled(false);
        void room.localParticipant.setMicrophoneEnabled(false);
      }
    };
    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [identity, room]);

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
    if (!micAllowed) return;
    const next = !micEnabled;
    setMicEnabled(next);
    await room.localParticipant.setMicrophoneEnabled(next);
  }, [micAllowed, micEnabled, room.localParticipant]);

  return (
    <div className="flex shrink-0 items-center justify-center gap-2 border-t border-border bg-card px-3 py-2">
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
        disabled={!micAllowed}
        className={`touch-target rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
          micEnabled
            ? "bg-emerald-600 text-white hover:bg-emerald-500"
            : "border border-border hover:bg-foreground/5"
        }`}
      >
        {micAllowed
          ? micEnabled
            ? "Mikrofonu kapat"
            : "Mikrofonu aç"
          : "Mikrofon izni bekleniyor"}
      </button>
    </div>
  );
}
